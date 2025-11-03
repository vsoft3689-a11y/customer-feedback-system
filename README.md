# 📁 Customer Feedback System - README

## 🎯 Project Overview
A **full-featured Customer Feedback System** built with Spring Boot that provides comprehensive features for product management, customer authentication, order handling, and feedback/review management.

---

## 🛠️ Technology Stack

### 🔧 Core Technologies
- **Backend**: Spring Boot (Java)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Database**: MySQL 8+
- **Authentication**: JWT (JSON Web Token)
- **Security**: Spring Security with BCrypt password encryption

### 📋 Version Requirements
- **Java**: JDK 17+
- **MySQL**: 8.0+
- **Spring Boot**: 3.x
- **Build Tool**: Maven

---

## 👥 User Roles & Features

| Role | Description | Key Features |
|------|-------------|--------------|
| **Customer** | End user who purchases products | Register, login, view products, manage cart, place orders, submit feedback |
| **Admin** | System administrator | Manage products, view all feedback, respond to reviews, user management |

---

## 🚀 Execution Process

### 📥 Prerequisites Setup

#### 1. **Install Required Software**
- **Java JDK 17+** - Download from Oracle website
- **MySQL 8+** - Download MySQL Installer
- **Maven** - Download from Apache Maven website

#### 2. **Database Setup**
```sql
-- Create database
CREATE DATABASE feedback_system;

-- Create user
CREATE USER 'feedback_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON feedback_system.* TO 'feedback_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. **Application Configuration**
Create `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/feedback_system
spring.datasource.username=feedback_user
spring.datasource.password=password123

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

---

## 🏃‍♂️ Step-by-Step Execution

### 🔧 Step 1: Project Structure
Create standard Spring Boot project structure:
```
customer-feedback-system/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/feedback/
│       │       ├── controller/
│       │       ├── service/
│       │       ├── repository/
│       │       ├── entity/
│       │       └── config/
│       └── resources/
│           ├── static/ (HTML, CSS, JS files)
│           ├── templates/
│           └── application.properties
└── pom.xml
```

### 📦 Step 2: Maven Dependencies
**pom.xml**:
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
</dependencies>
```

### 🗃️ Step 3: Database Setup
```bash
# Start MySQL service
# Windows: Services → Start MySQL
# Linux: sudo systemctl start mysql

# Verify database connection
mysql -u feedback_user -p feedback_system
```

### 🏗️ Step 4: Build Application
```bash
# Clean and compile project
mvn clean compile

# Package application
mvn clean package
```

### ▶️ Step 5: Run Application
```bash
# Method 1: Using Spring Boot Maven plugin
mvn spring-boot:run

# Method 2: Run packaged JAR
java -jar target/customer-feedback-system-1.0.0.jar

# Method 3: Run from IDE
# Right-click main class → Run As → Spring Boot App
```

### ✅ Step 6: Verify Startup
**Check console for successful startup message:**
```
Tomcat started on port(s): 8080
Started FeedbackSystemApplication in X.XXX seconds
```

### 🌐 Step 7: Access Application
Open web browser and navigate to:
```
http://localhost:8080
```

---

## 📋 Core Features Implementation

### 🔐 Authentication System
- User registration with email and password
- JWT-based login system
- Role-based access control (Admin/Customer)

### 📦 Product Management
- Admin can add/edit/delete products
- Customers can browse products
- Product details: name, description, price, image

### 🛒 Shopping Cart
- Add products to cart
- Update cart quantities
- Remove items from cart
- Checkout functionality

### 💬 Feedback System
- Submit product ratings (1-5 stars)
- Add comments and reviews
- Edit or delete own feedback
- Admin can respond to feedback

---

## 🗃️ Database Tables

### 👤 Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('CUSTOMER', 'ADMIN')
);
```

### 📦 Products Table
```sql
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200),
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    created_at TIMESTAMP
);
```

### 💬 Feedback Table
```sql
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    rating INT,
    comment TEXT,
    admin_comment TEXT,
    status ENUM('NEW', 'REVIEWED'),
    created_at TIMESTAMP
);
```

---

## 🔧 Basic Troubleshooting

### ❌ Common Issues & Solutions

#### 1. **Database Connection Failed**
- Check MySQL service is running
- Verify database credentials in application.properties
- Ensure database 'feedback_system' exists

#### 2. **Port 8080 Already in Use**
```bash
# Find process using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Change port in application.properties
server.port=8081
```

#### 3. **Build Failures**
```bash
# Clean and rebuild
mvn clean install

# Check internet connection for dependencies
```

#### 4. **Application Won't Start**
- Verify Java version (JDK 17+ required)
- Check application.properties configuration
- Ensure all required dependencies in pom.xml

---

## 📊 Application Flow

### 👤 Customer Journey
1. **Register/Login** → Create account or sign in
2. **Browse Products** → View available products
3. **Add to Cart** → Select products to purchase
4. **Checkout** → Place order
5. **Submit Feedback** → Rate and review purchased products

### 🔐 Admin Journey
1. **Admin Login** → Access admin dashboard
2. **Manage Products** → Add/edit/delete products
3. **View Feedback** → See all customer reviews
4. **Respond to Feedback** → Add admin comments

---

## 🎯 Quick Start Summary

```bash
# Complete setup commands:
1. Setup MySQL database and user
2. Update application.properties with database details
3. mvn clean package
4. java -jar target/customer-feedback-system-1.0.0.jar
5. Open http://localhost:8080 in browser
```

---

## ✅ Verification Checklist

### 📋 Pre-Run Checklist
- [ ] Java JDK 17+ installed
- [ ] MySQL 8+ installed and running
- [ ] Database 'feedback_system' created
- [ ] Application properties configured
- [ ] Maven dependencies downloaded

### ✅ Post-Run Verification
- [ ] Application starts without errors
- [ ] Database tables created automatically
- [ ] Home page loads in browser
- [ ] User registration works
- [ ] Login functionality works

---

*Last Updated: [Current Date]*  
*Version: 1.0*  
*Spring Boot Version: 3.x+*  
*Java Version: 17+*  

**🚀 Your Customer Feedback System is now ready! Access at http://localhost:8080**
