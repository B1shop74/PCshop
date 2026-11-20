# PCshop

A full-stack e-commerce demo application for browsing and searching PC components and pre-built computers.

**Live Demo:** https://pcshopweb.vercel.app

## Overview

PCshop is a web-based computer hardware store built with Python, FastAPI, HTML, CSS, and JavaScript.

The application provides a product catalog with search and category filtering, popular product listings, and a basic authentication system.

## Features

- **Product Catalog** — browse PC components and pre-built computers.
- **Product Search** — search products by name or description.
- **Category Filtering** — filter products by hardware category.
- **Popular Products** — display products sorted by sales count.
- **User Authentication** — login, logout, and session verification.
- **Session Management** — HTTP-only session cookies.

## Technologies

**Backend**
- Python
- FastAPI
- Pydantic
- Uvicorn

**Frontend**
- HTML5
- CSS3
- JavaScript

**Deployment**
- Vercel (Frontend)

## Project Structure

```text
PCshop/
├── Backend/
│   └── PCshop1_Backend.py
│
├── Frontend/
│   ├── index.html
│   ├── PCshop1_Frontend.css
│   ├── PCshop1_Frontend.js
│   ├── PCshop2_Frontend.html
│   ├── PCshop2_Frontend.css
│   ├── PCshop2_Frontend.js
│   ├── PCshop_login.js
│   └── package.json
│
├── .gitignore
└── vercel.json
```

## Backend Setup

Clone the repository:

```bash
git clone https://github.com/B1shop74/PCshop.git
cd PCshop
```

Create and activate a virtual environment:

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
```

On Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install fastapi uvicorn
```

Start the backend:

```bash
uvicorn PCshop1_Backend:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/product/popular` | Get popular products |
| GET | `/api/product/search` | Search and filter products |
| POST | `/api/login` | Authenticate a user |
| POST | `/api/logout` | End the current session |
| GET | `/api/me` | Get current session user |

## Deployment

The frontend is deployed using Vercel. The Vercel configuration specifies `Frontend` as the output directory.

The backend runs separately and provides the API used by the frontend.

## Current Limitations

This project is a demonstration application, not a production-ready e-commerce platform.

- Product data is currently stored in a Python list rather than a database.
- User accounts are defined directly in the backend source code.
- Sessions are stored in memory and are not persistent.
- Password hashing currently uses SHA-256 and requires a stronger password-hashing solution before production use.

## Author

**B1shop74**

GitHub: https://github.com/B1shop74
