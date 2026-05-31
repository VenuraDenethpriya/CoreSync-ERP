package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type RepairRepository struct {
	db *gorm.DB
}

func NewRepairRepository(db *gorm.DB) *RepairRepository {
	return &RepairRepository{db: db}
}

func (rs *RepairRepository) CreateRepair(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	repairModel := models.RepairFromDomain(repair)
	if err := rs.db.Create(&repairModel).Error; err != nil {
		logger.Error(ctx, "Error creating repair", zap.String("method", "POST"), zap.String("path", "/repairs"), zap.Any("repair", repair), zap.Error(err))
		return nil, err
	}
	var userModel models.UserModel
	if err := rs.db.First(&userModel, "clerk_id = ?", repairModel.CreatedBy).Error; err == nil {
		repairModel.User = &userModel
	}
	logger.Info(ctx, "Repair created", zap.String("method", "POST"), zap.String("path", "/repairs"), zap.Any("repair", repair))
	return repairModel.RepairToDomain(), nil
}

func (rs *RepairRepository) GetRepairs(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Repair, int, error) {
	var repairModels []*models.RepairModel
	var whereClause string
	var args []interface{}

	searchPattern := "%" + searchQuery + "%"
	whereClause = ` WHERE job_no ILIKE ? OR customer_name ILIKE  ?`
	args = append(args, searchPattern, searchPattern)

	var totalCount int
	countQuery := "SELECT COUNT(*) FROM repairs r " + whereClause
	if err := rs.db.Raw(countQuery, args...).Scan(&totalCount).Error; err != nil {
		return nil, 0, err
	}
	baseQuery := `
	SELECT r.*
	FROM repairs r`
	paginationClause := " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	argsWithPagination := append(args, limit, offset)
	finalQuery := baseQuery + whereClause + paginationClause
	if err := rs.db.Raw(finalQuery, argsWithPagination...).Scan(&repairModels).Error; err != nil {
		return nil, 0, err
	}

	var domainRepairs []*domain.Repair
	for _, r := range repairModels {
		domainRepairs = append(domainRepairs, r.RepairToDomain())
	}
	return domainRepairs, totalCount, nil
}

