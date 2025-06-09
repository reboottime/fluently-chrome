import React, { useCallback, useEffect } from "react";
import MessageUtils from "@utils/messageUtils";

interface VoiceMessageItem extends VoiceMessage {
  container: HTMLElement
}

// Constants
const SELECTORS = {
  TEXT_ELEMENTS: ".css-146c3p1.text-fg-primary",
  CONTAINER: ".rounded-2xl",
  SPEAKER: ".text-fg-secondary",
  DURATION: ".font-mono",
  EXISTING_BUTTONS: ".voice-action-buttons",
  SPANS: "span",
} as const;

const BUTTON_STYLES = {
  CONTAINER: `
    display: flex;
    gap: 8px;
    margin-top: 8px;
  `,
  COPY: `
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    color: #2563eb;
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;
  `,
  COPY_HOVER: `
    background-color: #dbeafe;
  `,
  COPY_FOCUS: `
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
  `,
  ADD_NOTE: `
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    color: #16a34a;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;
  `,
  ADD_NOTE_HOVER: `
    background-color: #dcfce7;
  `,
  ADD_NOTE_FOCUS: `
    outline: none;
    box-shadow: 0 0 0 2px #22c55e, 0 0 0 4px rgba(34, 197, 94, 0.1);
  `,
} as const;

const ICONS = {
  COPY: `
    <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
    </svg>
  `,
  SUCCESS: `
    <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
    </svg>
  `,
  ADD_NOTE: `
    <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd"></path>
    </svg>
  `,
  LOADING: `
    <svg style="width: 12px; height: 12px; margin-right: 4px; animation: spin 1s linear infinite;" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
    </svg>
  `,
} as const;

const DELAYS = {
  FEEDBACK: 1500,
  LOADING: 1000,
  DEBOUNCE: 500,
} as const;

