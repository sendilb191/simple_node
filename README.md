# 🚀 User Management API

A modern, full-featured User Management API built with Node.js, Express, and PostgreSQL. Features a beautiful web interface and is ready for deployment on various free hosting platforms.

## ✨ Features

- **RESTful API** - Complete CRUD operations for user management
- **PostgreSQL Database** - Robust, scalable database with full ACID compliance
- **Modern Web Interface** - Beautiful, responsive HTML/CSS/JS frontend
- **Real-time Updates** - Dynamic user interface with live data
- **Input Validation** - Comprehensive server-side and client-side validation
- **Error Handling** - Robust error handling with user-friendly messages
- **Multiple Deployment Options** - Ready for Vercel, Render, Railway, Heroku
- **Health Check Endpoint** - Built-in API monitoring
- **Mobile Responsive** - Works perfectly on all devices
- **Fallback Support** - Graceful fallback to in-memory storage if database unavailable

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (with in-memory fallback)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Deployment**: Multiple platform support

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- PostgreSQL database (optional - uses in-memory fallback if unavailable)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sendilb191/simple_node.git
   cd simple_node
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure database (optional)**

   Set the DATABASE_URL environment variable:

   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/users_db"
   ```

   Or create a `.env` file:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/users_db
   PORT=3000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📚 API Documentation

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

### Endpoints

#### Health Check

- **GET** `/api/health`
- Returns API status and timestamp

#### Users

##### Get All Users

- **GET** `/api/users`
- Returns list of all users with count
- **Response Example:**
  ```json
  {
    "success": true,
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "created_at": "2023-12-03T10:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```

##### Get User by ID

- **GET** `/api/users/:id`
- Returns specific user details
- **Response Example:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "created_at": "2023-12-03T10:00:00.000Z"
    }
  }
  ```

##### Create New User

- **POST** `/api/users`
- **Body Parameters:**
  - `name` (required): Full name
  - `email` (required): Valid email address
  - `age` (optional): Age in years
- **Request Example:**
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25
  }
  ```

##### Update User

- **PUT** `/api/users/:id`
- **Body Parameters:** Same as create user
- Updates existing user information

##### Delete User

- **DELETE** `/api/users/:id`
- Removes user from database
- **Response Example:**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## 🌐 Web Interface

The application includes a modern, responsive web interface accessible at the root URL (`/`).

### Features:

- **User Dashboard** - View all users in a card-based layout
- **Add Users** - Form with real-time validation
- **Edit Users** - Modal-based editing interface
- **Delete Users** - Confirmation dialogs for safety
- **Statistics** - User count and API status
- **Real-time Updates** - Automatic refresh after operations
- **Mobile Responsive** - Works on all screen sizes

## 🚀 Deployment

This application is configured for deployment on multiple free hosting platforms:

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Render

1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Deploy automatically on git push

### Railway

1. Connect your GitHub repository to Railway
2. Uses the included `railway.json` configuration
3. Deploy with zero configuration

### Heroku

1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`
4. Uses the included `Procfile`

## 📁 Project Structure

```
simple_node/
├── public/                 # Static files
│   ├── index.html         # Main web interface
│   ├── css/               # Stylesheets
│   │   ├── main.css      # Main styles
│   │   └── api-testing.css # API testing styles
│   └── js/                # JavaScript files
│       ├── main.js       # Main app logic
│       └── api-testing.js # API testing utilities
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore rules
├── vercel.json           # Vercel config
├── render.yaml           # Render config
├── railway.json          # Railway config
├── Procfile              # Heroku config
└── README.md             # This file
```

## 🧪 Testing the API

### Using curl:

**Get all users:**

```bash
curl -X GET http://localhost:3000/api/users
```

**Create a user:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","age":25}'
```

**Update a user:**

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com","age":30}'
```

**Delete a user:**

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Using Postman:

Import the API endpoints using the base URL and test each endpoint with the documented request formats.

## 🔧 Configuration

### Environment Variables

The application supports the following environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `DATABASE_URL` - PostgreSQL connection string (optional)

Create a `.env` file for local development:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/users_db
```

**Note**: If DATABASE_URL is not provided, the application will use in-memory storage as a fallback.

### Database

- **Primary**: PostgreSQL for production-grade performance and scalability
- **Fallback**: In-memory storage if PostgreSQL is unavailable
- **Auto-initialization**: Creates users table and sample data automatically
- **Environment-based**: Configure via DATABASE_URL environment variable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Ensure all dependencies are installed: `npm install`
3. Verify Node.js version: `node --version` (should be 18+)
4. Check if the port is available (default: 3000)

## 🔧 Development Notes

### Database Architecture

- The application is designed to work with PostgreSQL as the primary database
- Includes automatic fallback to in-memory storage if PostgreSQL is unavailable
- Database schema is auto-created on first run
- Sample users are inserted automatically for testing

### API Design

- Follows RESTful conventions
- Returns consistent JSON responses
- Includes proper HTTP status codes
- Comprehensive error handling and validation

### Deployment Features

- Zero-config deployment on major platforms
- Environment variable support for all configurations
- Health check endpoints for monitoring
- Production-ready logging and error handling

## 🎉 What's Next?

Potential enhancements you could add:

- User authentication and authorization
- Password hashing and security
- Email validation with verification
- File upload for user avatars
- Advanced search and filtering
- Pagination for large datasets
- Export functionality (CSV, Excel)
- API rate limiting
- Logging and monitoring
- Unit and integration tests
- Docker containerization
- API documentation with Swagger/OpenAPI

## 📊 Repository Info

- **Repository**: [simple_node](https://github.com/sendilb191/simple_node)
- **Owner**: sendilb191
- **Last Updated**: December 2025
- **License**: ISC

---

**Happy Coding! 🚀**
