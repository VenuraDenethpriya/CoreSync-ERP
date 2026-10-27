package finance

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetPurchaseOrderByID(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error) {
	return s.financeRepo.GetPurchaseOrderByID(ctx, purchaseOrder)
}
