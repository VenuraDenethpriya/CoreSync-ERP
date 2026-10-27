package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRespository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{
		db,
	}
}
func (pr *PaymentRepository) CreateOrderPayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error) {
	paymentModel := models.PaymentModelFromDomain(payment)
	if err := pr.db.Create(paymentModel).Error; err != nil {
		return nil, err
	}
	return paymentModel.PaymentModelToDomain(), nil
}

func (pr *PaymentRepository) UpdatePaymentType(ctx context.Context, payment *domain.Payment) (*domain.Payment, error) {
	var paymentModel models.PaymentModel
	err := pr.db.Preload("Order").First(&paymentModel, payment.ID).Error
	if err != nil {
		return nil, err
	}
	paymentModel.PaymentType = payment.PaymentType
	err = pr.db.Save(&paymentModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating order payment type", zap.String("method", "PUT"), zap.String("path", "orders/refund"), zap.Any("refund", payment), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Order payment type updated", zap.String("method", "PUT"), zap.String("path", "orders/refund"), zap.Any("refund", payment), zap.Error(err))
	return paymentModel.PaymentModelToDomain(), nil
}

func (pr *PaymentRepository) GetOrderPaymentList(ctx context.Context, query string, limit int, offset int) ([]*domain.Payment, int, error) {
	var paymentModels []models.PaymentModel
	var total int64

	db := pr.db.WithContext(ctx).
		Model(&models.PaymentModel{}).
		Where("order_payments.amount > ?", 0).
		Where("order_payments.status = ?", "Pending").
		Where("order_payments.payment_type != ?", "Refund")

	if query != "" {
		searchTerm := "%" + query + "%"

		db = db.Joins("LEFT JOIN orders ON orders.order_id = order_payments.order_id").
			Where("orders.order_no ILIKE ? OR order_payments.payment_mode ILIKE ? OR CAST(order_payments.payment_type AS TEXT) ILIKE ?",
				searchTerm, searchTerm, searchTerm)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	db = db.Preload("User").
		Preload("Order").
		Order("order_payments.paid_date DESC")

	if limit > 0 {
		db = db.Limit(limit)
	}
	if offset >= 0 {
		db = db.Offset(offset)
	}

	if err := db.Find(&paymentModels).Error; err != nil {
		return nil, 0, err
	}

	var payments []*domain.Payment
	for i := range paymentModels {
		domainPayment := paymentModels[i].PaymentModelToDomain()
		if domainPayment != nil {
			payments = append(payments, domainPayment)
		}
	}

	return payments, int(total), nil
}

func (pr *PaymentRepository) UpdatePayment(ctx context.Context, payment *domain.Payment) (*domain.Payment, error) {
	var paymentModel models.PaymentModel

	err := pr.db.WithContext(ctx).Preload("Order").First(&paymentModel, payment.ID).Error
	if err != nil {
		return nil, err
	}

	if payment.Status == "Rejected" {
		err = pr.db.WithContext(ctx).Delete(&paymentModel).Error
		if err != nil {
			logger.Error(ctx, "Error deleting rejected order payment", zap.String("method", "PUT"), zap.String("path", "orders/payments"), zap.Any("paymentID", payment.ID), zap.Error(err))
			return nil, err
		}

		logger.Info(ctx, "Order payment rejected and deleted successfully", zap.String("method", "PUT"), zap.String("path", "orders/payments"), zap.Any("paymentID", payment.ID))

		paymentModel.Status = "Rejected"
		return paymentModel.PaymentModelToDomain(), nil
	}

	paymentModel.Status = payment.Status
	err = pr.db.WithContext(ctx).Save(&paymentModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating order payment status", zap.String("method", "PUT"), zap.String("path", "orders/payments"), zap.Any("status", payment.Status), zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Order payment status updated", zap.String("method", "PUT"), zap.String("path", "orders/payments"), zap.Any("status", payment.Status))
	return paymentModel.PaymentModelToDomain(), nil
}
