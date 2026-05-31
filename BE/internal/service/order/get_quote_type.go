package order

import "context"

func (s *service) GetQuoteType(ctx context.Context) (map[string]string, error) {
	return s.quoteRepo.GetQuoteType(ctx, s.quoteTypes)
}
