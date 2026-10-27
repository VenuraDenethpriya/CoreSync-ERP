package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InventoryItemUsageRepository struct {
	db *gorm.DB
}

func NewInventoryItemUsageRepository(db *gorm.DB) *InventoryItemUsageRepository {
	return &InventoryItemUsageRepository{
		db,
	}
}

// func (r *InventoryItemUsageRepository) CreateUsageAndAdjustInventory(db *gorm.DB, usageReq domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {

// 	var createdUsage domain.InventoryItemUsage

// 	err := db.Transaction(func(tx *gorm.DB) error {

// 		var childItem models.InventoryItemModel
// 		if err := tx.Where("id = ?", usageReq.ItemID).First(&childItem).Error; err != nil {
// 			return err
// 		}

// 		var parentInventory models.InventoryModel
// 		if err := tx.Where("id = ?", childItem.ItemID).First(&parentInventory).Error; err != nil {
// 			return err
// 		}

// 		if err := tx.Model(&models.InventoryModel{}).
// 			Where("id = ?", parentInventory.ID).
// 			Updates(map[string]interface{}{
// 				"quantity_in_stock": gorm.Expr("quantity_in_stock - ?", 1),
// 				"hold":              gorm.Expr("CASE WHEN hold > 0 THEN GREATEST(hold - ?, 0) ELSE hold END", 1),
// 			}).Error; err != nil {
// 			return err
// 		}

// 		createdUsage = domain.InventoryItemUsage{
// 			ID:       uuid.New(),
// 			User:     usageReq.User,
// 			ItemID:   childItem.ID,
// 			ItemCode: parentInventory.ItemCode,
// 			// ItemName:  parentInventory.ItemName,
// 			OrderID:   usageReq.OrderID,
// 			OrderType: usageReq.OrderType,
// 			OrederNo:  usageReq.OrederNo,
// 			UserName:  usageReq.UserName,
// 			CreatedAt: time.Now(),
// 		}

// 		usageModel := models.InventoryItemUsageModelFromDomain(&createdUsage)

// 		if err := tx.Create(usageModel).Error; err != nil {
// 			return err
// 		}

// 		return nil
// 	})

// 	if err != nil {
// 		return nil, err
// 	}

//		return &createdUsage, nil
//	}

