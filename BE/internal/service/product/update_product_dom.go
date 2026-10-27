package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) UpdateProductBom(ctx context.Context, bom *domain.Bom, actingClerkID string) (*domain.Bom, string, error) {
	updatedBom, err := s.repo.UpdateProductBom(ctx, bom)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedBom, actorName, nil
}
