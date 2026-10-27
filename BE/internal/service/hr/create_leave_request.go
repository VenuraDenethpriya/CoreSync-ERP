package hr

import (
	"CoreSync-backend/internal/email"
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"os"
	"strings"
	"time"
)

func getStartAndEndDates(dates []time.Time) (string, string) {
	if len(dates) == 0 {
		return "N/A", "N/A"
	}
	minDate, maxDate := dates[0], dates[0]
	for _, d := range dates {
		if d.Before(minDate) {
			minDate = d
		}
		if d.After(maxDate) {
			maxDate = d
		}
	}
	return minDate.Format("Jan 02, 2006"), maxDate.Format("Jan 02, 2006")
}

func parseEnvList(val string) []string {
	if val == "" {
		return nil
	}
	parts := strings.Split(val, ",")
	var result []string
	for _, p := range parts {
		clean := strings.TCoreSyncpace(p)
		if clean != "" {
			result = append(result, clean)
		}
	}
	return result
}

func (s *serviece) CreateLeaveRequest(ctx context.Context, leave *domain.Leave) (*domain.Leave, error) {
	createdLeave, err := s.hrRepo.CreateLeaveRequest(ctx, leave)
	if err != nil {
		return nil, err
	}

	empReq := &domain.Employee{ID: leave.EmployeeId}
	emp, _ := s.hrRepo.GetEmployeeByID(ctx, empReq)

	empName := "An employee"
	empDesignation := "Employee"

	if emp != nil {
		empName = emp.FirstName + " " + emp.LastName
		if emp.JobTitle != "" {
			empDesignation = emp.JobTitle
		}
	}

	go func(leaveData *domain.Leave, employeeName string, designation string) {
		bgCtx := context.Background()

		hrEmails := parseEnvList(os.Getenv("HR_EMAILS"))
		hrPhones := parseEnvList(os.Getenv("HR_PHONES"))

		startDate, endDate := getStartAndEndDates(leaveData.Date)

		subject := fmt.Sprintf("Leave Request – %s – %s to %s", employeeName, startDate, endDate)

		textBody := fmt.Sprintf(`Dear HR Team,

I would like to request %s leave from %s to %s.
Reason: %s

Kindly consider my leave request and approve it accordingly.

Thank you.
Best regards,
%s
%s`, leaveData.Type, startDate, endDate, leaveData.Reason, employeeName, designation)

		htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; color: #333333; line-height: 1.6; }
				.container { padding: 20px; }
			</style>
		</head>
		<body>
			<div class="container">
				<p>Dear HR Team,</p>
				<p>I would like to request <strong>%s</strong> leave from <strong>%s</strong> to <strong>%s</strong>.</p>
				<p><strong>Reason:</strong> %s</p>
				<p>Kindly consider my leave request and approve it accordingly.</p>
				<br>
				<p>Thank you.</p>
				<p>Best regards,<br>
				<strong>%s</strong><br>
				%s</p>
			</div>
		</body>
		</html>
		`, leaveData.Type, startDate, endDate, leaveData.Reason, employeeName, designation)

		// Send HR Emails
		if len(hrEmails) > 0 && s.emailSender != nil {
			emailMsg := email.EmailMessage{
				From:    "CoreSync HR <" + os.Getenv("FROM_EMAIL") + ">",
				To:      hrEmails,
				Subject: subject,
				Html:    htmlBody,
				Body:    textBody,
			}
			s.emailSender.SendOrderConfirmation(emailMsg)
		}

		if len(hrPhones) > 0 && s.smsClient != nil {
			smsText := fmt.Sprintf("Leave Request: %s requested %s leave from %s to %s.", employeeName, leaveData.Type, startDate, endDate)
			for _, phone := range hrPhones {
				s.smsClient.SendSMS(bgCtx, phone, smsText)
			}
		}
	}(createdLeave, empName, empDesignation)

	return createdLeave, nil
}
