<h1 align="center">Authify</h1>
<p align="center">🚀 A clean and extendable FastAPI-based authentication system</p>
<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/ORM-Tortoise-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-SQLite-green?style=flat-square&logo=sqlite" />
  <img src="https://img.shields.io/badge/Validated-Pydantic-orange?style=flat-square&logo=pydantic" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/github/workflow/status/yogesh-xcode/authify/tests?label=tests" />
</p>

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
   - [Clone the Repository](#clone-the-repository)
   - [Install Poetry](#install-poetry)
   - [Install Dependencies](#install-dependencies)
   - [Run the Development Server](#run-the-development-server)
5. [Project Structure](#project-structure)
6. [Configuration](#configuration)
   - [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Testing](#testing)
9. [Roadmap](#roadmap)
10. [Security Considerations](#security-considerations)
11. [Deployment](#deployment)
12. [License and Contribution](#license-and-contribution)

---

## Introduction

Authify is a FastAPI-based authentication system designed to be simple, extendable, and secure. It provides essential authentication features like user registration, login, and input validation, along with auto-generated API documentation. Built using FastAPI and Tortoise ORM, it’s optimized for high performance and ease of scaling.

---

## Features

- ✅ Register with username, email & password
- ✅ Login with email & password
- ⚙️ FastAPI + Tortoise ORM architecture
- 🔐 Input validation with Pydantic
- ⚡ Auto-generated API Docs with Swagger and ReDoc
- 🔜 Coming Soon:
  - Email Verification
  - Social Logins (Google, GitHub)
  - JWT Authentication & Refresh Tokens
  - Role-Based Access Control (RBAC)

---

## Tech Stack

| Tool                                                   | Description                             |
| ------------------------------------------------------ | --------------------------------------- |
| [FastAPI](https://fastapi.tiangolo.com)                | High-performance Python API framework   |
| [Pydantic](https://docs.pydantic.dev)                  | Type validation using Python type hints |
| [Tortoise ORM](https://tortoise-orm.readthedocs.io)    | Async ORM for Python                    |
| [SQLite](https://www.sqlite.org)                       | Lightweight SQL database                |
| [Poetry](https://python-poetry.org)                    | Dependency management                   |
| [FastAPI CLI](https://github.com/dmontagu/fastapi-cli) | Development server runner               |

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yogesh-xcode/authify.git
```

### Open the Project

```
cd authify
```

### Install Poetry

If you don't have Poetry installed, use the following command:

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

> After installation, restart your shell or add Poetry to your path if needed.

### Install Dependencies

```bash
poetry install
```

### Run the Development Server

```bash
poetry run fastapi dev app/main.py
```

---

> Optional: Add that fastapi[all] includes the dev command

## Project Structure

```bash
.
├── app
│   ├── __init__.py
│   ├── config
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── lifecycle.py
│   ├── core
│   │   ├── __init__.py
│   │   └── crypto
│   │       ├── __init__.py
│   │       └── hashing.py
│   ├── main.py
│   ├── middlewares
│   │   └── __init__.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── auth_model.py
│   │   ├── response_model.py
│   │   └── type_model.py
│   ├── routes
│   │   ├── __init__.py
│   │   └── auth_routes.py
│   ├── schemas
│   │   ├── __init__.py
│   │   └── auth_schemas.py
│   ├── services
│   │   ├── __init__.py
│   │   └── auth_service.py
│   ├── tests
│   │   ├── auth
│   │   │   ├── test_login.py
│   │   │   └── test_register.py
│   │   └── models
│   │       ├── __init__.py
│   │       └── validate_error_model.py
│   └── storage
│       ├── __init__.py
│       └── user.sqlite
├── changelog.md
├── poetry.lock
└── pyproject.toml

```

---

## Configuration

### Environment Variables

Create a `.env` file and add the required variables:

```env
DATABASE_URL=sqlite://db.sqlite3
SECRET_KEY=your_super_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## API Endpoints

| Method | Endpoint  | Description     |
| ------ | --------- | --------------- |
| POST   | /register | Register a user |
| POST   | /login    | Login a user    |
| GET    | /docs     | Swagger UI      |
| GET    | /redoc    | ReDoc UI        |

**Example:**

- endpoint /register

```json
POST /register
Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "your_secure_password"
}
Response:
{
  "message": "User successfully registered"
}
HTTP Status: 201 Created
```

- endpoint /login

```json
POST /login
Request Body:
{
  "email": "john@example.com",
  "password": "your_secure_password"
}
Response:
{
  "message": "User successfully logged"
}
HTTP Status: 202 Accepted
```

---

## Testing

You can run the tests using `pytest`:

```bash
poetry run pytest -v
```

---

## Roadmap

### 🚀 Planned Features:

- Implement Email Verification
- Integrate Social Logins (Google, GitHub)
- Implement JWT Authentication & Refresh Tokens
- Add Role-Based Access Control (RBAC)

---

## Security Considerations

### Password Hashing

Passwords are hashed using a secure hashing algorithm (`bcrypt` or similar), ensuring that they are not stored in plaintext.

---

## Deployment

### export poetry packages to requirements.txt

```bash
poetry export --without-hashes --dev --format=requirements.txt > requirements.txt
```

### build the docker container

```
docker build -t authify .
```

### run the docker container

```
docker build -p 8080:8080 authify
```

---

## License and Contribution

Authify is licensed under the [MIT License](./LICENSE). Contributions are welcome! Please fork the repository and submit a pull request. For major changes, open an issue to discuss.

## 🤝 Contribution Guidelines

- Fork the repository and create your branch (`git checkout -b feature/feature-name`).
- Ensure tests are included for any new features or bug fixes.
- Submit a pull request with a clear description of the changes.

---
