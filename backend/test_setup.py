import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported without errors."""
    try:
        from main import app
        print("✓ FastAPI app imported successfully")
        
        from routers import roleplay, feedback
        print("✓ Routers imported successfully")
        
        from services import deepgram_stt, deepgram_tts, gemini_service, context_manager
        print("✓ Services imported successfully")
        
        from models import schemas
        print("✓ Schemas imported successfully")
        
        print("\n🎉 All imports successful! The backend is set up correctly.")
        return True
        
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing backend setup...")
    success = test_imports()
    sys.exit(0 if success else 1)