const COLOR_STYLES = {
  BLUE: {
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  GREEN: {
    color: "#16a34a",
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
} as const;

// Add CSS animation for spinning
const addSpinAnimation = () => {
  if (!document.getElementById("voice-buttons-styles")) {
    const style = document.createElement("style");
    style.id = "voice-buttons-styles";
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Utility function for creating button elements with raw styles
 */
const createButtonElement = (
  innerHTML: string,
  baseStyle: string,
  hoverStyle: string,
  focusStyle: string,
  onClick: (e: Event) => void,
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.innerHTML = innerHTML;
  button.className = "voice-action-button";

  // Apply base styles
  Object.assign(button.style, parseStyleString(baseStyle));

  // Add hover and focus event listeners
  button.addEventListener("mouseenter", () => {
    Object.assign(button.style, parseStyleString(hoverStyle));
  });

  button.addEventListener("mouseleave", () => {
    Object.assign(button.style, parseStyleString(baseStyle));
  });

  button.addEventListener("focus", () => {
    Object.assign(button.style, parseStyleString(focusStyle));
  });

  button.addEventListener("blur", () => {
    Object.assign(button.style, parseStyleString(baseStyle));
  });

  button.addEventListener("click", onClick);
  return button;
};

/**
 * Utility function to parse CSS string into style object
 */
const parseStyleString = (styleString: string): Record<string, string> => {
  const styles: Record<string, string> = {};
  const declarations = styleString.split(";").filter((d) => d.trim());

  declarations.forEach((declaration) => {
    const [property, value] = declaration.split(":").map((s) => s.trim());
    if (property && value) {
      const camelCaseProperty = property.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase(),
      );
      styles[camelCaseProperty] = value;
    }
  });

  return styles;
};

/**
 * Utility function for providing visual feedback
 */
const provideVisualFeedback = (
  button: HTMLButtonElement,
  newContent: string,
  newColorStyle: typeof COLOR_STYLES.BLUE | typeof COLOR_STYLES.GREEN,
  originalContent: string,
  originalColorStyle: typeof COLOR_STYLES.BLUE | typeof COLOR_STYLES.GREEN,
  delay: number,
): void => {
  button.innerHTML = newContent;
  Object.assign(button.style, newColorStyle);

  setTimeout(() => {
    button.innerHTML = originalContent;
    Object.assign(button.style, originalColorStyle);
  }, delay);
};

/**
 * Main ActionButtons component
 */
const InjectActionButtons: React.FC = () => {
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        console.log("Copied:", text);
        return true;
      } catch (error) {
        console.error("Failed to copy text:", error);
        return false;
      }
    },
    [],
  );

  const extractVoiceMessages = useCallback((): VoiceMessageItem[] => {
    const sessionIdMatch = window.location.href.match(
      /\/session\/([a-f0-9\-]{36})/,
    );
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : "";

    const textElements = document.querySelectorAll(SELECTORS.TEXT_ELEMENTS);

    const messages: VoiceMessageItem[] = [];

    textElements.forEach((textElement, index) => {
      const container = textElement.closest(SELECTORS.CONTAINER) as HTMLElement;
      if (!container) return;

      const spans = textElement.querySelectorAll(SELECTORS.SPANS);
      const textContent = Array.from(spans)
        .map((span) => span.textContent || "")
        .join("")
        .trim();

      if (!textContent) return;

      const speaker =
        container.querySelector(SELECTORS.SPEAKER)?.textContent || "";
      const duration =
        container.querySelector(SELECTORS.DURATION)?.textContent || "";

      messages.push({
        container,
        sessionId,
        textContent,
        index,
        speaker,
        duration,
      });
    });

    return messages;
  }, []);

  const createCopyButton = useCallback(
    (message: VoiceMessage): HTMLButtonElement => {
      const handleCopyClick = async (e: Event): Promise<void> => {
        e.stopPropagation();

        const button = e.currentTarget as HTMLButtonElement;
        const success = await copyToClipboard(message.textContent);

        if (success) {
          const originalHTML = button.innerHTML;
          provideVisualFeedback(
            button,
            `${ICONS.SUCCESS}Copied!`,
            COLOR_STYLES.GREEN,
            originalHTML,
            COLOR_STYLES.BLUE,
            DELAYS.FEEDBACK,
          );
        }
      };

      return createButtonElement(
        `${ICONS.COPY}Copy`,
        BUTTON_STYLES.COPY,
        BUTTON_STYLES.COPY_HOVER,
        BUTTON_STYLES.COPY_FOCUS,
        handleCopyClick,
      );
    },
    [copyToClipboard],
  );

  const createAddNoteButton = useCallback(
    (message: VoiceMessage): HTMLButtonElement => {
      const handleAddNoteClick = async (e: Event): Promise<void> => {

        const button = e.currentTarget as HTMLButtonElement;
        const originalHTML = button.innerHTML;

        // Show loading state
        button.innerHTML = `${ICONS.LOADING}Opening...`;

        await MessageUtils.requestOpenPanel();
        setTimeout(async () => {
          await MessageUtils.sendVoiceMessage(message);
        }, DELAYS.LOADING);

        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, DELAYS.LOADING);
      };

      return createButtonElement(
        `${ICONS.ADD_NOTE}Add Note`,
        BUTTON_STYLES.ADD_NOTE,
        BUTTON_STYLES.ADD_NOTE_HOVER,
        BUTTON_STYLES.ADD_NOTE_FOCUS,
        handleAddNoteClick,
      );
    },
    [],
  );

  const createActionButtons = useCallback(
    (message: VoiceMessageItem): void => {
      // Skip if buttons already exist
      if (message.container.querySelector(SELECTORS.EXISTING_BUTTONS)) return;

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "voice-action-buttons";
      Object.assign(
        buttonContainer.style,
        parseStyleString(BUTTON_STYLES.CONTAINER),
      );

      const { container, ...voiceMessage } = message;

      const copyButton = createCopyButton(message);
      const addNoteButton = createAddNoteButton(voiceMessage);

      buttonContainer.appendChild(copyButton);
      buttonContainer.appendChild(addNoteButton);
      message.container.appendChild(buttonContainer);
    },
    [createCopyButton, createAddNoteButton],
  );

  const addActionButtonsToDOM = useCallback((): void => {
    const messages = extractVoiceMessages();
    console.log("Processing messages:", messages.length);
    messages.forEach(createActionButtons);
  }, [extractVoiceMessages, createActionButtons]);

  const cleanupExistingButtons = useCallback((): void => {
    document
      .querySelectorAll(SELECTORS.EXISTING_BUTTONS)
      .forEach((button) => button.remove());
  }, []);

  useEffect(() => {
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        addSpinAnimation();
        addActionButtonsToDOM();
      }, DELAYS.DEBOUNCE);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on unmount
    return () => {
      cleanupExistingButtons();
      // Remove injected styles
      const styleElement = document.getElementById("voice-buttons-styles");
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [addActionButtonsToDOM, cleanupExistingButtons]);

  return null;
};

export default InjectActionButtons;
