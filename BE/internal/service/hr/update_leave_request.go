package hr

import (
	"CoreSync-backend/internal/email"
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"os"
	"strings"
)

func (s *serviece) UpdateLeaveRequest(ctx context.Context, leave *domain.Leave, actingClerkID string) (*domain.Leave, string, error) {
	updatedLeaveRequest, err := s.hrRepo.UpdateLeaveRequest(ctx, leave)
	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	actorName := "HR Admin"
	if err == nil && actor != nil {
		actorName = actor.FirstName + " " + actor.LastName
	}

	empReq := &domain.Employee{ID: updatedLeaveRequest.EmployeeId}
	emp, err := s.hrRepo.GetEmployeeByID(ctx, empReq)

	if err == nil && emp != nil {

		go func(leaveData *domain.Leave, employee *domain.Employee, hrName string) {
			bgCtx := context.Background()

			startDate, endDate := getStartAndEndDates(leaveData.Date)
			fullName := employee.FirstName + " " + employee.LastName

			var subject, textBody, htmlBody, smsText string

			// -----------------------------------------
			// Handle Accepted / Approved
			// -----------------------------------------
			if strings.EqualFold(leaveData.Status, "ACCEPTED") || strings.EqualFold(leaveData.Status, "APPROVED") {

				subject = fmt.Sprintf("Leave Request Approved – %s – %s to %s", leaveData.Type, startDate, endDate)

				textBody = fmt.Sprintf(`Dear %s,

Your leave request has been *approved*.

*Leave Type:* %s
*Leave Period:* %s to %s
*Reason:* %s

Please ensure that any necessary work handovers are completed before your leave.
We wish you a pleasant leave.

Best regards,
HR Department
CoreSync Pvt Ltd`, fullName, leaveData.Type, startDate, endDate, leaveData.Reason)

				htmlBody = fmt.Sprintf(`
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
						<p>Dear %s,</p>
						<p>Your leave request has been <strong>approved</strong>.</p>
						<p>
							<strong>Leave Type:</strong> %s<br>
							<strong>Leave Period:</strong> %s to %s<br>
							<strong>Reason:</strong> %s
						</p>
						<p>Please ensure that any necessary work handovers are completed before your leave.<br>
						We wish you a pleasant leave.</p>
						<br>
						<p>Best regards,<br>
						HR Department<br>
						CoreSync Pvt Ltd</p>
					</div>
				</body>
				</html>
				`, fullName, leaveData.Type, startDate, endDate, leaveData.Reason)

				smsText = fmt.Sprintf("Hi %s, your %s leave from %s to %s was APPROVED.", employee.FirstName, leaveData.Type, startDate, endDate)

				// -----------------------------------------
				// Handle Rejected / Not Approved
				// -----------------------------------------
			} else if strings.EqualFold(leaveData.Status, "REJECTED") {

				subject = fmt.Sprintf("Leave Request – Not Approved – %s – %s to %s", leaveData.Type, startDate, endDate)

				textRemarks := ""
				htmlRemarks := ""
				if leaveData.Comment != "" {
					textRemarks = fmt.Sprintf("*Remarks:* %s\n\n", leaveData.Comment)
					htmlRemarks = fmt.Sprintf("<p><strong>Remarks:</strong> %s</p>", leaveData.Comment)
				}

				textBody = fmt.Sprintf(`Dear %s,

Your leave request has been *not approved*.
%s
Please contact the HR Department if you require any clarification regarding this decision.

Best regards,
HR Department
CoreSync Pvt Ltd`, fullName, textRemarks)

				htmlBody = fmt.Sprintf(`
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
						<p>Dear %s,</p>
						<p>Your leave request has been <strong>not approved</strong>.</p>
						%s
						<p>Please contact the HR Department if you require any clarification regarding this decision.</p>
						<br>
						<p>Best regards,<br>
						HR Department<br>
						CoreSync Pvt Ltd</p>
					</div>
				</body>
				</html>
				`, fullName, htmlRemarks)

				smsText = fmt.Sprintf("Hi %s, your %s leave from %s to %s was NOT APPROVED.", employee.FirstName, leaveData.Type, startDate, endDate)

			} else {
				return
			}

			// Send Email to Employee
			if employee.Email != "" && s.emailSender != nil {
				emailMsg := email.EmailMessage{
					From:    "CoreSync HR <" + os.Getenv("FROM_EMAIL") + ">",
					To:      []string{employee.Email},
					Subject: subject,
					Html:    htmlBody,
					Body:    textBody,
				}
				s.emailSender.SendOrderConfirmation(emailMsg)
			}

			// Send SMS to Employee
			if employee.Phone != "" && s.smsClient != nil {
				s.smsClient.SendSMS(bgCtx, employee.Phone, smsText)
			}
		}(updatedLeaveRequest, emp, actorName)
	}

	return updatedLeaveRequest, actorName, nil
}
