import asyncio
import os
import sys
from datetime import datetime, date, timedelta

# Add services/api to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'services', 'api')))

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.user_settings import UserSettings
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.services.category_service import seed_user_categories
from sqlalchemy import select, delete


async def seed_demo():
    print("Connecting to database...")
    async with AsyncSessionLocal() as db:
        demo_email = "demo@vaultwise.com"
        demo_password = "Password123!"
        full_name = "Alex Vance (Demo)"

        # Check existing user
        result = await db.execute(select(User).where(User.email == demo_email))
        user = result.scalars().first()

        if user:
            print(f"User {demo_email} already exists. Cleaning existing data...")
            await db.execute(delete(Transaction).where(Transaction.user_id == user.id))
            await db.execute(delete(Budget).where(Budget.user_id == user.id))
            await db.execute(delete(Category).where(Category.user_id == user.id))
            await db.execute(delete(UserSettings).where(UserSettings.user_id == user.id))
            await db.execute(delete(User).where(User.id == user.id))
            await db.commit()

        # Create user
        print(f"Creating user {demo_email}...")
        user = User(
            email=demo_email,
            hashed_password=get_password_hash(demo_password),
            full_name=full_name,
        )
        db.add(user)
        await db.flush()

        # User settings
        user_settings = UserSettings(
            user_id=user.id,
            currency_code="USD",
            currency_symbol="$",
            theme_mode="dark",
            date_format="YYYY-MM-DD",
        )
        db.add(user_settings)

        # Seed categories
        print("Seeding standard categories...")
        await seed_user_categories(db, user.id)
        await db.commit()

        # Fetch seeded categories
        cat_result = await db.execute(select(Category).where(Category.user_id == user.id))
        categories = {c.name.lower(): c.id for c in cat_result.scalars().all()}

        today = date.today()
        current_period = today.strftime("%Y-%m")
        prev_month = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

        print("Adding sample transactions...")
        # Current month transactions
        sample_txs = [
            # Income
            (today.replace(day=1), 450000, "income", "Salary & Income", "Monthly Consulting Salary", None),
            (today.replace(day=12) if today.day >= 12 else today, 35000, "income", "Salary & Income", "Freelance Web Design", None),
            
            # Fixed Expenses
            (today.replace(day=2), 120000, "expense", "Housing & Rent", "Downtown Apartment Rent", "Monthly lease transfer"),
            (today.replace(day=4), 9500, "expense", "Utilities", "Fiber Broadband & Cloud Sync", "Auto-pay"),
            (today.replace(day=7), 4850, "expense", "Utilities", "Electric & Water Utility", "City Utilities"),
            
            # Variable Expenses
            (today.replace(day=3), 14230, "expense", "Groceries", "Trader Joe's Supermarket", "Weekly pantry restock"),
            (today.replace(day=9) if today.day >= 9 else today, 8940, "expense", "Groceries", "Whole Foods Market", "Organic veggies & dairy"),
            (today.replace(day=14) if today.day >= 14 else today, 11520, "expense", "Groceries", "Costco Wholesale", "Bulk household goods"),
            
            (today.replace(day=5), 4500, "expense", "Food & Dining", "Bistro Lunch Meeting", "Client catch-up"),
            (today.replace(day=8) if today.day >= 8 else today, 6800, "expense", "Food & Dining", "Sushi Dinner with Friends", "Weekend dinner"),
            (today.replace(day=13) if today.day >= 13 else today, 2450, "expense", "Food & Dining", "Artisan Bakery & Coffee", "Espresso and pastry"),
            
            (today.replace(day=6), 6200, "expense", "Transportation", "Metro Transit Pass & Gas", "Commute card"),
            (today.replace(day=11) if today.day >= 11 else today, 3850, "expense", "Transportation", "Rideshare to Airport", "Late night Uber"),
            
            (today.replace(day=10) if today.day >= 10 else today, 8500, "expense", "Shopping", "Tech Accessories & Cables", "USB-C hub"),
            (today.replace(day=15) if today.day >= 15 else today, 3200, "expense", "Entertainment", "Concert Tickets & Streaming", "Movie night"),

            # Previous month comparison records
            (date(today.year, today.month - 1 if today.month > 1 else 12, 1), 450000, "income", "Salary & Income", "Prior Month Salary", None),
            (date(today.year, today.month - 1 if today.month > 1 else 12, 2), 120000, "expense", "Housing & Rent", "Downtown Apartment Rent", None),
            (date(today.year, today.month - 1 if today.month > 1 else 12, 5), 32000, "expense", "Groceries", "Prior Month Grocery Batch", None),
            (date(today.year, today.month - 1 if today.month > 1 else 12, 12), 18000, "expense", "Food & Dining", "Prior Month Dining Out", None),
            (date(today.year, today.month - 1 if today.month > 1 else 12, 18), 12500, "expense", "Utilities", "Prior Utilities Statement", None),
            (date(today.year, today.month - 1 if today.month > 1 else 12, 22), 9500, "expense", "Transportation", "Prior Month Fuel", None),
        ]

        for tx_date, amount_cents, tx_type, cat_name, desc, notes in sample_txs:
            cat_id = categories.get(cat_name.lower())
            tx = Transaction(
                user_id=user.id,
                category_id=cat_id,
                amount_cents=amount_cents,
                type=tx_type,
                date=tx_date,
                description=desc,
                notes=notes,
            )
            db.add(tx)

        print("Setting up budgets...")
        budgets_to_add = [
            (None, current_period, 280000), # Overall $2,800.00
            (categories.get("groceries"), current_period, 50000), # $500.00
            (categories.get("food & dining"), current_period, 25000), # $250.00
            (categories.get("housing & rent"), current_period, 120000), # $1,200.00
            (categories.get("utilities"), current_period, 18000), # $180.00
            (categories.get("transportation"), current_period, 15000), # $150.00
        ]

        for cat_id, period, limit_cents in budgets_to_add:
            b = Budget(
                user_id=user.id,
                category_id=cat_id,
                period=period,
                limit_cents=limit_cents,
            )
            db.add(b)

        await db.commit()
        print("Demo account successfully seeded!")
        print(f"Email: {demo_email}")
        print(f"Password: {demo_password}")


if __name__ == "__main__":
    asyncio.run(seed_demo())
