package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetOrderPaymentList(ctx context.Context, query string, limit int, offset int) ([]*domain.Payment, int, error) {
	payments, total, err := s.paymentRepo.GetOrderPaymentList(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return payments, total, nil
}
