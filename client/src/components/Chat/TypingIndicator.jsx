const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="bg-gray-100 rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">AI is thinking</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;