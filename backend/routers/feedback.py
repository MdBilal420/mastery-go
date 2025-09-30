from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.schemas import FeedbackResponse
from services import gemini_service, context_manager

router = APIRouter()

@router.post("/feedback", response_model=FeedbackResponse)
async def generate_feedback():
    """
    Generates session summary, scores, suggestions.
    """
    # Get session history
    context = context_manager.ContextManager()
    history = context.get_history()
    
    # Generate feedback using Gemini
    feedback_data = await gemini_service.generate_feedback(history)
    
    return FeedbackResponse(**feedback_data)