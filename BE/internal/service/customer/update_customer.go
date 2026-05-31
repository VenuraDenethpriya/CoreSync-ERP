package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateCustomer(ctx context.Context, customer *domain.Customer, actingClerkID string) (*domain.Customer, string, error) {
	updatedCustomer, err := s.repo.UpdateCustomer(ctx, customer)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatedCustomer, actorName, nil

}
