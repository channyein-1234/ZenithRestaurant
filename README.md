# Restaurant QR Ordering System
A full-stack, QR-based restaurant ordering system that allows customers to
place orders directly from their table without queueing, while providing
real-time order management for admins and kitchen staff.

---

## Problem
Traditional restaurant ordering often causes long queues, delays, and manual
errors, especially during peak hours.

## Solution
This system enables customers to scan a QR code at their table, browse a
secured menu, place orders, and track order status. Orders are instantly
available to the kitchen and admin dashboards for efficient processing.

---

## Key Features

### Customer
- Scan QR code to access table-specific menu
- Secure table-based access (no login required)
- Add items to cart
- Confirm and place orders
- View order status in real time

### Admin
- Admin dashboard to manage menu items
- View active orders by table number
- Monitor total order amounts
- View order history with date-based filtering

### Kitchen
- Kitchen dashboard to view incoming orders
- See table number, ordered items, and totals
- Order status tracking

---

## Security & Authentication
- Table-based access secured using unique table tokens
- Secure routing to prevent unauthorized menu access
- Authentication and authorization handled via Supabase
- Users can only view menus after scanning a valid table QR code
- Protected routes for admin and kitchen dashboards

---

## Tech Stack
- Frontend: React
- Backend: React (Full-Stack Architecture)
- Database: Supabase
- Authentication: Supabase Auth
- Security:
  - Token-based table validation
  - Secure routing with protected routes
  - Role-based access (Admin / Kitchen)

---

## What are Implemented
- Designed QR-based table authentication system
- Implemented secure table-level access using tokens
- Built customer ordering flow with cart and order confirmation
- Developed admin dashboard for menu and order management
- Created kitchen interface for real-time order tracking
- Integrated Supabase for authentication, database, and security rules

---

## Challenges & Learnings
- Securing routes based on table tokens
- Preventing unauthorized menu access
- Managing real-time order updates
- Designing role-based dashboards within a single system
- Structuring database tables for orders, tables, and history

---

## Screenshots / Demo
(Add screenshots or demo link here)

---

## Future Improvements
- Payment gateway integration
- Real-time notifications for kitchen and customers
- Multi-restaurant support
- Analytics dashboard for sales insights

