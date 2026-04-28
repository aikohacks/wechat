# WeChat

A production-style real-time chat application built with Next.js 14, Node.js, Express, Socket.IO, MongoDB, and Tailwind CSS. It supports secure JWT authentication, direct and group messaging, media sharing, live presence, unread counts, typing indicators, and seen receipts in a single full-stack project structure.[1][2]

## Features

- JWT authentication with register and login flows using `bcryptjs` and `jsonwebtoken` for secure credential handling.[2]
- Persistent client sessions using local storage so users remain signed in across refreshes in the current browser.[3]
- Unified room system for direct messages and group chats backed by MongoDB models.[2][4]
- Real-time messaging with Socket.IO and JWT-based socket authentication middleware.[2]
- Unread message counts using a `ReadReceipt` model and per-room tracking logic.[2]
- Seen receipts using `seenBy` on messages and live `messageSeen` socket updates.[2]
- Initials-based color avatars for a lightweight identity system without mandatory profile images.
- File and image sharing through a Multer upload endpoint with support for `text`, `image`, and `file` message types.[2]
- Typing indicators, online user tracking, auto-scroll, date dividers, and polished sidebar metadata for a production-style messaging UX.[2][5]
- New chat modal for starting DMs or creating groups, plus logout support for session control.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, React, Tailwind CSS |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| Uploads | Multer |
| Realtime | Socket.IO rooms, typing events, seen events |

## Project Structure

```bash
wechat/
├── app/                  # Next.js App Router frontend
├── components/           # Reusable UI components
├── lib/                  # Utility helpers such as avatar colors
├── middleware/           # JWT auth middleware
├── models/               # Mongoose models
├── routes/               # Express API routes
├── uploads/              # Uploaded files
├── server.js             # Express + Socket.IO server
├── package.json
└── README.md
```

## Core Capabilities

### Authentication

Users can register and log in with JWT-based authentication, and the backend protects API and socket access with token verification middleware.[2]

### Messaging

The app supports one-to-one chats and group chats through a unified room model, with persistent message history stored in MongoDB and real-time delivery over Socket.IO.[2][4]

### Presence and Activity

Online status, typing indicators, unread counts, and seen receipts help the interface behave like a modern messaging product instead of a basic demo.[2][5]

### Media Sharing

Users can upload files and images through a Multer-powered endpoint and send them as structured chat messages with message type metadata.[2]

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Add any frontend environment variables separately if your client-side code requires them.

## Installation

1. Clone the repository.
2. Install dependencies.
3. Create the `.env` file.
4. Start the development servers.

```bash
git clone <your-repo-url>
cd wechat
npm install
```

## Running the App

### Start the backend

```bash
node server.js
```

### Start the frontend

```bash
npm run dev
```

By default, the frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:5000`, which is a common local setup for Next.js plus Express development.[1]

## Example Workflow

1. Register a new account.
2. Log in and load the chat dashboard.
3. Start a direct message or create a group.
4. Send text, image, or file messages.
5. Watch unread counts, typing indicators, online presence, and seen updates change in real time.

## API and Socket Highlights

### REST Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/rooms`
- `GET /api/rooms/users/all`
- `POST /api/rooms/dm`
- `POST /api/rooms/group`
- `GET /api/rooms/:roomId/messages`
- `POST /api/rooms/:roomId/read`
- `POST /api/upload`

### Socket Events

- `joinRooms`
- `sendMessage`
- `newMessage`
- `typing`
- `stopTyping`
- `userTyping`
- `userStopTyping`
- `markSeen`
- `messageSeen`
- `onlineUsers`

## Development Notes

- Keep import paths consistent between `server.js`, `routes`, `models`, and `middleware` when the whole app lives in one combined project folder.
- Store uploaded files in `uploads/` and expose them with static middleware from Express.
- Keep JWT validation aligned between REST routes and Socket.IO middleware so browser sessions and socket sessions stay in sync.[2]

## Roadmap

Potential next improvements for a stronger production-ready version:

- Search across messages and rooms.
- Delivered receipts separate from seen receipts.
- User profile photos and editable profile settings.
- Message reactions, reply threads, and pinned messages.
- Deployment with separate production frontend and backend environments.
- Rate limiting, validation hardening, and role-based moderation.

## License

Choose a license before publishing publicly. MIT is a common default for personal and portfolio projects.[6][7]

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
