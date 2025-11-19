# Trello Clone Backend

This is the backend API for a Trello Clone application, built with Node.js, Express, TypeScript, MongoDB, and Redis. It supports real-time updates via Socket.io and background job processing for emails.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Real-time Events](#real-time-events)
- [Project Structure](#project-structure)

## Features

- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Board Management**: Create, read, update, and delete boards.
- **List Management**: Manage lists within boards.
- **Card Management**: Create cards, assign users, move cards between lists.
- **Real-time Updates**: Socket.io integration for instant board updates.
- **Background Jobs**: Email notifications processed via BullMQ and Redis.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **Caching & Queues**: Redis (ioredis, BullMQ)
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/) (Running locally on default port 6379)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd trello-clone-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=5656
MONGO_URI=mongodb://localhost:27017/trello-clone # Or your MongoDB connection string
JWT_SECRET=your_super_secret_key
```

*Note: Redis is configured to connect to `127.0.0.1:6379` by default in `src/queus/emailQueue.ts`.*

## Running the Application

### Development Mode

Run the server with `nodemon` for hot-reloading:

```bash
npm run dev
```

The server will start on `http://localhost:5656` (or your specified PORT).

### Production Build

1.  Compile TypeScript to JavaScript:
    ```bash
    npm run build
    ```

2.  Start the production server:
    ```bash
    npm start
    ```

## API Endpoints

### Auth (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Login and receive a JWT.

### Boards (`/api/boards`)
- `GET /`: Get all boards for the user.
- `POST /`: Create a new board.
- `GET /:id`: Get a specific board.
- `PUT /:id`: Update a board.
- `DELETE /:id`: Delete a board.

### Lists (`/api/lists`)
- `POST /`: Create a new list.
- `PUT /:id`: Update a list.
- `DELETE /:id`: Delete a list.

### Cards (`/api/cards`)
- `POST /`: Create a new card.
- `PUT /:id`: Update a card (move, assign users, etc.).
- `DELETE /:id`: Delete a card.

## Real-time Events

The server listens for the following Socket.io events:

- `connection`: Client connected.
- `joinBoard`: Client joins a board room (Payload: `boardId`).
- `leaveBoard`: Client leaves a board room (Payload: `boardId`).
- `disconnect`: Client disconnected.

## Project Structure

```
src/
├── models/         # Mongoose models (User, Board, List, Card)
├── routes/         # Express route handlers
├── queus/          # Background job queues (EmailQueue)
├── index.ts        # Application entry point
└── ...
```
