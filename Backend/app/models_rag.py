# ══════════════════════════════════════════════════════════════
# FILE: backend/app/models_rag.py
# RAG-specific SQLAlchemy models using SQLite FTS5 for full-text search.
# ══════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    text,
)
from sqlalchemy.orm import relationship
from app.database import Base

class KnowledgeDocument(Base):
    """Metadata for a curated wellness document in the knowledge base."""
    __tablename__ = "knowledge_documents"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String(100), unique=True, nullable=False, index=True)  # e.g. "stress-management-basics"
    title = Column(String(300), nullable=False)
    source_url = Column(String(500), nullable=True)
    source_name = Column(String(200), nullable=True)
    language = Column(String(10), default="en", nullable=False)
    category = Column(String(50), nullable=False)
    review_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class KnowledgeChunk(Base):
    """A chunk of a knowledge document, indexed for retrieval."""
    __tablename__ = "knowledge_chunks"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)  # position within document
    content = Column(Text, nullable=False)
    chunk_hash = Column(String(64), nullable=False, index=True)  # SHA-256 for idempotent re-ingestion
    # Relationship
    document = relationship("KnowledgeDocument")

class RAGCitation(Base):
    """Links a chat message to the knowledge chunks used in its response."""
    __tablename__ = "rag_citations"
    id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False, index=True)
    chunk_id = Column(Integer, ForeignKey("knowledge_chunks.id"), nullable=False)
    relevance_score = Column(Float, nullable=True)

def ensure_fts_tables(engine):
    """Creates FTS5 virtual tables for full-text search."""
    with engine.connect() as conn:
        # FTS5 over knowledge_chunks.content
        conn.execute(text("""
            CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
                content,
                content='knowledge_chunks',
                content_rowid='id',
                tokenize='porter'
            );
        """))
        # FTS5 over chat_messages and journal_entries for personal context
        conn.execute(text("""
            CREATE VIRTUAL TABLE IF NOT EXISTS personal_context_fts USING fts5(
                user_id UNINDEXED,  -- Must filter by user, but don't index it for text search
                source_type UNINDEXED, -- 'journal' or 'chat'
                content,
                tokenize='porter'
            );
        """))
        conn.commit()
