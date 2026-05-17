<<<<<<< HEAD
# 📱📊 Subscription Insight System

A **full-stack subscription analytics platform** that combines an **Android app usage collector** with a **Spring Boot backend** to provide:

* 📈 App usage analytics
* 💳 Subscription billing insights
* 🤖 Smart recommendations (KEEP / CONSIDER / CANCEL)
* 📊 Dashboard visualizations

This project helps users understand whether their premium subscriptions (Spotify, Netflix, YouTube Premium, etc.) are actually worth paying for.

---

# 🚀 Project Architecture

```text
Android App
   ↓
UsageStatsManager + AppsUsageMonitorAPI
   ↓
Retrofit API Calls
   ↓
Spring Boot Backend
   ↓
MySQL (Docker Container)
   ↓
Analytics + Recommendations
   ↓
Android Dashboard UI
```

---

# 🧠 Core Idea

The system collects **real mobile app usage data** from Android devices and maps it to user subscriptions.

Using this data, the backend:

1. Tracks monthly app usage
2. Compares usage against subscription cost
3. Generates monthly billing records
4. Produces recommendations
5. Sends analytics to the dashboard

---

# 🛠️ Tech Stack

## 📱 Android Frontend

* **Java**
* **XML layouts**
* **Retrofit** for API calls
* **AppsUsageMonitorAPI** for usage collection
* Android `UsageStatsManager`
* MPAndroidChart (planned dashboard charts)

### Android usage library

Used reference implementation:

```text
https://github.com/TheBotBox/AppsUsageMonitorAPI/tree/master/appusagemonitor/src
```

---

## 🌐 Backend

* **Java 17**
* **Spring Boot**
* Spring Web
* Spring Data JPA
* Spring Security
* JWT Authentication
* Flyway migrations

---

## 🗄️ Database

* **MySQL**
* Docker containerized setup
* Database name: `subscription_db`

---

# 🐳 Database Setup (Docker)

## Start MySQL container

```bash
docker run --name subscription-mysql \
-e MYSQL_ROOT_PASSWORD=root \
-e MYSQL_DATABASE=subscription_db \
-p 3306:3306 \
-d mysql:8
```

## Verify container

```bash
docker ps
```

## Open MySQL shell

```bash
docker exec -it subscription-mysql mysql -u root -p
```

---

# 🗂️ Database Schema

## 👤 users

Stores authenticated users.

Fields:

* id
* username
* email
* passwordhash
* status
* created_at
* last_login_at

---

## 📦 subscriptions

Stores user subscriptions.

Fields:

* id
* user_id
* provider_name
* package_name
* category
* renewal_cycle
* price
* currency
* status

---

## 📊 user_snapshots

Monthly app usage snapshots.

Fields:

* id
* subscription_id
* period
* usage_count
* last_used_at
* source

---

## 💳 billing_records

Stores generated billing data.

Fields:

* id
* subscription_id
* amount
* billing_period
* payment_method
* source

---

## 🤖 recommendations

AI-style recommendation engine output.

Fields:

* id
* user_id
* subscription_id
* type
* reason
* confidence_score

---

# 🔄 System Workflow

```text
User Login
   ↓
Grant Usage Permission
   ↓
Android fetches app usage
   ↓
Send JSON to Spring Boot
   ↓
Match app package → subscription
   ↓
Update user_snapshots
   ↓
Generate billing_records
   ↓
Generate recommendations
   ↓
Dashboard API response
   ↓
Android analytics graphs
```

---

# 📦 Backend Modules

## 🔐 1. Auth Module

Handles:

* Signup
* Login
* JWT token generation
* BCrypt password hashing

Endpoints:

```text
POST /auth/signup
POST /auth/login
```

---

## 📦 2. Subscription Module

Handles:

* Add subscription
* Fetch user subscriptions
* Package name mapping

Endpoints:

```text
GET /api/subscriptions/{userId}
POST /api/subscriptions/{userId}
```

---

## 📊 3. Usage Module

Processes Android usage sync.

Endpoint:

```text
POST /api/usage
```

Responsibilities:

* Receive app usage data
* Match package names
* Update `user_snapshots`

---

## 💳 4. Billing Module

Generates billing data from subscriptions.

Logic:

