// [ADDED 2026-10-13] Calls into the inventory controls after packs and orders change.
package order

import (
	"context"

	"CoreSync-backend/internal/helper/logger"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// The pack/order change is already saved when these run. A stock error is logged (with
// the pack/order id) rather than undoing the user's change; see the review notes.

func (s *service) stockPackCreated(ctx context.Context, packID, productID uuid.UUID, qty int) {
	if s.stock == nil {
		return
	}
	if err := s.stock.SnapshotPackBOM(ctx, packID, productID, qty); err != nil {
		logger.Error(ctx, "stock control: BOM copy for new pack failed", zap.String("pack_id", packID.String()), zap.Error(err))
	}
}

func (s *service) stockPackChanged(ctx context.Context, packID uuid.UUID, actor string) {
	if s.stock == nil {
		return
	}
	if err := s.stock.OnPackChanged(ctx, packID, actor); err != nil {
		logger.Error(ctx, "stock control: pack stock update failed", zap.String("pack_id", packID.String()), zap.Error(err))
	}
}

func (s *service) stockOrderChanged(ctx context.Context, orderID uuid.UUID, actor string) {
	if s.stock == nil || orderID == uuid.Nil {
		return
	}
	if err := s.stock.OnOrderChanged(ctx, orderID, actor); err != nil {
		logger.Error(ctx, "stock control: order stock update failed", zap.String("order_id", orderID.String()), zap.Error(err))
	}
}
