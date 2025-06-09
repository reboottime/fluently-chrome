# Chrome Extension Backend Server Documentation

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
  messageHash: String,      // SHA-256 hash for duplicate detection
  originalContent: String,  // Raw transcribed voice message
  improvedMessage: String,  // LLM-enhanced version
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

### 1. Check if Message Exists

```http
GET /transcripts/:messageHash
```

**Response Success (200):**

```json
{
  "_id": "transcript_id",
  "messageHash": "hash_value",
  "originalContent": "original message",
  "improvedMessage": "improved version",
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
  "messageHash": "sha256_hash",
  "originalContent": "transcribed voice message",
  "improvedMessage": "LLM improved version",
  "explanation": "LLM explanation of changes",
  "status": "processed"
}
```

**Response Success (201):**

```json
{
  "_id": "new_transcript_id",
  "messageHash": "sha256_hash",
  "originalContent": "transcribed voice message",
  "improvedMessage": "LLM improved version",
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
  "improvedContent": "user edited version",
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

### 1. Generate Message Hash

```javascript
const messageHash = crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(originalMessage.trim().toLowerCase())
).then(hashBuffer => 
  Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
);
```

### 2. Check for Existing Transcript

```javascript
const response = await fetch(`/transcripts/${messageHash}`);
if (response.ok) {
  const existing = await response.json();
  // Use existing transcript
} else {
  // Proceed with LLM call
}
```

### 3. Save New Transcript

```javascript
const transcript = {
  messageHash,
  originalContent: originalMessage,
  improvedMessage: llmResponse.improved,
  explanation: llmResponse.explanation,
  status: 'processed'
};

await fetch('/transcripts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(transcript)
});
```

### 4. Update Transcript

```javascript
const updates = {
  improvedMessage: userEditedMessage,
  explanation: userExplanation,
  status: 'user_modified'
};

await fetch(`/transcripts/${transcriptId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});
```

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