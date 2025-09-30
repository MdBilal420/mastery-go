from fastapi import FastAPI
from routers import roleplay, feedback

app = FastAPI(title="Role-Playing Tutor API")

app.include_router(roleplay.router, prefix="/roleplay", tags=["roleplay"])
app.include_router(feedback.router, prefix="/roleplay", tags=["feedback"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Role-Playing Tutor API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)