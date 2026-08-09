import React, { useState } from 'react';
import { useInterviewContext } from '../../context/InterviewContext';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow() {
  const { messages, submitAnswer, loading } = useInterviewContext();
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    submitAnswer(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} content={msg.content} day={msg.day} />
        ))}
        {loading && <TypingIndicator />}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #eee' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response..."
          disabled={loading}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Send
        </button>
      </form>
    </div>
  );
}