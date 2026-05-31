package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateOrderStatus(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	updateOrder, err := s.orderRepo.UpdateOrderStatus(ctx, order)
	if err != nil {
		return nil, err
	}

	// Only send WhatsApp if order is completed
	// if updateOrder.OrderStatus == "Completed" && updateOrder.Customer != nil {
	// 	phone := updateOrder.Customer.PhoneNo

	// 	Ensure E.164 format (add '+' if missing)
	// 	if phone != "" && !strings.HasPrefix(phone, "+") {
	// 		phone = "+" + phone
	// 	}

	// 	waSender := whatsapp.NewWhatsAppSender()
	// 	msg := fmt.Sprintf(
	// 		"Hi %s, your %s order #%s has been completed and is ready for delivery/pickup. – Renewaa Team",
	// 		updateOrder.Customer.FirstName, updateOrder.Type, updateOrder.OrderNo,
	// 	)

	// 	err := waSender.SendTextMessage(ctx, phone, msg)
	// 	if err != nil {
	// 		logger.Error(ctx, "Failed to send WhatsApp message",
	// 			zap.Error(err),
	// 			zap.String("customer_id", updateOrder.CustomerID.String()),
	// 			zap.String("phone", phone))
	// 	} else {
	// 		logger.Info(ctx, "WhatsApp message sent successfully",
	// 			zap.String("customer_id", updateOrder.CustomerID.String()),
	// 			zap.String("phone", phone))
	// 	}
	// }

	return updateOrder, nil
}
