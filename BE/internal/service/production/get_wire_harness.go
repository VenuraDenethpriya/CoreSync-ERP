package production

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetWireHarness(ctx context.Context, query string, limit int, offset int) ([]*domain.WireHarness, int64, error) {
	return s.productionRepo.GetWireHarness(ctx, query, limit, offset)
}
