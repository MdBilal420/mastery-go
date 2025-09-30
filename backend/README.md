# Role-Playing Tutor Backend

This is the FastAPI backend for the Role-Playing Tutor application.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

## Running the Server

```bash
uvicorn main:app --reload
```

The server will start on `http://localhost:8000`.

## API Endpoints

- `POST /roleplay/open` - Start a new role-playing scenario
- `POST /roleplay/respond-audio` - Process user audio response
- `POST /roleplay/feedback` - Get feedback on the session

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not committed)
├── routers/             # API route handlers
│   ├── roleplay.py      # Roleplay endpoints
│   └── feedback.py      # Feedback endpoints
├── services/            # Business logic
│   ├── gemini_service.py # Gemini API integration
│   ├── deepgram_stt.py   # Deepgram speech-to-text
│   ├── deepgram_tts.py   # Deepgram text-to-speech
│   └── context_manager.py # Session context management
└── models/              # Data models and schemas
    └── schemas.py       # Pydantic models
```