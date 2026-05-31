package user

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteUser(ctx context.Context, user *domain.User, actingClerkID string) (*domain.User, string, error) {
	// return s.repo.DeleteUser(ctx, user)
	// Delete the target user
	deletedUser, err := s.repo.DeleteUser(ctx, user)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.repo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)

	return deletedUser.UserModelToDomain(), actorName, nil
}
