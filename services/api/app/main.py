from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.models import *  # Import all models so Base.metadata is fully populated


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Teardown
    await engine.dispose()


app = FastAPI(
    title="Vaultwise API",
    version="1.0.0",
    description="Vaultwise: Your Money. Your Rules. — Personal Finance Analyzer Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Vaultwise API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


# Register v1 routes
app.include_router(api_router, prefix=settings.API_PREFIX)
