package ws

import (
	"net/http"
	"rims-backend/internal/events"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type WebSocketHandler struct {
	bus *events.EventBus
}

func NewWebSocketHandler(bus *events.EventBus) *WebSocketHandler {
	return &WebSocketHandler{bus: bus}
}

func SetupWsRoutes(router *gin.RouterGroup, handler *WebSocketHandler) {
	ws := router.Group("/ws")
	{
		// Single dynamic route for any topic
		ws.GET("/:topic", handler.Handle())
	}
}
