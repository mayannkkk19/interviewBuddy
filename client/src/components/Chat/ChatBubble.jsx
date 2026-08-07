const ChatBubble = ({ message, isAI }) => {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-slide-up`}>
      <div className={`max-w-[80%] ${
        isAI 
          ? 'bg-gray-100 text-gray-900' 
          : 'bg-primary-600 text-white'
      } rounded-2xl px-4 py-3 shadow-sm`}>
        {isAI && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-gray-500">AI Interviewer</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.text}
        </p>
        {message.timestamp && (
          <div className={`text-xs mt-1 ${
            isAI ? 'text-gray-400' : 'text-primary-200'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;