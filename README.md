# Turnstile

Track your live sports experiences. Share with friends. Relive the memories.

## Project Structure
```
turnstile/
├── backend/          # Node.js/Express API
└── mobile/           # React Native (Expo) app
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up database:
```bash
# Using Docker (recommended)
docker-compose up -d
docker exec -i turnstile-db psql -U postgres -d turnstile < src/config/db-setup.sql

# Or using local PostgreSQL
createdb turnstile
psql -d turnstile -f src/config/db-setup.sql
```

3. Start server:
```bash
npm run dev
```

API will be available at `http://localhost:3000`

### Mobile App Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start Expo:
```bash
npx expo start
```

3. Run on device/simulator:
- Press `i` for iOS
- Press `a` for Android
- Scan QR with Expo Go app

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (file uploads)

**Mobile:**
- React Native (Expo)
- React Navigation
- Axios (API calls)
- Expo Image Picker

## License

MIT
