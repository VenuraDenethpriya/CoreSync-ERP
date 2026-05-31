package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"strconv"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

// NewOrderRepository creates a new order repository instance
func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{
		db,
	}
}

// CreateOrder creates a new order in the database
func (ur *OrderRepository) CreateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	fmt.Println("SalesID received 3:", order.SalesID)
	orderModel := models.OrderModelFromDomain(order)
	if err := ur.db.Create(orderModel).Error; err != nil {
		logger.Error(ctx, "Error creating order", zap.String("method", "POST"), zap.String("path", "orders"), zap.Any("orders", order), zap.Error(err))
		return nil, err
	}

	// Fetch the created order with its customer association
	var loaded models.OrderModel
	if err := ur.db.Preload("Customer").First(&loaded, "order_id = ?", orderModel.OrderID).Error; err != nil {
		return orderModel.OrderModelToDomain(), nil
	}

	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", loaded.CreatedBy).Error; err == nil {
		loaded.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", loaded.CreatedBy), zap.Error(err))
	}

	// Convert the fully loaded model back to a domain object and return
	return loaded.OrderModelToDomain(), nil
}

func (ur *OrderRepository) GetLastOrderType(ctx context.Context, types []string) (map[string]string, error) {
	lastestOrders := make(map[string]string)
	logger.Info(ctx, "Getting lastest order for each type", zap.Any("order_types", types))

	for _, orderType := range types {
		var order models.OrderModel
		err := ur.db.
			Unscoped().
			Where("type = ?", orderType).
			Order("created_at DESC").
			First(&order).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				logger.Error(ctx, "No lastest order found for type", zap.String("order_type", orderType), zap.Error(err))
				continue
			}
			return nil, fmt.Errorf("failed to get lastest order for type %s: %w", orderType, err)
		}

		logger.Info(ctx, "Lastest order found", zap.String("order_type", orderType), zap.String("order_no", order.OrderNo))
		lastestOrders[orderType] = order.OrderNo
	}

	return lastestOrders, nil
}

// GetAllOrders retrieves all orders from the database with pagination
func (ur *OrderRepository) GetAllOrders(ctx context.Context, searchQuery string, limit int, offset int, vat string, orderStatus string, paymentStatus string) ([]*domain.Order, int, error) {

	// Building the base query
	dbQuery := ur.db.WithContext(ctx).Model(&models.OrderModel{}).
		Joins("LEFT JOIN customers c ON c.customer_id = orders.customer_id")

	// Search query
	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		dbQuery = dbQuery.Where(
			"(orders.order_no ILIKE ? OR c.first_name ILIKE ? OR c.last_name ILIKE ?)",
			searchPattern, searchPattern, searchPattern,
		)
	}

	// Add filters
	if vat != "" {
		vatBool, err := strconv.ParseBool(vat)
		if err == nil {
			dbQuery = dbQuery.Where("orders.vat = ?", vatBool)
		}
	}
	if orderStatus != "" {
		dbQuery = dbQuery.Where("orders.order_status = ?", orderStatus)
	}
	if paymentStatus != "" {
		dbQuery = dbQuery.Where("orders.payment_status = ?", paymentStatus)
	}

	// Total count using the constructed query
	var totalOrders int64
	if err := dbQuery.Count(&totalOrders).Error; err != nil {
		return nil, 0, err
	}

	// Paginated data using the *same* query chain
	var orders []*models.OrderModel
	if err := dbQuery.
		Preload("Customer").
		Order("orders.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	// Map to domain models
	var domainOrders []*domain.Order
	for _, o := range orders {
		domainOrders = append(domainOrders, o.OrderModelToDomain())
	}
	return domainOrders, int(totalOrders), nil
}

