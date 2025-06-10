# Chrome Extension Backend Server Documentation

The server is built on top of [nest.js](https://nestjs.com/).

## Overview

Backend API for Chrome extension that processes voice transcripts and stores learning notes. The frontend handles LLM integration directly, while the backend manages data persistence.

## Tech Stack

- **Database**: MongoDB
- **API**: RESTful endpoints
- **Authentication**: None (personal use)

## Database Design

### Collection: `transcripts`

```javascript
{
  _id: ObjectId,
  sessionId: string; // Unique session identifier for AI tutor conversation thread
  messageHash: String,      // SHA-256 hash based on the textContent
  textContent: String,  // Raw transcribed voice message
  suggestedContent: String,  // LLM-enhanced version
  explanation: String,      // LLM explanation of improvements
  status: String,          // "processed" | "user_modified"
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Primary lookup for duplicate detection
db.transcripts.createIndex({ "messageHash": 1 }, { unique: true })

// Time-based queries
db.transcripts.createIndex({ "createdAt": -1 })

// Status filtering
db.transcripts.createIndex({ "status": 1 })
```

## API Endpoints

### 1. get the note of a voice transcript

```http
GET /transcripts/:messageHash
```

**Response Success (200):**

```json
{
  "_id": "transcript_id",
  "sessionId": "uuid",
  "messageHash": "hash_value",
  "textContent": "original message",
  "suggestedContent": "improved version",
  "explanation": "grammar explanation",
  "status": "processed",
  "createdAt": "2025-06-08T10:00:00Z",
  "updatedAt": "2025-06-08T10:00:00Z"
}
```

**Response Not Found (404):**

```json
{
  "error": "Transcript not found"
}
```

### 2. Save New Transcript

```http
POST /transcripts
```

**Request Body:**

```json
{
  "sessionId": "uuid",
  "messageHash": "sha256_hash",
  "textContent": "transcribed voice message",
  "suggestedContent": "LLM improved version",
  "explanation": "LLM explanation of changes",
  "status": "processed"
}
```

**Response Success (201):**

```json
{
  "_id": "new_transcript_id",
  "sessionId": "uuid",
  "messageHash": "sha256_hash",
  "textContent": "transcribed voice message",
  "suggestedContent": "LLM improved version",
  "explanation": "LLM explanation of changes",
  "status": "processed",
  "createdAt": "2025-06-08T10:00:00Z",
  "updatedAt": "2025-06-08T10:00:00Z"
}
```

### 3. Update Existing Transcript

```http
PUT /transcripts/:id
```

**Request Body:**

```json
{
  "suggestedContent": "user edited version",
  "explanation": "user's explanation",
  "status": "user_modified"
}
```

**Response Success (200):**

```json
{
  "_id": "transcript_id",
  "sessionId": "uuid",
  "messageHash": "hash_value",
  "originalContent": "original message",
  "improvedContent": "user edited version",
  "explanation": "user's explanation",
  "status": "user_modified",
  "createdAt": "2025-06-08T10:00:00Z",
  "updatedAt": "2025-06-08T11:00:00Z"
}
```

## Architecture Flow

```plain
Chrome Extension (Content Script) 
    ↓
Background.js 
    ↓
Side Panel
    ↓
┌─────────────────┬─────────────────┐
│   LLM Provider  │   Backend API   │
│   (Direct Call) │   (Persistence) │
└─────────────────┴─────────────────┘
```

## Frontend Integration Guide

Please refer to `extension/src/pages/panel/services/note.services.ts`

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Development Notes

- Database connection string should be configured via environment variables
- Consider adding request validation middleware
- MongoDB connection pooling recommended for production
- Add logging for debugging and monitoring