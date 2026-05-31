package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

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
