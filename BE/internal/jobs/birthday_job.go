package jobs

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"CoreSync-backend/internal/email"
	"CoreSync-backend/internal/storage/repository"
	"CoreSync-backend/pkg/sms"

	"github.com/robfig/cron/v3"
)

type BirthdayNotifier struct {
	hrRepo      *repository.HrRepository
	emailClient email.EmailSender
	smsClient   sms.Sender
}

func NewBirthdayNotifier(hrRepo *repository.HrRepository, emailClient email.EmailSender, smsClient sms.Sender) *BirthdayNotifier {
	return &BirthdayNotifier{
		hrRepo:      hrRepo,
		emailClient: emailClient,
		smsClient:   smsClient,
	}
}

func (b *BirthdayNotifier) Start() {
	// Set exact timezone for Sri Lanka (+05:30)
	slLocation := time.FixedZone("Asia/Colombo", 5*3600+1800)
	c := cron.New(cron.WithLocation(slLocation))

	// Runs at 9:00 AM every day
	_, err := c.AddFunc("0 9 * * *", b.processNotifications)
	if err != nil {
		log.Fatalf("Failed to schedule birthday cron job: %v", err)
	}

	c.Start()
	log.Println("Birthday Notification Cron Job started. Scheduled for 9:00 AM daily (LKA Time).")
}

func parseEnvList(val string) []string {
	if val == "" {
		return nil
	}
	parts := strings.Split(val, ",")
	var result []string
	for _, p := range parts {
		clean := strings.TrimSpace(p)
		if clean != "" {
			result = append(result, clean)
		}
	}
	return result
}

func (b *BirthdayNotifier) processNotifications() {
	ctx := context.Background()

	employees, err := b.hrRepo.GetEmployeesWithBirthdayTomorrow(ctx)
	if err != nil {
		log.Printf("Cron error fetching upcoming birthdays: %v", err)
		return
	}

	// If no birthdays tomorrow, exit silently
	if len(employees) == 0 {
		return
	}

	// Get Designer Contact Info (Multiple via comma separation)
	designerEmails := parseEnvList(os.Getenv("DESIGNER_EMAILS"))
	designerPhones := parseEnvList(os.Getenv("DESIGNER_PHONES"))

	if len(designerEmails) == 0 && len(designerPhones) == 0 {
		log.Println("Warning: No DESIGNER_EMAILS or DESIGNER_PHONES set in .env")
		return
	}

	for _, emp := range employees {
		// Format the date nicely, e.g., "August 15"
		formattedDate := emp.DateOfBirth.Format("January 02")

		subject := fmt.Sprintf("Action Required: Birthday Tomorrow - %s %s", emp.FirstName, emp.LastName)

		// Plain text fallback
		textBody := fmt.Sprintf(
			"Hi Team,\n\nReminder: %s %s's birthday is tomorrow (%s). Please prepare the birthday graphics and wishes.\n\nBest regards,\nCoreSync HR System",
			emp.FirstName,
			emp.LastName,
			formattedDate,
		)

		// Rich HTML Email Structure
		htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; line-height: 1.6; background-color: #f1f5f9; margin: 0; padding: 20px; }
				.container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
				.header { font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 10px; }
				.details-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
				.details-box p { margin: 5px 0; font-size: 15px; }
				.action-text { color: #b91c1c; font-weight: 600; margin-top: 20px; }
				.footer { margin-top: 35px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">🎉 Upcoming Employee Birthday</div>
				<p>Hi Team,</p>
				<p>This is an automated reminder that we have an employee birthday coming up tomorrow. Please prepare the birthday graphics and company wishes.</p>
				
				<div class="details-box">
					<p><strong>Employee Name:</strong> %s %s</p>
					<p><strong>Birthday:</strong> %s</p>
				</div>
				
				<p class="action-text">Action Required: Graphic preparation & internal announcement setup.</p>
				
				<p>Best regards,<br><strong>CoreSync HR System</strong></p>
				
				<div class="footer">
					<p>This is an automated notification. Please do not reply directly to this email.</p>
				</div>
			</div>
		</body>
		</html>
		`, emp.FirstName, emp.LastName, formattedDate)

		// Trigger Email to all designers simultaneously
		if len(designerEmails) > 0 {
			emailMsg := email.EmailMessage{
				From:    "CoreSync <" + os.Getenv("FROM_EMAIL") + ">",
				To:      designerEmails,
				Subject: subject,
				Html:    htmlBody,
				Body:    textBody,
			}

			// Calling your existing interface method
			if err := b.emailClient.SendOrderConfirmation(emailMsg); err != nil {
				log.Printf("Failed to send birthday email for %s: %v", emp.FirstName, err)
			}
		}

		// Trigger SMS to all designers one by one
		if len(designerPhones) > 0 {
			// Keep SMS slightly shorter for character limits
			smsText := fmt.Sprintf("Reminder: %s %s's birthday is tomorrow (%s). Please prepare graphics. - CoreSync HR", emp.FirstName, emp.LastName, formattedDate)
			for _, phone := range designerPhones {
				if err := b.smsClient.SendSMS(ctx, phone, smsText); err != nil {
					log.Printf("Failed to send birthday SMS to %s for %s: %v", phone, emp.FirstName, err)
				}
			}
		}

		log.Printf("Successfully sent birthday reminders to designers for %s %s", emp.FirstName, emp.LastName)
	}
}
