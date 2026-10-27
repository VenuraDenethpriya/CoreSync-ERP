package production

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"math/rand"
	"time"
)

func (s *service) CreateWireHarness(ctx context.Context, baseWireHarness *domain.WireHarness, quantity int) ([]*domain.WireHarness, error) {
	var wireHarnessToCreate []*domain.WireHarness

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < quantity; i++ {
		uniqueSerial := fmt.Sprintf("SN-W-%06d", rand.Intn(1000000))

		newWireHarness := &domain.WireHarness{
			ProductID: baseWireHarness.ProductID,
			Note:      baseWireHarness.Note,
			CreatedBy: baseWireHarness.CreatedBy,
			SerialNo:  uniqueSerial,
		}

		wireHarnessToCreate = append(wireHarnessToCreate, newWireHarness)
	}

	return s.productionRepo.CreateWireHarness(ctx, wireHarnessToCreate)
}
