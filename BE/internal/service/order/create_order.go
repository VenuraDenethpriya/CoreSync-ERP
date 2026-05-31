package order

import (
	"context"
	"fmt"
	"os"
	"rims-backend/internal/email"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (s *service) CreateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	fmt.Println("SalesID received 2:", order.SalesID)
	createdOrder, err := s.orderRepo.CreateOrder(ctx, order)
	if err != nil {
		return nil, err
	}

	if createdOrder.CustomerID != uuid.Nil && (createdOrder.Customer == nil || createdOrder.Customer.Email == "") {
		customer, err := s.customerRepo.GetCustomerByID(ctx, &domain.Customer{CustomerID: createdOrder.CustomerID})
		if err != nil {
			logger.Error(ctx, "Failed to retrieve customer for email confirmation", zap.Error(err))
		} else {
			createdOrder.Customer = customer
			logger.Info(ctx, "Customer assigned to createdOrder",
				zap.String("customer_id", createdOrder.CustomerID.String()),
				zap.String("customer_email_in_order", createdOrder.Customer.Email),
				zap.Any("full_customer_in_created_order", createdOrder.Customer))
		}
	}

	logger.Info(ctx, "Final createdOrder state before goroutine", zap.Any("order_details", createdOrder))

	go func() {
		if createdOrder.Customer != nil && createdOrder.Customer.Email != "" {
			logger.Info(ctx, "Inside goroutine: Customer details found for email",
				zap.String("customer_id", createdOrder.CustomerID.String()),
				zap.String("customer_email_in_goroutine", createdOrder.Customer.Email))

			emailMsg := email.EmailMessage{
				From:    "Renewaa <" + os.Getenv("FROM_EMAIL") + ">",
				To:      []string{createdOrder.Customer.Email},
				Subject: fmt.Sprintf("Your %s%s Order Confirmation", createdOrder.Type, createdOrder.OrderNo),
				Html: fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
				.order-details { margin: 20px 0; }
				.footer { margin-top: 30px; font-size: 12px; color: #777; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">Thank you for your order!</div>
				<p>Hi %s,</p>
				<p>We’ve received your order <strong>%s</strong><strong>%s</strong>. We’re currently processing it and will notify you when your order is ready.</p>
				<div class="order-details">
					<p><strong>Order No:</strong> %s%s</p>
				</div>
				<p>If you have any questions, feel free to reply to this email. info@renewaa.com</p>
				<p>Best regards,<br>Renewaa Team</p>
				<div class="footer">
					<p>This is an automated email. Please do not reply directly.</p>
				</div>
			</div>
		</body>
		</html>
	`, createdOrder.Customer.FirstName, createdOrder.Type, createdOrder.OrderNo,
					createdOrder.Type, createdOrder.OrderNo),
				Body: fmt.Sprintf("Hi %s,\n\nThank you for your order #%s for a %s. We're processing it and will keep you updated.\n\nBest regards,\nThe Acme Team",
					createdOrder.Customer.FirstName, createdOrder.OrderNo, createdOrder.Type),
				Cc:      strings.Split(os.Getenv("CC_EMAIL"), ","),
				Bcc:     strings.Split(os.Getenv("BCC_EMAIL"), ","),
				ReplyTo: "info@renewaa.com",
			}
			logger.Debug(ctx, "Attempting to send email", zap.Any("email_message", emailMsg))
			err := s.emailSender.SendOrderConfirmation(emailMsg)
			if err != nil {
				logger.Error(ctx, "Failed to send order confirmation email", zap.Error(err))
			}
		} else {
			logger.Error(ctx, "Customer information or email missing for order confirmation email (inside goroutine)")
		}
	}()

	// WhatsApp sending logic
	// if createdOrder.Customer != nil && createdOrder.Customer.PhoneNo != "" {
	// 	waSender := whatsapp.NewWhatsAppSender()
	// 	msg := fmt.Sprintf("Hi %s, thank you for your order %s%s. We're processing it and will update you soon. - Renewaa Team",
	// 		createdOrder.Customer.FirstName, createdOrder.Type, createdOrder.OrderNo)

	// 	err := waSender.SendTextMessage(ctx, createdOrder.Customer.PhoneNo, msg)
	// 	if err != nil {
	// 		logger.Error(ctx, "Failed to send WhatsApp message", zap.Error(err))
	// 	} else {
	// 		logger.Info(ctx, "WhatsApp message sent successfully",
	// 			zap.String("customer_id", createdOrder.CustomerID.String()),
	// 			zap.String("phone", createdOrder.Customer.PhoneNo))
	// 	}
	// }
	// s.bus.Publish(events.Event{Type: "order.created", Data: createdOrder})
	return createdOrder, nil
}
