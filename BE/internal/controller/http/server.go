package http

import (
	"CoreSync-backend/internal/config"
	"CoreSync-backend/internal/controller/http/api"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service"
	"CoreSync-backend/pkg/sms"
	"context"
	"fmt"
	"log"

	"go.uber.org/zap"
)

func StartServer(ctx context.Context, config *config.Container, services *service.Services, bus *events.EventBus, smsService sms.Sender) error {
	log.Println("Starting the HTTP Server Execution!")

	// Init router
	router, err := api.NewRouter(
		config.HTTP,
		services,
		bus,
		smsService,
	)
	if err != nil {
		zap.L().Error("Error initializing router",
			zap.Error(err),
		)
		return err

	}

	// Start server
	listenAddr := fmt.Sprintf("%s:%s", config.HTTP.URL, config.HTTP.Port)
	logger.Info(ctx, "Starting the HTTP server",
		zap.String("listen_address", listenAddr),
	)
	err = router.Serve(listenAddr)

	if err != nil {
		zap.L().Error("Error starting the HTTP server",
			zap.Error(err),
		)
		return err
	}

	return nil
}
