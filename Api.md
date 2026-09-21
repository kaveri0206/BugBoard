# 🔌 BugBoard API Documentation

This document describes the REST API currently implemented by the **BugBoard – Bug & Issue Tracking System** backend.

The backend uses **Node.js + Express + MongoDB/Mongoose** and supports JWT-based authentication, role-based access, project management, issue tracking, notifications, activities, analytics/telemetry and supporting service modules.

---

## 1. Base URL

For local development:

```text
http://localhost:5000
```

The primary versioned API prefix is:

```text
http://localhost:5000/api/v1
```

The application also exposes several root-level aliases such as:

```text
http://localhost:5000/auth
http://localhost:5000/issues
http://localhost:5000/projects
```

For new frontend integrations, prefer the versioned `/api/v1` endpoints.

---

# 2. Authentication

Most protected endpoints require a JWT access token.

Send the token using:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
GET /api/v1/issues
Authorization: Bearer eyJ...
```

---

# 3. API Response Convention

Successful responses generally return JSON.

Example:

```json
{
  "success": true,
  "data": {}
}
```

Error responses follow the application's structured error handling.

Example:

```json
{
  "success": false,
  "message": "Invalid request"
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `401` | Authentication required or invalid |
| `403` | Authenticated but not authorized |
| `404` | Resource/route not found |
| `409` | Conflict |
| `500` | Internal server error |

---

# 4. Health Check

## `GET /health`

Checks whether the server is running.

### Example

```bash
curl http://localhost:5000/health
```

### Example response

```json
{
  "status": "healthy",
  "uptime": 123.45
}
```

This endpoint does not require authentication.

---

# 5. Authentication API

Base path:

```text
/api/v1/auth
```

Authentication routes are defined in:

```text
server/routes/auth.routes.js
```

---

## 5.1 Register

### `POST /api/v1/auth/register`

Creates a new user account.

### Request body

```json
{
  "name": "John Developer",
  "email": "john@example.com",
  "password": "password123",
  "department": "Engineering",
  "role": "Developer"
}
```

### Validation

- `name`: required, 2–100 characters
- `email`: required, valid email
- `password`: required, 6–100 characters
- `department`: optional
- `role`: `Developer` or `Tester`

Self-registration does not allow creating an Admin account.

---

## 5.2 Login

### `POST /api/v1/auth/login`

Authenticates a user.

### Request body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

The authentication service validates the credentials and issues authentication tokens.

---

## 5.3 Refresh Token

### `POST /api/v1/auth/refresh`

Refreshes the access-token/session information.

### Request

The refresh-token mechanism is handled by the authentication service.

---

## 5.4 Logout

### `POST /api/v1/auth/logout`

Logs out the authenticated user and invalidates the applicable token/session state.

---

## 5.5 Current User

### `GET /api/v1/auth/me`

Returns information about the currently authenticated user.

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 5.6 Forgot Password

### `POST /api/v1/auth/forgot-password`

Starts the password recovery process.

### Request body

```json
{
  "email": "john@example.com"
}
```

---

## 5.7 Reset Password

### `POST /api/v1/auth/reset-password`

Resets the password using a valid reset token.

### Request body

```json
{
  "token": "<RESET_TOKEN>",
  "newPassword": "newPassword123"
}
```

---

## 5.8 Update Password

### `PUT /api/v1/auth/update-password`

Updates the password of the authenticated user.

### Request body

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

Requires authentication.

---

# 6. Projects API

Base path:

```text
/api/v1/projects
```

Project routes are defined in:

```text
server/routes/project.routes.js
```

All project endpoints require authentication.

---

## 6.1 Get Projects

### `GET /api/v1/projects`

Returns projects available to the authenticated user.

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 6.2 Create Project

### `POST /api/v1/projects`

Creates a project.

### Request body

```json
{
  "name": "Payment Platform",
  "projectKey": "PAY",
  "description": "Payment processing application",
  "members": [
    "64f000000000000000000001",
    "64f000000000000000000002"
  ]
}
```

### Validation

| Field | Type | Requirement |
|---|---|---|
| `name` | String | Required, 2–120 characters |
| `projectKey` | String | Required, 2–10 alphanumeric characters |
| `description` | String | Optional |
| `members` | Array | Optional MongoDB ObjectIds |

The project key is converted/validated as uppercase.

---

## 6.3 Get Project

### `GET /api/v1/projects/:id`

Returns a project by MongoDB ObjectId.

Example:

```text
GET /api/v1/projects/64f000000000000000000001
```

---

# 7. Issues API

Base path:

```text
/api/v1/issues
```

Issue routes are defined in:

```text
server/routes/issue.routes.js
```

Issue endpoints use authentication protection.

---

## 7.1 Get Issues

### `GET /api/v1/issues`

Returns issue records available to the authenticated user.

Example:

```bash
curl \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:5000/api/v1/issues
```

---

## 7.2 Create Issue

### `POST /api/v1/issues`

Creates a new bug/issue.

### Request body

```json
{
  "project": "64f000000000000000000001",
  "title": "Login button is not working",
  "description": "The login button does not submit the form after valid credentials are entered.",
  "severity": "High",
  "priority": "High",
  "assignee": "64f000000000000000000002",
  "labels": [
    "authentication",
    "frontend"
  ],
  "environment": "Development",
  "browser": "Chrome",
  "operatingSystem": "Windows 11",
  "stepsToReproduce": "1. Open login page\n2. Enter valid credentials\n3. Click Login",
  "expectedResult": "User should be logged in.",
  "actualResult": "Nothing happens.",
  "dueDate": null,
  "attachments": []
}
```

### Required fields

```text
project
title
description
```

### Optional fields

```text
severity
priority
assignee
labels
environment
browser
operatingSystem
stepsToReproduce
expectedResult
actualResult
dueDate
attachments
```

### Severity values

```text
Low
Medium
High
Critical
```

### Priority values

```text
Low
Medium
High
Urgent
```

---

## 7.3 Get Issue by ID

### `GET /api/v1/issues/:id`

Returns a single issue.

Example:

```text
GET /api/v1/issues/64f000000000000000000010
```

---

## 7.4 Update Issue

### `PUT /api/v1/issues/:id`

Updates an issue.

Example request:

```json
{
  "title": "Login button does not submit form",
  "severity": "Critical",
  "priority": "Urgent",
  "assignee": "64f000000000000000000002",
  "labels": [
    "authentication",
    "frontend",
    "regression"
  ]
}
```

---

## 7.5 Partial Update Issue

### `PATCH /api/v1/issues/:id`

Updates selected issue fields.

Example:

```json
{
  "priority": "High",
  "severity": "Medium"
}
```

---

## 7.6 Change Issue Status

### `PATCH /api/v1/issues/:id/status`

Changes the issue workflow status.

### Request body

```json
{
  "status": "In Progress"
}
```

Supported statuses:

```text
Open
In Progress
Testing
Resolved
Closed
Reopened
```

Example workflow:

```text
Open
  ↓
In Progress
  ↓
Testing
  ↓
Resolved
  ↓
Closed
```

An issue may also be reopened when required.

---

# 8. Comments API

The project contains a comment route module:

```text
server/routes/comment.routes.js
```

The comment API supports issue discussions.

## `POST /api/v1/comments/issue/:id`

Adds a comment to an issue.

### Request body

```json
{
  "content": "I reproduced this issue on Chrome."
}
```

The comment content must contain between 1 and 5000 characters.

---

## `GET /api/v1/comments/issue/:id`

Returns comments associated with an issue.

---

## `DELETE /api/v1/comments/:commentId`

Deletes a comment.

### Important

The comment route module is implemented in the project. If the current `app.js` does not mount this route in the active server configuration, mount it before using these endpoints:

```js
app.use('/api/v1/comments', commentRoutes);
```

---

# 9. User Management API

Base path:

```text
/api/v1/users
```

Defined in:

```text
server/routes/user.routes.js
```

All user-management endpoints require authentication.

---

## 9.1 Get Users

### `GET /api/v1/users`

Returns users available to the authenticated management context.

---

## 9.2 Update User Role

### `PATCH /api/v1/users/:id/role`

Updates a user's role.

Supported roles:

```text
Admin
Developer
Tester
```

Example request:

```json
{
  "role": "Developer"
}
```

---

## 9.3 Toggle User Status

### `PATCH /api/v1/users/:id/status`

Changes the active/inactive status of a user.

Example:

```json
{
  "isActive": false
}
```

---

# 10. Activity API

Base path:

```text
/api/v1/activities
```

Defined in:

```text
server/routes/activity.routes.js
```

---

## 10.1 Get Activities

### `GET /api/v1/activities`

Returns application activity records.

Requires authentication.

---

## 10.2 Get Issue Activities

### `GET /api/v1/activities/issue/:issueId`

Returns activity history for a particular issue.

Example:

```text
GET /api/v1/activities/issue/64f000000000000000000010
```

Typical activity types include:

```text
CREATED
UPDATED
STATUS_CHANGED
ASSIGNED
COMMENT_ADDED
RESOLVED
CLOSED
REOPENED
DELETED
```

---

# 11. Notification API

Base path:

```text
/api/v1/notifications
```

Defined in:

```text
server/routes/notification.routes.js
```

All notification endpoints require authentication.

---

## 11.1 Get Notifications

### `GET /api/v1/notifications`

Returns notifications for the authenticated user.

---

## 11.2 Mark All Notifications as Read

### `PATCH /api/v1/notifications/mark-all-read`

Marks all applicable notifications as read.

---

## 11.3 Mark Notification as Read

### `PATCH /api/v1/notifications/:id/read`

Marks one notification as read.

Example:

```text
PATCH /api/v1/notifications/64f000000000000000000030/read
```

---

# 12. Analytics API

The project contains analytics functionality.

### `GET /api/v1/analytics`

Returns analytics/metrics information through the currently mounted analytics/telemetry route configuration.

### `GET /api/v1/analytics/metrics`

Returns metrics through the analytics route module.

---

## Example

```bash
curl \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:5000/api/v1/analytics/metrics
```

---

# 13. Telemetry API

Base path:

```text
/api/v1/telemetry
```

Defined in:

```text
server/routes/telemetry.routes.js
```

---

## `GET /api/v1/telemetry`

Returns telemetry/metrics information.

The telemetry endpoint uses protected access.

---

# 14. AI API

The project contains an AI route module:

```text
server/routes/ai.routes.js
```

## `POST /api/v1/ai/analyze-issue`

Analyzes an issue using the AI service.

### Request body

The AI service expects issue information such as title and description.

Example:

```json
{
  "title": "Application crashes after clicking Save",
  "description": "The application closes when a user submits a form with an empty optional field."
}
```

The AI service can return suggestions such as:

```text
Summary
Severity
Priority
Labels
Possible root causes
Debugging steps
Test cases
```

### Authentication

The AI route uses authentication middleware.

### External dependency

The AI service can use the Google Gemini API when configured.

---

# 15. File Upload API

The project contains an upload route module:

```text
server/routes/upload.routes.js
```

## `POST /api/v1/upload`

Uploads a file.

The request uses multipart form data:

```text
Content-Type: multipart/form-data
```

The file field is:

```text
file
```

Example using `curl`:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@screenshot.png" \
  http://localhost:5000/api/v1/upload
```

---

## `DELETE /api/v1/upload`

Deletes a previously uploaded file according to the storage service configuration.

### Important

Like the comment/AI route modules, the upload route module should be explicitly mounted in `app.js` if it is not included in the active route mounting configuration.

Example:

```js
app.use('/api/v1/upload', uploadRoutes);
```

---

# 16. Authentication Matrix

| Endpoint Area | Authentication |
|---|---|
| `/health` | Public |
| `/auth/register` | Public |
| `/auth/login` | Public |
| `/auth/refresh` | Public/session based |
| `/auth/forgot-password` | Public |
| `/auth/reset-password` | Token based |
| `/auth/me` | Required |
| `/auth/update-password` | Required |
| `/projects` | Required |
| `/issues` | Required |
| `/users` | Required |
| `/activities` | Required |
| `/notifications` | Required |
| `/analytics` | Protected |
| `/telemetry` | Protected |
| `/ai` | Required |
| `/upload` | Required |

---

# 17. Roles

BugBoard defines three application roles:

```text
Admin
Developer
Tester
```

### Admin

Administrative operations such as user management and system-level functionality.

### Developer

Development-related issue assignment and workflow operations.

### Tester

Defect reporting and testing-oriented issue workflow.

Authorization should always be enforced on the backend; frontend route guards are only an additional user-interface layer.

---

# 18. Common Request Headers

For JSON requests:

```http
Content-Type: application/json
```

For authenticated requests:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

For file uploads:

```http
Content-Type: multipart/form-data
```

---

# 19. Example: Complete Issue Creation

### Step 1 – Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "developer@example.com",
  "password": "password123"
}
```

### Step 2 – Receive authentication token

Store the access token on the client according to the application's authentication strategy.

### Step 3 – Create issue

```http
POST /api/v1/issues
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "project": "64f000000000000000000001",
  "title": "Dashboard chart is not loading",
  "description": "The analytics chart remains blank after opening the dashboard.",
  "severity": "Medium",
  "priority": "High",
  "labels": [
    "analytics",
    "frontend"
  ],
  "environment": "Development",
  "browser": "Chrome",
  "operatingSystem": "Windows 11"
}
```

### Step 4 – Update status

```http
PATCH /api/v1/issues/64f000000000000000000010/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "status": "In Progress"
}
```

---

# 20. API Development Notes

The API is designed around REST principles:

- Resources are represented by nouns such as `issues`, `projects`, `users` and `notifications`.
- HTTP methods represent operations.
- JSON is used for most request/response payloads.
- JWT is used for protected resources.
- Joi is used for request validation.
- MongoDB ObjectIds are used for resource references.

---

# 21. Error Handling

The server contains centralized error handling.

Example `404` response:

```json
{
  "success": false,
  "message": "Route /unknown not found on this server"
}
```

Application errors are returned as structured JSON responses rather than HTML pages.

---

# 22. Frontend API Integration

The React frontend communicates with the API through Axios service modules.

Typical flow:

```text
React Component
      ↓
Service Function
      ↓
Axios
      ↓
JWT Authorization Header
      ↓
Express API
      ↓
Controller
      ↓
Service
      ↓
MongoDB
```

This keeps HTTP communication separate from UI components and makes API calls reusable across the application.

---

# 23. API Security

The API includes multiple security mechanisms:

- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Joi validation
- CORS configuration
- Helmet
- Rate limiting
- Protected routes
- Centralized error handling
- Environment-based secret configuration

Never commit production credentials, JWT secrets, MongoDB passwords or API keys to GitHub.

---

# 24. Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| POST | `/api/v1/auth/register` | Register | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh token | Session/token |
| POST | `/api/v1/auth/logout` | Logout | Auth/session |
| GET | `/api/v1/auth/me` | Current user | Yes |
| PUT | `/api/v1/auth/update-password` | Change password | Yes |
| POST | `/api/v1/auth/forgot-password` | Password recovery | No |
| POST | `/api/v1/auth/reset-password` | Reset password | Token |
| GET | `/api/v1/projects` | List projects | Yes |
| POST | `/api/v1/projects` | Create project | Yes |
| GET | `/api/v1/projects/:id` | Get project | Yes |
| GET | `/api/v1/issues` | List issues | Yes |
| POST | `/api/v1/issues` | Create issue | Yes |
| GET | `/api/v1/issues/:id` | Get issue | Yes |
| PUT | `/api/v1/issues/:id` | Update issue | Yes |
| PATCH | `/api/v1/issues/:id` | Partial issue update | Yes |
| PATCH | `/api/v1/issues/:id/status` | Change issue status | Yes |
| GET | `/api/v1/users` | List users | Yes |
| PATCH | `/api/v1/users/:id/role` | Update role | Yes |
| PATCH | `/api/v1/users/:id/status` | Toggle user status | Yes |
| GET | `/api/v1/activities` | List activities | Yes |
| GET | `/api/v1/activities/issue/:issueId` | Issue activity | Yes |
| GET | `/api/v1/notifications` | List notifications | Yes |
| PATCH | `/api/v1/notifications/mark-all-read` | Mark all read | Yes |
| PATCH | `/api/v1/notifications/:id/read` | Mark one read | Yes |
| GET | `/api/v1/analytics` | Analytics/metrics | Yes |
| GET | `/api/v1/analytics/metrics` | Metrics | Yes |
| GET | `/api/v1/telemetry` | Telemetry | Yes |

---

## 25. Related Documentation

```text
README.md
architecture.md
api.md
```

- `README.md` – Project overview, setup and features.
- `architecture.md` – System architecture and internal design.
- `api.md` – REST API reference.

---

## 👩‍💻 Author

**Kaveri Kadu**

MERN Stack Developer | React | Node.js | MongoDB