```text
subscription.price → billing_records
```

---

## 🤖 5. Recommendation Module

Recommendation rules:

```text
usage < 30      → CANCEL
30 <= usage <100 → CONSIDER
usage >=100      → KEEP
```

---

## 📊 6. Dashboard Module

Combines:

* usage analytics
* billing insights
* recommendations

Endpoint:

```text
GET /api/dashboard/{userId}
```

---

# 📱 Android App Flow

## Screen 1 — Login

* User authentication
* JWT token received

## Screen 2 — Home

* Allow Usage Permission
* Sync Usage button
* Dashboard button

## Screen 3 — Dashboard

* App usage charts
* Cost analytics
* KEEP / CANCEL recommendations

---

# 🔌 Android → Backend Payload

```json
{
  "userId": 1,
  "apps": [
    {
      "packageName": "com.spotify.music",
      "appName": "Spotify",
      "usageMinutes": 120
    }
  ]
}
```

---

# 🧱 Project Folder Structure

```text
subscription-backend/
│── src/main/java/com/yourorg
│   ├── Auth
│   ├── Users
│   ├── Subscriptions
│   ├── UserSnapshot
│   ├── Billing
│   ├── Recommendation
│   └── Dashboard
│
│── src/main/resources
│   ├── application.yml
│   └── db/migration
│       ├── V1__init_schema.sql
│       ├── V2__add_package_name.sql
│       └── V3__seed_data.sql
=======
# Subscription Analytics Platform

A comprehensive subscription management and analytics platform that helps users track, manage, and optimize their subscriptions with detailed billing records, usage tracking, and intelligent recommendations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Design Patterns](#design-patterns)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Subscription Analytics** is a full-stack web application designed to help users manage multiple subscriptions efficiently. It provides:

- **Subscription Management**: Create, update, and track all your subscriptions in one place
- **Billing & Payment Tracking**: Monitor upcoming payments and payment history
- **Usage Analytics**: Track service usage patterns and get insights
- **Smart Recommendations**: AI-powered suggestions to optimize your subscriptions
- **CSV Import**: Bulk upload subscriptions via CSV files
- **Browser Extension**: Real-time usage tracking via browser extension

The platform consists of a **Spring Boot REST API backend**, a **React frontend**, and a **Chrome browser extension** for seamless tracking.

---

## ✨ Features

### Core Features

- ✅ **User Authentication**
  - Secure registration and login
  - JWT-based token authentication
  - Password encryption (BCrypt)
  - Persistent sessions with token refresh

- ✅ **Subscription Management**
  - Create, read, update, delete subscriptions
  - Track subscription categories (Streaming, Music, Cloud, Productivity, Gaming, Fitness, News)
  - Monitor renewal dates and billing cycles
  - Subscription status tracking (Active, Paused, Inactive, Expired)

- ✅ **Billing & Payments**
  - Automatic billing record creation
  - Payment tracking by multiple methods (Credit Card, Debit Card, PayPal, Bank Transfer)
  - Upcoming payment alerts (30-day forecast)
  - Billing history and payment records

- ✅ **Usage Tracking**
  - Real-time service usage monitoring via browser extension
  - Monthly usage aggregation and trends
  - Supported services configuration
  - Idempotency for duplicate prevention

- ✅ **Recommendations Engine**
  - Intelligent subscription suggestions based on usage patterns
  - Recommendation types: Upgrade, Downgrade, Cancel
  - Confidence scoring for recommendations
  - User acceptance/rejection tracking

- ✅ **Analytics & Dashboard**
  - Real-time subscription summary
  - Monthly spending overview
  - Usage metrics and trends
  - Upcoming payments widget
  - Recommendation alerts

- ✅ **Data Import/Export**
  - CSV file upload for bulk subscription import
  - File storage via Cloudinary
  - CSV parsing and validation

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (React + Vite)                 │
│    - React Components & Functional Hooks        │
│    - Context API for State Management           │
│    - Route-based Navigation                     │
│    - Axios HTTP Client                          │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│    REST API Layer (Spring Boot Controllers)     │
│    - REST endpoints with validation             │
│    - Request/Response DTOs                      │
│    - HTTP status code handling                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Business Logic Layer (Services)               │
│    - SubscriptionService                        │
│    - BillingService                             │
│    - UsageTrackingService                       │
│    - RecommendationService                      │
│    - AuthService                                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Data Access Layer (Repositories)              │
│    - Spring Data JPA                            │
│    - Custom Query Methods                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│   Database Layer (MySQL)                        │
│    - Flyway Migrations                          │
│    - Users, Subscriptions, BillingRecords       │
│    - UsageTracking, Recommendations             │
└─────────────────────────────────────────────────┘
```

