# 🐞 BugBoard – Bug & Issue Tracking System

BugBoard is a full-stack web application for managing software bugs and issues across development and testing teams.

It provides a centralized platform to create, assign, track, discuss, prioritize and analyze software defects. The application includes role-based access, project management, Kanban workflow, analytics, notifications, file attachments and AI-assisted bug analysis.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Access and refresh token support
- Role-based access control
- Password reset flow
- Protected routes
- Roles:
  - Admin
  - Developer
  - Tester

### 📌 Issue Management
- Create, view and update issues
- Assign issues to developers
- Track issue status
- Set severity and priority
- Add labels
- Add reproduction steps
- Add expected and actual results
- Track browser, operating system and environment details
- Issue-specific comments and activity history
- File attachment support

### 📊 Issue Workflow

Issues can move through the following workflow:

`Open → In Progress → Testing → Resolved → Closed`

Issues can also be reopened when required.

### 📋 Kanban Board
- Visualize issues by status
- Drag-and-drop issue cards
- Track work through different workflow stages

### 🏢 Project Management
- Create and manage projects
- Project keys for issue identification
- Add project leads and members
- Associate issues with projects

Example issue key:

```text
PAY-1
AUTH-3
CORE-5
```

### 🤖 AI-Assisted Bug Analysis
BugBoard integrates Google Gemini for AI-assisted issue analysis.

The AI assistant can provide suggestions such as:
- Bug summary
- Severity
- Priority
- Labels
- Possible root causes
- Debugging steps
- Test cases

A fallback analysis flow is available when the external AI service is not configured or unavailable.

### 📈 Analytics
The application includes analytics and dashboard views for:
- Issue status distribution
- Issue trends
- Developer workload
- Severity distribution
- Project-level information

Charts are implemented using Chart.js.

### 🔔 Notifications
- In-app notifications
- Issue assignment notifications
- Email notification support through Nodemailer

### 🛡️ Security
- Password hashing using bcryptjs
- JWT authentication
- Role-based authorization
- Joi request validation
- Helmet security middleware
- CORS configuration
- Rate limiting
- Centralized error handling

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Axios
- Tailwind CSS
- Vite
- Chart.js
- react-chartjs-2
- @hello-pangea/dnd
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Joi
- Helmet
- Express Rate Limit
- Multer
- Nodemailer
- Cloudinary

### AI
- Google Gemini API via `@google/genai`

---

## 🏗️ Project Architecture

```text
BugBoard
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── seeds/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── public/
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Main Database Models

The backend uses MongoDB with Mongoose.

Main models include:

- `User`
- `Project`
- `Issue`
- `Comment`
- `Notification`
- `ActivityLog`
- `Token`

### Issue

An issue contains information such as:

```text
Issue Key
Title
Description
Status
Severity
Priority
Project
Reporter
Assignee
Labels
Steps to Reproduce
Expected Result
Actual Result
Environment Details
Attachments
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB

You can use either a local MongoDB instance or MongoDB Atlas.

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bugboard
```

---

## 2. Configure Backend

Go to the server directory:

```bash
cd server
npm install
```

Create a `.env` file based on `server/.env.example`.

Example:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/bugboard
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional
GEMINI_API_KEY=

# Optional email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@bugboard.dev
```

> ⚠️ Never commit your real `.env` file, API keys, database credentials or JWT secrets to GitHub.

---

## 3. Configure Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 4. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## 5. Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🌱 Seed Demo Data

The backend contains seed scripts for creating sample users, projects and issues.

From the `server` directory:

```bash
npm run seed
```

This creates sample data for development/testing.

---

## 👥 Demo Roles

The seed data includes example accounts for different application roles.

| Role | Example Email |
|------|---------------|
| Admin | `admin@bugboard.dev` |
| Developer | `developer@bugboard.dev` |
| Tester | `tester@bugboard.dev` |

> Passwords should be configured according to the current seed/authentication implementation. Do not publish real credentials or production secrets in a public repository.

---

## 🔌 API Structure

The backend exposes REST API routes under:

```text
/api/v1
```

Main API areas include:

```text
/api/v1/auth
/api/v1/issues
/api/v1/projects
/api/v1/users
/api/v1/comments
/api/v1/activities
/api/v1/notifications
/api/v1/analytics
/api/v1/telemetry
/api/v1/upload
```

Health check:

```text
GET /health
```

---

## 🔄 Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ Axios / REST API
  ▼
Express.js Backend
  │
  ├── Authentication & Authorization
  ├── Validation
  ├── Business Logic
  ├── Issue Workflow
  ├── Notifications
  └── AI Services
  │
  ▼
MongoDB
```

---

## 🤖 AI Bug Analysis Flow

```text
Bug Title + Description
          │
          ▼
     AI Service
          │
          ▼
   Google Gemini API
          │
          ▼
Suggested Analysis
          │
 ┌────────┼─────────┐
 ▼        ▼         ▼
Severity Priority  Labels
          │
          ▼
 Root Cause / Debugging
          │
          ▼
      Test Cases
```

If the Gemini API key is not configured, the application can use its fallback analysis behavior instead of depending completely on the external service.

---

## 📊 Dashboard

BugBoard provides different dashboards depending on the user's role.

### Admin Dashboard
- User management
- Project information
- System activity/audit information
- Overall analytics

### Developer Dashboard
- Assigned issues
- Issue status
- Workload information
- Project activity

### Tester Dashboard
- Reported issues
- Testing workflow
- Issue tracking
- Defect information

---

## 🧪 Development

Frontend build:

```bash
cd client
npm run build
```

Frontend preview:

```bash
npm run preview
```

Backend production start:

```bash
cd server
npm start
```

---

## 🔒 Environment Variables

Do not commit these files:

```text
.env
server/.env
client/.env
```

Use the provided example files instead:

```text
.env.example
server/.env.example
client/.env.example
```

---

## 📁 Important Backend Layers

The backend follows a modular structure:

```text
routes
   ↓
controllers
   ↓
services
   ↓
models
   ↓
MongoDB
```

Supporting middleware handles:

- Authentication
- Role authorization
- Project membership
- Validation
- Rate limiting
- File uploads
- Error handling

---

## 🎯 Project Objective

The main objective of BugBoard is to provide a centralized and user-friendly platform for software teams to manage the complete defect lifecycle.

The system helps teams:

- Report bugs efficiently
- Assign issues to responsible developers
- Prioritize and classify defects
- Track progress
- Collaborate through comments
- Monitor project activity
- Visualize work using Kanban
- Analyze defect data
- Use AI-assisted suggestions for faster triage

---

## 🔮 Future Enhancements

Possible future improvements include:

- Real-time notifications using WebSockets
- Advanced reporting and export functionality
- More integrations with GitHub/Jira
- Automated test integration
- Enhanced duplicate issue detection
- More granular project permissions
- CI/CD deployment pipelines
- Production cloud deployment

---

## 👩‍💻 Author

**Kaveri Kadu**

MERN Stack Developer | React | Node.js | MongoDB | Express.js 

---

## 📄 License

This project was developed as a software project/assignment for learning and evaluation purposes.
