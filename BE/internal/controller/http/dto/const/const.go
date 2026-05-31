package dto

// Role represents a user role type
type Role string

// Role constants used across the application
const (
	SUPER_ADMIN       Role = "SUPER_ADMIN"
	HEAD              Role = "HEAD"
	INVENTORY_MANAGER Role = "INVENTORY_MANAGER"
	WAREHOUSE_STAFF   Role = "WAREHOUSE_STAFF"
	OFFICE_STAFF      Role = "OFFICE_STAFF"
)
