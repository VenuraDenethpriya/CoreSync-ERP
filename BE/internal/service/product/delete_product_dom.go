package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteProductBom(ctx context.Context, bom *domain.Bom, actingClerkID string) (*domain.Bom, string, error) {
	deletedProductBom, err := s.repo.DeleteProductBom(ctx, bom)
	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return deletedProductBom, actorName, nil
}
