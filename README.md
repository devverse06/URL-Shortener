# URL Shortener - Low-Level Design (LLD) Implementation

A production-ready URL shortener service built with Node.js, demonstrating key Low-Level Design patterns and SOLID principles.

## Support my work ☕
Buy me a coffee 👉 https://bit.ly/buydeveloperdiary

## 🎯 Project Overview

This project showcases a complete URL shortener implementation following industry-standard design patterns including Strategy Pattern, Repository Pattern, Dependency Injection, and Layered Architecture.

### Key Features
- ✅ URL shortening with customizable strategies
- ✅ Redis caching for high performance
- ✅ Click tracking and analytics
- ✅ MongoDB for persistent storage
- ✅ RESTful API design
- ✅ Extensible architecture

---

## 🏗️ Architecture & Design Patterns

### 1. **Layered Architecture**
The application follows a clear separation of concerns with distinct layers:

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← HTTP endpoints
├─────────────────────────────────────┤
│       Controller Layer              │  ← Request handling
├─────────────────────────────────────┤
│        Service Layer                │  ← Business logic
├─────────────────────────────────────┤
│      Repository Layer               │  ← Data access
├─────────────────────────────────────┤
│    Model Layer + Database           │  ← Data persistence
└─────────────────────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test individual layers
- Maintainable and scalable code

---

### 2. **Strategy Pattern** 🎨

The Strategy Pattern allows different algorithms for generating short codes to be swapped at runtime without modifying the service logic.

#### Implementation:

**Base Strategy (Interface):**
```javascript
// src/strategies/shortCode.strategy.js
class ShortCodeStrategy {
  generate() {
    throw new Error("generate() must be implemented");
  }
}
```

**Concrete Strategy:**
```javascript
// src/strategies/base62.strategy.js
class Base62Strategy extends ShortCodeStrategy {
  generate() {
    return nanoid(7); // Generates URL-safe short codes
  }
}
```

**Usage in Service:**
```javascript
class UrlService {
  constructor(shortCodeStrategy) {
    this.shortCodeStrategy = shortCodeStrategy; // Strategy injection
  }

  async shorten(originalUrl) {
    const shortCode = this.shortCodeStrategy.generate(); // Uses injected strategy
    // ... rest of logic
  }
}
```

**Benefits:**
- **Open/Closed Principle**: Open for extension, closed for modification
- Easy to add new short code generation algorithms (MD5, Base62, Sequential, etc.)
- No need to modify existing service code when adding new strategies

**Example: Adding a New Strategy**
```javascript
// src/strategies/sequential.strategy.js
class SequentialStrategy extends ShortCodeStrategy {
  constructor() {
    super();
    this.counter = 1000;
  }
  
  generate() {
    return `URL${this.counter++}`;
  }
}

// Usage in routes
const service = new UrlService(new SequentialStrategy());
```

---

### 3. **Repository Pattern** 🗄️

Abstracts data access logic from business logic, making the codebase database-agnostic.

```javascript
// src/repositories/url.repository.js
class UrlRepository {
  async create(data) {
    return Url.create(data);
  }

  async findByCode(code) {
    return Url.findOne({ shortCode: code });
  }

  async incrementClicks(code) {
    return Url.updateOne(
      { shortCode: code },
      { $inc: { clickCount: 1 } }
    );
  }
}
```

**Benefits:**
- Centralizes all database queries
- Easy to switch databases (MongoDB → PostgreSQL)
- Simplifies unit testing with mock repositories
- Clear separation between data access and business logic

---

### 4. **Dependency Injection** 💉

Dependencies are injected rather than hard-coded, improving testability and flexibility.

```javascript
// Routes file - Dependency injection at startup
const service = new UrlService(new Base62Strategy());
const controller = new UrlController(service);
```

**Benefits:**
- Loose coupling between components
- Easy to test (inject mock dependencies)
- Flexible configuration (swap implementations easily)

---

### 5. **Caching Strategy** ⚡

Implements cache-aside pattern with Redis for optimal performance:

```javascript
async resolve(shortCode) {
  // 1. Try cache first
  const cachedUrl = await redisClient.get(shortCode);
  if (cachedUrl) {
    await urlRepository.incrementClicks(shortCode);
    return cachedUrl;
  }

  // 2. Cache miss - query database
  const url = await urlRepository.findByCode(shortCode);
  if (!url) return null;

  // 3. Update cache for future requests
  await redisClient.set(shortCode, url.originalUrl);
  await urlRepository.incrementClicks(shortCode);
  return url.originalUrl;
}
```

**Benefits:**
- Reduces database load
- Improves response time
- Scalable for high traffic

---

## 📁 Project Structure

