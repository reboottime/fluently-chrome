import { useEffect, useState } from "react";
import MessageUtils, {
  MESSAGE_ACTIONS,
  VoiceMessage,
} from "@utils/messageUtils";

import './Panel.css';

export default function Panel() {
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    chrome.runtime.onMessage.addListener(
      async (message) => {
        if (message.action === MESSAGE_ACTIONS.RENDER_VOICE_MESSAGE) {
          setVoiceMessage(message.data);
          setIsLoading(false);
        }
      },
    );
    window.addEventListener("beforeunload", async () => {
      setIsLoading(true);
      await MessageUtils.requestClosePanel();
      setIsLoading(false);
      setVoiceMessage(null);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!voiceMessage) {
    return (
      <div className="container">
        <p>No voice message available</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel">
        <h2 className="panel-heading text-red-500">
          Current Message #{voiceMessage.index}
        </h2>
        
        <div className="panel-original">
          {voiceMessage.textContent}
        </div>
        
        <div className="panel-suggested">
          {/* This is where you'll display the suggested/improved version */}
          {/* You might want to call an AI service or have this data from elsewhere */}
          Suggested improvement will appear here...
        </div>
      </div>
    </div>
  );
}