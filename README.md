# ShopSphere — Full-Stack Microservices E-Commerce Platform

A production-ready e-commerce platform built with a **Spring Boot microservices backend** and an **Angular 21 frontend**, featuring JWT authentication, RabbitMQ async messaging, Redis caching, Outbox pattern, and full Docker support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TailwindCSS, TypeScript |
| Backend | Spring Boot 3.2, Spring Cloud 2023, Java 17 |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Config Management | Spring Cloud Config Server |
| Database | PostgreSQL 15 (separate DB per service) |
| Cache | Redis 7 |
| Messaging | RabbitMQ 4 |
| Auth | JWT (HS256, shared secret) |
| Tracing | Zipkin |
| Code Quality | SonarQube |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |

---

## Architecture Overview

```
Browser (Angular :4200)
        │
        ▼
API Gateway :8080  ←── JWT validation, CORS, routing
        │
        ├──► auth-service      :8081  ←── PostgreSQL auth_db
        ├──► payment-service   :8082  ←── PostgreSQL payment_db
        ├──► order-service     :8083  ←── PostgreSQL order_db + RabbitMQ
        ├──► catalog-service   :8084  ←── PostgreSQL catalog_db + Redis
        ├──► admin-service     :8085  ←── PostgreSQL admin_db
        └──► notification-svc  :8086  ←── PostgreSQL notification_db + RabbitMQ

Infrastructure:
  Eureka Server   :8761  ←── service registry
  Config Server   :8888  ←── centralized config
  RabbitMQ        :5672  ←── async messaging
  Redis           :6379  ←── product list cache
  Zipkin          :9411  ←── distributed tracing
  SonarQube       :9000  ←── code quality
```

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 8080 | JWT validation, CORS, route all requests |
| `auth-service` | 8081 | Register, login, JWT generation |
| `payment-service` | 8082 | Razorpay integration, payment processing |
| `order-service` | 8083 | Cart, checkout, order lifecycle, Outbox pattern |
| `catalog-service` | 8084 | Products, categories, image upload, Redis cache |
| `admin-service` | 8085 | Dashboard, reports, order management |
| `notification-service` | 8086 | RabbitMQ consumer, notification storage & delivery |
| `eureka-server` | 8761 | Service discovery registry |
| `config-server` | 8888 | Centralized configuration |

---

## Key Features

- **JWT Auth** — token issued on login, validated at gateway + each service
- **Role-based access** — `CUSTOMER` and `ADMIN` roles with route guards on frontend and `hasRole` checks on backend
- **Redis caching** — product list cached, invalidated on every write
- **Outbox pattern** — order events saved to DB in same transaction, polled every 5s and published to RabbitMQ (guaranteed delivery)
- **Async notifications** — order events flow through RabbitMQ → notification-service → PostgreSQL → frontend polls every 20s
- **Image upload** — product images stored on disk in catalog-service, served as static files
- **Separate databases** — each microservice owns its own PostgreSQL database (database-per-service pattern)
- **Swagger UI** — every service exposes `/v3/api-docs`, aggregated at gateway `/swagger-ui.html`

---

## Request Flow (How it works)

Every request follows this exact pipeline:

```
Angular Component
  → Service (admin.service / auth.service etc.)
    → jwt.interceptor.ts  (attaches Bearer token)
      → error.interceptor.ts  (handles 401/403)
        → API Gateway :8080
          → CorsConfig  (CORS headers)
          → AuthFilter  (validates JWT, checks role)
          → GatewayConfig  (rewrites URL, routes via Eureka)
            → Microservice
              → JwtFilter  (sets role in SecurityContext)
              → SecurityConfig  (enforces permissions)
              → Controller → Service → Repository → PostgreSQL
```

---

## Running Locally with Docker

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/shopsphere.git
cd shopsphere
```

### 2. Create a `.env` file
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
DOCKER_USERNAME=your_dockerhub_username
```

### 3. Start everything
```bash
docker compose up -d
```

### 4. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API Gateway | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Eureka Dashboard | http://localhost:8761 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Zipkin Tracing | http://localhost:9411 |
| SonarQube | http://localhost:9000 |

---

## Running Locally without Docker

### Prerequisites
- Java 17
- Maven 3.9+
- Node.js 20 + npm
- PostgreSQL 15 (running locally)
- RabbitMQ (running locally)
- Redis (running locally)

### 1. Create databases
```sql
CREATE DATABASE auth_db;
CREATE DATABASE payment_db;
CREATE DATABASE order_db;
CREATE DATABASE catalog_db;
CREATE DATABASE admin_db;
CREATE DATABASE notification_db;
```

