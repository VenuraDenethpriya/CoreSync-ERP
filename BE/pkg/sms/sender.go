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
	"strconv"
	"strings"
	"sync"
	"time"
)

// --- Structs for Dialog e-SMS API ---

// LoginRequest is the structure for the token generation request body.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse represents the successful token response from the Dialog e-SMS API.
type LoginResponse struct {
	Status     string `json:"status"`
	Comment    string `json:"comment"`
	Token      string `json:"token"`
	Expiration int    `json:"expiration"` // in seconds
}

// SmsMsisdn represents a single mobile number entry in the request.
type SmsMsisdn struct {
	Mobile string `json:"mobile"`
}

// SmsRequestV2 is the structure for the SMS API (Version 2) request body.
type SmsRequestV2 struct {
	Msisdn        []SmsMsisdn `json:"msisdn"`
	Message       string      `json:"message"`
	SourceAddress string      `json:"sourceAddress,omitempty"`
	TransactionID string      `json:"transaction_id"`
}

// GenericSmsResponse is used to check the status of the response.
type GenericSmsResponse struct {
	Status  string `json:"status"`
	Comment string `json:"comment"`
}

// --- Service Interface and Implementation ---

// Sender defines the interface for an SMS sending service.
type Sender interface {
	SendSMS(ctx context.Context, recipientPhoneNumber string, message string) error
}

// dialogSmsSender implements the Sender interface for Dialog e-SMS.
type dialogSmsSender struct {
	client        *http.Client
	apiUrl        string
	tokenUrl      string
	username      string
	password      string
	senderAddress string

	// For caching the access token
	tokenMutex  sync.RWMutex
	accessToken string
	tokenExpiry time.Time
}

// NewDialogSmsSender creates a new instance of the Dialog e-SMS sender.
// Credentials should be loaded from environment variables for security.
func NewDialogSmsSender() (Sender, error) {
	username := os.Getenv("DIALOG_ESMS_USERNAME")
	password := os.Getenv("DIALOG_ESMS_PASSWORD")
	senderAddr := os.Getenv("DIALOG_ESMS_SENDER_ADDRESS")

	if username == "" || password == "" {
		return nil, fmt.Errorf("DIALOG_ESMS_USERNAME and DIALOG_ESMS_PASSWORD must be set in environment variables")
	}

	return &dialogSmsSender{
		client:        &http.Client{Timeout: 15 * time.Second},
		apiUrl:        "https://e-sms.dialog.lk/api/v2/sms",
		tokenUrl:      "https://e-sms.dialog.lk/api/v1/login",
		username:      username,
		password:      password,
		senderAddress: senderAddr,
	}, nil
}

// getAccessToken handles fetching and caching the access token.
func (s *dialogSmsSender) getAccessToken(ctx context.Context) (string, error) {
	s.tokenMutex.RLock()
	// Check if token is valid and not expiring within the next minute
	if s.accessToken != "" && time.Now().Before(s.tokenExpiry.Add(-1*time.Minute)) {
		s.tokenMutex.RUnlock()
		return s.accessToken, nil
	}
	s.tokenMutex.RUnlock()

	// If token is invalid or expired, get a new one (with a full lock)
	s.tokenMutex.Lock()
	defer s.tokenMutex.Unlock()

	// Double-check in case another goroutine just refreshed the token
	if s.accessToken != "" && time.Now().Before(s.tokenExpiry.Add(-1*time.Minute)) {
		return s.accessToken, nil
	}

	loginReqBody := LoginRequest{
		Username: s.username,
		Password: s.password,
	}
	jsonBody, err := json.Marshal(loginReqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal login request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.tokenUrl, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute token request: %w", err)
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read token response body: %w", err)
	}

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get token, status: %s, body: %s", res.Status, string(bodyBytes))
	}

	var tokenRes LoginResponse
	if err := json.Unmarshal(bodyBytes, &tokenRes); err != nil {
		return "", fmt.Errorf("failed to decode token response: %w", err)
	}

	if tokenRes.Status != "success" || tokenRes.Token == "" {
		return "", fmt.Errorf("authentication failed: %s", tokenRes.Comment)
	}

	// Cache the new token and its expiry time
	s.accessToken = tokenRes.Token
	s.tokenExpiry = time.Now().Add(time.Duration(tokenRes.Expiration) * time.Second)

	return s.accessToken, nil
}

