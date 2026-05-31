package order

import "context"

func (s *service) GetLastOrderType(ctx context.Context) (map[string]string, error) {
	return s.orderRepo.GetLastOrderType(ctx, s.orderTypes)
}