```
nodejs-lld-url-shortener/
├── src/
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Server entry point
│   ├── config/
│   │   ├── mongo.js                # MongoDB connection
│   │   └── redis.js                # Redis connection
│   ├── controllers/
│   │   └── url.controller.js       # HTTP request handlers
│   ├── services/
│   │   └── url.service.js          # Business logic layer
│   ├── repositories/
│   │   └── url.repository.js       # Data access layer
│   ├── models/
│   │   └── url.model.js            # Mongoose schema
│   ├── strategies/
│   │   ├── shortCode.strategy.js   # Base strategy (interface)
│   │   └── base62.strategy.js      # Concrete strategy
│   └── routes/
│       └── url.routes.js           # API routes
├── .env                            # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- **Either:**
  - Docker and Docker Compose (recommended)
  - **OR** MongoDB (running on default port 27017) + Redis (running on default port 6379)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nodejs-lld-url-shortener
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/url_shortener
   REDIS_URL=redis://127.0.0.1:6379
   ```

4. **Start MongoDB and Redis:**

   **Option A: Using Docker (Recommended):**
   ```bash
   # Start MongoDB and Redis containers
   docker-compose up -d
   
   # Stop containers
   docker-compose down
   
   # Stop and remove data volumes
   docker-compose down -v
   ```

   **Option B: Local Installation:**
   ```bash
   # Windows - MongoDB
   mongod
   
   # Windows - Redis
   redis-server
   
   # macOS/Linux - MongoDB
   sudo systemctl start mongod
   
   # macOS/Linux - Redis
   sudo systemctl start redis
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3000`

---

## 📡 API Endpoints

### 1. Shorten URL
**POST** `/shorten`

**Request Body:**
```json
{
  "originalUrl": "https://www.example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/ADsZo3D"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://google.com"}'
```

---

### 2. Redirect to Original URL
**GET** `/:code`

**Example:**
```
GET http://localhost:3000/ADsZo3D
→ Redirects to https://www.example.com/very/long/url
→ Increments click count
```

**Browser/cURL:**
```bash
curl -L http://localhost:3000/ADsZo3D
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Primary database (persistence) |
| **Mongoose** | MongoDB ODM |
| **Redis** | Caching layer |
| **nanoid** | Short code generation |
| **dotenv** | Environment configuration |

---

## 🧪 Design Principles Applied

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each class has one reason to change
   - Controller → handles HTTP
   - Service → business logic
   - Repository → data access

2. **Open/Closed Principle (OCP)**
   - Strategy pattern allows adding new strategies without modifying service

3. **Liskov Substitution Principle (LSP)**
   - Any `ShortCodeStrategy` implementation can replace another

4. **Interface Segregation Principle (ISP)**
   - Minimal, focused interfaces (ShortCodeStrategy has only `generate()`)

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions (strategies), not concrete implementations

---

## 🎓 Extending the System

### Adding a Custom Strategy

1. **Create new strategy file:**
   ```javascript
   // src/strategies/md5.strategy.js
   const crypto = require('crypto');
   const ShortCodeStrategy = require('./shortCode.strategy');

   class MD5Strategy extends ShortCodeStrategy {
     generate() {
       const hash = crypto.createHash('md5')
         .update(Date.now().toString())
         .digest('hex');
       return hash.substring(0, 7);
     }
   }

   module.exports = MD5Strategy;
   ```

2. **Use in routes:**
   ```javascript
   const MD5Strategy = require('../strategies/md5.strategy');
   const service = new UrlService(new MD5Strategy());
   ```

### Adding Analytics Features

Extend the repository with new methods:
```javascript
// In url.repository.js
async getAnalytics(code) {
  return Url.findOne({ shortCode: code })
    .select('originalUrl clickCount createdAt');
}
```

Add corresponding service and controller methods.

---

## 📊 Database Schema

### URL Model
```javascript
{
  originalUrl: String (required),
  shortCode: String (unique),
  expiresAt: Date (optional),
  clickCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🤔 Why This Design?

### Scalability
- Redis caching reduces database load
- Stateless services enable horizontal scaling
- Repository pattern allows database sharding

### Maintainability
- Clear separation of concerns
- Each component is independently testable
- New features can be added without breaking existing code

### Testability
- Dependency injection enables easy mocking
- Each layer can be unit tested in isolation

### Extensibility
- Strategy pattern allows new algorithms
- Repository pattern allows database switching
- Layered architecture supports feature additions

---

## 📝 License

MIT License - Feel free to use this for learning and interviews!

---

## 👨‍💻 Contributing

This project is for educational purposes.
Contributions are welcome! Please follow the existing code structure and design patterns.

---

## Support my work ☕
Buy me a coffee 👉 https://bit.ly/buydeveloperdiary
