package production

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"math/rand"
	"time"
)

func (s *service) CreateCasings(ctx context.Context, baseCasing *domain.Casing, quantity int) ([]*domain.Casing, error) {
	var casingsToCreate []*domain.Casing

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < quantity; i++ {
		uniqueSerial := fmt.Sprintf("SN-C-%06d", rand.Intn(1000000))

		newCasing := &domain.Casing{
			ProductID: baseCasing.ProductID,
			Note:      baseCasing.Note,
			CreatedBy: baseCasing.CreatedBy,
			SerialNo:  uniqueSerial,
		}

		casingsToCreate = append(casingsToCreate, newCasing)
	}

	return s.productionRepo.CreateCasings(ctx, casingsToCreate)
}
