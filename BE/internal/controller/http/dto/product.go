package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

// Add validation for CreateProduct
// CreateProductRequest represents the request body for creating a new product
type CreateProductRequest struct {
	//Required fields
	Category  domain.ProductCategory `gorm:"type:product_category;not null; required" json:"category"`
	Name      string                 `gorm:"type:varchar(100);not null required" json:"ProductName"`
	BasePrice float64                `gorm:"type:decimal(10,2);not null required" json:"BasePrice"`

	//Common fields
	Capacity  float64 `gorm:"type:float" json:"Capacity,omitempty"`
	Type      string  `gorm:"type:varchar(100)" json:"Type,omitempty"`
	CreatedBy string  `json:"CreatedBy" validate:"required"`

	//For battery packs
	CellCount      string  `gorm:"type:varchar(100)" json:"CellCount,omitempty"`
	CellType       string  `gorm:"type:varchar(100)" json:"CellType,omitempty"`
	Voltage        float64 `gorm:"type:float" json:"Voltage,omitempty"`
	BmsType        string  `gorm:"type:varchar(100)" json:"BmsType,omitempty"`
	Monitor        string  `gorm:"type:varchar(100)" json:"Monitor,omitempty"`
	Specifications string  `gorm:"type:varchar(255)" json:"Specifications,omitempty"`

	//For solar panels
	SolarPanel string `json:"PanelType,omitempty" binding:"omitempty,max=100"`
	Inverter   string `json:"Inverter,omitempty" binding:"omitempty,max=100"`
}

