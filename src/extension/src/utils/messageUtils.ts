// ===================================
// TYPES & INTERFACES
// ===================================

/**
 * Interface for message data - flexible structure for any message payload
 */
interface MessageData extends Record<string, any> { }

/**
 * Interface defining the structure of a voice message
 */
interface VoiceMessage {
    sessionId: string;
    container: HTMLElement;
    textContent: string;
    index: number;
    speaker?: string;
    duration?: string;
}

// ===================================
// MESSAGE CLASS
// ===================================

/**
 * Message class represents a structured message with action and optional data
 */
class Message {
    readonly action: string;
    readonly data?: MessageData;

    constructor(action: string, data?: MessageData) {
        this.action = action;
        this.data = data;
    }
}

// ===================================
// ACTION CONSTANTS
// ===================================
const MESSAGE_ACTIONS = {
    OPEN_SIDE_PANEL: 'OPEN_SIDE_PANEL',
    CLOSE_SIDE_PANEL: 'CLOSE_SIDE_PANEL',
    SEND_VOICE_MESSAGE: 'SEND_VOICE_MESSAGE',
    RENDER_VOICE_MESSAGE: 'RENDER_VOICE_MESSAGE'
} as const;

// ===================================
// MESSAGE UTILITIES CLASS
// ===================================

/**
 * MessageUtils class provides static utility methods for Chrome extension messaging
 * with centralized runtime handling
 */
class MessageUtils {

    // ===================================
    // CORE MESSAGING METHOD
    // ===================================

    /**
     * Reusable method to send any message with centralized Chrome runtime handling
     * @param action - The action string for the message
     * @param data - Optional data payload
     */
    private static sendMessage(action: string, data?: MessageData): Promise<void> {
        const message = new Message(action, data);
        return chrome.runtime?.sendMessage?.(message);
    }

    // ===================================
    // PUBLIC API METHODS
    // ===================================

    /**
     * Sends a request to open the side panel
     */
    static requestOpenPanel(): Promise<void> {
        return this.sendMessage(MESSAGE_ACTIONS.OPEN_SIDE_PANEL);
    }

    /**
     * Sends a request to close the side panel
     */
    static requestClosePanel(): Promise<void> {
        return this.sendMessage(MESSAGE_ACTIONS.CLOSE_SIDE_PANEL);
    }

    /**
     * Sends a message to render a voice note to the panel
     * @param data - The voice message data
     */
    static requestRenderNoteToPanel(data: VoiceMessage): Promise<void> {
        return this.sendMessage(MESSAGE_ACTIONS.RENDER_VOICE_MESSAGE, data);
    }

    /**
     * Sends a voice message action
     * @param data - The voice message data
     */
    static sendVoiceMessage(data: VoiceMessage): Promise<void> {
        return this.sendMessage(MESSAGE_ACTIONS.SEND_VOICE_MESSAGE, data);
    }
}

// ===================================
// EXPORTS
// ===================================

export default MessageUtils;
export { Message, MESSAGE_ACTIONS };
export type { MessageData, VoiceMessage };