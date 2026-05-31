package user

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"rims-backend/internal/controller/http/dto"

	"github.com/gin-gonic/gin"
)

func (ch *UserHandler) CreateClerkUser(c *gin.Context) {
	var req dto.ClerkCreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	// Prepare Clerk API payload
	payload := map[string]interface{}{
		"first_name":    req.FirstName,
		"last_name":     req.LastName,
		"email_address": []string{req.Email},
		"password":      req.Password,
		"public_metadata": map[string]string{
			"role": req.Role,
		},
	}

	if req.PhoneNo != "" {
		payload["phone_numbers"] = []string{"+" + req.PhoneNo}
	}

	body, _ := json.Marshal(payload)

	// Call Clerk API
	clerkKey := os.Getenv("CLERK_SECRET_KEY")
	clerkUserURL := os.Getenv("CLERK_USERAPI_URL")
	reqClerk, _ := http.NewRequest("POST", clerkUserURL, bytes.NewBuffer(body))
	reqClerk.Header.Set("Content-Type", "application/json")
	reqClerk.Header.Set("Authorization", "Bearer "+clerkKey)

	client := &http.Client{}
	resp, err := client.Do(reqClerk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "failed to call Clerk"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": fmt.Sprintf("Clerk error: %v", errResp)})
		return
	}

	var clerkResp dto.ClerkCreateUserResponse
	if err := json.NewDecoder(resp.Body).Decode(&clerkResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "failed to parse Clerk response"})
		return
	}

	// Return Clerk ID to frontend
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"clerkUserId": clerkResp.ID,
	})
}
