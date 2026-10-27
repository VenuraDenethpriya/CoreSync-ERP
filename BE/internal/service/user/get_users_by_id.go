package user

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetUsersByIDs(ctx context.Context, ids []string) ([]domain.User, error) {
	return s.repo.GetUsersByIDs(ctx, ids)
}
