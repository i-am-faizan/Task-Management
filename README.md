# Task Management Application

A production-ready Full Stack Task Management Application with robust security and a clean architecture.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React (Vite), Axios, Lucide Icons, React Hot Toast
- **Security**: JWT-based Auth (HTTP-only cookies), Bcrypt password hashing, AES Payload Encryption (crypto-js), Helmet, CORS, Input Validation.

## Features

- **User Authentication**: Secure registration and login using JWT stored in HTTP-only cookies.
- **Task Management**: Full CRUD operations for tasks, including title, description, and status.
- **Data Security**: End-to-end payload encryption using AES for sensitive data transit between frontend and backend.
- **Modern UI**: Clean, responsive interface built with React and styled for a premium feel.
- **Search & Filter**: Ability to search tasks by title and filter them by their current status.
- **Pagination**: Efficient handling of large task lists with pagination support.
- **Input Validation**: Robust server-side validation to ensure data integrity.
- **Health Monitoring**: Built-in health-check endpoint for monitoring server status.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or a cloud instance)

### Backend Setup

1. **Navigate to the Backend directory**:
   ```bash
   cd BACKEND
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `BACKEND` directory with the following content:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_here
   AES_SECRET=your_aes_encryption_secret
   NODE_ENV=development
   ```
4. **Start the server**:
   ```bash
   npm start
   ```
   The backend will be running at `http://localhost:5000`.

### Frontend Setup

1. **Navigate to the Frontend directory**:
   ```bash
   cd FRONTEND
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `FRONTEND` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_AES_SECRET=your_aes_encryption_secret (Matches backend AES_SECRET)
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`.

## Architecture & Design Patterns

The project is structured following clean architecture principles:

- **Modular Backend**: Logic is neatly separated into Controllers (business logic), Models (data structure), Routes (endpoints), and Middlewares (reusable logic like authentication and decryption).
- **Component-Driven Frontend**: React components are designed to be reusable and maintainable, with centralized API services and utility functions.
- **Security First**: Implementation of security best practices including CORS configuration, Helmet headers, and payload encryption.

## API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate and receive an HTTP-only cookie.
- `GET /api/auth/me` - Retrieve information about the currently logged-in user.

### Tasks
- `GET /api/tasks` - Fetch all tasks for the logged-in user (supports `search`, `status`, `page`, and `limit`).
- `POST /api/tasks` - Create a new task.
- `GET /api/tasks/:id` - Fetch details of a specific task.
- `PUT /api/tasks/:id` - Update an existing task.
- `DELETE /api/tasks/:id` - Remove a task from the system.

### System
- `GET /health` - Check the operational status of the backend API.
