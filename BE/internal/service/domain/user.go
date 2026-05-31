package domain

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	UserRoleSuperAdmin       UserRole = "SUPER_ADMIN"
	UserRoleHead             UserRole = "HEAD"
	UserRoleWareHouseSaff    UserRole = "WAREHOUSE_STAFF"
	UserRoleInventoryManager UserRole = "INVENTORY_MANAGER"
	UserRoleOfficeStaff      UserRole = "OFFICE_STAFF"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	ClerkID   string    `json:"clerk_id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	PhoneNo   string    `json:"phone_no"`
	Email     string    `json:"email"`
	Role      UserRole  `json:"role"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
