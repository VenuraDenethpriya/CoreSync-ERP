package production

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCasings(ctx context.Context, query string, limit int, offset int) ([]*domain.Casing, int64, error) {
	return s.productionRepo.GetCasings(ctx, query, limit, offset)
}
