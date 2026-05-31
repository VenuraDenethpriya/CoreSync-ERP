
# RIMS – Renewaa Inventory Management System

## Layered Architecture
This project follows a **layered architecture** approach — a widely adopted Go design pattern for building maintainable, scalable backends.

### Main Components
1. **Controller Layer**
    - HTTP (Gin) and Kafka handlers
    - Maps DTOs to services
    - Deals with input validation, request/response only

2. **Service Layer (Business Logic)**
    - Contains core application logic
    - Orchestrates workflows using repositories
    - Interfaces defined here

3. **Repository Layer (Storage)**
    - Interacts with data stores like SQL (Postgres), Redis, etc.
    - Uses GORM models to persist data

4. **Entity Layer (Models)**
    - GORM database struct definitions
    - Used only inside the repository layer

###  Dependency Flow

Only outer layers may depend on inner layers. Inner layers know **nothing** about outer ones.

```text
[Controller]
└── Accepts JSON → maps to `dto.GetCustomerRequest`
     ↓
[Service]
└── Maps DTO → `domain.Customer` → Business logic 
     ↓
[Repository]
└── Maps `domain.Customer` → `model.CustomerModel` → GORM save
```

### Folder structure

```
.
├── cmd
│   └── app               # Entrypoint 
├── docs                  # swagger and other docs
└── internal              # Source codes
    ├── config            # App/env configuration
    ├── controller        # Controller layer
    │   ├── http          # HTTP adapter to expose services
    │   │   ├── api       # All the API handlers goes here
    │   │   │   ├── customer # customer handlers
    │   │   │   ├── order    # order handlers
    │   │   │   └── item     # item handlers
    │   │   ├── common       # common functions/helpers for all APIs, 
    │   │   ├── dto          # Request and response dtos for the different entities 
    │   │   └── middleware   # API middlewares
    │   └── kafka            #kafka messaging adapter
    ├── service              # service layer 
    │   ├── service.go       # Wires services together
    │   ├── domains/         # domains used for each service
    │   ├── customer/        # customer's business logic implementation
    │   │   ├── service.go   # abstraction
    │   │   └── get_customers.go  
    │   ├── item/            # item's business logic implementation
    │   └── order/           # item's business logic implementation
    ├── storage              # repository layer 
    │   ├── db.go            # DB connection logic
    │   ├── repository.go    # Wires repositories
    │   └──  repository      # Entity-specific repositories
    │       ├── item.go  
    │       ├── order.go  
    │       └── customer.go  
    ├── models               # entity layer
    │   ├── customer.go      
    │   ├── item.go
    │   └── order.go
    └── helper              # General utilities shared across the application
        ├── ctxkey          # Context keys are defined here
        └── logger          # logger adapter with using zap
```

## Setup 

### Prerequisites
1. [Docker](https://www.docker.com/)
2. [Go (latest version)](https://go.dev/dl/)
3. [DBeaver (optional)](https://dbeaver.io/) – Recommended DB GUI

### Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.template .env
   ```

2. **Update Environment Variables**
   Edit the `.env` file with your configuration values. For Docker Compose, ensure `POSTGRES_HOST=db`.
   - Database connection details
   - API keys (Resend, Clerk)
   - Application settings
   - Authentication settings

### Running with Docker

#### Docker Compose (Recommended)
This is the recommended way to run the application and its database together. It uses the `docker-compose.yml` file in the project root.
 
Then run:
```bash
sudo docker-compose up --build
```

### Running Locally (Development)

1. **Install Dependencies**
   ```bash
   go mod download
   ```

2. **Run the Application**
   ```bash
   go run main.go
   ```

3. **Build for Production**
   ```bash
   go build -o main .
   ./main
   ```

### API Documentation

The API documentation is available via Swagger UI:
- Local: `http://localhost:8080/swagger/index.html`
- Docker: `http://localhost:{HTTP_PORT}/swagger/index.html`

### Health Check

The application includes a health check endpoint:
- Endpoint: `/api/v1/healthcheck`
- Method: GET
- Response: `{"status": "healthy"}`

### Docker Features

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Dynamic port configuration** based on HTTP_PORT environment variable
- **Health check** with automatic endpoint validation
- **Alpine Linux** base image for minimal size
- **Environment variable support** with .env file integration

### Troubleshooting

#### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8080
   
   # Kill the process or change HTTP_PORT in .env
   ```

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

3. **Docker Build Issues**
   ```bash
   # Clean build (no cache)
   docker build --no-cache -t rims-backend .
   
   # Check Docker logs
   docker logs <container_id>
   ```

4. **Environment Variables Not Loading**
   - Ensure `.env` file exists and is properly formatted
   - Check that there are no spaces around the `=` sign
   - Verify file permissions

#### Development Tips

1. **Live Reload (Development)**
   ```bash
   # Install air for hot reload
   go install github.com/cosmtrek/air@latest
   
   # Run with hot reload
   air
   ```

2. **Database Migrations**
   ```bash
   # Generate Swagger docs
   swag init
   ```

3. **View Logs**
   ```bash
   # Docker logs
   docker logs rims-backend
   
   # Docker compose logs
   docker-compose logs app
   ```


## Best Practices and Rules
1. Case types
    - Use `kebab-case` for url paths
    - Use `snake_case` for requests and responses
    - Use `camelCase`/`CamelCase` for golang variables
    - Use `snake_case` for filenames
2. Use `domain.WrapErrorWithCode` and `domain.NewCustomError` to throw a error with logic specific error `code`. Create a new error code in `domain/error.go` if existing codes are not match with your error.
3. Define shorter package names without any space or any other character. Optional: Use the same name for package name and folder name.
4. Don't use `config` or `environment` variables directly in the logic. Pass it through entrypoint.
5. Don't couple `service` logic and `repository layer` logic
6. Keep service logic independent of repository logic. Always define service interfaces in `service.go` within each service folder
7. Use `logger` adapter to print any debug/info/error logs. Define a new log level if required.