// internal/service/order/service.go

package order

import (
	"context"
	"rims-backend/internal/events"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/service/email"

	"rims-backend/internal/storage/repository"

	"github.com/google/uuid"
)

type Service interface {
	CreateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	CreateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error)
	GetQuotes(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Quote, int, error)
	GetQuoteByID(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	UpdateQuoteStatus(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	UpdateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error)
	UpdateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error)
	GetLastQuoteNo(ctx context.Context) (string, error)
	GetQuoteType(ctx context.Context) (map[string]string, error)
	DeleteQuote(ctx context.Context, quoteID uuid.UUID) (*domain.Quote, error)
	GetAllQuotesDetails(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Quote, error)
	GetQuoteItemsByQuoteID(ctx context.Context, quoteID uuid.UUID) ([]*domain.QuoteItem, error)
	DeleteQuoteItemByID(ctx context.Context, itemID uuid.UUID) error

	//	Orders
	CreateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error)
	CreateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error)
	GetLastOrderType(ctx context.Context) (map[string]string, error)
	GetAllOrders(ctx context.Context, searchQuery string, limit int, offset int, vat string, orderStatus string, paymentStatus string) ([]*domain.Order, int, error)
	GetCardOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, error)
	GetAllDraftedOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Order, int, error)
	UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error)
	UpdateOrderApproval(ctx context.Context, order *domain.Order) (*domain.Order, error)
	UpdateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error)
	GetOrderById(ctx context.Context, order *domain.Order) (*domain.Order, error)
	DeleteOrder(ctx context.Context, orderID uuid.UUID) (*domain.Order, error)
	UpdateOrderStatus(ctx context.Context, order *domain.Order) (*domain.Order, error)
	UpdatePaymentType(ctx context.Context, payment *domain.Payment, actingClerkID string) (*domain.Payment, string, error)
	GetOrderItemsByOrderID(ctx context.Context, orderID uuid.UUID) ([]*domain.OrderItem, error)
	DeleteOrderItemByID(ctx context.Context, itemID uuid.UUID) error
	CreateOrderPayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error)
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
	}
}
