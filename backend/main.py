from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import roleplay, feedback

app = FastAPI(title="Role-Playing Tutor API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(roleplay.router, prefix="/roleplay", tags=["roleplay"])
app.include_router(feedback.router, prefix="/roleplay", tags=["feedback"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Role-Playing Tutor API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)