### Design Patterns Used

| Pattern | Implementation | Benefit |
|---------|----------------|---------|
| **MVC** | Controllers → Services → Repositories | Clear separation of concerns |
| **Repository** | Spring Data JPA interfaces | Data access abstraction |
| **Dependency Injection** | Constructor-based injection | Loose coupling & testability |
| **DTO** | Request/Response objects | API contract definition |
| **Singleton** | Spring beans default scope | Single instance per app |
| **Builder** | Lombok @AllArgsConstructor | Flexible object creation |
| **Factory** | CloudinaryStorageService | Encapsulated object creation |
| **Strategy** | Storage service abstraction | Swappable implementations |
| **JWT Token** | Stateless authentication | Scalable and secure |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **ORM**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.0
- **Authentication**: Spring Security + JWT
- **File Storage**: Cloudinary
- **Build Tool**: Maven
- **Language**: Java 17+

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: Context API + React Hooks
- **Routing**: React Router v6
- **Styling**: CSS3
- **Node Version**: 18+

### Browser Extension
- **Type**: Chrome Extension (Manifest v3)
- **Communication**: Background Script + Content Script
- **Storage**: Chrome Storage API

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins
- **Database Migrations**: Flyway
- **Version Control**: Git

---

## 📁 Project Structure

```
Subscription-Analytics/
├── Backend/                              # Spring Boot API
│   ├── src/main/java/com/yourorg/
│   │   ├── Auth/                         # Authentication module
│   │   │   ├── AuthController.java
│   │   │   ├── AuthService.java
│   │   │   ├── JwtTokenService.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── AuthUserPrincipal.java
│   │   │   └── dto/
│   │   ├── Subscriptions/                # Subscription module
│   │   │   ├── SubscriptionController.java
│   │   │   ├── SubscriptionService.java
│   │   │   ├── SubscriptionRepository.java
│   │   │   ├── Subscription.java
│   │   │   ├── Category.java
│   │   │   ├── SubscriptionStatus.java
│   │   │   └── dto/
│   │   ├── BillingRecord/                # Billing module
│   │   │   ├── BillingController.java
│   │   │   ├── BillingService.java
│   │   │   ├── BillingRecordRepository.java
│   │   │   ├── BillingRecord.java
│   │   │   └── dto/
│   │   ├── UsageTracking/                # Usage tracking module
│   │   │   ├── UsageTrackingController.java
│   │   │   ├── UsageTrackingService.java
│   │   │   ├── UsageTrackingRepository.java
│   │   │   ├── UsageTracking.java
│   │   │   └── dto/
│   │   ├── Recommendation/               # Recommendation module
│   │   │   ├── RecommendationController.java
│   │   │   ├── RecommendationService.java
│   │   │   ├── RecommendationRepository.java
│   │   │   ├── Recommendation.java
│   │   │   └── dto/
│   │   ├── Users/                        # User module
│   │   │   ├── User.java
│   │   │   ├── UserRepository.java
│   │   │   ├── UserStatus.java
│   │   │   └── CurrentUserService.java
│   │   ├── Storage/                      # File storage module
│   │   │   └── CloudinaryStorageService.java
│   │   └── Config/                       # Configuration
│   │       ├── SecurityConfig.java
│   │       ├── JwtProperties.java
│   │       └── CloudinaryProperties.java
│   ├── src/main/resources/
│   │   ├── application.yml               # Application configuration
│   │   ├── application-test.yml
│   │   └── db/migration/                 # Flyway migrations
│   │       ├── v1__init_schema.sql
│   │       ├── v2__usage_tracking.sql
│   │       └── v3__service_catalog_plan_tiers_usage_idempotency.sql
│   ├── pom.xml                           # Maven dependencies
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Jenkinsfile
│   └── README.md
│
├── Frontend/                             # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── CsvUpload.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json                      # npm dependencies
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   └── README.md
│
├── browser-extension/                    # Chrome Extension
│   └── usage-tracker/
│       ├── manifest.json                 # Extension manifest
│       ├── background.js                 # Background worker
│       ├── popup.html
│       ├── popup.js
│       └── README.md
│
└── README.md                             # This file
>>>>>>> 75be6cf (Subscription-analytics)
```

