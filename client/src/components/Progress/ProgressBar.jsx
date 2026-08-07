const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;