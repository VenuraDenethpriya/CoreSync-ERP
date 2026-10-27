package email

import "CoreSync-backend/internal/email"

type EmailSender interface {
	SendOrderConfirmation(msg email.EmailMessage) error
}
