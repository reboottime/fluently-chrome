import { Message, MESSAGE_ACTIONS } from "@utils/messageUtils";

class Bridge {
  isSidePanelOpen: boolean = false;

  constructor() {
    this.trackPanelStatus();
    this.forwardVoiceMessage();
    this.trackTabChange();
  }

  private trackPanelStatus = () => {
    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        if (
          message.action === MESSAGE_ACTIONS.OPEN_SIDE_PANEL &&
          this.isValidFluentlySession(sender.tab?.url)
        ) {
          try {
            this.forceSidePanelOptions(sender.tab?.id);
            chrome.sidePanel.open({ tabId: sender.tab?.id! });
            sendResponse({ success: true });
          } catch (error) {
            sendResponse({ success: false, error: (error as Error)?.message });
          }
          return true;
        }
      },
    );
  };

  private forwardVoiceMessage = () => {
    chrome.runtime.onMessage.addListener(
      async (message, _sender, sendResponse) => {
        if (message.action === MESSAGE_ACTIONS.SEND_VOICE_MESSAGE) {
          try {
            const forwardedMessage = new Message(
              MESSAGE_ACTIONS.RENDER_VOICE_MESSAGE,
              message.data,
            );
            await chrome.runtime.sendMessage(forwardedMessage);
            sendResponse({ success: true });
          } catch (e) {
            sendResponse({ success: false });
          }
        }
      },
    );
  };

  private trackTabChange = () => {
    chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
      if (!tab.url) return;

      if (this.isValidFluentlySession(tab.url)) {
        this.forceSidePanelOptions(tab.id!);
      } else {
        // Disable the side panel on all other URLs
        chrome.sidePanel.setOptions({
          tabId,
          enabled: false
        });
      }
    });

    // Handle when user switches between tabs
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);

      if (this.isValidFluentlySession(tab.url)) {
        this.forceSidePanelOptions(tab.id!);
      } else {
        chrome.sidePanel.setOptions({
          tabId: activeInfo.tabId,
          enabled: false
        });
      }
    });
  }


  private forceSidePanelOptions = (tabId: number | undefined) => {
    chrome.sidePanel.setOptions({
      tabId,
      path: 'src/pages/panel/index.html',
      enabled: true
    });
  };

  private isValidFluentlySession = (url?: string): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'app.getfluently.app' &&
        urlObj.pathname.startsWith('/session/');
    } catch (error) {
      return false;
    }
  };
}

new Bridge();
