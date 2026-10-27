package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) GetOrderProductByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	// 1. Call the correct repository method that takes the uuid
	product, err := s.repo.GetOrderProductByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// 2. Return directly! The repository already converted it to a domain object
	return product, nil
}
