package storage

import (
	"context"
	"log"
	"rims-backend/internal/config"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DB struct {
	*gorm.DB
}

func New(ctx context.Context, config *config.DB) (*DB, error) {

	var err error
	var db *gorm.DB
	db, err = gorm.Open(postgres.Open(config.DSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Println("Error getting *sql.DB object:", err)
		return nil, err
	}

	// Configure connection pooling
	sqlDB.SetMaxOpenConns(5)
	sqlDB.SetMaxIdleConns(3)
	sqlDB.SetConnMaxIdleTime(30 * time.Minute)

	return &DB{
		db,
	}, nil
}

// ErrorCode returns the error code of the given error
func (db *DB) ErrorCode(err error) string {
	pgErr := err.(*pgconn.PgError)
	return pgErr.Code
}

// Close closes the database connection
func (db *DB) Close() {
	sqlDB, err := db.DB.DB()
	if err != nil {
		log.Println("Failed to close the db", err)
	}
	sqlDB.Close()
}
