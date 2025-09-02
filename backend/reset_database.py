#!/usr/bin/env python
"""
Script to reset database for GlobeMate
This will drop all tables and recreate them cleanly
"""
import os
import django
from django.conf import settings
from django.core.management import execute_from_command_line
from django.db import connection

def reset_database():
    """Drop all tables and reset migrations"""
    
    # Get all table names
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        """)
        tables = [table[0] for table in cursor.fetchall()]
    
    # Drop all tables
    if tables:
        with connection.cursor() as cursor:
            cursor.execute('DROP TABLE IF EXISTS {} CASCADE'.format(', '.join(tables)))
            print(f"Dropped {len(tables)} tables")
    
    print("Database reset complete!")

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    reset_database()