func (r *InventoryItemUsageRepository) CreateUsageAndAdjustInventory(db *gorm.DB, usageReq domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {
	var createdUsage domain.InventoryItemUsage

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
		createdUsage = domain.InventoryItemUsage{
			ID:        uuid.New(),
			User:      usageReq.User,
			ItemID:    childItem.ID,
			ItemCode:  childItem.ItemCode,
			OrderID:   usageReq.OrderID,
			PackID:    usageReq.PackID,
			OrderType: usageReq.OrderType,
			OrederNo:  usageReq.OrederNo,
			UserName:  usageReq.UserName,
			CreatedAt: time.Now(),
		}

		usageModel := models.InventoryItemUsageModelFromDomain(&createdUsage)

		// Ensure the model ItemID is assigned the Child ID
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

type usageRawResult struct {
	ID        uuid.UUID `gorm:"column:id"`
	OrderID   uuid.UUID `gorm:"column:order_id"`
	ItemID    uuid.UUID `gorm:"column:item_id"`
	UserName  string    `gorm:"column:user_name"`
	CreatedAt time.Time `gorm:"column:created_at"`

	ChildCode  string    `gorm:"column:child_code"`
	ParentID   uuid.UUID `gorm:"column:parent_id"`
	ParentCode string    `gorm:"column:parent_code"`
	ParentName string    `gorm:"column:parent_name"`

	OrderType string `gorm:"column:order_type"`
	OrderNo   string `gorm:"column:order_no"`

	PackID   uuid.UUID `gorm:"column:pack_id"`
	SerialNo string    `gorm:"column:serial_no"`

	UserFirstName string `gorm:"column:user_first_name"`
	UserLastName  string `gorm:"column:user_last_name"`
}

func mapRawToDomain(r usageRawResult) *domain.InventoryItemUsage {
	finalUserName := r.UserName
	if r.UserFirstName != "" || r.UserLastName != "" {
		finalUserName = r.UserFirstName + " " + r.UserLastName
	}

	return &domain.InventoryItemUsage{
		ID:            r.ID,
		ItemID:        r.ItemID,
		ItemCode:      r.ChildCode,
		InventoryID:   r.ParentID,
		InventoryCode: r.ParentCode,
		InventoryName: r.ParentName,
		OrderID:       r.OrderID,
		OrderType:     r.OrderType,
		OrederNo:      r.OrderNo,
		PackID:        r.PackID,
		SerialNo:      r.SerialNo,
		UserName:      finalUserName,
		CreatedAt:     r.CreatedAt,
		User: &domain.User{
			FirstName: r.UserFirstName,
			LastName:  r.UserLastName,
		},
	}
}

// func (r *InventoryItemUsageRepository) GetUsageGroupedByOrder(
// 	ctx context.Context,
// 	itemID uuid.UUID,
// 	limit, offset int,
// ) ([]*domain.InventoryItemUsage, int, error) {

// 	var distinctOrders []uuid.UUID
// 	var total int64
// 	var isDirectInventoryJoin bool

// 	base := r.db.Table("inventory_item_usage").
// 		Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
// 		Where("ii.item_id = ?", itemID)

// 	if err := base.Session(&gorm.Session{}).
// 		Distinct("inventory_item_usage.order_id").
// 		Count(&total).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	if total == 0 {
// 		isDirectInventoryJoin = true

// 		base = r.db.Table("inventory_item_usage").
// 			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
// 			Where("inventory_item_usage.item_id = ?", itemID)

// 		if err := base.Session(&gorm.Session{}).
// 			Distinct("inventory_item_usage.order_id").
// 			Count(&total).Error; err != nil {
// 			return nil, 0, err
// 		}
// 	}

// 	if total == 0 {
// 		return []*domain.InventoryItemUsage{}, 0, nil
// 	}

// 	if err := base.Session(&gorm.Session{}).
// 		Select("inventory_item_usage.order_id").
// 		Group("inventory_item_usage.order_id").
// 		Order("MAX(inventory_item_usage.created_at) DESC").
// 		Limit(limit).
// 		Offset(offset).
// 		Pluck("inventory_item_usage.order_id", &distinctOrders).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	if len(distinctOrders) == 0 {
// 		return []*domain.InventoryItemUsage{}, int(total), nil
// 	}

// 	var rawResults []usageRawResult

// 	finalQuery := r.db.Table("inventory_item_usage").
// 		Joins("LEFT JOIN orders o ON o.order_id = inventory_item_usage.order_id").
// 		Joins("LEFT JOIN users u ON u.clerk_id = inventory_item_usage.user_name").
// 		Where("inventory_item_usage.order_id IN ?", distinctOrders).
// 		Order("inventory_item_usage.created_at DESC")

// 	if isDirectInventoryJoin {
// 		finalQuery = finalQuery.
// 			Select(`
// 				inventory_item_usage.id, inventory_item_usage.order_id,
// 				inventory_item_usage.item_id, inventory_item_usage.user_name,
// 				inventory_item_usage.created_at,

// 				'' as child_code,
// 				ii.id as parent_id,
// 				ii.item_code as parent_code,
// 				ii.item_name as parent_name,

// 				o.type as order_type, o.order_no as order_no,
// 				u.first_name as user_first_name, u.last_name as user_last_name
// 			`).
// 			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
// 			Where("inventory_item_usage.item_id = ?", itemID)
// 	} else {
// 		finalQuery = finalQuery.
// 			Select(`
// 				inventory_item_usage.id, inventory_item_usage.order_id,
// 				inventory_item_usage.item_id, inventory_item_usage.user_name,
// 				inventory_item_usage.created_at,

// 				ii.item_code as child_code,
// 				ii.item_id as parent_id,
// 				inv.item_code as parent_code,
// 				inv.item_name as parent_name,

// 				o.type as order_type, o.order_no as order_no,
// 				u.first_name as user_first_name, u.last_name as user_last_name
// 			`).
// 			Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
// 			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
// 			Where("ii.item_id = ?", itemID)
// 	}

// 	if err := finalQuery.Scan(&rawResults).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	var domainUsages []*domain.InventoryItemUsage
// 	for _, res := range rawResults {
// 		domainUsages = append(domainUsages, mapRawToDomain(res))
// 	}

//		return domainUsages, int(total), nil
//	}

func (r *InventoryItemUsageRepository) GetUsageGroupedByOrder(
	ctx context.Context,
	itemID uuid.UUID,
	limit, offset int,
) ([]*domain.InventoryItemUsage, int, error) {

	var total int64
	var isDirectInventoryJoin bool

	base := r.db.Table("inventory_item_usage").
		Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
		Where("ii.item_id = ?", itemID)

	// FIX: Prioritize Pack ID over Order ID. Added NULLIF to safely ignore zero-value UUIDs.
	groupExpr := "COALESCE(NULLIF(inventory_item_usage.pack_id, '00000000-0000-0000-0000-000000000000'::uuid), NULLIF(inventory_item_usage.order_id, '00000000-0000-0000-0000-000000000000'::uuid), inventory_item_usage.id)"

	// 1. EXACT COUNT OF UNIFIED GROUPS
	if err := r.db.Table("(?) as subquery", base.Select(groupExpr).Group(groupExpr)).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		isDirectInventoryJoin = true

		base = r.db.Table("inventory_item_usage").
			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
			Where("inventory_item_usage.item_id = ?", itemID)

		if err := r.db.Table("(?) as subquery", base.Select(groupExpr).Group(groupExpr)).
			Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	if total == 0 {
		return []*domain.InventoryItemUsage{}, 0, nil
	}

	// 2. PLUCK DISTINCT GROUP IDs
	var groupIDs []string

	if err := base.Session(&gorm.Session{}).
		Select(groupExpr).
		Group(groupExpr).
		Order("MAX(inventory_item_usage.created_at) DESC").
		Limit(limit).
		Offset(offset).
		Pluck(groupExpr, &groupIDs).Error; err != nil {
		return nil, 0, err
	}

	if len(groupIDs) == 0 {
		return []*domain.InventoryItemUsage{}, int(total), nil
	}

	// 3. FINAL QUERY JOINING BOTH ORDERS AND PACKS
	var rawResults []usageRawResult

	finalQuery := r.db.Table("inventory_item_usage").
		Joins("LEFT JOIN orders ord ON ord.order_id = inventory_item_usage.order_id").
		Joins("LEFT JOIN order_items pack ON pack.id = inventory_item_usage.pack_id"). // Join pack for serial_no
		Joins("LEFT JOIN users u ON u.clerk_id = inventory_item_usage.user_name").
		Where(groupExpr+" IN ?", groupIDs).
		Order("inventory_item_usage.created_at DESC")

	selectDirect := `
		inventory_item_usage.id, 
		COALESCE(inventory_item_usage.order_id, '00000000-0000-0000-0000-000000000000'::uuid) as order_id, 
		COALESCE(inventory_item_usage.pack_id, '00000000-0000-0000-0000-000000000000'::uuid) as pack_id,
		inventory_item_usage.item_id, inventory_item_usage.user_name,
		inventory_item_usage.created_at,

		'' as child_code,
		ii.id as parent_id,
		ii.item_code as parent_code,
		ii.item_name as parent_name,

		COALESCE(ord.type, '') as order_type, 
		COALESCE(ord.order_no, '') as order_no,
		COALESCE(pack.serial_no, '') as serial_no,
		COALESCE(u.first_name, '') as user_first_name, 
		COALESCE(u.last_name, '') as user_last_name
	`

	selectIndirect := `
		inventory_item_usage.id, 
		COALESCE(inventory_item_usage.order_id, '00000000-0000-0000-0000-000000000000'::uuid) as order_id, 
		COALESCE(inventory_item_usage.pack_id, '00000000-0000-0000-0000-000000000000'::uuid) as pack_id,
		inventory_item_usage.item_id, inventory_item_usage.user_name,
		inventory_item_usage.created_at,

		ii.item_code as child_code,
		ii.item_id as parent_id,
		inv.item_code as parent_code,
		inv.item_name as parent_name,

		COALESCE(ord.type, '') as order_type, 
		COALESCE(ord.order_no, '') as order_no,
		COALESCE(pack.serial_no, '') as serial_no,
		COALESCE(u.first_name, '') as user_first_name, 
		COALESCE(u.last_name, '') as user_last_name
	`

	if isDirectInventoryJoin {
		finalQuery = finalQuery.
			Select(selectDirect).
			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
			Where("inventory_item_usage.item_id = ?", itemID)
	} else {
		finalQuery = finalQuery.
			Select(selectIndirect).
			Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
			Where("ii.item_id = ?", itemID)
	}

	if err := finalQuery.Scan(&rawResults).Error; err != nil {
		return nil, 0, err
	}

	var domainUsages []*domain.InventoryItemUsage
	for _, res := range rawResults {
		domainUsages = append(domainUsages, mapRawToDomain(res))
	}

	return domainUsages, int(total), nil
}

func (r *InventoryItemUsageRepository) GetUsageGroupedByPack(
	ctx context.Context,
	packID uuid.UUID,
	limit, offset int,
) ([]*domain.InventoryItemUsage, int, error) {

	var distinctParentIDs []uuid.UUID
	var total int64
	var isDirectInventoryJoin bool

	// 1. Fixed Join: Join on inventory_item to find distinct Parent Inventory IDs (ii.item_id)
	base := r.db.Table("inventory_item_usage").
		Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
		Where("inventory_item_usage.pack_id = ?", packID)

	if err := base.Session(&gorm.Session{}).
		Distinct("ii.item_id").
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 2. Fallback for direct inventory joins
	if total == 0 {
		isDirectInventoryJoin = true

		base = r.db.Table("inventory_item_usage").
			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
			Where("inventory_item_usage.pack_id = ?", packID)

		if err := base.Session(&gorm.Session{}).
			Distinct("ii.id").
			Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	if total == 0 {
		return []*domain.InventoryItemUsage{}, 0, nil
	}

	// 3. Pluck the distinct PARENT inventories (applying limit/offset to the main inventory groups)
	pluckColumn := "ii.item_id"
	if isDirectInventoryJoin {
		pluckColumn = "ii.id"
	}

	if err := base.Session(&gorm.Session{}).
		Select(pluckColumn).
		Group(pluckColumn).
		Order("MAX(inventory_item_usage.created_at) DESC").
		Limit(limit).
		Offset(offset).
		Pluck(pluckColumn, &distinctParentIDs).Error; err != nil {
		return nil, 0, err
	}

	if len(distinctParentIDs) == 0 {
		return []*domain.InventoryItemUsage{}, int(total), nil
	}

	var rawResults []usageRawResult

	// 4. Fixed Final Query: Fetch ALL child usages for the paginated parent inventories
	finalQuery := r.db.Table("inventory_item_usage").
		Joins("LEFT JOIN order_items o ON o.id = inventory_item_usage.pack_id").
		Joins("LEFT JOIN users u ON u.clerk_id = inventory_item_usage.user_name").
		Where("inventory_item_usage.pack_id = ?", packID).
		Order("inventory_item_usage.created_at DESC")

	if isDirectInventoryJoin {
		finalQuery = finalQuery.
			Select(`
				inventory_item_usage.id, inventory_item_usage.pack_id, 
				inventory_item_usage.item_id, inventory_item_usage.user_name, 
				inventory_item_usage.created_at,
				
				'' as child_code,
				ii.id as parent_id,
				ii.item_code as parent_code,
				ii.item_name as parent_name,
				
				o.serial_no as serial_no,
				u.first_name as user_first_name, u.last_name as user_last_name
			`).
			Joins("JOIN inventory ii ON ii.id = inventory_item_usage.item_id").
			Where("ii.id IN ?", distinctParentIDs) // Filter by parent IDs
	} else {
		finalQuery = finalQuery.
			Select(`
				inventory_item_usage.id, inventory_item_usage.pack_id, 
				inventory_item_usage.item_id, inventory_item_usage.user_name, 
				inventory_item_usage.created_at,
				
				ii.item_code as child_code,
				ii.item_id as parent_id,
				inv.item_code as parent_code,
				inv.item_name as parent_name,
				
				o.serial_no as serial_no,
				u.first_name as user_first_name, u.last_name as user_last_name
			`).
			Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
			Where("ii.item_id IN ?", distinctParentIDs) // Filter by parent IDs
	}

	if err := finalQuery.Scan(&rawResults).Error; err != nil {
		return nil, 0, err
	}

	var domainUsages []*domain.InventoryItemUsage
	for _, res := range rawResults {
		domainUsages = append(domainUsages, mapRawToDomain(res))
	}

	return domainUsages, int(total), nil
}

func (r *InventoryItemUsageRepository) GetUsageGroupedByInventory(
	ctx context.Context,
	orderID uuid.UUID,
	limit, offset int,
) ([]*domain.InventoryItemUsage, int, error) {

	var distinctParents []uuid.UUID
	var total int64
	var isDirectInventoryJoin bool
	var groupByColumn string

	groupByColumn = "ii.item_id"
	base := r.db.Model(&models.InventoryItemUsageModel{}).
		Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
		Where("inventory_item_usage.order_id = ?", orderID)

	if err := base.Session(&gorm.Session{}).
		Distinct(groupByColumn).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		isDirectInventoryJoin = true
		groupByColumn = "inventory_item_usage.item_id"

		base = r.db.Model(&models.InventoryItemUsageModel{}).
			Joins("JOIN inventory inv ON inv.id = inventory_item_usage.item_id").
			Where("inventory_item_usage.order_id = ?", orderID)

		if err := base.Session(&gorm.Session{}).
			Distinct(groupByColumn).
			Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	if total == 0 {
		return []*domain.InventoryItemUsage{}, 0, nil
	}

	if err := base.Session(&gorm.Session{}).
		Select(groupByColumn).
		Group(groupByColumn).
		Order("MAX(inventory_item_usage.created_at) DESC").
		Limit(limit).
		Offset(offset).
		Pluck(groupByColumn, &distinctParents).Error; err != nil {
		return nil, 0, err
	}

	if len(distinctParents) == 0 {
		return []*domain.InventoryItemUsage{}, int(total), nil
	}

	type Result struct {
		models.InventoryItemUsageModel
		ParentID   uuid.UUID `gorm:"column:parent_id"`
		ParentCode string    `gorm:"column:parent_code"`
		ParentName string    `gorm:"column:parent_name"`
		ChildCode  string    `gorm:"column:child_code"`
	}
	var results []Result

	finalQuery := r.db.Table("inventory_item_usage").
		Preload("User").
		Preload("Order").
		Where("inventory_item_usage.order_id = ?", orderID).
		Order("inventory_item_usage.created_at DESC")

	if isDirectInventoryJoin {
		finalQuery = finalQuery.
			Select("inventory_item_usage.*, inventory_item_usage.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, '' as child_code").
			Joins("JOIN inventory inv ON inv.id = inventory_item_usage.item_id").
			Where("inventory_item_usage.item_id IN ?", distinctParents)
	} else {
		finalQuery = finalQuery.
			Select("inventory_item_usage.*, ii.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, ii.item_code as child_code").
			Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
			Where("ii.item_id IN ?", distinctParents)
	}

	if err := finalQuery.Find(&results).Error; err != nil {
		return nil, 0, err
	}

	var domainUsages []*domain.InventoryItemUsage
	for _, res := range results {
		d := res.InventoryItemUsageModel.InventoryItemUsageModelToDomain()

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

// func (r *InventoryItemUsageRepository) GetUsageGroupedByInventory(
// 	ctx context.Context,
// 	orderID uuid.UUID,
// 	limit, offset int,
// ) ([]*domain.InventoryItemUsage, int, error) {

// 	var distinctParents []uuid.UUID
// 	var total int64
// 	var isDirectInventoryJoin bool
// 	var groupByColumn string

// 	groupByColumn = "ii.item_id"
// 	base := r.db.Model(&models.InventoryItemUsageModel{}).
// 		Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
// 		Where("inventory_item_usage.order_id = ?", orderID)

// 	if err := base.Session(&gorm.Session{}).
// 		Distinct(groupByColumn).
// 		Count(&total).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	if total == 0 {
// 		isDirectInventoryJoin = true
// 		groupByColumn = "inventory_item_usage.item_id"

// 		base = r.db.Model(&models.InventoryItemUsageModel{}).
// 			Joins("JOIN inventory inv ON inv.id = inventory_item_usage.item_id").
// 			Where("inventory_item_usage.order_id = ?", orderID)

// 		if err := base.Session(&gorm.Session{}).
// 			Distinct(groupByColumn).
// 			Count(&total).Error; err != nil {
// 			return nil, 0, err
// 		}
// 	}

// 	if total == 0 {
// 		return []*domain.InventoryItemUsage{}, 0, nil
// 	}

// 	if err := base.Session(&gorm.Session{}).
// 		Select(groupByColumn).
// 		Group(groupByColumn).
// 		Order("MAX(inventory_item_usage.created_at) DESC").
// 		Limit(limit).
// 		Offset(offset).
// 		Pluck(groupByColumn, &distinctParents).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	if len(distinctParents) == 0 {
// 		return []*domain.InventoryItemUsage{}, int(total), nil
// 	}

// 	type Result struct {
// 		models.InventoryItemUsageModel
// 		ParentID   uuid.UUID `gorm:"column:parent_id"`
// 		ParentCode string    `gorm:"column:parent_code"`
// 		ParentName string    `gorm:"column:parent_name"`
// 		ChildCode  string    `gorm:"column:child_code"`
// 	}
// 	var results []Result

// 	finalQuery := r.db.Table("inventory_item_usage").
// 		Preload("User").
// 		Preload("Order").
// 		Where("inventory_item_usage.order_id = ?", orderID).
// 		Order("inventory_item_usage.created_at DESC")

// 	if isDirectInventoryJoin {
// 		finalQuery = finalQuery.
// 			Select("inventory_item_usage.*, inventory_item_usage.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, '' as child_code").
// 			Joins("JOIN inventory inv ON inv.id = inventory_item_usage.item_id").
// 			Where("inventory_item_usage.item_id IN ?", distinctParents)
// 	} else {
// 		finalQuery = finalQuery.
// 			Select("inventory_item_usage.*, ii.item_id as parent_id, inv.item_code as parent_code, inv.item_name as parent_name, ii.item_code as child_code").
// 			Joins("JOIN inventory_item ii ON ii.id = inventory_item_usage.item_id").
// 			Joins("LEFT JOIN inventory inv ON inv.id = ii.item_id").
// 			Where("ii.item_id IN ?", distinctParents)
// 	}

// 	if err := finalQuery.Find(&results).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	var domainUsages []*domain.InventoryItemUsage
// 	for _, res := range results {
// 		d := res.InventoryItemUsageModel.InventoryItemUsageModelToDomain()

// 		d.UsageCount = res.InventoryItemUsageModel.UsageCount

// 		d.InventoryID = res.ParentID
// 		d.InventoryCode = res.ParentCode
// 		d.InventoryName = res.ParentName
// 		if res.ChildCode != "" {
// 			d.ItemCode = res.ChildCode
// 		}

// 		domainUsages = append(domainUsages, d)
// 	}

// 	return domainUsages, int(total), nil
// }

func (iu *InventoryItemUsageRepository) DeleteInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {
	var usageModel models.InventoryItemUsageModel
	var InventoryModel models.InventoryModel

	if err := iu.db.WithContext(ctx).
		Preload("Inventory").
		Preload("Order").
		Preload("User").
		First(&usageModel, "id = ?", inventoryItemUsage.ID).Error; err != nil {
		return nil, err
	}
	err := iu.db.First(&InventoryModel, "id = ?", inventoryItemUsage.ItemID).Error
	if err != nil {
		return nil, err
	}

	// InventoryModel.QuantityInStock += inventoryItemUsage.UsageCount

	switch {
	case InventoryModel.QuantityInStock == 0:
		InventoryModel.Status = "Out of Stock"
	case InventoryModel.QuantityInStock < int(InventoryModel.Threshold):
		InventoryModel.Status = "Low Stock"
	default:
		InventoryModel.Status = "In Stock"
	}

	if err := iu.db.Updates(&InventoryModel).Error; err != nil {
		return nil, err
	}
	if err := iu.db.WithContext(ctx).Debug().
		Model(&models.InventoryModel{}).
		Where("id = ?", inventoryItemUsage.ItemID).
		// UpdateColumn("hold", gorm.Expr("hold + ? ", inventoryItemUsage.UsageCount)).
		Error; err != nil {
		return nil, err
	}
	err = iu.db.Delete(&usageModel).Error
	if err != nil {
		return nil, err
	}
	return usageModel.InventoryItemUsageModelToDomain(), nil
}

func (iu *InventoryItemUsageRepository) UpdateInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {
	var usageModel models.InventoryItemUsageModel
	var InventoryModel models.InventoryModel

	err := iu.db.First(&usageModel, "id = ?", inventoryItemUsage.ID).Error
	if err != nil {
		return nil, err
	}
	err = iu.db.First(&InventoryModel, "id = ?", inventoryItemUsage.ItemID).Error
	if err != nil {
		return nil, err
	}
	// InventoryModel.QuantityInStock += inventoryItemUsage.OldUsageCount
	// InventoryModel.QuantityInStock -= inventoryItemUsage.NewUsageCount
	switch {
	case InventoryModel.QuantityInStock == 0:
		InventoryModel.Status = "Out of Stock"
	case InventoryModel.QuantityInStock < int(InventoryModel.Threshold):
		InventoryModel.Status = "Low Stock"
	default:
		InventoryModel.Status = "In Stock"
	}
	if err := iu.db.Save(&InventoryModel).Error; err != nil {
		return nil, err
	}
	// usageModel.UsageCount = inventoryItemUsage.NewUsageCount
	err = iu.db.Save(&usageModel).Error
	if err != nil {
		return nil, err
	}
	// if err := iu.db.WithContext(ctx).Debug().
	// 	Model(&models.InventoryModel{}).
	// 	Where("id = ?", inventoryItemUsage.ItemID).
	// 	UpdateColumn("hold", gorm.Expr("hold + ? - ?", inventoryItemUsage.OldUsageCount, inventoryItemUsage.NewUsageCount)).
	// 	Error; err != nil {
	// 	return nil, err
	// }

	if err := iu.db.WithContext(ctx).
		Preload("Inventory").
		Preload("Order").
		Preload("User").
		First(&usageModel, "id = ?", usageModel.ID).Error; err != nil {
		logger.Error(ctx, "Failed to preload inventory and order data", zap.Error(err))
		return nil, err
	}
	return usageModel.InventoryItemUsageModelToDomain(), nil
}
