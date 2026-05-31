package dto

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

// CreateUserRequest represents the request body for creating a new user
type CreateUserRequest struct {
	FirstName string          `json:"first_name" binding:"required"`
	LastName  string          `json:"last_name" binding:"required"`
	ClerkID   string          `json:"clerk_id" binding:"required"`
	PhoneNo   string          `json:"phone_no" binding:"required"`
	Email     string          `json:"email" binding:"required"`
	Role      domain.UserRole `json:"role" binding:"required"`
	CreatedBy string          `json:"created_by"`
}

// CreateUserResponse represents the response body for creating a new user
type CreateUserResponse struct {
	ID        uuid.UUID       `gorm:"type:uuid;primary_key" json:"id"`
	FirstName string          `json:"first_name"`
	LastName  string          `json:"last_name"`
	ClerkID   string          `json:"clerk_id"`
	PhoneNo   string          `json:"phone_no"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	CreatedBy string          `json:"created_by"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// NewCreateUserRequest converts a CreateUserRequest DTO to a domain User
func NewCreateUserResponse(user *domain.User) *CreateUserResponse {
	return &CreateUserResponse{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		ClerkID:   user.ClerkID,
		PhoneNo:   user.PhoneNo,
		Email:     user.Email,
		Role:      user.Role,
		CreatedBy: user.CreatedBy,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

type GetUserRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetUserResponse struct {
	ID        uuid.UUID       `json:"id"`
	FirstName string          `json:"first_name"`
	LastName  string          `json:"last_name"`
	ClerkID   string          `json:"clerk_id"`
	PhoneNo   string          `json:"phone_no"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}
type GetUsersResponse struct {
	Items      []GetUserResponse `json:"items"`
	Total      int               `json:"total"`
	TotalUsers int               `json:"total_users"`
}

func NewGetUserResponse(user *domain.User) *GetUserResponse {
	return &GetUserResponse{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		ClerkID:   user.ClerkID,
		PhoneNo:   user.PhoneNo,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
func NewGetUsersResponse(users []*domain.User, totalUsers int) *GetUsersResponse {
	items := make([]GetUserResponse, len(users))
	for i, user := range users {
		items[i] = *NewGetUserResponse(user)
	}
	return &GetUsersResponse{
		Items:      items,
		Total:      len(items),
		TotalUsers: totalUsers,
	}
}

// UpdateUserRequest represents the request body for updating an existing user
type UpdateUserRequest struct {
	UserID    string `uri:"user-id" binding:"required" json:"user_id"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	// ClerkID   string          `json:"clerk_id,omitempty"`
	PhoneNo string          `json:"phone_no,omitempty"`
	Email   string          `json:"email,omitempty"`
	Role    domain.UserRole `json:"role,omitempty"`
}

// UpdateUserResponse represents the response body for updating an existing user
type UpdateUserResponse struct {
	UserID    uuid.UUID       `gorm:"type:uuid;primary_key" json:"id"`
	FirstName string          `json:"first_name"`
	LastName  string          `json:"last_name"`
	ClerkID   string          `json:"clerk_id"`
	PhoneNo   string          `json:"phone_no"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	CreatedBy string          `json:"created_by"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// NewUpdateUserResponse converts a domain User to an UpdateUserResponse DTO
func NewUpdateUserResponse(user *domain.User) *UpdateUserResponse {
	return &UpdateUserResponse{
		UserID:    user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		ClerkID:   user.ClerkID,
		PhoneNo:   user.PhoneNo,
		Email:     user.Email,
		Role:      user.Role,
		CreatedBy: user.CreatedBy,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

// DeleteUserIdRequest represents the request body for deleting a user
type DeleteUserIdRequest struct {
	UserID string `uri:"user-id" binding:"required" json:"user_id"`
}

// DeleteUserResponse represents the response body for deleting a user
type DeleteUserResponse struct {
	UserID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewDeleteUserResponse(user *domain.User) *DeleteUserResponse {
	return &DeleteUserResponse{
		UserID: user.ID,
	}
}

type ClerkCreateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	PhoneNo   string `json:"phone_no"`
	Password  string `json:"password"`
	Role      string `json:"role"`
}

type ClerkCreateUserResponse struct {
	ID string `json:"id"`
}

type ClerkUpdateUserRequest struct {
	ID        string `json:"clerkId"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	PhoneNo   string `json:"phone_no"`
	Role      string `json:"role"`
}

type ClerkUpdateUserResponse struct {
	ID string `json:"clerkId"`
}
