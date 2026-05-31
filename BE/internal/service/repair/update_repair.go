package repair

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error) {
	updatedRepair, err := s.repairRepo.UpdateRepair(ctx, repair)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedRepair, actorName, nil
}
