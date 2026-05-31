package common

import (
	"errors"
	"net/http"
	"rims-backend/internal/service/domain"
)

// ErrorStatusMap is a map of defined error messages and their corresponding http status codes
var errorStatusMap = map[domain.ErrorCode]int{
	domain.ErrInternalServerError: http.StatusInternalServerError,
	domain.ErrDataNotFound:        http.StatusNotFound,
}

// Common errors
var (
	ErrNotFound   = errors.New("resource not found")
	ErrForbidden  = errors.New("action forbidden")
	ErrValidation = errors.New("validation error")
	ErrInternal   = errors.New("internal server error")
	ErrNotChanged = errors.New("NotChanged")
)
