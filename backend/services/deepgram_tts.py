import os
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
TTS_VOICE = os.getenv("TTS_VOICE", "aura-stella")

async def text_to_speech(text: str) -> str:
    """
    Convert text to speech using Deepgram API and return base64 encoded audio.
    """
    url = f"https://api.deepgram.com/v1/speak?model={TTS_VOICE}"
    
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": text
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        # Encode audio content to base64
        audio_b64 = base64.b64encode(response.content).decode('utf-8')
        
        return audio_b64