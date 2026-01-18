from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import uvicorn
from dotenv import load_dotenv
import os
import uuid
import hashlib
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="ZakVibe Backend API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
users_db = {}
sessions_db = {}

# Models
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    referralCode: Optional[str] = None
    instituteName: Optional[str] = None
    instituteLocation: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return str(uuid.uuid4())

# Routes
@app.get("/")
async def root():
    return {"message": "ZakVibe Backend API is running", "status": "success"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "zakvibe-backend"}

@app.get("/api/status")
async def api_status():
    return {
        "status": "operational",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    # Check if user already exists
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(request.password)
    
    user = {
        "id": user_id,
        "name": request.name,
        "email": request.email,
        "password": hashed_password,
        "role": request.role,
        "referralCode": request.referralCode,
        "instituteName": request.instituteName,
        "instituteLocation": request.instituteLocation,
        "isApproved": True,  # Auto-approve for now
        "createdAt": datetime.now().isoformat()
    }
    
    users_db[request.email] = user
    
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "userId": user_id,
            "isApproved": True
        }
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login user"""
    # Check if user exists
    if request.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[request.email]
    hashed_password = hash_password(request.password)
    
    # Verify password
    if user["password"] != hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = generate_token()
    sessions_db[token] = user["id"]
    
    # Return user data without password
    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "isApproved": user["isApproved"]
    }
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user_data,
            "token": token
        }
    }

@app.get("/api/user/profile")
async def get_profile(authorization: Optional[str] = Header(None)):
    """Get user profile"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    
    token = authorization.replace("Bearer ", "")
    
    if token not in sessions_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = sessions_db[token]
    user = next((u for u in users_db.values() if u["id"] == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "isApproved": user["isApproved"]
    }
    
    return {
        "success": True,
        "data": user_data
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)