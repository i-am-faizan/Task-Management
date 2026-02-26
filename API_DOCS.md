# Task Management — API Documentation

> **Base URL:** `http://localhost:5000/api`  
> **Content-Type:** `application/json`  
> **Authentication:** Cookie-based JWT (`token` httpOnly cookie, expires in **24 hours**)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Tasks](#tasks)
3. [Health Check](#health-check)
4. [Data Models](#data-models)
5. [Encryption](#encryption)
6. [Error Responses](#error-responses)

---

## Authentication

All protected routes require a valid `token` cookie sent automatically by the browser. The cookie is set on login/register and cleared on logout.

---

### `POST /api/auth/register`

Register a new user account.

**Access:** Public

#### Request Body

| Field      | Type   | Required | Constraints              |
|------------|--------|----------|--------------------------|
| `name`     | string | ✅        | Non-empty                |
| `email`    | string | ✅        | Valid email, unique      |
| `password` | string | ✅        | Minimum 6 characters     |

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Response `201 Created`

Sets a `token` httpOnly cookie (24h expiry).

```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Error Responses

| Status | Message                  | Reason                  |
|--------|--------------------------|-------------------------|
| `400`  | `User already exists`    | Email already registered |

---

### `POST /api/auth/login`

Login with existing credentials.

**Access:** Public

#### Request Body

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | ✅        |
| `password` | string | ✅        |

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Response `200 OK`

Sets a `token` httpOnly cookie (24h expiry).

```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Error Responses

| Status | Message                              | Reason                     |
|--------|--------------------------------------|----------------------------|
| `400`  | `Please provide email and password`  | Missing fields             |
| `401`  | `Invalid credentials`               | Wrong email or password    |

---

### `GET /api/auth/me`

Get the currently authenticated user's profile.

**Access:** 🔒 Private

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### `GET /api/auth/logout`

Logout the current user and clear the auth cookie.

**Access:** 🔒 Private

#### Response `200 OK`

Overwrites the `token` cookie with an expired value (10s TTL).

```json
{
  "success": true,
  "data": {}
}
```

---

## Tasks

All task routes require authentication. Tasks are scoped to the authenticated user — users can only access their own tasks.

> **Note on Encryption:** `title` and `description` fields are AES-encrypted in transit. The client sends them inside an `encryptedData` field; the server decrypts, stores, then re-encrypts them in the response. See [Encryption](#encryption) for details.

---

### `GET /api/tasks`

Get a paginated, filterable list of tasks for the current user.

**Access:** 🔒 Private

#### Query Parameters

| Parameter | Type   | Default | Description                                              |
|-----------|--------|---------|----------------------------------------------------------|
| `page`    | number | `1`     | Page number                                              |
| `limit`   | number | `10`    | Tasks per page                                           |
| `search`  | string | —       | Case-insensitive regex search on `title`                |
| `status`  | string | —       | Filter by status: `pending`, `in-progress`, `completed` |
| `sort`    | string | `-createdAt` | Sort field(s), comma-separated (prefix `-` for desc) |
| `select`  | string | —       | Comma-separated fields to include in response           |

#### Example Request

```
GET /api/tasks?page=1&limit=6&status=pending&search=fix
```

#### Response `200 OK`

```json
{
  "success": true,
  "count": 6,
  "total": 14,
  "pagination": {
    "next": { "page": 2, "limit": 6 },
    "prev": { "page": 0, "limit": 6 }
  },
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "user": "64f1a2b3c4d5e6f7a8b9c0d1",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "encryptedData": "<AES_encrypted_string_containing_title_and_description>"
    }
  ]
}
```

> `pagination.next` is omitted when on the last page; `pagination.prev` is omitted when on the first page.

---

### `GET /api/tasks/:id`

Get a single task by ID.

**Access:** 🔒 Private

#### URL Parameters

| Parameter | Type   | Description   |
|-----------|--------|---------------|
| `id`      | string | MongoDB `_id` |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "encryptedData": "<AES_encrypted_string_containing_title_and_description>"
  }
}
```

#### Error Responses

| Status | Message          | Reason                          |
|--------|------------------|---------------------------------|
| `404`  | `Task not found` | ID doesn't exist or belongs to another user |

---

### `POST /api/tasks`

Create a new task.

**Access:** 🔒 Private

#### Request Body

| Field           | Type   | Required | Constraints                                   |
|-----------------|--------|----------|-----------------------------------------------|
| `encryptedData` | string | ✅        | AES-encrypted JSON `{ title, description }`   |
| `status`        | string | ❌        | `pending` \| `in-progress` \| `completed` (default: `pending`) |

```json
{
  "encryptedData": "<AES_encrypted_string>",
  "status": "pending"
}
```

> The `encryptedData` field must be AES-encrypted using the shared `AES_SECRET` and must decrypt to valid JSON containing `title` (max 100 chars) and `description` (max 500 chars).

#### Response `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "encryptedData": "<AES_encrypted_string_containing_title_and_description>"
  }
}
```

#### Error Responses

| Status | Message                                  | Reason                       |
|--------|------------------------------------------|------------------------------|
| `400`  | `Security check failed: Invalid encrypted payload` | Malformed `encryptedData` |
| `400`  | `Please add a title`                     | Title missing after decryption |
| `400`  | `Please add a description`               | Description missing after decryption |

---

### `PUT /api/tasks/:id`

Update an existing task.

**Access:** 🔒 Private

#### URL Parameters

| Parameter | Type   | Description   |
|-----------|--------|---------------|
| `id`      | string | MongoDB `_id` |

#### Request Body

Send only the fields you want to update. At least one of the following:

| Field           | Type   | Constraints                                          |
|-----------------|--------|------------------------------------------------------|
| `encryptedData` | string | AES-encrypted JSON with updated `title`/`description` |
| `status`        | string | `pending` \| `in-progress` \| `completed`            |

```json
{
  "encryptedData": "<AES_encrypted_string>",
  "status": "in-progress"
}
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "status": "in-progress",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "encryptedData": "<AES_encrypted_string_containing_title_and_description>"
  }
}
```

#### Error Responses

| Status | Message          | Reason                                              |
|--------|------------------|-----------------------------------------------------|
| `404`  | `Task not found` | ID doesn't exist or belongs to another user         |

---

### `DELETE /api/tasks/:id`

Delete a task permanently.

**Access:** 🔒 Private

#### URL Parameters

| Parameter | Type   | Description   |
|-----------|--------|---------------|
| `id`      | string | MongoDB `_id` |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {}
}
```

