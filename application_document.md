# VNR Parking Pilot Application Documentation

## 1. What is the Application?

The VNR Parking Pilot is a comprehensive web-based vehicle registration and management system designed specifically for VNR Vignana Jyothi Institute of Engineering and Technology (VNR VJIET). It serves as a digital platform for students, faculty, and staff to register their vehicles (cars, bikes, and electric vehicles) for campus parking management. The application provides a user-friendly interface for vehicle registration, user authentication, and administrative oversight, ensuring efficient parking management within the educational institution.

## 2. Who are the Beneficiaries of this Application?

### Primary Beneficiaries:
- **Students**: Can register their vehicles for campus parking access
- **Faculty Members**: Can register vehicles for parking privileges
- **Staff Members**: Can manage vehicle registrations for parking purposes

### Secondary Beneficiaries:
- **Parking Administrators**: Can manage vehicle registrations, search records, and generate reports
- **Security Personnel**: Can verify vehicle registrations and access records
- **Campus Management**: Can track parking utilization and manage parking resources

## 3. How it Works?

### User Registration and Authentication:
1. Users register an account with username, email, and password
2. Users can have roles: 'user' (default) or 'admin'
3. JWT-based authentication system secures API endpoints

### Vehicle Registration Process:
1. Authenticated users can register vehicles through a web form
2. Required information includes:
   - Vehicle type (car, bike, or ev)
   - Vehicle number (unique identifier)
   - Owner name
   - Email address
   - Employee/Student ID
   - Optional: Model, Color, EV status
3. System validates data and prevents duplicate vehicle numbers
4. Confirmation email is sent upon successful registration

### Administrative Features:
1. Admin users can search vehicles by various criteria
2. View comprehensive statistics and reports
3. Export data in CSV or PDF formats
4. Manage user accounts and system settings

### Technical Architecture:
- **Frontend**: React-based SPA with TypeScript, using Vite for build tooling
- **Backend**: Node.js/Express API server
- **Database**: SQLite for data persistence
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email Service**: Nodemailer for notifications
- **UI Framework**: Tailwind CSS with shadcn/ui components

## 4. Uses or Advantages of the Application

### Operational Advantages:
- **Streamlined Registration**: Quick and easy vehicle registration process
- **Digital Records**: Eliminates paper-based registration systems
- **Real-time Access**: Instant access to vehicle information for verification
- **Automated Notifications**: Email confirmations for successful registrations

### Administrative Advantages:
- **Comprehensive Search**: Advanced search capabilities for vehicle lookup
- **Data Export**: Multiple export formats (CSV, PDF) for reporting
- **Statistics Dashboard**: Real-time insights into parking utilization
- **User Management**: Role-based access control for different user types

### Security Advantages:
- **Secure Authentication**: JWT-based secure login system
- **Data Validation**: Comprehensive input validation and sanitization
- **Access Control**: Role-based permissions (user vs admin)
- **Audit Trail**: Timestamped records for all operations

### Environmental Advantages:
- **EV Support**: Special tracking for electric vehicles
- **Digital Process**: Reduces paper usage and administrative overhead
- **Efficient Parking**: Better parking space utilization through organized management

## 5. What Data is Stored and How the Data is Stored?

### Database Schema:
The application uses SQLite database with the following tables:

#### Users Table:
- `id` (Primary Key, Auto-increment)
- `username` (Unique, Text)
- `email` (Unique, Text)
- `password` (Hashed, Text)
- `role` (Text: 'user' or 'admin')
- `created_at` (Timestamp)

#### Vehicles Table:
- `id` (Primary Key, Auto-increment)
- `vehicle_type` (Text: 'car', 'bike', or 'ev')
- `vehicle_number` (Unique, Text)
- `model` (Optional, Text)
- `color` (Optional, Text)
- `is_ev` (Boolean)
- `owner_name` (Text)
- `email` (Text)
- `employee_student_id` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Data Storage Method:
- **Database**: SQLite file-based database (`database.sqlite`)
- **Location**: Stored in the `backend/` directory
- **Initialization**: Database tables are created automatically on server startup
- **Backup**: SQLite file can be backed up and restored as needed

### Data Security:
- **Passwords**: Stored as bcrypt hashes (10 salt rounds)
- **Authentication**: JWT tokens with 7-day expiration
- **Input Validation**: All inputs validated using express-validator
- **SQL Injection Protection**: Parameterized queries prevent SQL injection

## 6. Additional Technical Details

### API Endpoints:
- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- **Vehicles**: `/api/vehicles` (CRUD operations), `/api/vehicles/search`, `/api/vehicles/stats`
- **Exports**: `/api/exports/vehicles/csv`, `/api/exports/vehicles/pdf`, `/api/exports/stats`

### Technologies Used:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query
- **Backend**: Node.js, Express.js, SQLite3, JWT, bcrypt, nodemailer
- **Development**: ESLint, concurrently for development

### Deployment:
- **Frontend**: Can be deployed to static hosting (Vercel, Netlify)
- **Backend**: Requires Node.js server hosting
- **Database**: SQLite file-based (suitable for development/small-scale production)

### Future Enhancements:
- Integration with campus ID systems
- Mobile app development
- Real-time parking space availability
- Integration with payment systems for parking fees
- Advanced analytics and reporting features
