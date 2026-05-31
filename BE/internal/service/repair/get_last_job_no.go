package repair

import "context"

func (s *service) GetLastRepairNo(ctx context.Context) (string, error) {
	return s.repairRepo.GetLastRepairNo(ctx)
}
