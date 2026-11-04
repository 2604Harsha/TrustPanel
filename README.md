 
# Trust Panel – Authentication System & Admin Dashboard

Trust Panel is a web-based authentication and user management system designed to provide secure user access and centralized administration. It includes user authentication, password management, role-based access, and an admin dashboard for managing users and monitoring system activity.

##  Features

### Authentication
- User registration
- User login and logout
- Secure password hashing using bcrypt
- JWT-based authentication
- Forgot password functionality
- Reset password functionality
- Protected routes
- Session management

### Admin Dashboard
- Admin dashboard overview
- View registered users
- Add and manage users
- Update user details
- Delete users
- Manage user roles and account status
- View system activities
- Monitor user information

### User Dashboard
- User dashboard overview
- View profile information
- Update profile details
- Change password
- View account information
- Access account settings

### UI & Experience
- Responsive design
- Modern user interface
- Glassmorphism-inspired design
- Dark and light theme support
- Interactive dashboard navigation
- Form validation and notifications

##  Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend framework and REST APIs |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcrypt | Password hashing |
| Nodemailer | Email communication |

## Project Structure

```text
Trust-Panel/
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── user-dashboard.html
│   ├── profile.html
│   ├── settings.html
│   ├── users.html
│   ├── activity.html
│   ├── security.html
│   │
│   ├── css/
│   │   ├── main.css
│   │   ├── dashboard.css
│   │   ├── components.css
│   │   └── responsive.css
│   │
│   └── js/
│       ├── config.js
│       ├── common.js
│       ├── auth.js
│       ├── user-dashboard.js
│       ├── admin-dashboard.js
│       └── users.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Activity.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/
│   │   └── createAdmin.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*Note: Adjust the folder structure above to match the files actually present in your project.*

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

### 2. Navigate to the Project

```bash
cd Trust-Panel
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://127.0.0.1:5501

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

Replace the example values with your own credentials. Never commit `.env` to GitHub.

### 5. Start the Backend Server

```bash
npm start
```

For development:

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5000
```

### 6. Run the Frontend

From the project root, run:

```bash
py -m http.server 5501 --directory frontend --bind 127.0.0.1
```

Open the application:

```text
http://127.0.0.1:5501
```

## Security

Trust Panel incorporates security practices such as:

- Password hashing with bcrypt.
- JWT-based authentication.
- Protected backend routes.
- Role-based authorization.
- Environment variables for sensitive configuration.
- Input validation.
- Restricted access to administrative features.

## Database

The project uses MongoDB Atlas as its cloud database.

The database stores information such as:

- User accounts
- Hashed passwords
- User roles
- Account status
- Profile information
- Activity records

## Backend API Modules

| Module | Base Route | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Register, login, logout and password operations |
| Users | `/api/users` | User profile and account management |
| Dashboard | `/api/dashboard` | Dashboard information |
| Admin | `/api/admin` | Administrative operations |

Refer to the backend route files for the exact available endpoints.

##  Project Objectives

- Build a secure authentication system.
- Implement user and admin role management.
- Connect frontend and backend applications.
- Store and manage user information using MongoDB Atlas.
- Develop a responsive admin dashboard.
- Apply authentication and authorization concepts in a real-world web application.

##  Future Enhancements

- Two-factor authentication (2FA).
- Email verification.
- Login history and device tracking.
- Advanced activity monitoring.
- Dashboard analytics and reports.
- Enhanced security alerts.

## Author

**Harsha Vardhan Naidu**


## License

This project is developed for learning and demonstration purposes.