---

<<<<<<< HEAD
# ▶️ Run Backend

```bash
mvn clean
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# 🔐 Security

* JWT-based authentication
* Spring Security filters
* BCrypt password hashing
* Protected APIs

---

# 🎯 Key Engineering Highlights

* ✅ Modular Monolith Architecture
* ✅ Android + Spring Boot integration
* ✅ Dockerized SQL database
* ✅ Flyway migration versioning
* ✅ Usage-based subscription intelligence
* ✅ Real-world mobile analytics use case

---

# 🚀 Future Enhancements

* Scheduled monthly billing generation
* Push notifications for renewals
* ML-based smarter recommendations
* Web admin dashboard
* Export analytics reports
* Multi-device sync

---

# 👨‍💻 Author

**Anvith Shetty**
Student, PES University
Full Stack Developer | Spring Boot | Android | System Design

---

# ⭐ Project Value

This project demonstrates:

* Backend architecture design
* Android device integration
* API engineering
* database version control
* analytics system design
* real-world subscription intelligence workflows

A strong **resume + interview-ready full-stack systems project**.
=======
## 🚀 Installation & Setup

### Prerequisites

- **Backend**: Java 17+, Maven 3.8+, MySQL 8.0+
- **Frontend**: Node.js 18+, npm 9+
- **Browser Extension**: Chrome/Chromium-based browser
- **Cloud**: Cloudinary account for file storage

### Backend Setup

#### 1. Clone the Repository
```bash
cd Subscription-Analytics/Backend
```

#### 2. Configure MySQL
```bash
# Ensure MySQL is running and create database
mysql -u root -p
CREATE DATABASE subscription_db;
CREATE USER 'subscription_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON subscription_db.* TO 'subscription_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Update Application Configuration
Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/subscription_db
    username: subscription_user
    password: password123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: your-secret-key-here-min-32-characters
  expiration-ms: 86400000  # 24 hours

cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}

server:
  port: 8080
  servlet:
    context-path: /
```

#### 4. Build & Run
```bash
# Build the project
mvn clean package

# Run the application
mvn spring-boot:run

# Or run the JAR
java -jar target/subscription-backend-1.0.0.jar
```

Backend will be available at: `http://localhost:8080`

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd Subscription-Analytics/Frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

#### 4. Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Browser Extension Setup

#### 1. Navigate to Extension Directory
```bash
cd Subscription-Analytics/browser-extension/usage-tracker
```

#### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `usage-tracker` folder
5. Extension is now loaded and ready to use

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env or environment variables)**:
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/subscription_db
SPRING_DATASOURCE_USERNAME=subscription_user
SPRING_DATASOURCE_PASSWORD=password123
JWT_SECRET=your-secret-key-here-min-32-characters
JWT_EXPIRATION_MS=86400000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Database Migrations

Flyway automatically runs migrations from `src/main/resources/db/migration/`:

- **v1__init_schema.sql** - Initial schema with users, subscriptions, billing
- **v2__usage_tracking.sql** - Usage tracking tables
- **v3__service_catalog_plan_tiers_usage_idempotency.sql** - Enhancements and indexes

---

