package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteProduct(ctx context.Context, product *domain.Product, actingClerkID string) (*domain.Product, string, error) {
	deletedProduct, err := s.repo.DeleteProduct(ctx, product)

	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return deletedProduct, actorName, nil
}
