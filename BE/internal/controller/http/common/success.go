package common

import "net/http"

type SuccessStatus int

const (
	// StatusOK represents HTTP 200 OK
	StatusOK SuccessStatus = http.StatusOK

	// StatusCreated represents HTTP 201 Created
	StatusCreated SuccessStatus = http.StatusCreated

	// StatusAccepted represents HTTP 202 Accepted
	StatusAccepted SuccessStatus = http.StatusAccepted

	// StatusNoContent represents HTTP 204 No Content
	StatusNoContent SuccessStatus = http.StatusNoContent
)
