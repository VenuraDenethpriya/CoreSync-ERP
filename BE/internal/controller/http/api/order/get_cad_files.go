package order

import (
	"net/http"
	"os"
	"rims-backend/internal/email"

	"github.com/gin-gonic/gin"
)

func (h *OrderHandler) GetCADFiles(c *gin.Context) {
	credsPath := os.Getenv("GOOGLE_CREDENTIALS_PATH")
	sheetID := os.Getenv("GOOGLE_SHEET_ID")

	if credsPath == "" || sheetID == "" {
		panic("Google Sheets credentials path or spreadsheet ID not set in environment variables")
	}

	gsClient, err := email.NewGoogleSheetsClient(credsPath, sheetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to init Google Sheets client"})
		return
	}

	files, err := gsClient.GetAllCADFiles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Map to {value, label} format for React Select
	var response []map[string]string
	for _, f := range files {
		response = append(response, map[string]string{
			"value": f,
			"label": f,
		})
	}

	c.JSON(http.StatusOK, response)
}