func (rs *RepairRepository) GetRepairByID(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	var repairModel models.RepairModel
	err := rs.db.WithContext(ctx).
		Preload("User").
		Preload("Order").
		First(&repairModel, "id = ?", repair.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return repairModel.RepairToDomain(), nil
}

func (rs *RepairRepository) DeleteRepair(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	var repairModel models.RepairModel
	err := rs.db.First(&repairModel, "id = ?", repair.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	err = rs.db.Delete(&repairModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting repair", zap.String("method", "DELETE"), zap.String("path", "/repairs/:repair-id"), zap.Any("repairID", repair.ID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sale deleted", zap.String("method", "DELETE"), zap.String("path", "/repairs/:repair-id"), zap.Any("repairID", repair.ID))
	return repairModel.RepairToDomain(), nil
}

func (rs *RepairRepository) UpdateRepair(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	var repairModel models.RepairModel

	err := rs.db.Preload("Order").First(&repairModel, "id = ?", repair.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	updateData := models.RepairModel{
		OrderID:             repair.OrderId,
		Description:         repair.Description,
		Status:              repair.Status,
		DueDate:             repair.DueDate,
		Price:               repair.Price,
		CustomerName:        repair.CustomerName,
		CustomerPhoneNumber: repair.CustomerPhone,
	}

	if err := rs.db.Model(&repairModel).Updates(updateData).Error; err != nil {
		return nil, err
	}

	return repairModel.RepairToDomain(), nil
}

func (rs *RepairRepository) GetLastRepairNo(ctx context.Context) (string, error) {
	var repairModel models.RepairModel
	err := rs.db.Order("job_no desc").First(&repairModel).Error
	if err != nil {
		return "", err
	}
	return repairModel.JobNo, nil
}

func (rs *RepairRepository) CreateRepairUsageAndAdjustInventory(db *gorm.DB, usageReq domain.RepairItemUsage) (*domain.RepairItemUsage, error) {
	var createdUsage domain.RepairItemUsage

	err := db.Transaction(func(tx *gorm.DB) error {
		// Fetch the CHILD item (the specific barcode scanned)
		var childItem models.InventoryItemModel
		if err := tx.Where("id = ?", usageReq.ItemID).First(&childItem).Error; err != nil {
			return err // Returns error if the specific serial ID doesn't exist
		}

		// Fetch the PARENT inventory (to get current stock/hold)
		var parentInventory models.InventoryModel
		if err := tx.Where("id = ?", childItem.ItemID).First(&parentInventory).Error; err != nil {
			return err
		}

		// Adjust Parent Stock and Hold
		if err := tx.Model(&models.InventoryModel{}).
			Where("id = ?", parentInventory.ID).
			Updates(map[string]interface{}{
				"quantity_in_stock": gorm.Expr("quantity_in_stock - ?", 1),
				"hold":              gorm.Expr("CASE WHEN hold > 0 THEN GREATEST(hold - ?, 0) ELSE hold END", 1),
			}).Error; err != nil {
			return err
		}

		// Create the Usage record using the CHILD Item ID
		createdUsage = domain.RepairItemUsage{
			ID:        uuid.New(),
			User:      usageReq.User,
			ItemID:    childItem.ID,
			ItemCode:  childItem.ItemCode,
			RepairID:  usageReq.RepairID,
			JobNo:     usageReq.JobNo,
			UserName:  usageReq.UserName,
			CreatedAt: time.Now(),
		}

		usageModel := models.RepairItemUsageModelFromDomain(&createdUsage)

		if err := tx.Create(usageModel).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &createdUsage, nil
}

type repairUsageRawResult struct {
	ID        uuid.UUID `gorm:"column:id"`
	JObID     uuid.UUID `gorm:"column:repair_id"`
	ItemID    uuid.UUID `gorm:"column:item_id"`
	UserName  string    `gorm:"column:user_name"`
	CreatedAt time.Time `gorm:"column:created_at"`

	ChildCode  string    `gorm:"column:child_code"`
	ParentID   uuid.UUID `gorm:"column:parent_id"`
	ParentCode string    `gorm:"column:parent_code"`
	ParentName string    `gorm:"column:parent_name"`

	JObNo string `gorm:"column:job_no"`

	UserFirstName string `gorm:"column:user_first_name"`
	UserLastName  string `gorm:"column:user_last_name"`
}

func mapRepairRawToDomain(r repairUsageRawResult) *domain.RepairItemUsage {
	finalUserName := r.UserName
	if r.UserFirstName != "" || r.UserLastName != "" {
		finalUserName = r.UserFirstName + " " + r.UserLastName
	}

	return &domain.RepairItemUsage{
		ID:            r.ID,
		ItemID:        r.ItemID,
		ItemCode:      r.ChildCode,
		InventoryID:   r.ParentID,
		InventoryCode: r.ParentCode,
		InventoryName: r.ParentName,
		RepairID:      r.JObID,
		JobNo:         r.JObNo,
		UserName:      finalUserName,
		CreatedAt:     r.CreatedAt,
		User: &domain.User{
			FirstName: r.UserFirstName,
			LastName:  r.UserLastName,
		},
	}
}

func (r *RepairRepository) GetRepairUsageGroupedByJob(
	ctx context.Context,
	itemID uuid.UUID,
	limit, offset int,
) ([]*domain.RepairItemUsage, int, error) {

	var distinctJobs []uuid.UUID
	var total int64
	var isDirectInventoryJoin bool

	base := r.db.Table("repair_item_usage").
		Joins("JOIN inventory_item ii ON ii.id = repair_item_usage.item_id").
		Where("ii.item_id = ?", itemID)

	if err := base.Session(&gorm.Session{}).
		Distinct("repair_item_usage.repair_id").
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		isDirectInventoryJoin = true

		base = r.db.Table("repair_item_usage").
			Joins("JOIN inventory ii ON ii.id = repair_item_usage.item_id").
			Where("repari_item_usage.item_id = ?", itemID)

		if err := base.Session(&gorm.Session{}).
			Distinct("repair_item_usage.repair_id").
			Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	if total == 0 {
		return []*domain.RepairItemUsage{}, 0, nil
	}

	if err := base.Session(&gorm.Session{}).
		Select("repair_item_usage.repair_id").
		Group("repair_item_usage.repair_id").
		Order("MAX(repair_item_usage.created_at) DESC").
		Limit(limit).
		Offset(offset).
		Pluck("repair_item_usage.repair_id", &distinctJobs).Error; err != nil {
		return nil, 0, err
	}

	if len(distinctJobs) == 0 {
		return []*domain.RepairItemUsage{}, int(total), nil
	}

	var rawResults []repairUsageRawResult

	finalQuery := r.db.Table("repair_item_usage").
		Joins("LEFT JOIN repairs o ON o.id = repair_item_usage.repair_id").
		Joins("LEFT JOIN users u ON u.clerk_id = repair_item_usage.user_name").
		Where("repair_item_usage.repair_id IN ?", distinctJobs).
		Order("repair_item_usage.created_at DESC")

	if isDirectInventoryJoin {
		finalQuery = finalQuery.
			Select(`
				repair_item_usage.id, repair_item_usage.repair_id, 
				repair_item_usage.item_id, repair_item_usage.user_name, 
				repair_item_usage.created_at,
				
				'' as child_code,
				ii.id as parent_id,
				ii.item_code as parent_code,
				ii.item_name as parent_name,
				
				o.job_no as job_no,
				u.first_name as user_first_name, u.last_name as user_last_name
			`).
			Joins("JOIN inventory ii ON ii.id = repair_item_usage.item_id").
			Where("repair_item_usage.item_id = ?", itemID)
	} else {
		finalQuery = finalQuery.
			Select(`
				repair_item_usage.id, repair_item_usage.repair_id, 
				repair_item_usage.item_id, repair_item_usage.user_name, 
				repair_item_usage.created_at,
				
				ii.item_code as child_code,
				ii.item_id as parent_id,
				inv.item_code as parent_code,
				inv.item_name as parent_name,
				
				o.job_no as job_no,
				u.first_name as user_first_name, u.last_name as user_last_name
			`).
			Joins("JOIN inventory_item ii ON ii.id = repair_item_usage.item_id").
			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
			Where("ii.item_id = ?", itemID)
	}

	if err := finalQuery.Scan(&rawResults).Error; err != nil {
		return nil, 0, err
	}

	var domainUsages []*domain.RepairItemUsage
	for _, res := range rawResults {
		domainUsages = append(domainUsages, mapRepairRawToDomain(res))
	}

	return domainUsages, int(total), nil
}

func (r *RepairRepository) GetRepairUsageGroupedByInventory(
	ctx context.Context,
	jobID uuid.UUID,
	limit, offset int,
) ([]*domain.RepairItemUsage, int, error) {

	var distinctParents []uuid.UUID
	var total int64
	var isDirectInventoryJoin bool
	var groupByColumn string

	groupByColumn = "ii.item_id"
	base := r.db.Model(&models.RepairItemUsageModel{}).
		Joins("JOIN inventory_item ii ON ii.id = repair_item_usage.item_id").
		Where("repair_item_usage.repair_id = ?", jobID)

	if err := base.Session(&gorm.Session{}).
		Distinct(groupByColumn).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		isDirectInventoryJoin = true
		groupByColumn = "repair_item_usage.item_id"

		base = r.db.Model(&models.RepairItemUsageModel{}).
			Joins("JOIN inventory inv ON inv.id = repair_item_usage.item_id").
			Where("repair_item_usage.repair_id = ?", jobID)

		if err := base.Session(&gorm.Session{}).
			Distinct(groupByColumn).
			Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	if total == 0 {
		return []*domain.RepairItemUsage{}, 0, nil
	}

	if err := base.Session(&gorm.Session{}).
		Select(groupByColumn).
		Group(groupByColumn).
		Order("MAX(repair_item_usage.created_at) DESC").
		Limit(limit).
		Offset(offset).
		Pluck(groupByColumn, &distinctParents).Error; err != nil {
		return nil, 0, err
	}

	if len(distinctParents) == 0 {
		return []*domain.RepairItemUsage{}, int(total), nil
	}

	type Result struct {
		models.RepairItemUsageModel
		ParentID   uuid.UUID `gorm:"column:parent_id"`
		ParentCode string    `gorm:"column:parent_code"`
		ParentName string    `gorm:"column:parent_name"`
		ChildCode  string    `gorm:"column:child_code"`
	}
	var results []Result

	finalQuery := r.db.Table("repair_item_usage").
		Preload("User").
		Preload("Repair").
		Where("repair_item_usage.repair_id = ?", jobID).
		Order("repair_item_usage.created_at DESC")

	if isDirectInventoryJoin {
		finalQuery = finalQuery.
			Select("repair_item_usage.*, repair_item_usage.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, '' as child_code").
			Joins("JOIN inventory inv ON inv.id = repair_item_usage.item_id").
			Where("repair_item_usage.item_id IN ?", distinctParents)
	} else {
		finalQuery = finalQuery.
			Select("repair_item_usage.*, ii.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, ii.item_code as child_code").
			Joins("JOIN inventory_item ii ON ii.id = repair_item_usage.item_id").
			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
			Where("ii.item_id IN ?", distinctParents)
	}

	if err := finalQuery.Find(&results).Error; err != nil {
		return nil, 0, err
	}

	var domainUsages []*domain.RepairItemUsage
	for _, res := range results {
		d := res.RepairItemUsageModel.RepairItemUsageModelToDomain()

		d.InventoryID = res.ParentID
		d.InventoryCode = res.ParentCode
		d.InventoryName = res.ParentName
		if res.ChildCode != "" {
			d.ItemCode = res.ChildCode
		}

		domainUsages = append(domainUsages, d)
	}

	return domainUsages, int(total), nil
}
