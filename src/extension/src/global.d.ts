declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.json' {
  const content: string;
  export default content;
}


/**
 * Interface defining the structure of a voice message
 */
interface VoiceMessage {
  sessionId: string;
  textContent: string;
  index: number;
  speaker?: string;
  duration?: string;
}

/**
 * Interface defining the note made for a transcript
 */
interface Note extends VoiceMessage {
  _id: string; // mongodb objectid
  messageHash: string;
  suggestedContent: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  status: 'processed' | 'user_modified'
}