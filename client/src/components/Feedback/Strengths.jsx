const Strengths = ({ strengths }) => {
  if (!strengths || strengths.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
        <p className="text-gray-500 text-sm">No strengths identified</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
      <ul className="space-y-2">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start text-gray-700">
            <span className="text-green-500 mr-2 mt-0.5">✓</span>
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Strengths;