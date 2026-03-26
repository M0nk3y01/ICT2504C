# TEAMWORK CONTRIBUTION

This project was developed collaboratively by two team members.  
Responsibilities were divided according to the assigned system components in the project brief.

## Theron – Employee Onboarding, Authentication & Profile Management

Responsibilities:

- Designed and implemented user authentication system using JWT
- Implemented refresh token rotation (short-lived access + long-lived refresh tokens)
- Developed login system with brute-force protection and account lockout
- Implemented admin account creation for employees (Employee / Manager / Admin roles)
- Built password management features:
  - Change password (with old password verification)
  - Reset password with expiry mechanism
- Implemented role-based access control (RBAC)
- Developed employee profile management:
  - View profile
  - Update personal details
- Implemented admin ability to unlock locked accounts
- Implemented audit logging for:
  - Login attempts
  - Password changes
  - Account status changes
- Designed and implemented database models for user-related components

---

## Kai Lin – Leave Management System

Responsibilities:

- Designed and implemented leave application system:
  - Annual leave and sick leave
  - Start date and end date validation
  - Optional reason input
- Implemented leave validation rules:
  - No past-date leave applications
  - No overlapping leave requests
  - End date must be after start date
- Developed leave status workflow:
  - Pending / Approved / Rejected
- Implemented leave approval system:
  - Managers approve/reject direct reports
  - Admin can approve/reject all leave requests
- Built leave history tracking for employees
- Implemented leave balance tracking:
  - Annual quota
  - Used leave
  - Remaining leave
- Implemented weekend exclusion from leave calculation
- Implemented public holiday exclusion using configurable holiday database
- Implemented half-day leave functionality (AM / PM = 0.5 days)
- Integrated leave system with database and backend APIs

## Collaboration

Both team members collaborated on:

- Overall system architecture design (frontend + backend integration)
- API integration between React frontend and Express backend
- Testing of system functionality and validation logic
- Debugging and fixing system errors
- UI improvements and user experience design
- Security feature testing (authentication, access control, account lockout)
- Documentation (README and TEAMWORK files)
- Preparation of final presentation and demo