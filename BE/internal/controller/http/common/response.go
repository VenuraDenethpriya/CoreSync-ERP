package common

import (
	"errors"
	"fmt"
	"net/http"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

type Response struct {
	Code    string `json:"code" example:"0"`
	Message string `json:"message" example:"success"`
	Data    any    `json:"data,omitempty"`
}

// NewResponse is a helper function to create a response body
func NewResponse(code string, message string, data any) Response {
	return Response{
		Code:    code,
		Message: message,
		Data:    data,
	}
}

// ErrorResponse represents an error response body format
type ErrorResponse struct {
	Code    string      `json:"code" example:"NS-00100"`
	Message string      `json:"message" example:"Error message 1, Error message 2"`
	Data    interface{} `json:"data,omitempty"`
}

// NewErrorResponse is a helper function to create an error response body
func NewErrorResponse(code int, errMsgs []string, namespace ...string) ErrorResponse {
	combinedMsg := strings.Join(errMsgs, ", ")
	return ErrorResponse{
		Message: combinedMsg,
		Code:    CodeIntToString(code, namespace...),
		Data:    map[string]interface{}{},
	}
}

func CodeIntToString(code int, namespace ...string) string {
	ns := "NS" // default namespace
	if len(namespace) > 0 {
		ns = namespace[0]
	}
	return fmt.Sprintf("%s-%05d", ns, code)
}

// ValidationError sends an error response for some specific request validation error
func ValidationError(ctx *gin.Context, err error) {
	var code = int(domain.ErrValidation)
	errMsg := parseError(err)
	errRsp := NewErrorResponse(code, errMsg)
	ctx.JSON(http.StatusBadRequest, errRsp)
}

func ForbiddenError(ctx *gin.Context, err error) {
	var code = int(domain.ErrValidation)
	errMsg := parseError(err)
	errRsp := NewErrorResponse(code, errMsg)
	ctx.JSON(http.StatusForbidden, errRsp)
}

// HandleError determines the status code of an error and returns a JSON response with the error message and status code
func HandleError(ctx *gin.Context, err error) {
	errMsg := parseError(err)
	errRsp := NewErrorResponse(0, errMsg)
	logger.Error(ctx, "Error Response", zap.Error(err))
	ctx.JSON(http.StatusInternalServerError, errRsp)
}

func HandleAuthError(ctx *gin.Context, err error) {
	customErr, ok := err.(*domain.CustomError)
	var statusCode int
	var code int
	if ok {
		code = int(customErr.Code)
	} else {
		code = int(domain.ErrInvalidToken)
	}
	statusCode = http.StatusUnauthorized
	errMsg := parseError(err)
	errRsp := NewErrorResponse(code, errMsg, "AUTH")
	logger.Error(ctx, "Error Response", zap.Error(err))
	ctx.AbortWithStatusJSON(statusCode, errRsp)
}

// parseError parses error messages from the error object and returns a slice of error messages
func parseError(err error) []string {
	var errMsgs []string

	if errors.As(err, &validator.ValidationErrors{}) {
		for _, err := range err.(validator.ValidationErrors) {
			errMsgs = append(errMsgs, err.Error())
		}
	} else {
		errMsgs = append(errMsgs, err.Error())
	}

	return errMsgs
}

// HandleSuccess sends a success response with the specified status code and optional data
func HandleSuccess(ctx *gin.Context, statusCode SuccessStatus, data any) {
	rsp := NewResponse("0", "success", data)
	ctx.JSON(int(statusCode), rsp)
}

// HandleAbort sends an error response and aborts the request with the specified status code and error message
func HandleAbort(ctx *gin.Context, err error) {
	customErr, ok := err.(*domain.CustomError)
	var statusCode int
	var code int
	if ok {
		code = int(customErr.Code)
		statusCode, ok = errorStatusMap[customErr.Code]
		if !ok {
			statusCode = http.StatusInternalServerError
		}
	} else {
		code = int(domain.ErrInternalServerError)
		statusCode = http.StatusInternalServerError
	}

	errMsg := parseError(err)

	errRsp := NewErrorResponse(code, errMsg)
	logger.Error(ctx, "Error Response", zap.Error(err))
	ctx.AbortWithStatusJSON(statusCode, errRsp)
}

// HandleNotFound respond to resource not found
func HandleNotFound(ctx *gin.Context, err error) {
	var code = int(domain.ErrDataNotFound)
	errMsg := parseError(err)
	errRsp := NewErrorResponse(code, errMsg)
	ctx.JSON(http.StatusNotFound, errRsp)
}

// HandleNotChanged respond to resource not found
func HandleNotChanged(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, NewResponse("0", "not updated", []string{}))
}
