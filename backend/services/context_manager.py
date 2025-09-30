class ContextManager:
    """
    Manages the conversation context for the role-playing session.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ContextManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.context = {
                "book": None,
                "chapter": None,
                "profile": None
            }
            self.history = []
            self._initialized = True
    
    def set_context(self, book: str, chapter: str, profile: str):
        """
        Set the initial context for the role-playing session.
        """
        self.context["book"] = book
        self.context["chapter"] = chapter
        self.context["profile"] = profile
    
    def get_current_context(self) -> dict:
        """
        Get the current context.
        """
        return self.context.copy()
    
    def save_turn(self, speaker: str, text: str):
        """
        Save a turn in the conversation history.
        """
        self.history.append({
            "speaker": speaker,
            "text": text
        })
    
    def get_history(self) -> list:
        """
        Get the conversation history.
        """
        return self.history.copy()
    
    def reset(self):
        """
        Reset the context and history.
        """
        self.context = {
            "book": None,
            "chapter": None,
            "profile": None
        }
        self.history = []