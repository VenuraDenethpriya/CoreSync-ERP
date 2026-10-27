package repair

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error) {
	deletedRepair, err := s.repairRepo.DeleteRepair(ctx, repair)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedRepair, actorName, nil
}
