package order

import (
	"context"
	"fmt"
	"os"
	"rims-backend/internal/email"
	"rims-backend/internal/service/domain"
	"strings"
)

func (s *service) UpdateOrderApproval(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	//  Update DB
	updatedOrder, err := s.orderRepo.UpdateOrderApproval(ctx, order)
	if err != nil {
		return nil, err
	}

	// Send CAD file links email (if CAD emails exist)
	if len(order.CADFiles.Email) > 0 {
		links, err := s.sheetsClient.GetFileLinks(order.CADFiles.FileName)
		if err != nil {
			return updatedOrder, fmt.Errorf("failed to fetch CAD links: %w", err)
		}

		htmlContent := fmt.Sprintf(
			"<p>Hello,</p><p>Please find below the CAD files and quantities for printing:</p>"+
				"<p><strong>Quantity to print:</strong> %d</p><p><strong>CAD File Links:</strong></p>",
			order.CADFiles.Quantity,
		)

		for file, link := range links {
			htmlContent += fmt.Sprintf("<p>%s: <a href='%s' target='_blank'>Download</a></p>", file, link)
		}
		htmlContent += "<p>Please ensure the prints match the specified quantity. Contact us if you encounter any issues accessing the files. Chalangana: 070 700 7668</p><p>Thank you,<br/>Renewaa Team</p>"

		msg := email.EmailMessage{
			From:    "Renewaa <" + os.Getenv("FROM_EMAIL") + ">",
			To:      order.CADFiles.Email,
			Cc:      strings.Split(os.Getenv("CC_EMAIL"), ","),
			Bcc:     strings.Split(os.Getenv("BCC_EMAIL"), ","),
			Subject: fmt.Sprintf("CAD Files & Print Instructions  %s%s", order.Type, order.OrderNo),
			Html:    htmlContent,
		}

		if err := s.emailSender.SendOrderConfirmation(msg); err != nil {
			return updatedOrder, fmt.Errorf("failed to send CAD email: %w", err)
		}
	}

	// 3. Send designer description email (if designer emails exist)
	if len(order.Designer.Email) > 0 && order.Designer.Description != "" {
		htmlContent := fmt.Sprintf(
			"<p>Dear Designer(s),</p>"+
				"<p>A new CAD design is required</p>"+
				"<p><strong>Description / Requirements:</strong></p><p>%s</p>"+
				"<p>Please create the CAD design according to the description above and share the completed files once ready.</p>"+
				"<p>Thank you for your prompt attention.<br/>Renewaa Team</p>",
			order.Designer.Description,
		)

		msg := email.EmailMessage{
			From:    "Renewaa <" + os.Getenv("FROM_EMAIL") + ">",
			To:      order.Designer.Email,
			Cc:      strings.Split(os.Getenv("CC_EMAIL"), ","),
			Bcc:     strings.Split(os.Getenv("BCC_EMAIL"), ","),
			Subject: fmt.Sprintf("New CAD Design Request %s", order.OrderNo),
			Html:    htmlContent,
		}

		if err := s.emailSender.SendOrderConfirmation(msg); err != nil {
			return updatedOrder, fmt.Errorf("failed to send designer email: %w", err)
		}
	}

	return updatedOrder, nil
}
