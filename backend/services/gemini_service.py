import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-preview-05-20")  # Default to the correct model

print(f"Using Gemini model: {GEMINI_MODEL}")  # Debug print

async def generate_bot_intro(context: dict) -> str:
    """
    Generate bot introduction based on context.
    """
    prompt = f"""
    You are an AI tutor helping with role-playing exercises. 
    Based on the selected book, chapter, and profile, introduce the scenario.
    
    Context: {context}
    
    Provide a brief, engaging introduction to start the role-play scenario.
    """
    
    return await _call_gemini_api(prompt)

async def generate_response(user_input: str, history: list) -> str:
    """
    Generate bot response based on user input and conversation history.
    """
    history_text = "\n".join([f"{turn['speaker']}: {turn['text']}" for turn in history])
    
    prompt = f"""
    You are an AI tutor helping with role-playing exercises.
    
    Conversation history:
    {history_text}
    
    User said: "{user_input}"
    
    Respond appropriately to continue the role-play scenario. Keep your response concise and engaging.
    """
    
    return await _call_gemini_api(prompt)

async def generate_feedback(history: list) -> dict:
    """
    Generate feedback based on the conversation history.
    """
    history_text = "\n".join([f"{turn['speaker']}: {turn['text']}" for turn in history])
    
    prompt = f"""
    Analyze the following role-playing conversation and provide feedback:
    
    {history_text}
    
    Please provide:
    1. A summary of the conversation
    2. A score out of 100 for the user's performance
    3. Specific suggestions for improvement
    
    Format your response as JSON with keys: summary, score, suggestions
    """
    
    response_text = await _call_gemini_api(prompt)
    
    # In a real implementation, we would parse the JSON response
    # For now, we'll return a placeholder
    return {
        "summary": "Conversation summary would go here",
        "score": 85,
        "suggestions": [
            "Try to ask more open-ended questions",
            "Listen actively to the responses",
            "Show empathy in your replies"
        ]
    }

async def _call_gemini_api(prompt: str) -> str:
    """
    Call the Gemini API with the given prompt.
    """
    # Fix the URL construction - use just the model name, not the full path
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL.split('/')[-1]}:generateContent?key={GOOGLE_API_KEY}"
    
    print(f"Calling Gemini API: {url}")  # Debug print
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    
    # Add timeout parameter to prevent hanging
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        return text