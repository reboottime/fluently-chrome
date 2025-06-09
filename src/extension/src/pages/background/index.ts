import { Message, MESSAGE_ACTIONS } from "@utils/messageUtils";

class Bridge {
  currentVoiceMessage: VoiceMessage | null = null;
  isSidePanelOpen: boolean = false;

  constructor() {
    this.trackPanelStatus();
    this.forwardVoiceMesage();
  }

  private trackPanelStatus = () => {
    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        if (
          message.action === MESSAGE_ACTIONS.OPEN_SIDE_PANEL &&
          !this.isSidePanelOpen
        ) {
          try {
            await this.openPanel(sender);
            sendResponse({ success: true });
          } catch (error) {
            sendResponse({ success: false, error: (error as Error)?.message });
          }
          return true;
        }

        if (message.action === MESSAGE_ACTIONS.CLOSE_SIDE_PANEL) {
          this.isSidePanelOpen = false;
          this.currentVoiceMessage = null;
        }
      },
    );
  };

  private forwardVoiceMesage = () => {
    chrome.runtime.onMessage.addListener(
      async (message, _sender, sendResponse) => {
        if (message.action === MESSAGE_ACTIONS.SEND_VOICE_MESSAGE) {
          try {
            const forwardedMessage = new Message(
              MESSAGE_ACTIONS.RENDER_VOICE_MESSAGE,
              message.data,
            );
            await chrome.runtime.sendMessage(forwardedMessage);
            this.currentVoiceMessage = message.data;
            sendResponse({ success: true });
          } catch (e) {
            sendResponse({ success: false });
          }
        }
      },
    );
  };

  private openPanel = async (sender: chrome.runtime.MessageSender) => {
    try {
      await chrome.sidePanel.open({ windowId: sender?.tab?.windowId! });
      this.isSidePanelOpen = true;
    } catch (e) {
      console.error(e);
    }
  };
}

new Bridge();
