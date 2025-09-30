import os
import httpx
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

async def speech_to_text(audio_data: bytes) -> str:
    """
    Convert speech audio to text using Deepgram API.
    """
    url = "https://api.deepgram.com/v1/listen?model=nova-2"
    
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/m4a"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, content=audio_data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
        
        return transcript