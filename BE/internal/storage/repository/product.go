package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"CoreSync-backend/internal/service/domain"

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
func (ur *ProductRepository) GetOrderProductByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	// Find the existing product by ID
	var existingProduct models.ProductModel
	err := ur.db.First(&existingProduct, "product_id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("product with ID %s not found", id)
		}
		return nil, err
	}

	// Return the product from the database
	return existingProduct.ProductModelToDomain(), nil
}

func (ur *ProductRepository) CreateProductBom(ctx context.Context, boms []*domain.Bom) ([]*domain.Bom, error) {
	var bomModels []*models.BomModel

	for _, bom := range boms {
		bomModels = append(bomModels, models.BomModelFromDomain(bom))
	}

	if err := ur.db.Create(&bomModels).Error; err != nil {
		logger.Error(ctx, "Error creating product BOMs", zap.String("method", "POST"), zap.String("path", "/products/boms"), zap.Error(err))
		return nil, err
	}
	var createdBoms []*domain.Bom
	for _, bm := range bomModels {
		createdBoms = append(createdBoms, bm.BomModelToDomain())
	}

	logger.Info(ctx, "Product BOMs created successfully", zap.String("method", "POST"), zap.String("path", "/products/boms"), zap.Int("count", len(createdBoms)))

	return createdBoms, nil
}

func (ur *ProductRepository) GetProductBomByID(ctx context.Context, product *domain.Product) ([]*domain.Bom, error) {
	var bomModels []*models.BomModel
	err := ur.db.Preload("Inventory").Preload("User").Preload("Product").Where("product_id = ?", product.ProductID).Find(&bomModels).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("BOMs for product with ID %s not found", product.ProductID)
		}
		return nil, err
	}
	var domainBoms []*domain.Bom
	for _, bm := range bomModels {
		domainBoms = append(domainBoms, bm.BomModelToDomain())
	}
	return domainBoms, nil
}

func (ur *ProductRepository) DeleteProductBom(ctx context.Context, bom *domain.Bom) (*domain.Bom, error) {
	var bomModel models.BomModel

	if err := ur.db.Preload("Inventory").First(&bomModel, "id = ?", bom.ID).Error; err != nil {
		logger.Error(ctx, "Product BOM not found for deletion", zap.Error(err), zap.Any("bom_id", bom.ID))
		return nil, err
	}

	if err := ur.db.Delete(&bomModel).Error; err != nil {
		logger.Error(ctx, "Error deleting product BOM", zap.Error(err), zap.Any("bom_id", bom.ID))
		return nil, err
	}

	logger.Info(ctx, "Product BOM successfully deleted", zap.String("bom_id", bomModel.ID.String()))
	return bomModel.BomModelToDomain(), nil
}

func (ur *ProductRepository) UpdateProductBom(ctx context.Context, bom *domain.Bom) (*domain.Bom, error) {
	var bomModel models.BomModel

	err := ur.db.WithContext(ctx).
		Model(&bomModel).
		Where("id = ?", bom.ID).
		Update("quantity", bom.Quantity).Error

	if err != nil {
		logger.Error(ctx, "Failed to update product BOM quantity", zap.Error(err), zap.String("bom_id", bom.ID.String()))
		return nil, err
	}

	err = ur.db.WithContext(ctx).
		Preload("Inventory").
		First(&bomModel, "id = ?", bom.ID).Error

	if err != nil {
		logger.Error(ctx, "Failed to fetch updated product BOM", zap.Error(err), zap.String("bom_id", bom.ID.String()))
		return nil, err
	}

	logger.Info(ctx, "Product BOM quantity updated successfully", zap.String("bom_id", bom.ID.String()), zap.Int("new_quantity", bomModel.Quantity))
	return bomModel.BomModelToDomain(), nil
}
