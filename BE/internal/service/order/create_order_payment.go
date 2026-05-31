package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateOrderPayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error) {
	return s.paymentRepo.CreateOrderPayment(ctx, payment)
}
