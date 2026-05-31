package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"rims-backend/internal/config"
	"rims-backend/internal/controller/http"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service"
	"rims-backend/internal/storage"
	"rims-backend/pkg/sms"
	"syscall"

	"go.uber.org/zap"
)

func main() {
	logger.SetupDefaultLogger()
	zap.L().Info("Starting the main execution!")

	// Load environment variables
	config, err := config.New()
	if err != nil {
		zap.L().Error("Error loading environment variables", zap.Error(err))
		os.Exit(1)
	}

	// Set up context with cancellation for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling for graceful shutdown
	go handleShutdown(cancel)

	// Set logger
	logger.Set(ctx, config.App)
	logger.Info(ctx, "Starting the application",
		zap.String("app", config.App.Name),
		zap.String("env", config.App.Env),
	)

	// Initialize dependencies
	db, services, err := initializeDependencies(ctx, config)
	if err != nil {
		zap.L().Error("Failed to initialize dependencies", zap.Error(err))
		os.Exit(1)
	}
	defer db.Close()

	// Initialize EventBus
	bus := events.NewEventBus()

	smsService, err := sms.NewDialogSmsSender()
	if err != nil {
		log.Fatalf("Failed to create SMS sender: %v", err)
	}
	// smsService, err := sms.NewNotifySmsSender()
	// if err != nil {
	// 	log.Fatalf("Failed to create SMS sender: %v", err)
	// }

	// Start server with EventBus
	if err := http.StartServer(ctx, config, services, bus, smsService); err != nil {
		logger.Error(ctx, "HTTP server stopped", zap.Error(err))
	} else {
		logger.Info(ctx, "HTTP server stopped gracefully")
	}

	//// Run HTTP and Kafka services concurrently
	//var wg sync.WaitGroup
	//wg.Add(2)
	//
	//// Start HTTP server in a separate goroutine
	//go func() {
	//	defer wg.Done()
	//	if err := http.StartServer(ctx, config, services); err != nil {
	//		logger.Error(ctx, "HTTP server stopped", zap.Error(err))
	//	} else {
	//		logger.Info(ctx, "HTTP server stopped gracefully")
	//	}
	//
	//}()

	// Start Kafka listener in a separate goroutine
	//go func() {
	//	defer wg.Done()
	//	// Run Kafka listener and log shutdown
	//	if err := kafka.StartListener(ctx, config, services); err != nil {
	//		logger.Error(ctx, "Kafka listener stopped", zap.Error(err))
	//	} else {
	//		logger.Info(ctx, "Kafka listener stopped gracefully")
	//	}
	//}()
	// Wait for both services to complete
	//wg.Wait()
}

func handleShutdown(cancelFunc context.CancelFunc) {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
	log.Println("Received shutdown signal, shutting down gracefully...")
	cancelFunc()
}

func initializeDependencies(ctx context.Context, config *config.Container) (db *storage.DB, services *service.Services, err error) {

	// Initialize database connection
	db, err = storage.New(ctx, config.DB)
	if err != nil {
		logger.Error(ctx, "Error initializing database connection", zap.Error(err))
		return nil, nil, err
	}

	repository := storage.NewRepository(db)

	services = service.SetupServices(service.Config{
		Repositories: repository,
		DB:           db.DB,
	})

	return db, services, nil
}