#### Error Responses

| Status | Message          | Reason                                              |
|--------|------------------|-----------------------------------------------------|
| `404`  | `Task not found` | ID doesn't exist or belongs to another user         |

---

## Health Check

### `GET /health`

Check if the server is running. Does **not** require authentication.

**Access:** Public

#### Response `200 OK`

```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123
}
```

---

## Data Models

### User

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| `_id`       | ObjectId | Auto-generated MongoDB ID            |
| `name`      | string   | User's display name                  |
| `email`     | string   | Unique email address                 |
| `password`  | string   | bcrypt hashed (never returned in API)|
| `createdAt` | Date     | Account creation timestamp           |

### Task

| Field         | Type     | Description                                                 |
|---------------|----------|-------------------------------------------------------------|
| `_id`         | ObjectId | Auto-generated MongoDB ID                                   |
| `user`        | ObjectId | Reference to the owning `User`                              |
| `title`       | string   | Task title (max 100 chars) — stored plain, sent encrypted   |
| `description` | string   | Task description (max 500 chars) — stored plain, sent encrypted |
| `status`      | string   | `pending` \| `in-progress` \| `completed` (default: `pending`) |
| `createdAt`   | Date     | Task creation timestamp                                     |

---

## Encryption

This API uses **AES encryption** (via `crypto-js`) to protect task `title` and `description` fields in transit.

### How it works

```
Client → encrypt({ title, description }) → encryptedData string → POST /api/tasks
Server → decryptMiddleware decrypts encryptedData → stores plain title & description in DB
Server → re-encrypts { title, description } → returns encryptedData in response
Client → decrypts encryptedData → renders title & description
```

### Client-side example

```js
import CryptoJS from 'crypto-js';

const AES_SECRET = import.meta.env.VITE_AES_SECRET;

// Encrypt before sending
const encryptedData = CryptoJS.AES.encrypt(
  JSON.stringify({ title: 'Fix bug', description: 'Details here...' }),
  AES_SECRET
).toString();

// Decrypt after receiving
const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Code  | Meaning                                              |
|-------|------------------------------------------------------|
| `200` | OK — Request succeeded                               |
| `201` | Created — Resource created successfully              |
| `400` | Bad Request — Validation error or duplicate entry    |
| `401` | Unauthorized — Missing, invalid, or expired token    |
| `404` | Not Found — Resource doesn't exist or access denied  |
| `500` | Internal Server Error — Unexpected server error      |

### Global Error Handling

The server automatically maps certain MongoDB errors to user-friendly messages:

| Error Type             | Status | Message                          |
|------------------------|--------|----------------------------------|
| `CastError`            | `404`  | `Resource not found`             |
| Duplicate key (`11000`)| `400`  | `Duplicate field value entered`  |
| `ValidationError`      | `400`  | Field-level validation messages  |
