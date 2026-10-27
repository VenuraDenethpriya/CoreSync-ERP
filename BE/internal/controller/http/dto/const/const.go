package dto

// Role represents a user role type
type Role string

// Role constants used across the application
const (
	SUPER_ADMIN Role = "SUPER_ADMIN"
	HEAD        Role = "HEAD"

	HR_HEAD      Role = "HR_HEAD"
	HR_ASSISTANT Role = "HR_ASSISTANT"

	FINANCE_HEAD      Role = "FINANCE_HEAD"
	FINANCE_ASSISTANT Role = "FINANCE_ASSISTANT"

	INVENTORY_MANAGER Role = "INVENTORY_MANAGER"
	WAREHOUSE_STAFF   Role = "WAREHOUSE_STAFF"

	OFFICE_STAFF Role = "OFFICE_STAFF"

	SALES_HEAD Role = "SALES_HEAD"
	SALES_TEAM Role = "SALES_TEAM"

	READ_ONLY Role = "READ_ONLY"
)
