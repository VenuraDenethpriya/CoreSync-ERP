package main

import (
	"CoreSync-backend/internal/config"
	"CoreSync-backend/internal/controller/http"
	"CoreSync-backend/internal/email"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/jobs"
	"CoreSync-backend/internal/service"
	"CoreSync-backend/internal/storage"
	"CoreSync-backend/pkg/sms"
	"context"
	"log"
	"os"
	"os/signal"
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
	db, repo, services, err := initializeDependencies(ctx, config)
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
	emailService := email.NewResendClient()
	birthdayJob := jobs.NewBirthdayNotifier(repo.HrRepository, emailService, smsService)
	birthdayJob.Start()
	// [ADDED 2026-10-13] daily low-level check: updates low levels from BOMs, drafts automatic PRs
	stockActor := os.Getenv("STOCK_SYSTEM_CLERK_ID")
	if stockActor == "" {
		stockActor = "system"
	}
	services.StockControl.StartDailyLowLevel(ctx, stockActor, log.Printf)
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

// func initializeDependencies(ctx context.Context, config *config.Container) (db *storage.DB, services *service.Services, err error) {

// 	// Initialize database connection
// 	db, err = storage.New(ctx, config.DB)
// 	if err != nil {
// 		logger.Error(ctx, "Error initializing database connection", zap.Error(err))
// 		return nil, nil, err
// 	}

// 	repository := storage.NewRepository(db)

// 	services = service.SetupServices(service.Config{
// 		Repositories: repository,
// 		DB:           db.DB,
// 	})

//		return db, services, nil
//	}
func initializeDependencies(ctx context.Context, config *config.Container) (db *storage.DB, repo *storage.Repository, services *service.Services, err error) {

	// Initialize database connection
	db, err = storage.New(ctx, config.DB)
	if err != nil {
		logger.Error(ctx, "Error initializing database connection", zap.Error(err))
		return nil, nil, nil, err
	}

	// Capture the repository here
	repo = storage.NewRepository(db)

	services = service.SetupServices(service.Config{
		Repositories: repo,
		DB:           db.DB,
	})

	return db, repo, services, nil
}
