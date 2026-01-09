# RBAC SaaS Monorepo

A modern **full-stack SaaS monorepo** focused on **authentication, authorization, and Role-Based Access Control (RBAC)**.

This project provides a scalable foundation for multi-role applications, supporting granular permissions across different roles such as **Admin**, **Member**, and **Billing**.

It is built with **Node.js**, **Fastify**, **Next.js-ready architecture**, **Drizzle ORM**, **PostgreSQL**, and **CASL** for authorization.

---

## ✨ Features

- Monorepo architecture
- Full-stack RBAC with granular permissions
- Authentication & authorization ready
- Role and permission management using CASL
- API built with Fastify
- Database layer with Drizzle ORM
- PostgreSQL via Docker Compose
- Shared configuration (ESLint, Prettier, TypeScript)
- Modular and extensible package structure

---

## 🗂️ Repository Structure

```bash
.
├── apps/
│   └── api/              # Backend API (Fastify)
│       ├── src/
│       ├── drizzle/
│       ├── docker-compose.yml
│       └── package.json
│
├── config/               # Shared configurations
│   ├── eslint/
│   ├── prettier/
│   └── typescript/
│
├── packages/
│   └── auth/             # Authorization & RBAC package (CASL)
│       ├── src/
│       └── package.json
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 📦 Apps

### `apps/api`

The backend API responsible for authentication, authorization, and business logic.

**Tech stack:**

- Node.js
- Fastify
- Drizzle ORM
- PostgreSQL
- Docker Compose

**Responsibilities:**

- User authentication
- Role and permission enforcement
- API endpoints
- Database access

To start the database locally:

```bash
docker-compose up -d
```

---

## ⚙️ Config

### `config/`

Centralized configuration shared across the monorepo.

Includes:

- ESLint rules
- Prettier formatting
- TypeScript base configs

This ensures **consistent code style and type safety** across all apps and packages.

---

## 📦 Packages

### `packages/auth`

A reusable **authorization package** responsible for defining and checking permissions.

**Tech stack:**

- CASL
- TypeScript

**Responsibilities:**

- Define abilities per role
- Check permissions and access rules
- Share authorization logic between apps

This package can be consumed by both backend and frontend applications.

---

## 🔐 RBAC Model

The system is designed around roles such as:

- **Admin** – full access
- **Member** – limited access to resources
- **Billing** – billing and subscription-related permissions

Permissions are enforced using **CASL abilities**, allowing fine-grained control over actions and resources.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PNPM
- Docker & Docker Compose

### Install dependencies

```bash
pnpm install
```

### Run the database

```bash
cd apps/api
docker-compose up -d
```

### Start the API

```bash
pnpm --filter api dev
```

---

## 🧱 Monorepo Tooling

- **PNPM Workspaces** for dependency management
- Shared configs via `config/`
- Isolated apps and packages

---

## 🧠 Inspiration

This project is intended to serve as a **production-ready RBAC SaaS foundation**, suitable for real-world applications and learning purposes.