// CreateProductResponse represents the response body for creating a new product
type CreateProductResponse struct {
	ProductID      uuid.UUID              `gorm:"type:uuid;primary_key" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"Category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"ProductName"`
	Type           string                 `gorm:"type:varchar(100)" json:"Type,omitempty"`
	CellCount      string                 `gorm:"type:varchar(100)" json:"CellCount,omitempty"`
	CellType       string                 `gorm:"type:varchar(100)" json:"CellType,omitempty"`
	Voltage        float64                `gorm:"type:float" json:"Voltage,omitempty"`
	Capacity       float64                `gorm:"type:float" json:"Capacity,omitempty"`
	BmsType        string                 `gorm:"type:varchar(100)" json:"BmsType,omitempty"`
	Monitor        string                 `gorm:"type:varchar(100)" json:"Monitor,omitempty"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"BasePrice"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       bool                   `gorm:"default:true" json:"is_active"`
	SolarPanel     string                 `gorm:"type:varchar(100)" json:"PanelType,omitempty"`
	Inverter       string                 `gorm:"type:varchar(100)" json:"Inverter,omitempty"`
	CreatedBy      string                 `json:"created_by"`
	CreatedAt      time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewProductResponse creates a new CreateProductResponse instance from a domain.Product
func NewProductResponse(product *domain.Product) *CreateProductResponse {
	return &CreateProductResponse{
		ProductID:      product.ProductID,
		Category:       product.Category,
		Name:           product.Name,
		Type:           product.Type,
		CellCount:      product.CellCount,
		CellType:       product.CellType,
		Voltage:        product.Voltage,
		Capacity:       product.Capacity,
		BmsType:        product.BmsType,
		Monitor:        product.Monitor,
		BasePrice:      product.BasePrice,
		Specifications: product.Specifications,
		IsActive:       *product.IsActive,
		SolarPanel: func() string {
			if product.SolarPanel == "" {
				return "null"
			}
			return product.SolarPanel
		}(),
		Inverter: func() string {
			if product.Inverter == "" {
				return "null"
			}
			return product.Inverter
		}(),
		CreatedBy: product.CreatedBy,
		CreatedAt: product.CreatedAt,
		UpdatedAt: product.UpdatedAt,
	}
}

// Add validation for UpdateProduct
// UpdateProductIdRequest represents the request uri for updating a product
type UpdateProductIdRequest struct {
	ProductID string `uri:"product-id" json:"product-id"`
}

// UpdateProductRequest represents the request body for updating a product
type UpdateProductRequest struct {
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category,omitempty"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"name,omitempty"`
	Type           string                 `json:"type,omitempty"`
	CellCount      string                 `gorm:"type:varchar(100)" json:"cell_count,omitempty"`
	CellType       string                 `gorm:"type:varchar(100)" json:"cell_type,omitempty"`
	Voltage        float64                `gorm:"type:float" json:"voltage,omitempty"`
	Capacity       float64                `gorm:"type:float" json:"capacity,omitempty"`
	BmsType        string                 `gorm:"type:varchar(100)" json:"bms_type,omitempty"`
	Monitor        string                 `gorm:"type:varchar(100)" json:"monitor,omitempty"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"base_price,omitempty"`
	SolarPanel     string                 `gorm:"type:varchar(100)" json:"PanelType,omitempty"`
	Inverter       string                 `gorm:"type:varchar(100)" json:"Inverter,omitempty"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       bool                   `gorm:"default:true" json:"is_active,omitempty"`
}

// UpdateProductResponse represents the response body for updating a product
type UpdateProductResponse struct {
	ProductID      uuid.UUID              `gorm:"type:uuid;primary_key" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"name"`
	Type           string                 `gorm:"type:varchar(100)" json:"type,omitempty"`
	CellCount      string                 `gorm:"type:varchar(100)" json:"cell_count,omitempty"`
	CellType       string                 `gorm:"type:varchar(100)" json:"cell_type,omitempty"`
	Voltage        float64                `gorm:"type:float" json:"voltage,omitempty"`
	Capacity       float64                `gorm:"type:float" json:"capacity,omitempty"`
	BmsType        string                 `gorm:"type:varchar(100)" json:"bms_type,omitempty"`
	Monitor        string                 `gorm:"type:varchar(100)" json:"monitor,omitempty"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"base_price"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       bool                   `gorm:"default:true" json:"is_active"`
	SolarPanel     string                 `gorm:"type:varchar(100)" json:"PanelType,omitempty"`
	Inverter       string                 `gorm:"type:varchar(100)" json:"Inverter,omitempty"`
	CreatedAt      time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewUpdateProductResponse creates a new UpdateProductResponse instance from a domain.Product
func NewUpdateProductResponse(product *domain.Product) UpdateProductResponse {
	return UpdateProductResponse{
		ProductID:      product.ProductID,
		Category:       product.Category,
		Name:           product.Name,
		Type:           product.Type,
		CellCount:      product.CellCount,
		CellType:       product.CellType,
		Voltage:        product.Voltage,
		Capacity:       product.Capacity,
		BmsType:        product.BmsType,
		Monitor:        product.Monitor,
		BasePrice:      product.BasePrice,
		Specifications: product.Specifications,
		IsActive:       *product.IsActive,
		SolarPanel:     product.SolarPanel,
		Inverter:       product.Inverter,
		CreatedAt:      product.CreatedAt,
		UpdatedAt:      product.UpdatedAt,
	}
}

// DeleteProductIdRequest represents the request uri for deleting a product
type DeleteProductIdRequest struct {
	ProductID string `uri:"product-id" binding:"required" json:"product-id"`
}

// DeleteProductResponse represents the response body for deleting a product
type DeleteProductResponse struct {
	ProductID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

// NewDeleteProductResponse creates a new DeleteProductResponse instance from a domain.Product
func NewDeleteProductResponse(product *domain.Product) DeleteProductResponse {
	return DeleteProductResponse{
		ProductID: product.ProductID,
	}
}

// Get Product By ID
// GetProductIdRequest represents the request uri for getting a product by ID
type GetProductIdRequest struct {
	ProductID string `uri:"product-id" binding:"required" json:"product-id"`
}

// GetProductResponse represents the response body for getting a product by ID
type GetProductResponse struct {
	ProductID      uuid.UUID              `gorm:"type:uuid;primary_key" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"name"`
	Type           string                 `gorm:"type:type" json:"type,omitempty"`
	CellCount      string                 `gorm:"type:varchar(100)" json:"cell_count,omitempty"`
	CellType       string                 `gorm:"type:varchar(100)" json:"cell_type,omitempty"`
	Voltage        float64                `gorm:"type:float" json:"voltage,omitempty"`
	Capacity       float64                `gorm:"type:float" json:"capacity,omitempty"`
	BmsType        string                 `gorm:"type:varchar(100)" json:"bms_type,omitempty"`
	Monitor        string                 `gorm:"type:varchar(100)" json:"monitor,omitempty"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"base_price"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       bool                   `gorm:"default:true" json:"is_active"`
	SolarPanel     string                 `gorm:"type:varchar(100)" json:"PanelType,omitempty"`
	Inverter       string                 `gorm:"type:varchar(100)" json:"Inverter,omitempty"`
	CreatedAt      time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewGetProductResponse creates a new GetProductResponse instance from a domain.Product
func NewGetProductByIdResponse(product *domain.Product) *GetProductResponse {
	return &GetProductResponse{
		ProductID:      product.ProductID,
		Category:       product.Category,
		Name:           product.Name,
		Type:           product.Type,
		CellCount:      product.CellCount,
		CellType:       product.CellType,
		Voltage:        product.Voltage,
		Capacity:       product.Capacity,
		BmsType:        product.BmsType,
		Monitor:        product.Monitor,
		BasePrice:      product.BasePrice,
		Specifications: product.Specifications,
		IsActive:       *product.IsActive,
		SolarPanel:     product.SolarPanel,
		Inverter:       product.Inverter,
		CreatedAt:      product.CreatedAt,
		UpdatedAt:      product.UpdatedAt,
	}
}

type GetProductsRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetProductsResponse struct {
	ID             uuid.UUID              `gorm:"type:uuid;primary_key" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"ProductName"`
	Price          float64                `gorm:"type:decimal(10,2);not null" json:"BasePrice"`
	Type           string                 `gorm:"type:varchar(100)" json:"Type,omitempty"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       bool                   `gorm:"default:true" json:"is_active"`
}

// GetProductsResponse represents the response body for getting products
type GetAllProductsResponse struct {
	Products      []GetProductsResponse `json:"products"`
	Total         int                   `json:"total"`
	TotalProducts int                   `json:"total_products"`
}

// NewGetProductResponse creates a new GetProductResponse instance from a domain.Product
func NewGetProductResponse(products []*domain.Product, totalProducts int) *GetAllProductsResponse {
	var response []GetProductsResponse
	for _, p := range products {
		response = append(response, GetProductsResponse{
			ID:             p.ProductID,
			Category:       p.Category,
			Name:           p.Name,
			Price:          p.BasePrice,
			Type:           p.Type,
			Specifications: p.Specifications,
			IsActive:       *p.IsActive,
		})
	}
	return &GetAllProductsResponse{
		Products:      response,
		TotalProducts: totalProducts,
		Total:         len(products),
	}
}

type GetBasicProductInfoResponse struct {
	ProductID      uuid.UUID              `gorm:"type:uuid;primary_key" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"ProductName"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"BasePrice"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
}

func NewGetBasicProductInfoListResponse(products []*domain.Product) []*GetBasicProductInfoResponse {
	responses := make([]*GetBasicProductInfoResponse, 0, len(products))
	for _, product := range products {
		responses = append(responses, &GetBasicProductInfoResponse{
			ProductID:      product.ProductID,
			Category:       product.Category,
			Name:           product.Name,
			BasePrice:      product.BasePrice,
			Specifications: product.Specifications,
		})
	}
	return responses
}

type BomItemRequest struct {
	ProductID   uuid.UUID `json:"product_id"`
	InventoryID uuid.UUID `json:"inventory_id" binding:"required"`
	Quantity    int       `json:"quantity" binding:"required,gt=0"`
	CreatedBy   string    `json:"created_by" binding:"required"`
}
type CreateProductBomRequest struct {
	Items []BomItemRequest `json:"items" binding:"required,min=1,dive"`
}
type CreateProductBomResponse struct {
	ID          uuid.UUID `json:"id"`
	ProductID   uuid.UUID `json:"product_id"`
	InventoryID uuid.UUID `json:"inventory_id"`
	Quantity    int       `json:"quantity"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

func NewCreateProductBomResponse(bom *domain.Bom) *CreateProductBomResponse {
	return &CreateProductBomResponse{
		ID:          bom.ID,
		ProductID:   bom.ProductID,
		InventoryID: bom.InventoryID,
		Quantity:    bom.Quantity,
		CreatedBy:   bom.User.FirstName + " " + bom.User.LastName,
		CreatedAt:   bom.CreatedAt,
	}
}

func NewCreateProductBomResponseList(boms []*domain.Bom) []CreateProductBomResponse {
	var responses []CreateProductBomResponse
	for _, bom := range boms {
		responses = append(responses, *NewCreateProductBomResponse(bom))
	}
	return responses
}

type GetProductBomByIdRequest struct {
	ProductID string `uri:"product-id" binding:"required"`
}
type GetProductBomByIdResponse struct {
	ID            uuid.UUID `json:"id"`
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryName string    `json:"inventory_name"`
	Quantity      int       `json:"quantity"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
}
type GetProductBomByIdResponseList struct {
	Items []GetProductBomByIdResponse `json:"items"`
}

func NewGetProductBomByIdResponse(bom *domain.Bom) *GetProductBomByIdResponse {
	return &GetProductBomByIdResponse{
		ID:            bom.ID,
		InventoryID:   bom.InventoryID,
		InventoryName: bom.Inventory.ItemName,
		Quantity:      bom.Quantity,
		CreatedBy:     bom.User.FirstName + " " + bom.User.LastName,
		CreatedAt:     bom.CreatedAt,
	}
}
func NewGetProductBomByIdResponseList(boms []*domain.Bom) *GetProductBomByIdResponseList {
	var responses []GetProductBomByIdResponse
	for _, bom := range boms {
		responses = append(responses, *NewGetProductBomByIdResponse(bom))
	}
	return &GetProductBomByIdResponseList{
		Items: responses,
	}
}

type DeleteProductBomIdRequest struct {
	ProductBomID string `uri:"product-bom-id" binding:"required" json:"product_bom_id"`
}
type DeleteProductBomResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteProductBomResponse(bom *domain.Bom) *DeleteProductBomResponse {
	return &DeleteProductBomResponse{
		ID: bom.ID,
	}
}

type UpdateProductBomRequest struct {
	ID       string `json:"bom_id" binding:"required"`
	Quantity int    `json:"quantity"`
}
type UpdateProductBomResponse struct {
	ID            uuid.UUID `json:"id"`
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryName string    `json:"inventory_name"`
}

func NewUpdateProductBomResponse(bom *domain.Bom) *UpdateProductBomResponse {
	return &UpdateProductBomResponse{
		ID:            bom.ID,
		InventoryID:   bom.InventoryID,
		InventoryName: bom.Inventory.ItemName,
	}
}