// SendSMS sends a message to the specified recipient. It will retry once if the token is expired.
func (s *dialogSmsSender) SendSMS(ctx context.Context, recipientPhoneNumber string, message string) error {
	token, err := s.getAccessToken(ctx)
	if err != nil {
		return fmt.Errorf("could not get access token: %w", err)
	}

	// Normalize phone number to the required 9-digit format "7XXXXXXXX"
	normalizedPhone := normalizePhoneNumber(recipientPhoneNumber)
	if normalizedPhone == "" {
		return fmt.Errorf("invalid phone number format: %s", recipientPhoneNumber)
	}

	// Construct the request body
	smsReqBody := SmsRequestV2{
		Msisdn:        []SmsMsisdn{{Mobile: normalizedPhone}},
		Message:       message,
		TransactionID: strconv.FormatInt(time.Now().UnixMicro(), 10),
		SourceAddress: s.senderAddress,
	}

	jsonBody, err := json.Marshal(smsReqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal sms request body: %w", err)
	}

	// --- Execute the request ---
	res, err := s.doSmsRequest(ctx, token, jsonBody)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return fmt.Errorf("failed to read sms response body: %w", err)
	}

	// Check for expired token (Error Code 100). The HTTP status might be 401 or another code.
	var genericRes GenericSmsResponse
	_ = json.Unmarshal(bodyBytes, &genericRes) // Ignore error, just for checking status
	if res.StatusCode == http.StatusUnauthorized || strings.Contains(genericRes.Comment, "Expired") {
		// Token might have expired between fetching and using. Force a refresh and retry once.
		newToken, refreshErr := s.forceRefreshToken(ctx)
		if refreshErr != nil {
			return fmt.Errorf("failed to refresh token after auth error: %w", refreshErr)
		}

		// Retry the request with the new token
		res, err = s.doSmsRequest(ctx, newToken, jsonBody)
		if err != nil {
			return err
		}
		defer res.Body.Close()
		bodyBytes, _ = io.ReadAll(res.Body)
	}

	// Final check on the response
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("sms sending failed, status: %s, body: %s", res.Status, string(bodyBytes))
	}

	var finalRes GenericSmsResponse
	if err := json.Unmarshal(bodyBytes, &finalRes); err != nil {
		return fmt.Errorf("failed to decode final sms response: %w", err)
	}

	if finalRes.Status != "success" {
		return fmt.Errorf("sms sending failed: %s", finalRes.Comment)
	}

	return nil
}

// doSmsRequest is a helper to perform the HTTP request for sending an SMS.
func (s *dialogSmsSender) doSmsRequest(ctx context.Context, token string, body []byte) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, "POST", s.apiUrl, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create sms request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	res, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sms request: %w", err)
	}
	return res, nil
}

// forceRefreshToken invalidates the current token, forcing getAccessToken to fetch a new one.
func (s *dialogSmsSender) forceRefreshToken(ctx context.Context) (string, error) {
	s.tokenMutex.Lock()
	s.accessToken = ""
	s.tokenMutex.Unlock()
	return s.getAccessToken(ctx)
}

// nonNumericRegex is used to strip non-digit characters.
var nonNumericRegex = regexp.MustCompile(`\D`)

// normalizePhoneNumber ensures the phone number is in the 9-digit format "7..."
func normalizePhoneNumber(phone string) string {
	// Remove all non-numeric characters
	numericPhone := nonNumericRegex.ReplaceAllString(phone, "")

	// Case 1: Starts with "94" and is 11 digits long (e.g., 94771234567)
	if strings.HasPrefix(numericPhone, "94") && len(numericPhone) == 11 {
		return numericPhone[2:] // Return the last 9 digits
	}
	// Case 2: Starts with "0" and is 10 digits long (e.g., 0771234567)
	if strings.HasPrefix(numericPhone, "0") && len(numericPhone) == 10 {
		return numericPhone[1:] // Return the last 9 digits
	}
	// Case 3: Is exactly 9 digits long (e.g., 771234567)
	if len(numericPhone) == 9 {
		return numericPhone
	}

	// Return empty if format is not recognized
	return ""
}
