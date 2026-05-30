# 💬 ChatWave — Real-Time Chat Application

A full-stack real-time chat application built with Socket.io, Node.js, MongoDB, and React.js. Anyone can register and start chatting instantly.

## 🌐 Live Demo
👉 [https://chatwave-io.netlify.app](https://chatwave-io.netlify.app)


## ✨ Features
- Real-time messaging via Socket.io WebSockets
- JWT authentication with bcrypt password encryption
- Online/Offline presence detection
- Search users and start conversations instantly
- Persistent message history in MongoDB
- Beautiful glassmorphism UI with gradient design
- Fully deployed — backend on Render, frontend on Netlify

## 🏗️ Architecture

User A → React Frontend → Node.js Backend → MongoDB
↕ Socket.io
User B → React Frontend ← Node.js Backend

## ⚙️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Socket.io-client |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Deploy | Netlify + Render |

## 🚀 Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT |
| GET | /api/users/search?q= | Search users |
| POST | /api/chats | Create/get chat |
| GET | /api/chats | Get all chats |
| POST | /api/messages | Send message |
| GET | /api/messages/:chatId | Get messages |

## 👤 Author
**Satyam Upadhyay** — [GitHub](https://github.com/Satyam-here15/ChatWave)