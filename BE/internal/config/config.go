// package config

// import (
// 	"fmt"
// 	"os"

// 	"github.com/joho/godotenv"
// )

// // Container contains environment variables for the application, database, cache, and http server
// type (
// 	Container struct {
// 		App  *App
// 		DB   *DB
// 		HTTP *HTTP
// 	}
// 	// App contains all the environment variables for the application
// 	App struct {
// 		Name string
// 		Env  string
// 	}

// 	// DB Database contains all the environment variables for the database
// 	DB struct {
// 		DSN string
// 	}

// 	// HTTP contains all the environment variables for the http server
// 	HTTP struct {
// 		Env            string
// 		URL            string
// 		Port           string
// 		AllowedOrigins string
// 	}
// )

// // New creates a new container instance
// func New() (*Container, error) {
// 	if os.Getenv("APP_ENV") == "" {
// 		err := godotenv.Load(".env")
// 		if err != nil {
// 			return nil, err
// 		}
// 	}

// 	app := &App{
// 		Name: os.Getenv("APP_NAME"),
// 		Env:  os.Getenv("APP_ENV"),
// 	}

// 	// Build the DSN string
// 	db := &DB{
// 		DSN: fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s TimeZone=UTC",
// 			os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASS"), os.Getenv("POSTGRES_DB"), os.Getenv("POSTGRES_PORT")),
// 	}

// 	http := &HTTP{
// 		Env:            os.Getenv("APP_ENV"),
// 		URL:            os.Getenv("HTTP_URL"),
// 		Port:           os.Getenv("HTTP_PORT"),
// 		AllowedOrigins: os.Getenv("HTTP_ALLOWED_ORIGINS"),
// 	}

//		return &Container{
//			app,
//			db,
//			http,
//		}, nil
//	}
package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Container contains environment variables for the application, database, cache, and http server
type (
	Container struct {
		App  *App
		DB   *DB
		HTTP *HTTP
	}
	// App contains all the environment variables for the application
	App struct {
		Name string
		Env  string
	}

	// DB Database contains all the environment variables for the database
	DB struct {
		DSN string
	}

	// HTTP contains all the environment variables for the http server
	HTTP struct {
		Env            string
		URL            string
		Port           string
		AllowedOrigins string
	}
)

// New creates a new container instance
func New() (*Container, error) {
	if os.Getenv("APP_ENV") == "" {
		err := godotenv.Load(".env")
		if err != nil {
			return nil, err
		}
	}

	app := &App{
		Name: os.Getenv("APP_NAME"),
		Env:  os.Getenv("APP_ENV"),
	}

	// Build the DSN string
	db := &DB{
		DSN: fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s TimeZone=UTC",
			os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASS"), os.Getenv("POSTGRES_DB"), os.Getenv("POSTGRES_PORT")),
	}

	// --- PORT RESOLUTION LOGIC ---
	// 1. Try to get Render's automatically assigned port
	port := os.Getenv("PORT")
	if port == "" {
		// 2. Fall back to your local .env HTTP_PORT if Render's PORT is empty
		port = os.Getenv("HTTP_PORT")
		if port == "" {
			// 3. Final safety net just in case nothing is set
			port = "3000"
		}
	}

	http := &HTTP{
		Env:            os.Getenv("APP_ENV"),
		URL:            os.Getenv("HTTP_URL"),
		Port:           port, // Assign the resolved port here
		AllowedOrigins: os.Getenv("HTTP_ALLOWED_ORIGINS"),
	}

	return &Container{
		app,
		db,
		http,
	}, nil
}
