package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteCustomer(ctx context.Context, customer *domain.Customer, actingClerkID string) (*domain.Customer, string, error) {
	deletedCustomer, err := s.repo.DeleteCustomer(ctx, customer)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedCustomer, actorName, nil
}
