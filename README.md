# Project Context

## Architecture Overview

This is a full-stack React application with a containerized microservices architecture:

- **Backend (factory/)**: Node.js/Express API with PostgreSQL database
- **Frontend (playground/)**: React + Vite with Tailwind CSS
- **Infrastructure**: Docker Compose orchestration

## Services

### Factory (Backend API)
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Lucia Auth with user sessions in `res.locals`
- **Architecture**: MVC pattern (controllers, middleware, routers)
- **Logging**: Structured logging with file output
- **Container**: Docker with multi-stage build

### Playground (Frontend)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS + DaisyUI components
- **Build Tool**: Vite with hot reload and fast refresh
- **Linting**: ESLint configuration
- **Container**: Development Docker setup

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)

### Development Setup
```bash
# Start all services
docker-compose up -d

# Or start individually:
cd factory && npm install && npm run dev
cd playground && npm install && npm run dev
```

### Database Setup
```bash
cd factory
# Run Prisma migrations
npm run prisma:migrate
# Generate Prisma client
npm run prisma:generate
```

## Project Structure

```
├── docker-compose.yaml          # Service orchestration
├── factory/                     # Backend API
│   ├── app.js                  # Express application entry
│   ├── auth/                   # Lucia auth configuration
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware
│   ├── routers/               # API route definitions
│   ├── prisma/                # Database schema & migrations
│   └── shared/                # Shared utilities
├── playground/                 # React frontend
│   ├── src/                   # React components & pages
│   ├── public/                # Static assets
│   └── vite.config.js         # Vite configuration
└── postgres_data/             # Database volume
```

## Development Workflow

1. **Backend Development**: Work in `factory/` directory
   - API endpoints in `controllers/`
   - Database models in `prisma/schema.prisma`
   - Lucia auth setup in `auth/`
   - User sessions accessible via `res.locals.user`

2. **Frontend Development**: Work in `playground/` directory
   - React components in `src/`
   - Styling with Tailwind + DaisyUI
   - Vite handles HMR and fast refresh

3. **Database Changes**:
   - Modify `prisma/schema.prisma`
   - Run `npm run prisma:migrate dev`
   - Generate new client: `npm run prisma:generate`

## Key Technologies

- **Backend**: Node.js, Express, Lucia Auth, Prisma, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, DaisyUI
- **Infrastructure**: Docker Compose, PostgreSQL
- **Development**: ESLint, HMR, structured logging

## Authentication Flow

- **Library**: Lucia Auth for session management
- **Pattern**: User data stored in `res.locals.user` for authenticated requests
- **Session**: Persistent sessions with PostgreSQL storage

## Styling System

- **Framework**: Tailwind CSS for utility-first styling
- **Components**: DaisyUI for pre-built component classes
- **Theme**: Configurable via DaisyUI themes
