package repair

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error) {
	createdRepair, err := s.repairRepo.CreateRepair(ctx, repair)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return createdRepair, actorName, nil
}
