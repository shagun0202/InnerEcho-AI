from sqlalchemy.orm import Session
from sqlalchemy import text

class PersonalContextService:
    def retrieve_relevant_context(self, db: Session, user_id: int, query: str, 
                                    ai_consent: bool, top_k: int = 3) -> list[dict] | None:
        """Retrieve relevant past reflections/messages for this user."""
        if not ai_consent:
            return None
            
        safe_query = query.replace("'", "").replace('"', "")
        if not safe_query.strip():
            return []
            
        # We rank by FTS5 rank
        sql = text("""
            SELECT content, source_type
            FROM personal_context_fts
            WHERE personal_context_fts MATCH :query
              AND user_id = :user_id
            ORDER BY rank
            LIMIT :top_k
        """)
        
        results = db.execute(sql, {"query": safe_query, "user_id": user_id, "top_k": top_k}).fetchall()
        
        retrieved = []
        for r in results:
            retrieved.append({
                "text": r.content,
                "source_type": r.source_type,
                "date": "Recent" # Simplifying date for now, or join if needed
            })
            
        return retrieved
    
    def rebuild_user_index(self, db: Session, user_id: int):
        """Rebuild FTS5 index for a specific user's content."""
        self.delete_user_context(db, user_id)
        
        # Insert journal entries
        sql_journal = text("""
            INSERT INTO personal_context_fts (user_id, source_type, content)
            SELECT user_id, 'journal', text 
            FROM journal_entries 
            WHERE user_id = :user_id
        """)
        db.execute(sql_journal, {"user_id": user_id})
        
        # Insert chat messages
        sql_chat = text("""
            INSERT INTO personal_context_fts (user_id, source_type, content)
            SELECT user_id, 'chat', text 
            FROM chat_messages 
            WHERE user_id = :user_id AND role = 'user'
        """)
        db.execute(sql_chat, {"user_id": user_id})
        
        db.commit()
    
    def delete_user_context(self, db: Session, user_id: int):
        """Delete all personal context index entries for a user."""
        sql = text("""
            DELETE FROM personal_context_fts 
            WHERE user_id = :user_id
        """)
        db.execute(sql, {"user_id": user_id})
        db.commit()

_service = None
def get_personal_context_service() -> PersonalContextService:
    global _service
    if _service is None:
        _service = PersonalContextService()
    return _service
