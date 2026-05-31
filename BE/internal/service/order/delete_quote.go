package order

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) DeleteQuote(ctx context.Context, quoteID uuid.UUID) (*domain.Quote, error) {
	return s.quoteRepo.DeleteQuote(ctx, quoteID)
}
