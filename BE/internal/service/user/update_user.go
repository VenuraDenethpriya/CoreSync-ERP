package user

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateUser(ctx context.Context, user *domain.User, actingClerkID string) (*domain.User, string, error) {
	updatedUser, err := s.repo.UpdateUser(ctx, user)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.repo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedUser, actorName, nil
}
