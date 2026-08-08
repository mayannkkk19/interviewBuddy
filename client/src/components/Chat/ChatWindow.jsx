import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ messages, isLoading, error }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Interview will start soon</p>
          <p className="text-sm">The AI interviewer will begin with the first question.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {messages.map((message, index) => (
        <ChatBubble
          key={index}
          message={message}
          isAI={message.sender === 'ai'}
        />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      {error && (
        <div className="text-center text-red-600 text-sm p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;