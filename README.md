# Role-Playing Tutor MVP

An AI-powered role-playing tutor that helps users practice conversations in different scenarios using voice interaction.

## Project Structure

```
roleplay-tutor/
├── backend/     # FastAPI server
└── frontend/    # Expo app (iOS + Android)
```

## Features

- Voice-based role-playing scenarios
- AI-powered conversation partner (Gemini)
- Speech-to-text and text-to-speech (Deepgram)
- Session feedback and performance scoring
- Multiple books, chapters, and角色profiles

## Prerequisites

### API Keys
- `DEEPGRAM_API_KEY`
- `GOOGLE_API_KEY` (Gemini)

### Tooling
- Node 18+, npm or pnpm
- Python 3.11+, pip
- Xcode (for iOS simulator)
- Android phone with Expo Go (for audio testing)

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## API Endpoints

- `POST /roleplay/open` - Start a new role-playing scenario
- `POST /roleplay/respond-audio` - Process user audio response
- `POST /roleplay/feedback` - Get feedback on the session

## Testing Strategy

### iOS (Xcode Simulator)
- Test UI navigation, Redux state, screen flow
- Use stubs/fake backend responses (no real mic input)

### Android (Expo Go on device)
- Test real audio loop: Speak → record → backend → bot responds with audio
- Verify latency per turn (<3s)

## Demo Content

- Books: 2 (How to Win Friends, The Lean Startup)
- Chapters: 1-2 per book, each with 2-3 bullet summaries
- Profiles: 3 (Manager, Teacher, Student)
- Voices: Map profiles → different Deepgram Aura voices