package http

import (
	"context"
	"fmt"
	"log"
	"rims-backend/internal/config"
	"rims-backend/internal/controller/http/api"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service"
	"rims-backend/pkg/sms"

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
