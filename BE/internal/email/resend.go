package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// EmailSender interface
type EmailSender interface {
	SendOrderConfirmation(msg EmailMessage) error
}

// ResendClient implements EmailSender
type ResendClient struct {
	ApiKey string
}

// ResendEmailRequest maps to Resend API payload
type ResendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
	Cc      []string `json:"cc,omitempty"`
	Bcc     []string `json:"bcc,omitempty"`
	ReplyTo string   `json:"reply_to,omitempty"`
}

// ResendAPIResponse represents the structure of Resend's success response
type ResendAPIResponse struct {
	Id      string `json:"id"`
	Message string `json:"message"`
	Name    string `json:"name"`
	Errors  []struct {
		Message string `json:"message"`
		Code    string `json:"code"`
	} `json:"errors"`
}

// EmailMessage holds full message info
type EmailMessage struct {
	From    string
	To      []string
	Subject string
	Html    string
	Body    string
	Cc      []string
	Bcc     []string
	ReplyTo string
}

// NewResendClient creates a new client instance
func NewResendClient() *ResendClient {
	return &ResendClient{
		ApiKey: os.Getenv("RESEND_API_KEY"),
	}
}

// SendOrderConfirmation sends the email via Resend
func (r *ResendClient) SendOrderConfirmation(msg EmailMessage) error {
	reqBody := ResendEmailRequest{
		From:    msg.From,
		To:      msg.To,
		Subject: msg.Subject,
		Html:    msg.Html,
		Cc:      msg.Cc,
		Bcc:     msg.Bcc,
		ReplyTo: msg.ReplyTo,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+r.ApiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send HTTP request to Resend: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body for detailed error reporting
	responseBodyBytes, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		return fmt.Errorf("failed to read Resend response body: %w", readErr)
	}

	// Unmarshal the response to check for specific Resend errors even on 200 OK
	var resendResp ResendAPIResponse
	unmarshalErr := json.Unmarshal(responseBodyBytes, &resendResp)
	if unmarshalErr != nil {
		// Log the unparseable body if it's not JSON
		return fmt.Errorf("failed to unmarshal Resend API response: %w, raw body: %s", unmarshalErr, string(responseBodyBytes))
	}

	// Check for a non-OK HTTP status code first
	if resp.StatusCode != http.StatusOK {
		// Use the error message from Resend's response if available
		errMsg := fmt.Sprintf("resend API returned non-OK status: %d", resp.StatusCode)
		if len(resendResp.Errors) > 0 {
			errMsg += fmt.Sprintf(", Resend error: %s (Code: %s)", resendResp.Errors[0].Message, resendResp.Errors[0].Code)
		} else if resendResp.Message != "" {
			errMsg += fmt.Sprintf(", Resend message: %s", resendResp.Message)
		} else {
			errMsg += fmt.Sprintf(", raw body: %s", string(responseBodyBytes))
		}
		return fmt.Errorf(errMsg)
	}

	// Even if status is 200 OK, Resend might include errors in the body
	if len(resendResp.Errors) > 0 {
		return fmt.Errorf("resend reported an error despite 200 OK: %s (Code: %s)", resendResp.Errors[0].Message, resendResp.Errors[0].Code)
	}

	// If it reaches here, it means 200 OK and no errors in the body
	return nil
}
