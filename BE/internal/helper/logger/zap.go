package logger

import (
	"context"
	"os"
	"rims-backend/internal/config"
	"rims-backend/internal/helper/ctxkey"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	zapLogger *zap.Logger

	// Define a custom log level for Slack logs
	SlackInfoLevel  zapcore.Level = 1 + zapcore.InfoLevel
	SlackErrorLevel zapcore.Level = 2 + zapcore.FatalLevel
)

// SetupDefaultLogger initializes a basic logger for early logging.
func SetupDefaultLogger() {
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
	consoleCore := zapcore.NewCore(consoleEncoder, zapcore.Lock(zapcore.AddSync(os.Stdout)), zapcore.InfoLevel)
	zapLogger = zap.New(consoleCore, zap.AddCaller())
	zap.ReplaceGlobals(zapLogger)
}

// Set configures the logger based on the environment
func Set(ctx context.Context, cfg *config.App) {

	if cfg.Env == "production" {

		// Define console encoder configuration
		consoleEncoder := zapcore.NewConsoleEncoder(zap.NewProductionEncoderConfig())

		// Create a core that writes logs to the console
		consoleCore := zapcore.NewCore(consoleEncoder, zapcore.Lock(zapcore.AddSync(os.Stdout)), zapcore.InfoLevel)
		stackTraceLevelEnabler := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return SlackInfoLevel >= lvl && lvl >= zapcore.ErrorLevel
		})

		// Combine console and Slack cores
		core := zapcore.NewTee(consoleCore)

		zapLogger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(stackTraceLevelEnabler))
	} else {
		// Define console encoder configuration
		consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
		stackTraceLevelEnabler := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return SlackInfoLevel >= lvl && lvl >= zapcore.ErrorLevel
		})
		// Create a core that writes logs to the console
		consoleCore := zapcore.NewCore(consoleEncoder, zapcore.Lock(zapcore.AddSync(os.Stdout)), zapcore.InfoLevel)

		// Combine console and Slack cores
		core := zapcore.NewTee(consoleCore)
		zapLogger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(stackTraceLevelEnabler))
	}
	defer zapLogger.Sync()

	// Set logger as the default
	zap.ReplaceGlobals(WithInstanceID(ctx))
}

func WithInstanceID(ctx context.Context) *zap.Logger {
	InstanceID, _ := ctx.Value(ctxkey.InstanceID).(string)
	return zapLogger.With(zap.String("instance_id", InstanceID))
}

func WithContext(ctx context.Context) *zap.Logger {
	traceID, ok := ctx.Value("traceID").(string)
	if !ok || traceID == "" {
		traceID = uuid.Nil.String() // Default or fallback value
	}
	return zapLogger.With(zap.String("trace_id", traceID))
}

func Info(ctx context.Context, msg string, fields ...zapcore.Field) {
	WithContext(ctx).WithOptions(zap.AddCallerSkip(1)).Info(msg, fields...)
}

func Error(ctx context.Context, msg string, fields ...zapcore.Field) {
	WithContext(ctx).WithOptions(zap.AddCallerSkip(1)).Error(msg, fields...)
}

func Debug(ctx context.Context, msg string, fields ...zapcore.Field) {
	WithContext(ctx).WithOptions(zap.AddCallerSkip(1)).Debug(msg, fields...)
}
