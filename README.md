# Smart Grocery Management System – Product Management Module

## Overview

The **Product Management Module** is a core component of the **Smart Grocery Management System**, designed to support small grocery stores in managing product information efficiently and maintaining organized product records.

This module provides centralized product data management used across inventory operations, sales processes, reporting functionalities, and future expiry risk analysis workflows.

The system focuses on improving product organization, reducing manual management effort, and supporting better inventory handling for grocery store operations.

---

## Features

### Product Master Data Registry (CRUD)
- Register products with essential fields: Name, Main Category, Sub Category, Supplier, Cost Price, Selling Price, Image (URL or file upload), and Reorder Level.
- Maintain accurate records for every grocery item.

### Archive Obsolete Products
- Temporary archiving of discontinued, seasonal, or out-of-stock items instead of permanent deletion.
- Restoring archived products back to the active catalog with a single click.

### AI Expiry Risk prediction evaluation UI
- Custom evaluation UI section in the product details page showing Expiry risk level (High Risk, Medium Risk, Low Risk), recommended action (e.g. discount recommendation), and risk probability percentage based on stock and sales details.

---

## Technical Stack

- **Frontend**: React (Vite), React Router DOM, Vanilla CSS customized styling, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose (ODM).

---

## Folder Structure

```bash
product-management/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI widgets
│   │   ├── pages/           # Routed page components
│   │   └── constants.js     # Shared dropdown options & validators
├── server/          # Node.js backend
│   ├── controllers/ # Request handler functions
│   ├── models/      # MongoDB Schema models
│   └── routes/      # Express endpoint routes
```

---

## Getting Started

### 1. Backend Server Setup
1. Go to the `server/` directory:
   ```bash
   cd server
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env` (e.g., `PORT=5000`, `MONGO_URI`).
4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend client Setup
1. Go to the `client/` directory:
   ```bash
   cd client
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:3000`.

---

## Academic Metadata

- **Module Name**: Product Management
- **GitHub Repository**: [Smart-Grocery-Management-System-Product-Management-Module](https://github.com/RashmiDeSilva/Smart-Grocery-Management-System-Product-Management-Module.git)
