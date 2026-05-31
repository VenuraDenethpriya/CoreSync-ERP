package domain

import (
	"errors"
	"fmt"
)

type ErrorCode int

// Define constants for each error code
const (
	ErrInternalServerError      ErrorCode = 100
	ErrDataNotFound             ErrorCode = 101
	ErrConflictingData          ErrorCode = 102
	ErrInvalidCredentials       ErrorCode = 103
	ErrUnauthorized             ErrorCode = 104
	ErrInvalidToken             ErrorCode = 105
	ErrTokenExpired             ErrorCode = 106
	ErrForbidden                ErrorCode = 107
	ErrBadRequest               ErrorCode = 108
	ErrCustomerNotFound         ErrorCode = 109
	ErrGetCustomerByEmail       ErrorCode = 110
	ErrTokenCreation            ErrorCode = 111
	ErrHashPassword             ErrorCode = 112
	ErrCreateCustomer           ErrorCode = 113
	ErrEmptyAuthorizationHeader ErrorCode = 114
	ErrValidation               ErrorCode = 115
)

// ErrorMessages Define a map of error codes to messages
var ErrorMessages = map[ErrorCode]string{
	ErrInternalServerError:      "internal server error",
	ErrDataNotFound:             "data not found",
	ErrConflictingData:          "data Conflicting",
	ErrInvalidCredentials:       "invalid Credentials",
	ErrUnauthorized:             "unauthorized",
	ErrInvalidToken:             "invalid token",
	ErrTokenExpired:             "token has expired",
	ErrForbidden:                "forbidden",
	ErrBadRequest:               "bad request",
	ErrCustomerNotFound:         "customer not found",
	ErrGetCustomerByEmail:       "failed GetCustomerByEmail",
	ErrTokenCreation:            "failed TokenCreation",
	ErrHashPassword:             "failed HashPassword",
	ErrCreateCustomer:           "failed to CreateCustomer",
	ErrEmptyAuthorizationHeader: "missing Authorization",
	ErrValidation:               "Invalid request payload",
}

type CustomError struct {
	Code    ErrorCode
	Message string
	Err     error
}

func NewCustomError(code ErrorCode, fmtStr string, args ...interface{}) *CustomError {
	formattedMessage := fmt.Sprintf(fmtStr, args...)
	err := errors.New(formattedMessage)
	return &CustomError{
		Code:    code,
		Message: ErrorMessages[code],
		Err:     err,
	}
}

func (e *CustomError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%v %s: %v", e.Code, e.Message, e.Err)
	}
	return e.Message
}

func (e *CustomError) Unwrap() error {
	return e.Err
}

func WrapErrorWithCode(err error, code ErrorCode) *CustomError {
	if customErr, ok := (err).(*CustomError); ok {
		return customErr
	}

	return &CustomError{
		Code:    code,
		Message: ErrorMessages[code],
		Err:     err,
	}
}
