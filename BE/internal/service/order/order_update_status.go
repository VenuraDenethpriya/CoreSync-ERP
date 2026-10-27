package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateOrderStatus(ctx context.Context, order *domain.Order, actingClerkID string) (*domain.Order, string, error) {
	updateOrder, err := s.orderRepo.UpdateOrderStatus(ctx, order)
	if err != nil {
		return nil, "", err
	}
	s.stockOrderChanged(ctx, order.OrderID, actingClerkID) // [ADDED 2026-10-13] Delivered -> packs leave finished stock

	// Only send WhatsApp if order is completed
	// if updateOrder.OrderStatus == "Completed" && updateOrder.Customer != nil {
	// 	phone := updateOrder.Customer.PhoneNo

	// 	Ensure E.164 format (add '+' if missing)
	// 	if phone != "" && !strings.HasPrefix(phone, "+") {
	// 		phone = "+" + phone
	// 	}

	// 	waSender := whatsapp.NewWhatsAppSender()
	// 	msg := fmt.Sprintf(
	// 		"Hi %s, your %s order #%s has been completed and is ready for delivery/pickup. – CoreSync Team",
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

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updateOrder, actorName, nil
}
