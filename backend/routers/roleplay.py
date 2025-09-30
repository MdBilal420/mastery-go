from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from models.schemas import RoleplayOpenRequest, RoleplayResponse
from services import deepgram_stt, gemini_service, deepgram_tts, context_manager

router = APIRouter()

@router.post("/open", response_model=RoleplayResponse)
async def open_scenario(request: RoleplayOpenRequest):
    """
    Starts scenario with bot intro.
    """
    # Initialize context manager
    context = context_manager.ContextManager()
    context.reset()  # Reset any previous context
    context.set_context(request.book, request.chapter, request.profile)
    
    # Get bot introduction from Gemini
    bot_intro = await gemini_service.generate_bot_intro(context.get_current_context())
    
    # Convert bot intro text to speech
    audio_b64 = await deepgram_tts.text_to_speech(bot_intro)
    
    # Save initial context
    context.save_turn("bot", bot_intro)
    
    return RoleplayResponse(
        text=bot_intro,
        audio_b64=audio_b64
    )

@router.post("/respond-audio", response_model=RoleplayResponse)
async def respond_audio(audio: UploadFile = File(...)):
    """
    Accepts user audio (.m4a base64) → STT → Gemini → TTS.
    """
    # Read audio file
    audio_content = await audio.read()
    
    # Convert speech to text using Deepgram
    user_text = await deepgram_stt.speech_to_text(audio_content)
    
    # Get current context
    context = context_manager.ContextManager()
    context.save_turn("user", user_text)
    
    # Get bot response from Gemini
    bot_response = await gemini_service.generate_response(user_text, context.get_history())
    
    # Convert bot response to speech
    audio_b64 = await deepgram_tts.text_to_speech(bot_response)
    
    # Save bot response to context
    context.save_turn("bot", bot_response)
    
    return RoleplayResponse(
        text=bot_response,
        audio_b64=audio_b64
    )