package order

import "context"

func (s *service) GetLastQuoteNo(ctx context.Context) (string, error) {
	return s.quoteRepo.GetLastQuoteNo(ctx)
}
