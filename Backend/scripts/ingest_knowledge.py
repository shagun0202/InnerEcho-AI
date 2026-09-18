#!/usr/bin/env python
"""Ingest the curated wellness knowledge base into the RAG index.

Usage:
    python scripts/ingest_knowledge.py

Run from the repository root (the folder containing Backend/).
Requires the Python environment with project dependencies.
"""
import sys
from pathlib import Path
import os

# Add Backend to path
script_dir = Path(__file__).resolve().parent  # Backend/scripts/
backend_dir = script_dir.parent               # Backend/
sys.path.insert(0, str(backend_dir))

from app.database import engine, SessionLocal
from app.models_rag import ensure_fts_tables
from app.services.rag_service import get_rag_service

def main():
    knowledge_dir = backend_dir / "knowledge_base"
    if not knowledge_dir.exists():
        knowledge_dir.mkdir(parents=True, exist_ok=True)
        print(f"Created knowledge base directory: {knowledge_dir}")
        print("Please add JSON files to this directory before running.")
        sys.exit(0)
    
    # Ensure FTS tables exist
    ensure_fts_tables(engine)
    
    # Ingest
    with SessionLocal() as db:
        stats = get_rag_service().ingest_knowledge_base(db, str(knowledge_dir))
        print(f"Ingestion complete: {stats}")

if __name__ == "__main__":
    main()
