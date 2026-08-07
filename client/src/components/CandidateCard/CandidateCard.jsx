const CandidateCard = ({ candidate, onStartInterview, isLoading }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForName = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-full ${getColorForName(candidate.name)} flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
          {getInitials(candidate.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {candidate.name}
          </h3>
          {candidate.role && (
            <p className="text-sm text-gray-600">{candidate.role}</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {candidate.experience && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{candidate.experience} years experience</span>
          </div>
        )}

        {candidate.completedMissions !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{candidate.completedMissions} missions completed</span>
          </div>
        )}

        {candidate.progress !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>{candidate.progress}% complete</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onStartInterview(candidate.id)}
        disabled={isLoading}
        className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Starting...
          </>
        ) : (
          'Start Interview'
        )}
      </button>
    </div>
  );
};

export default CandidateCard;