## 📡 API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login and get JWT token
```

### Subscription Endpoints

```
GET    /api/subscriptions       - Get all user subscriptions
GET    /api/subscriptions/{id}  - Get subscription by ID
POST   /api/subscriptions       - Create new subscription
PUT    /api/subscriptions/{id}  - Update subscription
DELETE /api/subscriptions/{id}  - Delete subscription
POST   /api/subscriptions/upload-csv - Upload subscriptions via CSV
```

### Billing Endpoints

```
GET    /api/billing             - Get all billing records
GET    /api/billing/upcoming    - Get upcoming payments (30 days)
```

### Usage Tracking Endpoints

```
POST   /api/usage               - Create usage entry
GET    /api/usage/monthly       - Get monthly usage summary
GET    /api/usage/config        - Get supported services
```

### Recommendation Endpoints

```
GET    /api/recommendations     - Get all recommendations
PATCH  /api/recommendations/{id}/dismiss - Dismiss recommendation
```

---

## 🗄️ Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordhash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  INDEX idx_users_email (email)
);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  category ENUM('STREAMING', 'MUSIC', 'CLOUD', 'PRODUCTIVITY', 'GAMING', 'FITNESS', 'NEWS', 'OTHER'),
  start_date DATE NOT NULL,
  renewal_cycle ENUM('MONTHLY', 'QUARTERLY', 'YEARLY'),
  renewal_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('ACTIVE', 'PAUSED', 'INACTIVE', 'EXPIRED'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_subscriptions_user_id (user_id)
);
```

#### billing_records
```sql
CREATE TABLE billing_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subscription_id BIGINT NOT NULL,
  amount DOUBLE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  billing_period VARCHAR(7) NOT NULL,
  paid_at TIMESTAMP NOT NULL,
  payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER'),
  source ENUM('WEB', 'MOBILE', 'EXTENSION'),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_billing_sub_user (subscription_id)
);
```

#### usage_tracking
```sql
CREATE TABLE usage_tracking (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  minutes_used INT NOT NULL,
  idempotency_key VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (idempotency_key),
  INDEX idx_usage_user_date (user_id, date)
);
```

#### recommendations
```sql
CREATE TABLE recommendations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  subscription_id BIGINT NOT NULL,
  type ENUM('DOWNGRADE', 'UPGRADE', 'CANCEL'),
  reason VARCHAR(100),
  confidence_score DOUBLE,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_recommendations_user (user_id)
);
```

---

## 🎨 Design Diagrams

### Use Case Diagram
Available in project documentation with 19 use cases covering:
- Authentication & Profile Management
- Subscription Management (CRUD + CSV Upload)
- Billing & Payment Tracking
- Usage Tracking & Analytics
- Recommendations
- Dashboard & Reports

### Class Diagram
Shows all entities, controllers, services, repositories, DTOs, and their relationships.

### Activity Diagrams (4 types)
1. **User Authentication Flow** - Login to dashboard
2. **Subscription Management** - CRUD operations
3. **Billing & Payment Tracking** - Payment lifecycle
4. **Usage Tracking & Analytics** - Data collection and analysis

### State Diagrams (4 types)
1. **Subscription States** - ACTIVE → PAUSED → INACTIVE → EXPIRED
2. **Billing States** - PENDING → PAID/OVERDUE → CANCELLED
3. **Recommendation States** - PENDING → VIEWED → ACCEPTED/REJECTED → ACTIONED
4. **User Session States** - NOT_AUTHENTICATED → ACTIVE_SESSION → TOKEN_EXPIRED

---

## 💻 Development

### Running Tests

**Backend**:
```bash
cd Backend
mvn test
```

**Frontend**:
```bash
cd Frontend
npm test
```

### Code Style

- **Backend**: Follow Google Java Style Guide
- **Frontend**: ESLint with Prettier configuration

### Local Development with Docker

```bash
cd Backend
docker-compose up -d
```

This starts:
- MySQL database on port 3306
- Spring Boot API on port 8080

---

## 📦 Deployment

### Docker Deployment

#### Build Backend Docker Image
```bash
cd Backend
docker build -t subscription-backend:latest .
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Update JWT secret to a strong random value
- [ ] Configure Cloudinary with production credentials
- [ ] Set up database backups
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure environment-specific properties
- [ ] Run database migrations
- [ ] Test CI/CD pipeline

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Guidelines

- Write clean, readable code with meaningful variable names
- Add comments for complex logic
- Keep functions small and single-responsibility
- Write tests for new features
- Update documentation accordingly

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or feature requests, please create an issue in the repository.

---

## 🙋 Authors

- Development Team
- Software Architecture Design
- Full-Stack Implementation

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [JWT Introduction](https://jwt.io/introduction)
- [Cloudinary API Docs](https://cloudinary.com/documentation/image_upload_api)

---

**Version**: 1.0.0  
**Last Updated**: April 2026

>>>>>>> 75be6cf (Subscription-analytics)
