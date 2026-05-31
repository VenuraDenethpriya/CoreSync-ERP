package whatsapp

// import (
// 	"context"
// 	"fmt"
// 	"os"

// 	"github.com/go-resty/resty/v2"
// )

// type WhatsAppSender struct {
// 	client  *resty.Client
// 	token   string
// 	phoneID string
// }

// func NewWhatsAppSender() *WhatsAppSender {
// 	return &WhatsAppSender{
// 		client:  resty.New(),
// 		token:   os.Getenv("WHATSAPP_TOKEN"),
// 		phoneID: os.Getenv("WHATSAPP_PHONE_NUMBER_ID"),
// 	}
// }

// func (w *WhatsAppSender) SendTextMessage(ctx context.Context, to string, message string) error {
// 	url := fmt.Sprintf("https://graph.facebook.com/v22.0/%s/messages", w.phoneID)

// 	resp, err := w.client.R().
// 		SetHeader("Authorization", "Bearer "+w.token).
// 		SetHeader("Content-Type", "application/json").
// 		SetBody(map[string]interface{}{
// 			"messaging_product": "whatsapp",
// 			"to":                to,
// 			"type":              "text",
// 			"text": map[string]string{
// 				"body": message,
// 			},
// 		}).Post(url)

// 	if err != nil {
// 		return err
// 	}

// 	if resp.IsError() {
// 		return fmt.Errorf("failed to send WhatsApp message: %s", resp.String())
// 	}

// 	return nil
// }
