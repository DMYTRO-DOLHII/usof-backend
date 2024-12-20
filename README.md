# McOk (USOF Backend Project) 

This is the backend of the USOF (User Stack Overflow) project, a question-and-answer service for programmers. It’s built using Node.js, PostgreSQL, and Sequelize, following the MVC pattern, OOP paradigm, and SOLID principles. This README will guide you through the installation process, setup, and running of the project.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
  - [Step 1: Install Node.js and npm](#step-1-install-nodejs-and-npm)
  - [Step 2: Install PostgreSQL](#step-2-install-postgresql)
  - [Step 3: Clone the Repository](#step-3-clone-the-repository)
  - [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
  - [Step 5: Install Dependencies](#step-5-install-dependencies)
  - [Step 6: Set Up the Database](#step-6-set-up-the-database)
  - [Step 7: Run the Project](#step-7-run-the-project)


## Requirements

Before starting, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher) & npm
- **PostgreSQL** (v12 or higher)
- **Git** (to clone the repository)

## Installation

### Step 1: Install Node.js and npm

If you don’t have Node.js and npm installed, follow the instructions on the [official Node.js website](https://nodejs.org/en/) to install the latest LTS version. npm is included with Node.js.

You can verify the installation by running:

```bash
node -v
npm -v
```

### Step 2: Install PostgreSQL
Follow the instructions on the PostgreSQL website to install PostgreSQL.

Once installed, verify the installation by running:

```bash
psql --version
```

### Step 3: Clone the Repository
Clone this repository to your local machine using Git:

```bash
git clone https://github.com/DMYTRO-DOLHII/usof-backend
```

Navigate to the project directory:

```bash
cd usof-backend
```

### Step 4: Configure Environment Variables
Create a .env file in the root of the project and set up the following required environment variables:

```ini
# .env file example
DB_HOST=localhost
DB_DIALECT=postgres
DB_PORT=5432

DB_ADMIN_DB=postgres
DB_ADMIN_USER=postgres
DB_ADMIN_PASSWORD=12345678

DB_NAME=usof-backend
DB_USER=test-usof-user
DB_PASSWORD=test

EMAIL_USER=dolgiy.dmitriyp@gmail.com
EMAIL_PASS=hnml epmi cyzg qewr

FRONT_URL=http://localhost:8080
SECRET_KEY=your_jwt_secret_key
TOKEN_EXPIRES=1h

```

> **DB_HOST**: The host of your PostgreSQL server (usually `localhost`).
> 
> **DB_USER**: Your PostgreSQL username (default is `postgres`).
> 
> **DB_PASSWORD**: Your PostgreSQL password.
> 
> **DB_NAME**: The name of the database for the project (e.g., `usof_db`).
> 
> **DB_PORT**: The port for PostgreSQL (default is `5432`).
> 
> **PORT**: The port where the Node.js server will run (e.g., `3000`).
> 
> **JWT_SECRET**: A secret key for signing JWT tokens.

### Step 5: Install Dependencies
Install all the project dependencies using npm:

```bash
npm install
```

### Step 6: Set Up the Database
Before starting the project, you need to create the database in PostgreSQL:

**Create the database:**

```bash
npm run db:create
```

This will create a new database based on the configuration from your .env file.

**This will drop the database:**
```bash
npm run db:drop
```

**This will create test records in all the tables with relationships:**
```bash
npm run db:fill
```

### Step 7: Run the Project
After setting up the database, you can start the project in development mode by running:

```bash
npm run dev
```

This will start the Node.js server with automatic reloading enabled (using nodemon). The server will be running at http://localhost:3000/ by default.
