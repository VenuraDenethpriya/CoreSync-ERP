package email

import "rims-backend/internal/email"

type EmailSender interface {
	SendOrderConfirmation(msg email.EmailMessage) error
}
