# Overview

This is a professional car audio website called "30HERTZ" built with a modern full-stack architecture. The application serves as a comprehensive resource for car audio enthusiasts, providing advanced audio calculators, expert articles, and professional tools for designing and optimizing car audio systems. The platform features an admin panel for content management and includes sophisticated audio calculation tools for box design, cable sizing, speaker wiring, port dimensions, fuse ratings, and sine wave generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state management and API caching
- **Styling**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **Component Structure**: Modular design with separate directories for UI components, feature-specific components, and page components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database Layer**: Drizzle ORM with PostgreSQL using Neon serverless database
- **Authentication**: Session-based authentication with bcryptjs for password hashing
- **Security**: Helmet for security headers, rate limiting for API protection, and CORS handling
- **API Design**: RESTful API structure with organized route handlers

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon (serverless PostgreSQL)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Schema Design**: 
  - Admin users table for authentication
  - Articles table with categorization and publishing status
  - Site statistics tracking for analytics
  - Ad blocks table for managing advertisements
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Authentication and Authorization
- **Admin Authentication**: Session-based authentication system
- **Password Security**: bcryptjs for secure password hashing
- **Rate Limiting**: Express rate limiting to prevent brute force attacks
- **Session Management**: Secure session handling with database persistence
- **Role-Based Access**: Admin-only routes protected with middleware

## External Dependencies
- **Database**: Neon PostgreSQL (serverless PostgreSQL platform)
- **UI Components**: Radix UI primitives for accessible component foundations
- **Fonts**: Google Fonts integration (Poppins, DM Sans, Fira Code, Geist Mono)
- **Build Tools**: Vite for development and build processes with Replit-specific plugins
- **Audio Processing**: Web Audio API for sine wave generation and audio testing tools