package sms

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// notifyRequestBody is the structure for the Notify.lk API request body.
type notifyRequestBody struct {
	UserID   string `json:"user_id"`
	APIKey   string `json:"api_key"`
	SenderID string `json:"sender_id"`
	To       string `json:"to"`
	Message  string `json:"message"`
}

// notifyResponseBody is the structure for the Notify.lk API response body.
type notifyResponseBody struct {
	Status      string `json:"status"`
	Description string `json:"description"`
}

// notifySmsSender implements the Sender interface for Notify.lk.
type notifySmsSender struct {
	client   *http.Client
	apiUrl   string
	userID   string
	apiKey   string
	senderID string
}

// NewNotifySmsSender creates a new instance of the Notify.lk SMS sender.
func NewNotifySmsSender() (Sender, error) {
	userID := os.Getenv("NOTIFYLK_USER_ID")
	apiKey := os.Getenv("NOTIFYLK_API_KEY")
	senderID := os.Getenv("NOTIFYLK_SENDER_ID")

	if userID == "" || apiKey == "" || senderID == "" {
		return nil, fmt.Errorf("NOTIFYLK_USER_ID, NOTIFYLK_API_KEY, and NOTIFYLK_SENDER_ID must be set")
	}

	return &notifySmsSender{
		client:   &http.Client{Timeout: 15 * time.Second},
		apiUrl:   "https://app.notify.lk/api/v1/send",
		userID:   userID,
		apiKey:   apiKey,
		senderID: senderID,
	}, nil
}

// SendSMS sends a message using the Notify.lk service.
func (s *notifySmsSender) SendSMS(ctx context.Context, recipientPhoneNumber string, message string) error {
	// Notify.lk expects the phone number format 947...
	normalizedPhone := normalizePhoneForNotify(recipientPhoneNumber)
	if normalizedPhone == "" {
		return fmt.Errorf("invalid phone number format for Notify.lk: %s", recipientPhoneNumber)
	}

	reqBody := notifyRequestBody{
		UserID:   s.userID,
		APIKey:   s.apiKey,
		SenderID: s.senderID,
		To:       normalizedPhone,
		Message:  message,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal notify.lk request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.apiUrl, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create notify.lk request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	res, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute notify.lk request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(res.Body)
		return fmt.Errorf("notify.lk request failed with status: %s, body: %s", res.Status, string(bodyBytes))
	}

	var resBody notifyResponseBody
	if err := json.NewDecoder(res.Body).Decode(&resBody); err != nil {
		return fmt.Errorf("failed to decode notify.lk response body: %w", err)
	}

	if resBody.Status != "success" {
		return fmt.Errorf("notify.lk API returned an error: %s", resBody.Description)
	}

	return nil
}

// normalizePhoneForNotify strips all non-digits and ensures the number starts with 94.
func normalizePhoneForNotify(phone string) string {
	// Remove all non-numeric characters
	re := regexp.MustCompile(`\D`)
	numericPhone := re.ReplaceAllString(phone, "")

	// If it starts with 94 and has 11 digits (947... ...)
	if strings.HasPrefix(numericPhone, "94") && len(numericPhone) == 11 {
		return numericPhone
	}
	// If it starts with 0 and has 10 digits (07... ...)
	if strings.HasPrefix(numericPhone, "0") && len(numericPhone) == 10 {
		return "94" + numericPhone[1:]
	}

	// Return empty if format is not recognized
	return ""
}
