# MoodMentor Wellness Knowledge Base

This directory contains the curated wellness knowledge base used by the MoodMentor RAG (Retrieval-Augmented Generation) pipeline to provide accurate, evidence-based guidance to users.

## Structure
The knowledge base consists of individual JSON files for each wellness topic.

Each file follows this schema:
```json
{
  "id": "unique-slug",
  "title": "Document Title",
  "source_url": "https://example.org/page",
  "source_name": "Organization Name",
  "language": "en",
  "review_date": "YYYY-MM-DD",
  "category": "category_name",
  "content": "The actual wellness guidance content..."
}
```

### Supported Categories
- `stress_management`
- `mindfulness`
- `sleep`
- `exercise`
- `social`
- `breathing`
- `gratitude`
- `emotional_regulation`
- `work_life_balance`
- `burnout`
- `nutrition`
- `general_wellness`

## Adding New Documents
1. Identify a credible source (e.g., WHO, NIH, APA, Mayo Clinic, NHS).
2. Summarize the guidance into 200-500 words of clear, actionable, and empathetic content in your own words.
3. Create a new JSON file named `{unique-slug}.json` following the schema above.
4. Ensure the `review_date` is current.
5. Commit the new file.

## Review Process
All knowledge base documents should be reviewed annually to ensure the guidance remains current with the latest medical and psychological consensus. Update the `review_date` field after reviewing.
