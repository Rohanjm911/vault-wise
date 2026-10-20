from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.category import Category

DEFAULT_CATEGORIES = [
    {"name": "Groceries", "type": "expense", "color_hex": "#10B981", "icon_name": "shopping-cart"},
    {"name": "Food & Dining", "type": "expense", "color_hex": "#F59E0B", "icon_name": "utensils"},
    {"name": "Transportation", "type": "expense", "color_hex": "#3B82F6", "icon_name": "car"},
    {"name": "Housing & Rent", "type": "expense", "color_hex": "#6366F1", "icon_name": "home"},
    {"name": "Utilities", "type": "expense", "color_hex": "#8B5CF6", "icon_name": "zap"},
    {"name": "Healthcare", "type": "expense", "color_hex": "#EC4899", "icon_name": "activity"},
    {"name": "Shopping", "type": "expense", "color_hex": "#14B8A6", "icon_name": "shopping-bag"},
    {"name": "Entertainment", "type": "expense", "color_hex": "#F97316", "icon_name": "film"},
    {"name": "Education", "type": "expense", "color_hex": "#06B6D4", "icon_name": "book-open"},
    {"name": "Personal Care", "type": "expense", "color_hex": "#84CC16", "icon_name": "smile"},
    {"name": "Salary & Income", "type": "income", "color_hex": "#059669", "icon_name": "dollar-sign"},
    {"name": "Other", "type": "expense", "color_hex": "#64748B", "icon_name": "more-horizontal"},
]


async def seed_user_categories(db: AsyncSession, user_id: str) -> List[Category]:
    # Check if user already has categories
    existing = await db.execute(select(Category).where(Category.user_id == user_id))
    if existing.scalars().first():
        return []

    created_categories: List[Category] = []
    for item in DEFAULT_CATEGORIES:
        category = Category(
            user_id=user_id,
            name=item["name"],
            type=item["type"],
            color_hex=item["color_hex"],
            icon_name=item["icon_name"],
            is_system=False,
        )
        db.add(category)
        created_categories.append(category)

    await db.flush()
    return created_categories
