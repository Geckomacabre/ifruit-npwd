import React, { useEffect, useRef, useState } from 'react';
import { HELP_GREETING, HELP_QUESTIONS } from '../utils/constants';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const TYPING_DELAY_MS = 1200;

// BuckBot: canned questions, canned unhelpful answers. Purely a joke, not a
// support channel.
export const WalletHelp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([HELP_GREETING]);
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const ask = (question: typeof HELP_QUESTIONS[number]) => {
    if (typing) return;

    setMessages((previous) => [...previous, { from: 'user', text: question.q }]);
    setTyping(true);

    replyTimer.current = window.setTimeout(() => {
      setMessages((previous) => [...previous, { from: 'bot', text: question.a }]);
      setTyping(false);
    }, TYPING_DELAY_MS);
  };

  return (
    <div className="buckme-screen">
      <header className="buckme-header">
        <h3>Help</h3>
      </header>

      <div className="buckme-help-messages">
        {messages.map((message, index) => (
          <div key={index} className={`buckme-bubble is-${message.from}`}>
            {message.text}
          </div>
        ))}
        {typing && <div className="buckme-bubble is-bot is-typing">•••</div>}
      </div>

      <div className="buckme-quickreplies">
        {HELP_QUESTIONS.map((question) => (
          <button
            type="button"
            key={question.q}
            className="buckme-quickreply"
            disabled={typing}
            onClick={() => ask(question)}
          >
            {question.q}
          </button>
        ))}
      </div>
    </div>
  );
};
