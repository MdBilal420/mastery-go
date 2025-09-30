# Role-Playing Tutor Frontend

This is the Expo frontend for the Role-Playing Tutor application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
frontend/
├── app/                 # Screen components
│   ├── _layout.tsx      # Navigation layout
│   ├── index.tsx        # Book selection screen
│   ├── profile.tsx      # Profile selection screen
│   ├── roleplay.tsx     # Roleplay screen
│   └── feedback.tsx     # Feedback screen
├── src/                 # Shared code
│   ├── store/           # Redux store
│   │   ├── index.ts     # Store configuration
│   │   └── sessionSlice.ts # Session state management
│   ├── api.ts           # Backend API calls
│   ├── audio.ts         # Audio recording/playback helpers
│   └── constants.ts     # Application constants
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Available Scripts

- `npm start` - Start the development server
- `npm run android` - Start the development server and open Android emulator
- `npm run ios` - Start the development server and open iOS simulator
- `npm run web` - Start the development server and open web browser

## Dependencies

- `expo` - Expo framework for React Native
- `@react-navigation/native` - Navigation library
- `@reduxjs/toolkit` - State management
- `expo-av` - Audio recording and playback
- `expo-file-system` - File system access