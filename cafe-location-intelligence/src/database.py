"""
Database Integration Module for Café Location Intelligence System.
Handles SQLite database creation, table management, data insertion,
and query execution for SQL analytics.
"""

import os
import sqlite3
import pandas as pd
import logging
from typing import Dict, List, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

DEFAULT_DB_PATH = "data/processed/cafe_intelligence.db"


def init_db(df: pd.DataFrame, db_path: str = DEFAULT_DB_PATH) -> None:
    """
    Initializes SQLite database and writes processed location data to 'hyderabad_cafes' table.
    """
    try:
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        conn = sqlite3.connect(db_path)

        # Write DataFrame to SQLite table (replace if existing)
        df.to_sql("hyderabad_cafes", conn, if_exists="replace", index=False)
        conn.close()
        logging.info(f"Database successfully initialized at {db_path} with table 'hyderabad_cafes'.")
    except Exception as e:
        logging.error(f"Error initializing SQLite database at {db_path}: {str(e)}")
        raise e



def run_query(query_str: str, db_path: str = DEFAULT_DB_PATH) -> pd.DataFrame:
    """
    Executes a SQL query against the SQLite database and returns the result as a Pandas DataFrame.
    """
    try:
        conn = sqlite3.connect(db_path)
        result_df = pd.read_sql_query(query_str, conn)
        conn.close()
        return result_df
    except Exception as e:
        logging.error(f"Error executing SQL query: {str(e)}")
        raise e


def parse_sql_statements(sql_file_path: str) -> List[Tuple[str, str]]:
    """
    Parses SQL statements and comment headers from an .sql file.
    Returns list of tuples: (query_title, query_sql).
    """
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    queries = []
    blocks = content.split(';')
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        
        # Extract title from leading comment if present
        title = "SQL Query"
        lines = block.split('\n')
        comment_lines = [line.strip('- ').strip() for line in lines if line.strip().startswith('--')]
        sql_lines = [line for line in lines if not line.strip().startswith('--')]
        
        if comment_lines:
            title = comment_lines[0]
            
        sql_code = '\n'.join(sql_lines).strip()
        if sql_code:
            queries.append((title, sql_code))
            
    return queries
