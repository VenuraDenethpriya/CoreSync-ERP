package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}
type UserRepositoryInterface interface {
	FindManyByClerkIDs(ctx context.Context, clerkIDs []string) (map[string]*models.UserModel, error)
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (ur *UserRepository) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	userModel := models.UserModelFromDomain(user)
	if err := ur.db.Create(userModel).Error; err != nil {
		logger.Error(ctx, "failed to create user", zap.String("method", "POST"), zap.String("path", "users"), zap.Any("user", userModel))
		return nil, err
	}
	if err := ur.db.Preload("Creator").First(userModel, "id = ?", userModel.ID).Error; err != nil {
		return nil, err
	}

	logger.Info(ctx, "User created", zap.String("method", "POST"), zap.String("path", "users"), zap.Any("user", user))
	return userModel.UserModelToDomain(), nil
}

// GetUser retrieves users based on a search query, limit, and offset.
func (ur *UserRepository) GetUsers(ctx context.Context, query string, limit int, offset int) ([]*domain.User, int, error) {
	var userModels []models.UserModel

	var whereClause string
	var args []interface{}

	searchPattern := "%" + query + "%"
	whereClause = ` WHERE first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ? OR phone_no ILIKE ? OR role::text ILIKE ?`
	args = append(args, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)

	// Count total matching products
	var totalCount int
	countQuery := "SELECT COUNT(*) FROM users u" + whereClause
	if err := ur.db.Raw(countQuery, args...).Scan(&totalCount).Error; err != nil {
		return nil, 0, err
	}
	// Paginated query
	baseQuery := `
		SELECT u.* 
		FROM users u`
	paginationClause := " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	argsWithPagination := append(args, limit, offset)
	finalQuery := baseQuery + whereClause + paginationClause
	if err := ur.db.Raw(finalQuery, argsWithPagination...).Scan(&userModels).Error; err != nil {
		return nil, 0, err
	}
	var domainUsers []*domain.User
	for _, u := range userModels {
		domainUsers = append(domainUsers, u.UserModelToDomain())
	}
	return domainUsers, int(totalCount), nil
}

// UpdateUser updates an existing user in the database.
func (ur *UserRepository) UpdateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	var userModel models.UserModel
	err := ur.db.First(&userModel, user.ID).Error
	if err != nil {
		return nil, err
	}
	userModel.FirstName = user.FirstName
	userModel.LastName = user.LastName
	// userModel.ClerkID = user.ClerkID
	userModel.PhoneNo = user.PhoneNo
	userModel.Email = user.Email
	userModel.Role = user.Role

	err = ur.db.Updates(&userModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating user", zap.String("method", "PUT"), zap.String("path", "users"), zap.Any("user", userModel))
		return nil, err
	}
	logger.Info(ctx, "User updated", zap.String("method", "PUT"), zap.String("path", "users"), zap.Any("user", user))
	return userModel.UserModelToDomain(), nil
}

// DeleteUser deletes a user from the database.
//
//	func (ur *UserRepository) DeleteUser(ctx context.Context, user *domain.User) (*domain.User, error) {
//		var userModel models.UserModel
//		err := ur.db.First(&userModel, user.ID).Error
//		if err != nil {
//			return nil, err
//		}
//		err = ur.db.Delete(&userModel).Error
//		if err != nil {
//			return nil, err
//		}
//		return userModel.UserModelToDomain(), nil
//	}
//
// repository.go
func (ur *UserRepository) DeleteUser(ctx context.Context, user *domain.User) (*models.UserModel, error) {
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "id = ?", user.ID).Error; err != nil {
		return nil, err
	}
	if err := ur.db.Delete(&userModel).Error; err != nil {
		return nil, err
	}
	return &userModel, nil
}

// Find user by Clerk ID (the actor)
func (ur *UserRepository) FindByClerkID(ctx context.Context, clerkID string) (*models.UserModel, error) {
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", clerkID).Error; err != nil {
		return nil, err
	}
	return &userModel, nil
}
func (ur *UserRepository) FindManyByClerkIDs(ctx context.Context, clerkIDs []string) (map[string]*models.UserModel, error) {
	var users []*models.UserModel

	// Use a single "IN" query to fetch all users at once
	if err := ur.db.Where("clerk_id IN ?", clerkIDs).Find(&users).Error; err != nil {
		return nil, err
	}

	// Create a map for fast lookups (clerk_id -> user)
	userMap := make(map[string]*models.UserModel)
	for _, user := range users {
		userMap[user.ClerkID] = user
	}

	return userMap, nil
}
