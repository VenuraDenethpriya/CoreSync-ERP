package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetPackByID(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error) {
	return s.orderItemRepo.GetPackById(ctx, pack)
}