func (ur *OrderRepository) GetAllDraftedOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, int, error) {
	searchPattern := "%" + searchQuery + "%"

	var orders []*models.OrderModel
	var totalOrders int64

	if err := ur.db.Model(&models.OrderModel{}).
		Joins("LEFT JOIN customers c ON c.customer_id = orders.customer_id").
		Where(`(
        orders.order_no ILIKE ? OR 
        c.first_name ILIKE ? OR 
        c.last_name ILIKE ? OR 
        orders.payment_status ILIKE ?
    ) AND orders.order_status = 'Drafted' OR orders.order_status = 'In Progress'`,
			searchPattern, searchPattern, searchPattern, searchPattern).
		Count(&totalOrders).Error; err != nil {
		return nil, 0, err
	}

	if err := ur.db.
		Preload("Customer").
		Where(`(
        order_no ILIKE ? OR 
        order_status ILIKE ? OR 
        payment_status ILIKE ?
    ) AND order_status = 'Drafted' OR order_status = 'In Progress'`,
			searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	var domainOrders []*domain.Order
	for _, o := range orders {
		domainOrders = append(domainOrders, o.OrderModelToDomain())
	}
	return domainOrders, int(totalOrders), nil
}

// func (ur *OrderRepository) UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
// 	var orderModel models.OrderModel
// 	err := ur.db.First(&orderModel, order.OrderID).Error
// 	if err != nil {
// 		return nil, err
// 	}
// 	orderModel.OrderNo = order.OrderNo
// 	orderModel.SubTotal = order.SubTotal
// 	orderModel.AdditionalCharges = models.ConvertAdditionalChargesFromDomain(order.AdditionalCharges)
// 	orderModel.Discount = order.Discount
// 	orderModel.Total = order.Total
// 	orderModel.Vat = order.Vat
// 	orderModel.OrderStatus = order.OrderStatus
// 	orderModel.PaymentStatus = order.PaymentStatus
// 	orderModel.CreatedBy = order.CreatedBy
// 	orderModel.PoNo = order.PoNo
// 	if order.SalesID == uuid.Nil {
// 		orderModel.SalesID = nil
// 	} else {
// 		orderModel.SalesID = &order.SalesID
// 	}
// 	// orderModel.Assignee, err = json.Marshal(order.Assignee)
// 	// if err != nil {
// 	// 	return nil, fmt.Errorf("failed to marshal assignee: %w", err)
// 	// }
// 	// orderModel.Supervisor = order.Supervisor
// 	// orderModel.CADFiles = models.ConvertCADFileFromDomain(order.CADFiles)
// 	// orderModel.Designer = models.ConvertDesignerFromDomain(order.Designer)
// 	err = ur.db.Updates(&orderModel).Error

// 	if err != nil {
// 		logger.Error(ctx, "Error updating order", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order), zap.Error(err))
// 		return nil, err
// 	}

// 	// Explicitly fetch the user by the ClerkID
// 	var userModel models.UserModel
// 	if err := ur.db.First(&userModel, "clerk_id = ?", orderModel.CreatedBy).Error; err == nil {
// 		orderModel.User = userModel
// 	} else {
// 		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", orderModel.CreatedBy), zap.Error(err))
// 	}

//		logger.Info(ctx, "Order updated", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order))
//		return orderModel.OrderModelToDomain(), nil
//	}
func (ur *OrderRepository) UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	var orderModel models.OrderModel
	err := ur.db.First(&orderModel, order.OrderID).Error
	if err != nil {
		return nil, err
	}

	orderModel.OrderNo = order.OrderNo
	orderModel.SubTotal = order.SubTotal
	orderModel.AdditionalCharges = models.ConvertAdditionalChargesFromDomain(order.AdditionalCharges)
	orderModel.Discount = order.Discount
	orderModel.Total = order.Total
	orderModel.Vat = order.Vat
	orderModel.OrderStatus = order.OrderStatus
	orderModel.PaymentStatus = order.PaymentStatus
	orderModel.CreatedBy = order.CreatedBy
	orderModel.PoNo = order.PoNo

	if order.SalesID == uuid.Nil {
		orderModel.SalesID = nil
	} else {
		orderModel.SalesID = &order.SalesID
	}

	// orderModel.Assignee, err = json.Marshal(order.Assignee)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to marshal assignee: %w", err)
	// }
	// orderModel.Supervisor = order.Supervisor
	// orderModel.CADFiles = models.ConvertCADFileFromDomain(order.CADFiles)
	// orderModel.Designer = models.ConvertDesignerFromDomain(order.Designer)

	err = ur.db.Model(&orderModel).Select(
		"OrderNo",
		"SubTotal",
		"AdditionalCharges",
		"Discount",
		"Total",
		"Vat",
		"OrderStatus",
		"PaymentStatus",
		"CreatedBy",
		"PoNo",
		"SalesID",
	).Updates(&orderModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating order", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order), zap.Error(err))
		return nil, err
	}

	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", orderModel.CreatedBy).Error; err == nil {
		orderModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", orderModel.CreatedBy), zap.Error(err))
	}

	logger.Info(ctx, "Order updated", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order))
	return orderModel.OrderModelToDomain(), nil
}

