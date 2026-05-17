# Subscription Analytics Platform - Technical Specification & Documentation

---

## 📋 Table of Contents

1. [Problem Statement](#problem-statement)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Design Patterns](#design-patterns)
5. [System Components](#system-components)
6. [Database Design](#database-design)
7. [API Specifications](#api-specifications)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Implementation](#security-implementation)
10. [Further Implementation & Enhancements](#further-implementation--enhancements)
11. [Deployment & DevOps](#deployment--devops)
12. [Performance Considerations](#performance-considerations)
13. [Testing Strategy](#testing-strategy)
14. [Future Roadmap](#future-roadmap)

---

## 🎯 Problem Statement

### Business Problem

Users today manage multiple subscription services across different platforms (streaming, music, cloud storage, productivity tools, etc.) without a centralized system to:

1. **Track All Subscriptions**: No single place to view all active subscriptions, renewal dates, and costs
2. **Manage Billing**: Difficulty tracking upcoming payments and managing multiple payment methods
3. **Analyze Spending**: No insights into total subscription spending or category-wise breakdown
4. **Optimize Subscriptions**: Unable to identify unused or redundant subscriptions
5. **Monitor Usage**: No mechanism to track actual service usage vs. subscription cost
6. **Get Recommendations**: Lack of intelligent suggestions to optimize subscription portfolio

### Business Goals

- Provide centralized subscription management platform
- Enable users to track spending and optimize subscriptions
- Offer intelligent recommendations to reduce redundant subscriptions
- Track usage patterns to identify value-for-money subscriptions
- Reduce subscription costs through better management

### Target Users

1. **Individual Users**: Managing personal subscriptions (5-20 subscriptions)
2. **Family Plans**: Coordinating shared subscriptions
3. **Small Business Owners**: Managing team subscriptions
4. **Tech-Savvy Users**: Who want detailed analytics and automation

### Key Requirements

#### Functional Requirements

| Requirement | Priority | Description |
|------------|----------|-------------|
| User Authentication | HIGH | Secure login/registration system |
| Subscription CRUD | HIGH | Create, read, update, delete subscriptions |
| Billing Tracking | HIGH | Track payments and upcoming bills |
| Usage Tracking | MEDIUM | Monitor service usage via browser extension |
| Analytics Dashboard | MEDIUM | Visualize spending and trends |
| Recommendations | MEDIUM | AI-based subscription optimization suggestions |
| CSV Import | MEDIUM | Bulk import subscriptions |
| Payment History | MEDIUM | Track all payment records |
| Category Management | LOW | Organize subscriptions by type |
| Calendar View | LOW | Visualize renewal dates |

#### Non-Functional Requirements

| Requirement | Target | Priority |
|------------|--------|----------|
| Response Time | < 500ms | HIGH |
| Availability | 99.5% uptime | HIGH |
| Scalability | Support 10K+ users | MEDIUM |
| Security | HTTPS, JWT, encrypted passwords | HIGH |
| Data Privacy | GDPR compliant | HIGH |
| Performance | Support 1K concurrent users | MEDIUM |
| Backup & Recovery | Daily backups | HIGH |

---

## 🏛️ System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    External Services                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Cloudinary  │  │  Email/SMTP  │  │  Analytics   │  │
│  │  (File CDN)  │  │  Provider    │  │  Service     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬───────────────────────────────┬─┘
                        │                               │
            ┌───────────▼─────────────┐     ┌──────────▼─────────┐
            │  Browser Extension      │     │  REST API Gateway  │
            │  (Usage Tracking)       │     │  (Load Balancer)   │
            └───────────┬─────────────┘     └──────────┬─────────┘
                        │                              │
                        └──────────────┬───────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │    Spring Boot REST API Layer       │
                    │  ┌────────────────────────────────┐ │
                    │  │  Controllers & Routes          │ │
                    │  │  - AuthController             │ │
                    │  │  - SubscriptionController     │ │
                    │  │  - BillingController          │ │
                    │  │  - UsageTrackingController    │ │
                    │  │  - RecommendationController   │ │
                    │  └────────────────────────────────┘ │
                    │  ┌────────────────────────────────┐ │
                    │  │  Business Logic Layer          │ │
                    │  │  - Service Classes            │ │
                    │  │  - Business Rules             │ │
                    │  │  - Data Validation            │ │
                    │  └────────────────────────────────┘ │
                    │  ┌────────────────────────────────┐ │
                    │  │  Data Access Layer             │ │
                    │  │  - JPA Repositories           │ │
                    │  │  - Query Methods              │ │
                    │  └────────────────────────────────┘ │
                    │  ┌────────────────────────────────┐ │
                    │  │  Security Layer                │ │
                    │  │  - JWT Authentication         │ │
                    │  │  - Authorization Filters      │ │
                    │  │  - Password Encryption        │ │
                    │  └────────────────────────────────┘ │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │    MySQL Database               │
                    │  ┌────────────────────────────┐ │
                    │  │ Tables:                    │ │
                    │  │ - users                    │ │
                    │  │ - subscriptions            │ │
                    │  │ - billing_records          │ │
                    │  │ - usage_tracking           │ │
                    │  │ - recommendations          │ │
                    │  │ - user_snapshots           │ │
                    │  └────────────────────────────┘ │
                    │  ┌────────────────────────────┐ │
                    │  │ Flyway Migrations          │ │
                    │  │ Schema Versioning          │ │
                    │  └────────────────────────────┘ │
                    └────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                │                                     │
    ┌──────────▼──────────┐            ┌─────────────▼────────┐
    │  React Frontend     │            │  Admin Dashboard     │
    │  - Web UI           │            │  - Analytics         │
    │  - Dashboard        │            │  - User Management   │
    │  - Subscriptions    │            │  - System Monitoring │
    │  - Analytics        │            │  - Reports           │
    │  - Calendar         │            └─────────────────────┘
    │  - CSV Upload       │
    └─────────────────────┘
```

---

## 🏗️ Architecture

### 1. Layered Architecture

The system follows a **4-tier layered architecture**:

#### Tier 1: Presentation Layer (Frontend)
- **Technology**: React 18, Vite, Context API
- **Responsibilities**:
  - User Interface rendering
  - User interaction handling
  - Form validation
  - State management (authentication, user data)
  - API communication via Axios
- **Components**:
  - Page components (Dashboard, Subscriptions, Analytics, etc.)
  - Layout wrapper and navigation
  - Protected routes with authentication
  - Modal forms and dialogs

#### Tier 2: API Layer (REST Controller)
- **Technology**: Spring Boot REST Controllers
- **Responsibilities**:
  - HTTP request/response handling
  - Request routing to appropriate services
  - HTTP status code management
  - Input validation and error handling
  - CORS configuration
- **Endpoints**:
  - `/api/auth/*` - Authentication
  - `/api/subscriptions/*` - Subscription CRUD
  - `/api/billing/*` - Billing records
  - `/api/usage/*` - Usage tracking
  - `/api/recommendations/*` - Recommendations

#### Tier 3: Business Logic Layer (Services)
- **Technology**: Spring Service classes with @Service annotation
- **Responsibilities**:
  - Core business logic implementation
  - Data transformation and validation
  - Complex calculations (spending, recommendations)
  - Transaction management
  - Integration with external services
- **Key Services**:
  - SubscriptionService: Manages subscriptions lifecycle
  - BillingService: Handles billing records
  - UsageTrackingService: Aggregates usage data
  - RecommendationService: Generates suggestions
  - AuthService: User authentication logic

#### Tier 4: Data Access Layer (Repositories)
- **Technology**: Spring Data JPA
- **Responsibilities**:
  - Database operations (CRUD)
  - Custom query methods
  - Transaction propagation
  - Lazy/eager loading strategies
- **Repositories**:
  - UserRepository
  - SubscriptionRepository
  - BillingRecordRepository
  - UsageTrackingRepository
  - RecommendationRepository

#### Tier 5: Database Layer
- **Technology**: MySQL 8.0
- **Responsibilities**:
  - Data persistence
  - Data integrity constraints
  - Indexing for performance
  - Data consistency
  - Backup and recovery

### 2. Security Architecture

```
Request Flow with Security
│
├─ CORS Filter
│  └─ Check if request origin is allowed
│
├─ JWT Authentication Filter
│  ├─ Extract JWT token from Authorization header
│  ├─ Validate token signature
│  ├─ Extract user claims (userId, email, username)
│  └─ Set authentication context
│
├─ Spring Security Filter Chain
│  ├─ Check if user is authenticated
│  └─ Verify authorization (roles, permissions)
│
├─ Controller Handler
│  ├─ Validate request parameters
│  └─ Ensure user owns the resource
│
└─ Response
   └─ Return with HTTP 200/201/4xx/5xx
```

### 3. Data Flow Architecture

```
User Action Flow:
User Interaction (Frontend)
    │
    ▼
HTTP Request (Axios)
    │
    ▼
Controller (Route Handler)
    │
    ├─ Validate Request
    ├─ Extract JWT Token
    └─ Call Service
        │
        ▼
    Service (Business Logic)
    │
    ├─ Validate Business Rules
    ├─ Process Data
    ├─ Call Repository
    │   │
    │   ▼
    │   Repository (JPA)
    │   │
    │   ├─ Generate SQL
    │   ├─ Execute Query
    │   └─ Return Results
    │
    ├─ Transform to DTO
    └─ Return Response
        │
        ▼
Controller (Serialize DTO to JSON)
    │
    ▼
HTTP Response (JSON)
    │
    ▼
Frontend (Update UI State)
```

---

## 🎨 Design Patterns

### 1. MVC (Model-View-Controller)
- **Where**: Across all layers
- **Implementation**:
  - Model: Entity classes (User, Subscription, etc.)
  - View: React components
  - Controller: Spring REST controllers
- **Benefit**: Clear separation of concerns

### 2. Repository Pattern
- **Where**: Data Access Layer
- **Implementation**:
  ```java
  @Repository
  public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
      List<Subscription> findAllByUserId(Long userId);
      Optional<Subscription> findByIdAndUserId(Long id, Long userId);
  }
  ```
- **Benefit**: Abstraction of data source, easier testing and switching implementations

### 3. Service/Business Logic Pattern
- **Where**: Business Logic Layer
- **Implementation**:
  ```java
  @Service
  public class SubscriptionService {
      private final SubscriptionRepository repository;
      private final CurrentUserService userService;
      
      @Transactional
      public SubscriptionResponse create(SubscriptionRequest request) {
          User user = userService.getCurrentUser();
          Subscription subscription = new Subscription(user, ...);
          Subscription saved = repository.save(subscription);
          return toResponse(saved);
      }
  }
  ```
- **Benefit**: Centralizes business rules, transaction management

### 4. DTO (Data Transfer Object) Pattern
- **Where**: API layer between Controller and Client
- **Implementation**:
  ```java
  // Request DTO
  public record SubscriptionRequest(
      String providerName,
      Category category,
      LocalDate startDate,
      Renewal_Cycle renewalCycle,
      BigDecimal price,
      String currency
  ) {}
  
  // Response DTO
  public record SubscriptionResponse(
      Long id,
      String providerName,
      String category,
      LocalDate startDate,
      LocalDate renewalDate,
      BigDecimal price,
      String currency,
      String status,
      Instant createdAt
  ) {}
  ```
- **Benefit**: Decouples API contract from internal model, flexibility in API evolution

### 5. Dependency Injection Pattern
- **Where**: Spring Container management
- **Implementation**:
  ```java
  @RestController
  public class SubscriptionController {
      private final SubscriptionService service;
      
      public SubscriptionController(SubscriptionService service) {
          this.service = service;
      }
  }
  ```
- **Benefit**: Loose coupling, easier testing with mock objects

### 6. Singleton Pattern
- **Where**: Spring beans (Services, Controllers, Repositories)
- **Implementation**: `@Service`, `@Controller`, `@Repository` annotations
- **Benefit**: Single instance per application context, efficient resource usage

### 7. Factory Pattern
- **Where**: CloudinaryStorageService
- **Implementation**:
  ```java
  @Service
  public class CloudinaryStorageService {
      public String uploadCsv(MultipartFile file) {
          // Creates and configures Cloudinary instance
          Cloudinary cloudinary = new Cloudinary(config);
          // Encapsulates creation complexity
          return cloudinary.uploader().upload(file.getBytes(), options);
      }
  }
  ```
- **Benefit**: Encapsulates object creation, easier to replace with other storage providers

### 8. Strategy Pattern
- **Where**: Storage service abstraction
- **Future Implementation**:
  ```java
  public interface StorageStrategy {
      String upload(MultipartFile file);
      String download(String fileId);
      void delete(String fileId);
  }
  
  // Multiple implementations
  public class CloudinaryStorageStrategy implements StorageStrategy { }
  public class S3StorageStrategy implements StorageStrategy { }
  public class AzureBlobStorageStrategy implements StorageStrategy { }
  ```
- **Benefit**: Easy to switch storage providers without changing client code

### 9. Builder Pattern (via Lombok)
- **Where**: Entity classes
- **Implementation**:
  ```java
  @Entity
  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public class BillingRecord {
      // Lombok generates constructors, getters, setters
  }
  
  // Usage
  BillingRecord record = new BillingRecord(id, amount, subscription, ...);
  ```
- **Benefit**: Flexible object construction, cleaner code

### 10. Adapter Pattern
- **Where**: AuthUserPrincipal
- **Implementation**:
  ```java
  public class AuthUserPrincipal implements UserDetails {
      // Adapts domain User object to Spring Security UserDetails interface
  }
  ```
- **Benefit**: Integration with Spring Security framework

### 11. JWT Token Pattern
- **Where**: Authentication system
- **Implementation**:
  ```java
  @Service
  public class JwtTokenService {
      public String issueToken(Long userId, String username, String email) {
          // Create JWT with claims and signature
          return Jwts.builder()
              .claim("userId", userId)
              .claim("username", username)
              .claim("email", email)
              .issuedAt(now)
              .expiration(expirationTime)
              .signWith(key)
              .compact();
      }
      
      public Long extractUserId(String token) {
          // Verify and extract claims
      }
  }
  ```
- **Benefit**: Stateless authentication, scalable, suitable for microservices

### 12. Transactional Pattern
- **Where**: Service methods
- **Implementation**:
  ```java
  @Service
  public class SubscriptionService {
      @Transactional
      public SubscriptionResponse create(SubscriptionRequest request) {
          // All operations succeed or all fail
          subscription.save();
          billingRecord.create();
      }
      
      @Transactional(readOnly = true)
      public List<SubscriptionResponse> getAll() {
          // Read-only optimization
      }
  }
  ```
- **Benefit**: ACID properties, consistent data state

### 13. Filter/Interceptor Pattern
- **Where**: Security and request processing
- **Implementation**:
  ```java
  @Component
  public class JwtAuthenticationFilter extends OncePerRequestFilter {
      @Override
      protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws IOException, ServletException {
          // Intercept each request
          String token = extractToken(request);
          if (isValid(token)) {
              setAuthentication(token);
          }
          filterChain.doFilter(request, response);
      }
  }
  ```
- **Benefit**: Cross-cutting concerns, centralized logic

### 14. Observer Pattern (Future)
- **Purpose**: Event-driven notifications
- **Use Cases**:
  - Send email when payment is due
  - Notify user of new recommendations
  - Alert on subscription expiry
- **Implementation**:
  ```java
  public interface SubscriptionEventListener {
      void onSubscriptionCreated(Subscription subscription);
      void onSubscriptionExpiring(Subscription subscription);
      void onPaymentDue(BillingRecord record);
  }
  ```

---

## 🔧 System Components

### Backend Components

#### 1. Authentication Module
- **Files**: `Auth/` package
- **Classes**:
  - `AuthController.java`: Handles login/register endpoints
  - `AuthService.java`: Business logic for authentication
  - `JwtTokenService.java`: JWT generation and validation
  - `JwtAuthenticationFilter.java`: Request filter for token validation
  - `AuthUserPrincipal.java`: Spring Security UserDetails adapter
- **Key Features**:
  - User registration with validation
  - Secure login with password hashing (BCrypt)
  - JWT token issuance
  - Token refresh mechanism
  - Last login tracking

#### 2. Subscription Module
- **Files**: `Subscriptions/` package
- **Classes**:
  - `SubscriptionController.java`: REST endpoints
  - `SubscriptionService.java`: Business logic
  - `SubscriptionRepository.java`: Data access
  - `Subscription.java`: Entity model
  - `Category.java`: Enum for subscription types
  - `SubscriptionStatus.java`: Enum for states
- **Key Features**:
  - CRUD operations
  - Bulk CSV import with Cloudinary storage
  - Subscription status management
  - Renewal date tracking
  - Category-based organization

#### 3. Billing Module
- **Files**: `BillingRecord/` package
- **Classes**:
  - `BillingController.java`: REST endpoints
  - `BillingService.java`: Business logic
  - `BillingRecordRepository.java`: Data access
  - `BillingRecord.java`: Entity model
  - `PaymentMethod.java`: Enum for payment types
- **Key Features**:
  - Automatic billing record creation
  - Payment tracking
  - Upcoming payment alerts (30-day forecast)
  - Payment method tracking
  - Source tracking (Web, Mobile, Extension)

#### 4. Usage Tracking Module
- **Files**: `UsageTracking/` package
- **Classes**:
  - `UsageTrackingController.java`: REST endpoints
  - `UsageTrackingService.java`: Business logic
  - `UsageTrackingRepository.java`: Data access
  - `UsageTracking.java`: Entity model
- **Key Features**:
  - Real-time usage recording (from browser extension)
  - Monthly usage aggregation
  - Service-wise breakdown
  - Idempotency for duplicate prevention
  - Supported services configuration

#### 5. Recommendation Module
- **Files**: `Recommendation/` package
- **Classes**:
  - `RecommendationController.java`: REST endpoints
  - `RecommendationService.java`: Business logic
  - `RecommendationRepository.java`: Data access
  - `Recommendation.java`: Entity model
  - `Type.java`: Enum (UPGRADE, DOWNGRADE, CANCEL)
  - `Status.java`: Enum (PENDING, ACCEPTED, REJECTED)
- **Key Features**:
  - Intelligent suggestion generation
  - Confidence scoring
  - User acceptance tracking
  - Dismissal functionality
  - Action status tracking

#### 6. User Module
- **Files**: `Users/` package
- **Classes**:
  - `User.java`: Entity model
  - `UserRepository.java`: Data access
  - `UserStatus.java`: Enum for user states
  - `CurrentUserService.java`: Utility to get authenticated user
- **Key Features**:
  - User profile management
  - Status tracking (Active, Inactive, Suspended)
  - Last login tracking
  - Account creation timestamp

#### 7. Storage Module
- **Files**: `Storage/` package
- **Classes**:
  - `CloudinaryStorageService.java`: File upload service
- **Key Features**:
  - CSV file upload to Cloudinary CDN
  - Secure URL generation
  - Error handling for upload failures

#### 8. Configuration Module
- **Files**: `Config/` package
- **Classes**:
  - `SecurityConfig.java`: Spring Security configuration
  - `JwtProperties.java`: JWT configuration properties
  - `CloudinaryProperties.java`: Cloudinary configuration
- **Key Features**:
  - Security filter chain setup
  - CORS configuration
  - Password encoding configuration
  - Externalized configuration management

### Frontend Components

#### Pages
- **Login.jsx**: User authentication
- **Register.jsx**: User registration
- **Dashboard.jsx**: Summary statistics and overview
- **Subscriptions.jsx**: Manage subscriptions (CRUD + CSV upload)
- **Analytics.jsx**: Spending analysis and trends
- **Calendar.jsx**: Renewal date calendar view
- **CsvUpload.jsx**: Bulk import interface

#### Components
- **Layout.jsx**: Navigation and page wrapper
- **ProtectedRoute.jsx**: Route guard for authenticated users

#### Context
- **AuthContext.jsx**: Global authentication state

#### Services
- **api.js**: Centralized HTTP client with interceptors

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │────┐
│ username     │    │
│ email        │    │
│ password_hash│    │
│ status       │    │
│ created_at   │    │
│ last_login   │    │
└──────────────┘    │
                    │
        ┌───────────┼───────────────────┐
        │           │                   │
        ▼           ▼                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│subscriptions │ │recommendations│ │usage_tracking    │
├──────────────┤ ├──────────────┤ ├──────────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)          │
│ user_id (FK) │ │ user_id (FK) │ │ user_id (FK)     │
│ provider     │ │ sub_id (FK)  │ │ service_name     │
│ category     │ │ type         │ │ date             │
│ start_date   │ │ reason       │ │ minutes_used     │
│ renewal_date │ │ confidence   │ │ idempotency_key  │
│ price        │ │ status       │ │ created_at       │
│ currency     │ │ generated_at │ └──────────────────┘
│ status       │ └──────────────┘
│ created_at   │
│ updated_at   │
└──────────────┘
        │
        │ 1:N
        │
        ▼
┌──────────────────────┐
│ billing_records      │
├──────────────────────┤
│ id (PK)              │
│ subscription_id (FK) │
│ amount               │
│ currency             │
│ billing_period       │
│ paid_at              │
│ payment_method       │
│ source               │
│ created_at           │
└──────────────────────┘
```

### Key Tables

#### 1. users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordhash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  INDEX idx_users_email (email),
  CONSTRAINT check_email_format CHECK (email LIKE '%@%.%')
);
```

**Purpose**: Store user account information
**Relationships**: 1:N with subscriptions, recommendations, usage_tracking

#### 2. subscriptions
```sql
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  category ENUM('STREAMING', 'MUSIC', 'CLOUD', 'PRODUCTIVITY', 'GAMING', 'FITNESS', 'NEWS', 'OTHER'),
  start_date DATE NOT NULL,
  renewal_cycle ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
  renewal_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('ACTIVE', 'PAUSED', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_renewal_date (renewal_date),
  CONSTRAINT check_price CHECK (price > 0),
  CONSTRAINT check_dates CHECK (start_date <= renewal_date)
);
```

**Purpose**: Track user subscriptions
**Relationships**: N:1 with users, 1:N with billing_records, 1:N with recommendations

#### 3. billing_records
```sql
CREATE TABLE billing_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subscription_id BIGINT NOT NULL,
  amount DOUBLE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  billing_period VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
  paid_at TIMESTAMP NOT NULL,
  payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER'),
  source ENUM('WEB', 'MOBILE', 'EXTENSION'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_billing_subscription_id (subscription_id),
  INDEX idx_billing_paid_at (paid_at),
  INDEX idx_billing_period (billing_period),
  CONSTRAINT check_amount CHECK (amount > 0)
);
```

**Purpose**: Track billing and payment records
**Relationships**: N:1 with subscriptions

#### 4. usage_tracking
```sql
CREATE TABLE usage_tracking (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  minutes_used INT NOT NULL DEFAULT 0,
  idempotency_key VARCHAR(120) UNIQUE COMMENT 'Prevents duplicate entries',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_usage_user_id (user_id),
  INDEX idx_usage_user_date (user_id, date),
  INDEX idx_usage_service_date (service_name, date),
  CONSTRAINT check_minutes CHECK (minutes_used >= 0)
);
```

**Purpose**: Track service usage from browser extension
**Relationships**: N:1 with users

#### 5. recommendations
```sql
CREATE TABLE recommendations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  subscription_id BIGINT NOT NULL,
  type ENUM('DOWNGRADE', 'UPGRADE', 'CANCEL') NOT NULL,
  reason VARCHAR(100),
  confidence_score DOUBLE COMMENT 'Range: 0.0 to 1.0',
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_recommendations_user_id (user_id),
  INDEX idx_recommendations_status (status),
  INDEX idx_recommendations_generated_at (generated_at),
  CONSTRAINT check_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1.0)
);
```

**Purpose**: Store AI-generated subscription recommendations
**Relationships**: N:1 with users, N:1 with subscriptions

### Indexing Strategy

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | idx_users_email | email | Fast user lookup by email |
| subscriptions | idx_subscriptions_user_id | user_id | Fetch all user subscriptions |
| subscriptions | idx_subscriptions_renewal_date | renewal_date | Find upcoming renewals |
| billing_records | idx_billing_period | billing_period | Monthly billing reports |
| usage_tracking | idx_usage_user_date | user_id, date | Monthly usage aggregation |
| recommendations | idx_recommendations_status | status | Filter pending recommendations |

### Data Integrity Constraints

1. **Referential Integrity**: Foreign keys prevent orphaned records
2. **Check Constraints**: Validate data ranges (price > 0, confidence 0-1)
3. **Unique Constraints**: Email uniqueness, idempotency key uniqueness
4. **Cascading Deletes**: Delete user → cascade to all related records

---

## 📡 API Specifications

### Authentication APIs

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201 CREATED
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}

Error Responses:
- 400: Invalid input (missing fields, weak password)
- 409: Email or username already exists
- 500: Server error
```

#### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}

Error Responses:
- 400: Missing credentials
- 401: Invalid credentials
- 500: Server error
```

### Subscription APIs

#### 1. Get All Subscriptions
```
GET /api/subscriptions
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "id": 1,
    "providerName": "Netflix",
    "category": "STREAMING",
    "startDate": "2024-01-15",
    "renewalDate": "2024-05-15",
    "price": 15.99,
    "currency": "USD",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "providerName": "Spotify",
    "category": "MUSIC",
    "startDate": "2024-02-01",
    "renewalDate": "2024-05-01",
    "price": 9.99,
    "currency": "USD",
    "status": "ACTIVE",
    "createdAt": "2024-02-01T10:30:00Z"
  }
]

Error Responses:
- 401: Unauthorized (invalid or missing token)
- 500: Server error
```

#### 2. Create Subscription
```
POST /api/subscriptions
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

Request:
{
  "providerName": "Netflix",
  "category": "STREAMING",
  "startDate": "2024-01-15",
  "renewalCycle": "MONTHLY",
  "price": 15.99,
  "currency": "USD"
}

Response: 201 CREATED
{
  "id": 1,
  "providerName": "Netflix",
  "category": "STREAMING",
  "startDate": "2024-01-15",
  "renewalDate": "2024-02-15",
  "price": 15.99,
  "currency": "USD",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}

Error Responses:
- 400: Invalid request data
- 401: Unauthorized
- 500: Server error
```

#### 3. Update Subscription
```
PUT /api/subscriptions/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

Request:
{
  "providerName": "Netflix Premium",
  "price": 19.99
}

Response: 200 OK
{
  "id": 1,
  "providerName": "Netflix Premium",
  "category": "STREAMING",
  "startDate": "2024-01-15",
  "renewalDate": "2024-02-15",
  "price": 19.99,
  "currency": "USD",
  "status": "ACTIVE",
  "updatedAt": "2024-04-21T15:45:00Z"
}

Error Responses:
- 400: Invalid data
- 401: Unauthorized
- 404: Subscription not found
- 500: Server error
```

#### 4. Delete Subscription
```
DELETE /api/subscriptions/{id}
Authorization: Bearer {JWT_TOKEN}

Response: 204 NO CONTENT

Error Responses:
- 401: Unauthorized
- 404: Subscription not found
- 500: Server error
```

#### 5. Upload CSV
```
POST /api/subscriptions/upload-csv
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

Request:
(CSV file as multipart)

Response: 200 OK
{
  "fileUrl": "https://res.cloudinary.com/...",
  "message": "CSV uploaded successfully"
}

Error Responses:
- 400: Invalid file format
- 401: Unauthorized
- 413: File too large
- 500: Server error
```

### Billing APIs

#### 1. Get All Billing Records
```
GET /api/billing
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "id": 1,
    "subscriptionId": 1,
    "providerName": "Netflix",
    "amount": 15.99,
    "currency": "USD",
    "billingPeriod": "2024-04",
    "paidAt": "2024-04-15T00:00:00Z",
    "paymentMethod": "CREDIT_CARD",
    "source": "WEB",
    "createdAt": "2024-04-15T10:30:00Z"
  }
]

Error Responses:
- 401: Unauthorized
- 500: Server error
```

#### 2. Get Upcoming Payments
```
GET /api/billing/upcoming
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "id": 2,
    "subscriptionId": 1,
    "providerName": "Netflix",
    "amount": 15.99,
    "currency": "USD",
    "billingPeriod": "2024-05",
    "paidAt": "2024-05-15T00:00:00Z",
    "paymentMethod": "CREDIT_CARD",
    "source": "WEB"
  }
]

Error Responses:
- 401: Unauthorized
- 500: Server error
```

### Usage Tracking APIs

#### 1. Create Usage Entry
```
POST /api/usage
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

Request:
{
  "serviceName": "Netflix",
  "date": "2024-04-21",
  "minutesUsed": 120,
  "idempotencyKey": "unique-key-123"
}

Response: 201 CREATED
{
  "id": 1,
  "serviceName": "Netflix",
  "date": "2024-04-21",
  "minutesUsed": 120
}

Error Responses:
- 400: Invalid data
- 401: Unauthorized
- 409: Duplicate entry (idempotency key)
- 500: Server error
```

#### 2. Get Monthly Usage
```
GET /api/usage/monthly?year=2024&month=4
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "month": 4,
    "year": 2024,
    "totalMinutes": 3600
  }
]

Error Responses:
- 401: Unauthorized
- 500: Server error
```

#### 3. Get Supported Services
```
GET /api/usage/config
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "serviceName": "Netflix",
    "category": "STREAMING"
  },
  {
    "serviceName": "Spotify",
    "category": "MUSIC"
  }
]

Error Responses:
- 401: Unauthorized
- 500: Server error
```

### Recommendation APIs

#### 1. Get Recommendations
```
GET /api/recommendations
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
[
  {
    "id": 1,
    "subscriptionId": 1,
    "type": "DOWNGRADE",
    "reason": "Low usage detected",
    "confidenceScore": 0.85,
    "status": "PENDING"
  }
]

Error Responses:
- 401: Unauthorized
- 500: Server error
```

#### 2. Dismiss Recommendation
```
PATCH /api/recommendations/{id}/dismiss
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "id": 1,
  "subscriptionId": 1,
  "type": "DOWNGRADE",
  "status": "REJECTED"
}

Error Responses:
- 401: Unauthorized
- 404: Recommendation not found
- 500: Server error
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.jsx
├── AuthContext (Provider)
├── BrowserRouter
│   └── Routes
│       ├── Public Routes
│       │   ├── /login → Login.jsx
│       │   └── /register → Register.jsx
│       └── Protected Routes (ProtectedRoute wrapper)
│           ├── /dashboard → Dashboard.jsx
│           ├── /subscriptions → Subscriptions.jsx
│           ├── /billing → Billing.jsx
│           ├── /analytics → Analytics.jsx
│           ├── /calendar → Calendar.jsx
│           └── /upload → CsvUpload.jsx
```

### State Management

#### Global State (AuthContext)
```javascript
{
  user: {
    id: 1,
    username: "john_doe",
    email: "john@example.com"
  },
  token: "JWT_TOKEN_HERE",
  loading: false,
  error: null,
  isAuthenticated: true
}
```

#### Local State (Component Level)
- Form inputs (controlled components)
- Modal visibility states
- Pagination and filtering states
- Loading and error states

### API Integration

#### HTTP Interceptors
```javascript
// Request Interceptor
- Add Authorization header with JWT token
- Add Content-Type header

// Response Interceptor
- Handle 401 (Unauthorized) → redirect to login
- Handle 5xx errors → show error message
- Transform response data
```

#### API Service Structure
```javascript
export const authAPI = {
  register(data) { },
  login(data) { }
}

export const subscriptionAPI = {
  getAll() { },
  getById(id) { },
  create(data) { },
  update(id, data) { },
  delete(id) { },
  uploadCsv(file) { }
}

export const billingAPI = {
  getAll() { },
  getUpcoming() { }
}

export const usageAPI = {
  createEntry(data) { },
  getMonthly(year, month) { },
  getSupportedServices() { }
}

export const recommendationAPI = {
  getAll() { },
  dismiss(id) { }
}
```

---

## 🔐 Security Implementation

### Authentication Flow

```
User Input Credentials
    │
    ▼
Frontend: Send credentials to /api/auth/login
    │
    ▼
Backend: Validate credentials
    ├─ Check email exists
    ├─ Compare password with BCrypt hash
    └─ If valid, generate JWT token
    │
    ▼
Frontend: Store JWT in localStorage
    │
    ▼
All subsequent requests: Include JWT in Authorization header
    │
    ▼
Backend: JWT Filter
    ├─ Extract token from header
    ├─ Verify signature
    ├─ Check expiration
    ├─ Extract user claims
    └─ Set authentication context
    │
    ▼
Authorization: Check if user owns resource
```

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "iat": 1713667200,
  "exp": 1713753600
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Password Security

```
User Registration:
New Password → BCrypt Hashing (10 rounds) → Store Hash

User Login:
Input Password → BCrypt Compare with Hash → Match?
```

### CORS Configuration

```
Allowed Origins: http://localhost:5173, https://yourdomain.com
Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Allowed Headers: Authorization, Content-Type
Credentials: Include
```

### Data Encryption

1. **In Transit**: HTTPS/TLS (enforced in production)
2. **At Rest**: Database encryption (optional, for sensitive data)
3. **Sensitive Fields**: Passwords (hashed), API keys (environment variables)

---

## 🚀 Further Implementation & Enhancements

### Phase 1: Core Features (Current)
✅ User Authentication
✅ Subscription Management (CRUD)
✅ Billing Tracking
✅ Basic Usage Tracking
✅ Recommendations Engine
✅ Dashboard

### Phase 2: Advanced Features (3-6 months)

#### 2.1 Enhanced Analytics
```
Features to Implement:
- Spending trends over time (line chart)
- Category-wise spending breakdown (pie chart)
- Monthly vs yearly comparison
- Budget alerts when spending exceeds limit
- Spending forecast based on historical data
- ROI analysis (cost vs usage)
- Savings opportunities identification
```

**Implementation**:
```java
@Service
public class AnalyticsService {
    public SpendingTrendResponse getSpendingTrends(LocalDate from, LocalDate to) {
        // Aggregate billing by month
        // Calculate month-over-month changes
        // Generate trend analysis
    }
    
    public CategoryBreakdownResponse getCategoryBreakdown() {
        // Group subscriptions by category
        // Calculate total spend per category
        // Calculate percentage distribution
    }
    
    public SavingsOpportunityResponse identifySavingsOpportunities() {
        // Find unused subscriptions (low usage)
        // Find duplicate services
        // Recommend downgrades or cancellations
    }
}
```

#### 2.2 Advanced Recommendation Engine
```
Current: Rule-based recommendations
Future: ML-based recommendations

Machine Learning Approach:
- Input Features: Usage data, spending, renewal dates, user behavior
- Model: Classification/Clustering model
- Output: Personalized recommendations
- Framework: Python with TensorFlow/Scikit-learn
- Pipeline: Data → Feature Engineering → Model → Prediction

Alternative: Integrate third-party ML API (Google Cloud, AWS)
```

**Implementation Architecture**:
```
┌─────────────────────────────────────────┐
│  Spring Boot Backend                    │
│  ┌─────────────────────────────────────┐│
│  │ AnalyticsService                    ││
│  │  - Collect usage data               ││
│  │  - Extract features                 ││
│  │  - Call ML Service API              ││
│  └─────────────────────────────────────┘│
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  ML Service (Python)   │
    │  ┌──────────────────┐  │
    │  │ ML Model         │  │
    │  │ (Recommendation) │  │
    │  └──────────────────┘  │
    │  ┌──────────────────┐  │
    │  │ Data Processing  │  │
    │  └──────────────────┘  │
    └────────────────────────┘
```

#### 2.3 Notification System
```
Email Notifications:
- Payment due reminders (7 days, 3 days, 1 day before)
- Subscription expiry alerts
- New recommendations available
- Monthly spending summary

Push Notifications:
- In-app notifications
- Browser push notifications
- Mobile app push (if mobile app added)

SMS Notifications (Optional):
- Critical alerts (due date tomorrow)
- Payment confirmation
```

**Implementation**:
```java
@Service
public class NotificationService {
    private final EmailService emailService;
    private final PushNotificationService pushService;
    private final UserRepository userRepository;
    
    @Scheduled(cron = "0 0 9 * * ?") // Daily at 9 AM
    public void sendPaymentReminders() {
        List<BillingRecord> dueSoon = billingRepository.findDueSoon(3); // 3 days
        for (BillingRecord record : dueSoon) {
            User user = record.getSubscription().getUser();
            emailService.sendPaymentReminder(user.getEmail(), record);
            pushService.sendPushNotification(user.getId(), "Payment due in 3 days");
        }
    }
    
    @Scheduled(cron = "0 0 0 1 * ?") // Monthly at midnight on 1st
    public void sendMonthlySummary() {
        // Aggregate monthly spending
        // Send email with summary
    }
}

@Component
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendPaymentReminder(String email, BillingRecord record) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Payment Reminder: " + record.getSubscription().getProviderName());
        message.setText("Your payment of " + record.getAmount() + " is due in 3 days");
        mailSender.send(message);
    }
}

@Component
public class PushNotificationService {
    // Firebase Cloud Messaging or similar
}
```

#### 2.4 Multi-User/Family Plans
```
Features:
- Shared subscriptions
- Cost splitting
- Multiple user access levels (admin, viewer)
- Shared payment tracking
- Family dashboard

Database Changes:
- Subscription Groups table
- Subscription Group Members table
- Access Control List (ACL) table

Implementation:
@Entity
public class SubscriptionGroup {
    @Id
    private Long id;
    private String groupName;
    private Long adminUserId; // Owner
    
    @OneToMany
    private List<GroupMember> members;
    
    @OneToMany
    private List<SharedSubscription> sharedSubscriptions;
}

@Entity
public class GroupMember {
    @Id
    private Long id;
    private Long groupId;
    private Long userId;
    private GroupMemberRole role; // ADMIN, MEMBER, VIEWER
    private BigDecimal costShare; // Their share percentage
}
```

#### 2.5 Third-Party Integrations
```
Payment Gateway Integration:
- Stripe / PayPal integration
- Direct payment processing
- Payment method management
- Invoice generation

Calendar Integration:
- Google Calendar sync
- Outlook sync
- Automatic event creation for renewal dates

Banking Integration:
- Open Banking API (Plaid, Finicity)
- Automatic subscription detection
- Real-time transaction tracking

CRM Integration:
- Salesforce
- HubSpot
- Automatic data sync
```

### Phase 3: Mobile & Advanced (6-12 months)

#### 3.1 Mobile App
```
Technologies:
- React Native or Flutter
- Same backend API
- Offline capability
- Push notifications
- Widget support

Features:
- Quick add/edit subscriptions
- Mobile payment tracking
- Usage notifications
- Quick recommendations view
```

#### 3.2 API Enhancements
```
REST API → GraphQL:
- More efficient data fetching
- Reduce overfetching
- Better for mobile clients

Webhook Support:
- Real-time event notifications
- External system integration
- Event types: subscription_created, payment_due, recommendation_generated
```

**Example Webhook Implementation**:
```java
@Service
public class WebhookService {
    private final WebhookRepository webhookRepository;
    private final RestTemplate restTemplate;
    
    public void triggerWebhook(WebhookEvent event) {
        List<Webhook> subscriptions = webhookRepository.findByEventType(event.getType());
        for (Webhook webhook : subscriptions) {
            try {
                restTemplate.postForEntity(webhook.getUrl(), event, String.class);
            } catch (Exception e) {
                // Retry logic with exponential backoff
                retryWebhook(webhook, event);
            }
        }
    }
}
```

#### 3.3 Admin Dashboard
```
Admin Features:
- User management
- System statistics
- Performance monitoring
- Revenue analytics
- Support tickets
- User behavior analysis

Technologies:
- React Admin framework
- Real-time charts
- Export functionality
```

---

## 📦 Deployment & DevOps

### Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM maven:3.8.1-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/subscription-backend-*.jar app.jar
EXPOSE 8082
CMD ["java", "-jar", "app.jar"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: subscription_db
      MYSQL_USER: subscription_user
      MYSQL_PASSWORD: user_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    ports:
      - "8082:8082"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/subscription_db
      SPRING_DATASOURCE_USERNAME: subscription_user
      SPRING_DATASOURCE_PASSWORD: user_password
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8082/health"]
      timeout: 10s
      retries: 5

  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Kubernetes Deployment

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: subscription-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: subscription-backend
  template:
    metadata:
      labels:
        app: subscription-backend
    spec:
      containers:
      - name: backend
        image: subscription-backend:latest
        ports:
        - containerPort: 8082
        env:
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8082
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8082
          initialDelaySeconds: 20
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: subscription-backend-service
spec:
  selector:
    app: subscription-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8082
  type: LoadBalancer
```

### CI/CD Pipeline (Jenkins)

```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/yourorg/subscription-analytics.git'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('Backend') {
                    sh './mvnw clean package'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('Frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Test') {
            steps {
                dir('Backend') {
                    sh './mvnw test'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t subscription-backend:${BUILD_NUMBER} ./Backend'
                sh 'docker build -t subscription-frontend:${BUILD_NUMBER} ./Frontend'
            }
        }
        
        stage('Push to Registry') {
            steps {
                sh 'docker push subscription-backend:${BUILD_NUMBER}'
                sh 'docker push subscription-frontend:${BUILD_NUMBER}'
            }
        }
        
        stage('Deploy to K8s') {
            steps {
                sh 'kubectl set image deployment/subscription-backend subscription-backend=subscription-backend:${BUILD_NUMBER}'
                sh 'kubectl set image deployment/subscription-frontend subscription-frontend=subscription-frontend:${BUILD_NUMBER}'
            }
        }
    }
}
```

---

## 📊 Performance Considerations

### Backend Performance

#### Database Query Optimization
```java
// Problem: N+1 query
List<Subscription> subs = subscriptionRepository.findAll();
for (Subscription sub : subs) {
    User user = sub.getUser(); // N additional queries
}

// Solution: Eager loading or Join fetch
@Query("SELECT s FROM Subscription s JOIN FETCH s.user")
List<Subscription> findAllWithUser();

// Solution: LAZY loading with @Transactional(readOnly = true)
@Transactional(readOnly = true)
public List<SubscriptionResponse> getAll() {
    return subscriptionRepository.findAllByUserId(userId)
        .stream()
        .map(this::toResponse)
        .toList();
}
```

#### Caching Strategy
```java
@Service
public class SubscriptionService {
    @Cacheable(value = "subscriptions", key = "#userId")
    public List<SubscriptionResponse> getAll(Long userId) {
        // Results cached, subsequent calls return from cache
    }
    
    @CacheEvict(value = "subscriptions", key = "#userId")
    public SubscriptionResponse create(Long userId, SubscriptionRequest request) {
        // Cache invalidated after creation
    }
}

// Configuration
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("subscriptions", "recommendations");
    }
}
```

#### Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000
```

#### Pagination for Large Results
```java
@GetMapping
public Page<SubscriptionResponse> getAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
    return subscriptionRepository.findAllByUserId(userId, pageable)
        .map(this::toResponse);
}
```

### Frontend Performance

#### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/subscriptions" element={<Subscriptions />} />
  </Routes>
</Suspense>
```

#### Memoization
```javascript
import { useMemo, useCallback } from 'react';

function Dashboard() {
    const [subscriptions, setSubscriptions] = useState([]);
    
    // Memoized computation
    const totalSpending = useMemo(() => {
        return subscriptions.reduce((sum, s) => sum + s.price, 0);
    }, [subscriptions]);
    
    // Memoized callback
    const handleAdd = useCallback((sub) => {
        setSubscriptions([...subscriptions, sub]);
    }, []);
}
```

#### API Request Optimization
```javascript
// Parallel requests
const [subs, billing, recommendations] = await Promise.all([
    subscriptionAPI.getAll(),
    billingAPI.getAll(),
    recommendationAPI.getAll()
]);

// Batch requests (if backend supports)
export const batchAPI = {
    fetch(requests) {
        return axios.post('/api/batch', { requests });
    }
};
```

---

## 🧪 Testing Strategy

### Unit Testing (Backend)

```java
@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {
    
    @Mock
    private SubscriptionRepository subscriptionRepository;
    
    @Mock
    private CurrentUserService currentUserService;
    
    @InjectMocks
    private SubscriptionService subscriptionService;
    
    @Test
    void testCreateSubscription() {
        // Arrange
        User user = new User(1L, "john", "john@example.com", "hash");
        SubscriptionRequest request = new SubscriptionRequest(
            "Netflix", Category.STREAMING, LocalDate.now(),
            Renewal_Cycle.MONTHLY, BigDecimal.valueOf(15.99), "USD"
        );
        
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(subscriptionRepository.save(any(Subscription.class)))
            .thenReturn(new Subscription(user, "Netflix", ...));
        
        // Act
        SubscriptionResponse response = subscriptionService.create(request);
        
        // Assert
        assertNotNull(response);
        assertEquals("Netflix", response.providerName());
        verify(subscriptionRepository).save(any(Subscription.class));
    }
    
    @Test
    void testGetAllSubscriptions() {
        // Test getting all subscriptions for a user
        List<Subscription> subscriptions = List.of(/* ... */);
        when(subscriptionRepository.findAllByUserId(1L))
            .thenReturn(subscriptions);
        
        List<SubscriptionResponse> responses = subscriptionService.getAll();
        
        assertEquals(subscriptions.size(), responses.size());
    }
}
```

### Integration Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
class SubscriptionControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private UserRepository userRepository;
    
    private String jwtToken;
    
    @BeforeEach
    void setUp() throws Exception {
        // Create test user and generate token
        User user = new User("test", "test@example.com", "hashed");
        userRepository.save(user);
        jwtToken = generateTestToken(user.getId());
    }
    
    @Test
    void testCreateSubscription() throws Exception {
        mockMvc.perform(post("/api/subscriptions")
            .header("Authorization", "Bearer " + jwtToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "providerName": "Netflix",
                  "category": "STREAMING",
                  "startDate": "2024-01-15",
                  "renewalCycle": "MONTHLY",
                  "price": 15.99,
                  "currency": "USD"
                }
            """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.providerName").value("Netflix"));
    }
}
```

### Frontend Testing

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

describe('Dashboard Component', () => {
    test('renders dashboard with subscriptions', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );
        
        // Wait for data to load
        const heading = await screen.findByText(/Dashboard/i);
        expect(heading).toBeInTheDocument();
    });
    
    test('displays total spending', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );
        
        const totalSpending = await screen.findByText(/Total Monthly Spend/i);
        expect(totalSpending).toBeInTheDocument();
    });
});
```

---

## 🗺️ Future Roadmap

### Q2 2026
- [ ] Enhanced Analytics Dashboard
- [ ] Email Notification System
- [ ] Payment Gateway Integration

### Q3 2026
- [ ] Mobile App (React Native)
- [ ] Advanced ML Recommendations
- [ ] Multi-user/Family Plans
- [ ] Admin Dashboard

### Q4 2026
- [ ] GraphQL API Layer
- [ ] Advanced Reporting & Export
- [ ] Budget Alerts & Limits
- [ ] Integration with Banking APIs

### Q1 2027
- [ ] AI Chat Assistant
- [ ] Voice Interface
- [ ] Blockchain-based Subscription Verification
- [ ] Marketplace for Subscription Sharing

---

## 📚 Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.x |
| Frontend Build | Vite | 7.x |
| Backend | Spring Boot | 4.x |
| ORM | Hibernate/JPA | 7.x |
| Database | MySQL | 8.0 |
| Authentication | JWT | HS256 |
| Cloud Storage | Cloudinary | Latest |
| Containerization | Docker | Latest |
| Orchestration | Kubernetes | 1.27+ |
| CI/CD | Jenkins | Latest |
| Testing | JUnit 5, Mockito | Latest |

---

## 📞 Support & Documentation

- Technical Documentation: `/docs` folder
- API Documentation: Swagger UI at `/swagger-ui.html`
- Architecture Diagrams: UML diagrams in `/architecture` folder
- Development Guide: `DEVELOPMENT.md`
- Deployment Guide: `DEPLOYMENT.md`

---

**Document Version**: 1.0  
**Last Updated**: April 21, 2026  
**Maintained By**: Development Team