### 2. Start infrastructure services
```bash
# RabbitMQ (default port 5672)
# Redis (default port 6379)
# PostgreSQL (default port 5432)
```

### 3. Start backend services in order
```bash
# 1. Config Server
cd config-server && mvn spring-boot:run

# 2. Eureka Server
cd eureka-server && mvn spring-boot:run

# 3. All microservices (each in a separate terminal)
cd auth-service        && mvn spring-boot:run
cd catalog-service     && mvn spring-boot:run
cd order-service       && mvn spring-boot:run
cd payment-service     && mvn spring-boot:run
cd admin-service       && mvn spring-boot:run
cd notification-service && mvn spring-boot:run

# 4. API Gateway (last)
cd api-gateway && mvn spring-boot:run
```

### 4. Start the frontend
```bash
cd sprint-frontend
npm install
npm start
# → http://localhost:4200
```

---

## Default Credentials

| Role | How to create |
|---|---|
| Customer | Register at `/auth/register` |
| Admin | Register at `/admin/create-admin` (requires `@admin.com` email) |

---

## API Endpoints

All requests go through the gateway at `http://localhost:8080`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/gateway/auth/signup` | Public | Register new user |
| POST | `/gateway/auth/login` | Public | Login, returns JWT in `Authorization` header |
| GET | `/gateway/catalog/products` | Public | List all products |
| GET | `/gateway/catalog/products/:id` | Public | Get product by ID |
| POST | `/gateway/catalog/products` | ADMIN | Create product |
| POST | `/gateway/catalog/products/images` | ADMIN | Upload product image |
| PUT | `/gateway/catalog/products/:id` | ADMIN | Update product |
| DELETE | `/gateway/catalog/products/:id` | ADMIN | Delete product |
| GET | `/gateway/orders` | Customer | Get my orders |
| POST | `/gateway/orders` | Customer | Place order |
| GET | `/gateway/admin/dashboard` | ADMIN | Dashboard stats |
| GET | `/gateway/admin/orders` | ADMIN | All orders |
| PUT | `/gateway/admin/orders/:id/status` | ADMIN | Update order status |
| GET | `/gateway/notify/me` | Any | Get my notifications |
| PATCH | `/gateway/notify/:id/read` | Any | Mark notification read |

---

## Project Structure

```
shopsphere/
├── api-gateway/              # Spring Cloud Gateway — routing + JWT filter
├── auth-service/             # Registration, login, JWT generation
├── catalog-service/          # Products, categories, image upload, Redis cache
├── order-service/            # Cart, orders, Outbox pattern, RabbitMQ producer
├── payment-service/          # Razorpay payment processing
├── admin-service/            # Admin dashboard, reports
├── notification-service/     # RabbitMQ consumer, notification storage
├── eureka-server/            # Service discovery
├── config-server/            # Centralized config
├── sprint-frontend/          # Angular 21 SPA
│   └── src/app/
│       ├── core/
│       │   ├── guards/       # authGuard, adminGuard, customerGuard
│       │   ├── interceptors/ # jwt.interceptor, error.interceptor
│       │   ├── models/       # TypeScript interfaces
│       │   └── services/     # auth, product, order, cart, notification...
│       ├── features/
│       │   ├── auth/         # login, register, admin-login
│       │   ├── catalog/      # product-list, product-detail
│       │   ├── cart/         # cart component
│       │   ├── orders/       # checkout, order-list, order-detail
│       │   └── admin/        # dashboard, products, categories, orders
│       ├── layouts/          # auth-layout, main-layout
│       └── shared/           # navbar, footer, toast, notification-tray
├── docker-compose.yml
├── .github/workflows/ci.yml
└── .env                      # (not committed — see .env.example)
```

---

## CI/CD Pipeline

GitHub Actions runs on every push/PR to `main` or `master`.

```
push to main
    │
    ├── Job 1: build-java
    │   └── JDK 17 → mvn clean package -DskipTests (all 9 services)
    │
    ├── Job 2: build-frontend
    │   └── Node 20 → npm ci → ng build --configuration production
    │
    └── Job 3: docker  (only on main/master, after jobs 1 & 2 pass)
        └── Builds + pushes 10 Docker images to Docker Hub
```

### Required GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token |

---

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | payment-service | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | payment-service | Razorpay secret |
| `JWT_SECRET` | auth, order, admin, notification, gateway | Shared JWT signing key |
| `SPRING_DATASOURCE_URL` | all services | PostgreSQL connection URL |
| `SPRING_RABBITMQ_HOST` | order, notification, payment | RabbitMQ host |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | all services | Eureka registry URL |

---

## License

MIT