// UpdateOrderStatus updates the status of an existing order in the database.
func (ur *OrderRepository) UpdateOrderStatus(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	if order.OrderID == uuid.Nil {
		return nil, errors.New("order ID cannot be empty")
	}

	updates := map[string]interface{}{
		"order_status":   order.OrderStatus,
		"payment_status": order.PaymentStatus,
	}

	err := ur.db.Model(&models.OrderModel{}).Where("order_id = ?", order.OrderID).Updates(updates).Error
	if err != nil {
		return nil, err
	}

	var updatedOrderModel models.OrderModel
	err = ur.db.Preload("Customer").First(&updatedOrderModel, order.OrderID).Error
	if err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", updatedOrderModel.CreatedBy).Error; err == nil {
		updatedOrderModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", updatedOrderModel.CreatedBy), zap.Error(err))
	}
	return updatedOrderModel.OrderModelToDomain(), nil
}

func (ur *OrderRepository) GetOrderById(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	var orderModel models.OrderModel
	err := ur.db.
		Preload("Customer").
		Preload("OrderItems").
		Preload("OrderItems.Name").
		Preload("OrderPayments").
		Preload("OrderPayments.User").
		Preload("User").
		Preload("Sale").
		Preload("Sale.SalespersonData").
		Preload("Sale.User").
		First(&orderModel, "order_id = ?", order.OrderID).Error
	if err != nil {
		return nil, err
	}
	return orderModel.OrderModelToDomain(), nil
}

func (ur *OrderRepository) DeleteOrder(ctx context.Context, orderID uuid.UUID) (*domain.Order, error) {
	var orderModel models.OrderModel
	if err := ur.db.Preload("Customer").Preload("OrderItems").Preload("OrderItems.Name").First(&orderModel, "order_id = ?", orderID).Error; err != nil {
		return nil, err
	}

	err := ur.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("order_no = ?", orderID).Delete(&models.OrderItemModel{}).Error; err != nil {
			return err
		}
		if err := tx.Where("order_id = ?", orderID).Delete(&models.OrderModel{}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", orderModel.CreatedBy).Error; err == nil {
		orderModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", orderModel.CreatedBy), zap.Error(err))
	}
	return orderModel.OrderModelToDomain(), nil
}
func (ur *OrderRepository) UpdateOrderApproval(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	var orderModel models.OrderModel
	err := ur.db.First(&orderModel, order.OrderID).Error
	if err != nil {
		return nil, err
	}

	orderModel.Assignee, err = json.Marshal(order.Assignee)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal assignee: %w", err)
	}
	orderModel.Supervisor = order.Supervisor
	orderModel.CADFiles = models.ConvertCADFileFromDomain(order.CADFiles)
	orderModel.Designer = models.ConvertDesignerFromDomain(order.Designer)
	err = ur.db.Updates(&orderModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating order", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order), zap.Error(err))
		return nil, err
	}
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", orderModel.CreatedBy).Error; err == nil {
		orderModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", orderModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Order updated", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order", order))
	return orderModel.OrderModelToDomain(), nil
}

func (ur *OrderRepository) GetCardOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, error) {
	searchPattern := "%" + searchQuery + "%"

	var orders []*models.OrderModel

	if err := ur.db.
		Preload("OrderItems").
		Preload("OrderItems.Name").
		Joins("LEFT JOIN order_items i ON i.order_no = orders.order_id").
		Where(`
			(orders.order_no ILIKE ? OR orders.order_status ILIKE ?)
			AND orders.order_status != ?`,
			searchPattern, searchPattern, "Hold").
		Order("orders.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error; err != nil {
		return nil, err
	}

	var domainOrders []*domain.Order
	for _, o := range orders {
		domainOrders = append(domainOrders, o.OrderModelToDomain())
	}
	return domainOrders, nil
}
