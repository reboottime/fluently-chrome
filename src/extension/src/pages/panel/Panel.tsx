import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PencilIcon, CheckIcon, X, Bookmark } from "lucide-react";

import MessageUtils, { MESSAGE_ACTIONS } from "@utils/messageUtils";
import noteService from "./services/note.services";

interface FormData {
  suggestedContent: Note["suggestedContent"];
  explanation: Note["explanation"];
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
    <span className="text-gray-600">Loading...</span>
  </div>
);

const SavingSpinner = () => (
  <div className="flex items-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
    <span className="text-green-600">Saving...</span>
  </div>
);

const BookmarkButton: React.FC<{
  note: Note;
  onClick: Function;
}> = ({ note, onClick }) => {
  return (
    <button
      onClick={onClick.bind(null)}
      className={`
        p-2 rounded-md transition-colors duration-200 hover:bg-gray-100 cursor-pointer
        ${note.isBookmarked ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"}
      `}
      aria-label={note.isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark size={16} fill={note.isBookmarked ? "currentColor" : "none"} />
    </button>
  );
};

const Panel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [note, setNote] = useState<Note | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // read message from background.js
  useEffect(() => {
    setIsLoading(true);

    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.action === MESSAGE_ACTIONS.RENDER_VOICE_MESSAGE) {
        setVoiceMessage(message.data);
        setIsLoading(false);
      }
    });

    window.addEventListener("beforeunload", async () => {
      setIsLoading(false);
      await MessageUtils.requestClosePanel();
      setIsLoading(false);
      setVoiceMessage(null);
      setNote(null);
    });
  }, []);

  // load note for this voice message
  useEffect(() => {
    const loadNote = async (voiceMessage: VoiceMessage | null) => {
      if (!voiceMessage) return;

      setIsLoading(true);

      try {
        const existingNote =
          await noteService.fetchNoteByMessageHash(voiceMessage);

        if (existingNote) {
          setNote(existingNote);
          setValue("suggestedContent", existingNote.suggestedContent);
        } else {
          // No existing note, generate suggested content
          //request LLM service generating feedback
        }
      } catch (error) {
        console.error("Error loading note:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNote(voiceMessage);

    return () => {
      setNote(null);
      setIsLoading(false);
      setIsEditing(false);
      setIsSaving(false);
      reset();
    };
  }, [voiceMessage?.textContent, setValue, reset, setNote]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);

    try {
      const noteData: Partial<Note> = {
        suggestedContent: data.suggestedContent,
        explanation: data.explanation,
        status: "user_modified",
      };

      if (note?._id) {
        await noteService.updateNote(note._id, noteData);
      } else {
        const note = await noteService.createNote({
          ...voiceMessage,
          ...noteData,
        } as Note);
        setNote(note);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (note) {
      setValue("suggestedContent", note.suggestedContent);
      reset({ explanation: note.explanation });
    }
    clearErrors();
    setIsEditing(false);
  };

  if (isLoading || !voiceMessage) {
    return (
      <div className="w-full h-96 bg-white p-6 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-center">
          Loading voice message content...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header with Message Index */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Message #{voiceMessage.index}
          </h2>
          <div className="flex gap-1 items-center">
            {note?.status && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  note.status === "user_modified"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {note.status === "user_modified" ? "Modified" : "Processed"}
              </span>
            )}
            {note && (
              <BookmarkButton
                note={note}
                onClick={async () => {
                  try {
                    const updatedNote = await noteService.updateNote(note._id, {
                      suggestedContent: note.suggestedContent,
                      explanation: note.explanation,
                      isBookmarked: !note.isBookmarked,
                    });
                    setNote(updatedNote);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Original Content Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Original Transcript
          </h3>
          <div className="bg-gray-100 rounded-lg p-3 italic">
            <p className="text-base text-gray-800 leading-relaxed">
              {voiceMessage.textContent}
            </p>
          </div>
        </div>

        {/* Suggested Content Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Revised version:
            </h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm transition-colors cursor-pointer"
                disabled={isSaving}
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <textarea
                {...register("suggestedContent", {
                  required: "Suggested content is required",
                  minLength: {
                    value: 10,
                    message: "Content must be at least 10 characters",
                  },
                })}
                disabled={!isEditing || isSaving}
                className={`w-full p-3 border rounded-lg text-sm leading-relaxed resize-none transition-colors ${
                  isEditing
                    ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : "border-gray-200 bg-gray-50"
                } ${errors.suggestedContent ? "border-red-300" : ""}`}
                rows={4}
                placeholder="Enter suggested content..."
              />
              {errors.suggestedContent && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.suggestedContent.message}
                </p>
              )}
            </div>

            {/* Explanation Field - Only shown when editing */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation (Optional)
                </label>
                <textarea
                  {...register("explanation")}
                  disabled={isSaving}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Add a note about your changes..."
                />
              </div>
            )}

            {/* Action Buttons - Only shown when editing */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="cursor-pointer flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <SavingSpinner />
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Note metadata - show when note exists */}
        {note?.updatedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created: {new Date(note.createdAt).toLocaleString()}</div>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div>Updated: {new Date(note.updatedAt).toLocaleString()}</div>
              )}
              {note.explanation && (
                <div className="mt-2">
                  <span className="font-medium">Last explanation:</span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-gray-700">
                    {note.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panel;
