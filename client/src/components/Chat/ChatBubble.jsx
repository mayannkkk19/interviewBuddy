import React from 'react';

export default function ChatBubble({ role, content, day }) {
  const isAssistant = role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAssistant ? 'flex-start' : 'flex-end',
        margin: '0.75rem 0',
      }}
    >
      {isAssistant && day && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#0070f3',
            fontWeight: '600',
            marginBottom: '0.25rem',
          }}
        >
          Day {day} Focus
        </span>
      )}
      <div
        style={{
          maxWidth: '75%',
          padding: '0.85rem 1.1rem',
          borderRadius: '12px',
          background: isAssistant ? '#f0f4f8' : '#0070f3',
          color: isAssistant ? '#1a1a1a' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5',
        }}
      >
        {content}
      </div>
    </div>
  );
}