package ws

import (
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *WebSocketHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get the topic from the URL parameter
		topic := c.Param("topic")
		if topic == "" {
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		// 2. Subscribe to the specific topic
		subscriber := h.bus.Subscribe(topic)
		ctx := c.Request.Context()

		go func() {
			<-ctx.Done()
			// 3. Unsubscribe from the specific topic
			h.bus.Unsubscribe(topic, subscriber)
			close(subscriber)
		}()

		for {
			select {
			case <-ctx.Done():
				return
			case event := <-subscriber:
				if err := conn.WriteJSON(map[string]interface{}{
					"type": event.Type,
					"data": event.Data,
				}); err != nil {
					logger.Error(c, "Failed to send WS event", zap.Error(err))
					return
				}
			}
		}
	}
}
