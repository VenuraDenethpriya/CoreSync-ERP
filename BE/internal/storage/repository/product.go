package repository

import (
	"context"
	"errors"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new product repository instance
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{
		db,
	}
}

// CreateProduct creates a new product in the database
func (ur *ProductRepository) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	productModel := models.ProductModelFromDomain(product)
	if err := ur.db.Create(productModel).Error; err != nil {
		logger.Error(ctx, "Error creating product", zap.String("method", "POST"), zap.String("path", "/products"), zap.Any("product", product), zap.Error(err))
		return nil, err

	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", productModel.CreatedBy).Error; err == nil {
		productModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", productModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Product created", zap.String("method", "POST"), zap.String("path", "/products"), zap.Any("product", product))
	return productModel.ProductModelToDomain(), nil
}

// UpdateProduct updates an existing product in the database
func (ur *ProductRepository) UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Find the existing product by ID
	var existingProduct models.ProductModel
	err := ur.db.First(&existingProduct, "product_id = ?", product.ProductID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product with ID %s not found", product.ProductID)
		}
		return nil, err
	}

	// Update the product in the database
	existingProduct.Category = product.Category
	existingProduct.Name = product.Name
	existingProduct.Type = product.Type
	existingProduct.CellCount = product.CellCount
	existingProduct.CellType = product.CellType
	existingProduct.Voltage = product.Voltage
	existingProduct.Capacity = product.Capacity
	existingProduct.BmsType = product.BmsType
	existingProduct.Monitor = product.Monitor
	existingProduct.BasePrice = product.BasePrice
	existingProduct.Specifications = product.Specifications
	if product.IsActive != nil {
		existingProduct.IsActive = product.IsActive
	}
	existingProduct.SolarPanel = product.SolarPanel
	existingProduct.Inverter = product.Inverter

	err = ur.db.Save(&existingProduct).Error

	if err != nil {
		logger.Error(ctx, "Error updating product", zap.String("method", "PUT"), zap.String("path", "/products:product-id"), zap.Any("product", product), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Product updated", zap.String("method", "PUT"), zap.String("path", "/products/:product-id"), zap.Any("product", product))
	return existingProduct.ProductModelToDomain(), nil
}

// DeleteProduct deletes an existing product in the database
func (ur *ProductRepository) DeleteProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Find the existing product by ID
	var existingProduct models.ProductModel
	err := ur.db.First(&existingProduct, "product_id = ?", product.ProductID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product with ID %s not found", product.ProductID)
		}
		return nil, err
	}

	// Delete the product from the database
	err = ur.db.Delete(&existingProduct).Error
	if err != nil {
		logger.Error(ctx, "Error deleting product", zap.String("method", "DELETE"), zap.String("path", "/products/:product-id"), zap.Any("product", product), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", existingProduct.CreatedBy).Error; err == nil {
		existingProduct.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", existingProduct.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Product deleted", zap.String("method", "DELETE"), zap.String("path", "/products/:product-id"), zap.Any("product", product))
	return existingProduct.ProductModelToDomain(), nil
}

// Get Product By ID
func (ur *ProductRepository) GetProductByID(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Find the existing product by ID
	var existingProduct models.ProductModel
	err := ur.db.First(&existingProduct, "product_id = ?", product.ProductID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product with ID %s not found", product.ProductID)
		}
		return nil, err
	}

	// Return the product from the database
	return existingProduct.ProductModelToDomain(), nil
}

// GetProducts returns a slice of products and total count
func (ur *ProductRepository) GetProducts(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Product, int, error) {
	var productsModels []*models.ProductModel
	var whereClause string
	var args []interface{}

	searchPattern := "%" + searchQuery + "%"
	whereClause = ` WHERE name ILIKE ? OR category::text ILIKE ? OR type ILIKE ?`
	args = append(args, searchPattern, searchPattern, searchPattern)

	// Count total matching products
	var totalCount int64
	countQuery := "SELECT COUNT(*) FROM products p" + whereClause
	if err := ur.db.Raw(countQuery, args...).Scan(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Paginated query
	baseQuery := `
		SELECT p.*
		FROM products p`
	paginationClause := " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	argsWithPagination := append(args, limit, offset)
	finalQuery := baseQuery + whereClause + paginationClause
	if err := ur.db.Raw(finalQuery, argsWithPagination...).Scan(&productsModels).Error; err != nil {
		return nil, 0, err
	}

	var domainProducts []*domain.Product
	for _, p := range productsModels {
		domainProducts = append(domainProducts, p.ProductModelToDomain())
	}
	return domainProducts, int(totalCount), nil
}

func (ur *ProductRepository) GetBasicProductInfo(ctx context.Context) ([]*domain.Product, error) {
	var products []*models.ProductModel
	err := ur.db.Find(&products).Error
	if err != nil {
		return nil, err
	}
	var domainProducts []*domain.Product
	for _, p := range products {
		domainProducts = append(domainProducts, p.ProductModelToDomain())
	}
	return domainProducts, nil
}
