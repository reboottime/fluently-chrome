import crypto from "crypto";

interface CreateNoteRequest extends VoiceMessage {
  suggestedContent: string;
  explanation?: string;
  status?: "processed" | "user_modified";
}

interface UpdateNoteRequest {
  suggestedContent?: string;
  explanation?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const generateMessageHash = (content: string): string => {
  return crypto.createHash("sha256").update(`${content}`).digest("hex");
};

class NoteService {
  private baseUrl: string;
  // private apiKey?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    // this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // if (this.apiKey) {
    //     headers['Authorization'] = `Bearer ${this.apiKey}`;
    //     // or headers['X-API-Key'] = this.apiKey; depending on your API
    // }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // If it's not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return data;
  }

  /**
   * Fetch a note by message hash (generated from transcript VoiceMessage['textContent'])
   * GET /transcripts/{messageHash}
   */
  async fetchNoteByMessageHash(voiceTranscript: string): Promise<Note | null> {
    try {
      const messageHash = generateMessageHash(voiceTranscript);

      const response = await fetch(
        `${this.baseUrl}/transcripts/${messageHash}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (response.status === 404) {
        return null; // Note not found
      }

      const result = await this.handleResponse<ApiResponse<Note>>(response);

      return result.data ?? null;
    } catch (error) {
      console.error("Error fetching note by message hash:", error);
      throw new Error(
        `Failed to fetch note: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update an existing note
   * PUT /transcripts/{noteId}
   */
  async updateNote(
    noteId: string,
    updateData: UpdateNoteRequest,
  ): Promise<Note> {
    try {
      const payload = {
        ...updateData,
        status: "user_modified",
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/transcripts/${noteId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await this.handleResponse<ApiResponse<Note>>(response);

      if (!result.data) {
        throw new Error("No data returned from update operation");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating note:", error);
      throw new Error(
        `Failed to update note: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create a new note
   * POST /transcripts/notes
   */
  async createNote(notedata: CreateNoteRequest): Promise<Note> {
    try {
      const messageHash = generateMessageHash(notedata.textContent);

      const payload = {
        messageHash,
        status: "processed",
      };

      const response = await fetch(`${this.baseUrl}/transcripts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await this.handleResponse<ApiResponse<Note>>(response);

      if (!result.data) {
        throw new Error("No data returned from create operation");
      }

      return result.data;
    } catch (error) {
      console.error("Error creating note:", error);
      throw new Error(
        `Failed to create note: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all notes for a session
   * GET /transcripts/notes?sessionId={sessionId}
   */
  async getNotesBySession(sessionId: string): Promise<Note[]> {
    try {
      const queryParams = new URLSearchParams({ sessionId });

      const response = await fetch(
        `${this.baseUrl}/notes?session=${queryParams}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      const result = await this.handleResponse<ApiResponse<Note[]>>(response);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching notes by session:", error);
      throw new Error(
        `Failed to fetch notes: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a note
   * DELETE /transcripts/notes/{noteId}
   */
  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/transcripts/${noteId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw new Error(
        `Failed to delete note: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
const noteService = new NoteService("");

export default noteService;
