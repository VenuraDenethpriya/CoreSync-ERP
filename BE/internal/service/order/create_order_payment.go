package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateOrderPayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error) {
	return s.paymentRepo.CreateOrderPayment(ctx, payment)
}
