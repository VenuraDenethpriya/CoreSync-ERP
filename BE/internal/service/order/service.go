// internal/service/order/service.go

package order

import (
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/email"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"context"

	"CoreSync-backend/internal/storage/repository"

	"github.com/google/uuid"
)

type Service interface {
	CreateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	CreateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error)
	GetQuotes(ctx context.Context, searchQuery string, limit int, offset int, userRole string, clerkID string, userEmail string) ([]*domain.Quote, int, error)
	GetQuoteByID(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	UpdateQuoteStatus(ctx context.Context, quote *domain.Quote, actingClerkID string) (*domain.Quote, string, error)
	UpdateQuote(ctx context.Context, quote *domain.Quote, actingClerkID string) (*domain.Quote, string, error)
	UpdateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error)
	GetLastQuoteNo(ctx context.Context) (string, error)
	GetQuoteType(ctx context.Context) (map[string]string, error)
	DeleteQuote(ctx context.Context, quoteID uuid.UUID, actingClerkID string) (*domain.Quote, string, error)
	GetAllQuotesDetails(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Quote, error)
	GetQuoteItemsByQuoteID(ctx context.Context, quoteID uuid.UUID) ([]*domain.QuoteItem, error)
	DeleteQuoteItemByID(ctx context.Context, itemID uuid.UUID) error

	//	Orders
	CreateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error)
	CreateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error)
	GetLastOrderType(ctx context.Context) (map[string]string, error)
	GetAllOrders(ctx context.Context, searchQuery string, limit int, offset int, vat string, orderStatus string, paymentStatus string, userRole string, clerkID string, userEmail string) ([]*domain.Order, int, error)
	GetCardOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, error)
	GetAllDraftedOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, int, error)
	UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error)
	UpdateOrderApproval(ctx context.Context, order *domain.Order, actingClerkID string) (*domain.Order, string, error)
	UpdateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error)
	GetOrderById(ctx context.Context, order *domain.Order) (*domain.Order, error)
	DeleteOrder(ctx context.Context, orderID uuid.UUID, actingClerkID string) (*domain.Order, string, error)
	UpdateOrderStatus(ctx context.Context, order *domain.Order, actingClerkID string) (*domain.Order, string, error)
	UpdatePaymentType(ctx context.Context, payment *domain.Payment, actingClerkID string) (*domain.Payment, string, error)
	GetOrderItemsByOrderID(ctx context.Context, orderID uuid.UUID) ([]*domain.OrderItem, error)
	DeleteOrderItemByID(ctx context.Context, itemID uuid.UUID) error
	CreateOrderPayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error)
	GetAllPacks(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.OrderItem, int64, error)
	GetPackByID(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error)
	UpdatePack(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error)
	UpdatePackOrderID(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error)
	CreatePack(ctx context.Context, sale *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error)
	GetOrderPaymentList(ctx context.Context, query string, limit int, offset int) ([]*domain.Payment, int, error)
	UpdatePayment(ctx context.Context, payment *domain.Payment, actingClerkID string) (*domain.Payment, string, error)
	DeleteUnassignedBatteryPacks(ctx context.Context, productID uuid.UUID, limit int) error
	UpdatePackProduction(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error)
	DeletePack(ctx context.Context, packID uuid.UUID, actingClerkID string) (*domain.OrderItem, string, error)
}

type service struct {
	orderRepo     repository.OrderRepository
	quoteRepo     repository.QuoteRepository
	quoteItemRepo repository.QuoteItemRepository
	orderItemRepo repository.OrderItemRepository
	customerRepo  repository.CustomerRepository
	paymentRepo   repository.PaymentRepository
	userRepo      repository.UserRepository
	quoteTypes    []string
	orderTypes    []string
	emailSender   email.EmailSender
	sheetsClient  email.SheetCheck
	bus           *events.EventBus
	stock         stockcontrol.Hooks // [ADDED 2026-10-13] BOM copy, withdrawal on Completed / Delivered
}

func NewService(orderRepo repository.OrderRepository,
	quoteRepo repository.QuoteRepository,
	quoteItemRepo repository.QuoteItemRepository,
	orderItemRepo repository.OrderItemRepository,
	customerRepo repository.CustomerRepository,
	paymentRepo repository.PaymentRepository,
	userRepo repository.UserRepository,
	emailSender email.EmailSender,
	sheetsClient email.SheetCheck,
	bus *events.EventBus,
	stock stockcontrol.Hooks, // [ADDED 2026-10-13]
) Service {
	return &service{
		orderRepo:     orderRepo,
		quoteRepo:     quoteRepo,
		quoteItemRepo: quoteItemRepo,
		orderItemRepo: orderItemRepo,
		customerRepo:  customerRepo,
		paymentRepo:   paymentRepo,
		userRepo:      userRepo,
		quoteTypes:    []string{"Quo/SOLAR/", "Quo/EHP/"},
		orderTypes:    []string{"INV/EHP/", "INV/EHP/R/"},
		emailSender:   emailSender,
		sheetsClient:  sheetsClient,
		bus:           bus,
		stock:         stock,
	}
}
