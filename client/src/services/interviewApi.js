import api from './api';

// Mock data for development
const MOCK_CANDIDATES = [
  {
    id: 'CAND-001',
    name: 'Sarah Johnson',
    role: 'Senior Data Engineer',
    experience: 9,
    completedMissions: 28,
    progress: 90,
  },
  {
    id: 'CAND-002',
    name: 'Michael Chen',
    role: 'AI Engineer',
    experience: 5,
    completedMissions: 22,
    progress: 71,
  },
  {
    id: 'CAND-003',
    name: 'Priya Sharma',
    role: 'ML Engineer',
    experience: 7,
    completedMissions: 25,
    progress: 81,
  },
  {
    id: 'CAND-004',
    name: 'James Wilson',
    role: 'Software Engineer',
    experience: 3,
    completedMissions: 15,
    progress: 48,
  },
  {
    id: 'CAND-005',
    name: 'Emma Martinez',
    role: 'Data Scientist',
    experience: 6,
    completedMissions: 20,
    progress: 65,
  },
];

// For development - set to true to use mock data, false to use real API
const USE_MOCK = true;

export const getCandidates = async () => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_CANDIDATES;
  }
  
  const response = await api.get('/candidates');
  return response.data;
};

export const startInterview = async (candidateId) => {
  if (USE_MOCK) {
    // Reduce delay from 1000ms to 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const candidate = MOCK_CANDIDATES.find(c => c.id === candidateId) || MOCK_CANDIDATES[0];
    
    return {
      sessionId: `session-${Date.now()}`,
      candidate: candidate,
      question: {
        text: "Explain how embeddings are used in a RAG system. What role do they play in retrieval?",
        number: 1
      },
      totalQuestions: 8
    };
  }
  
  const response = await api.post('/interview/start', { candidateId });
  return response.data;
};

export const submitAnswer = async (sessionId, answer) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const questionNumber = Math.floor(Math.random() * 7) + 2;
    const completed = questionNumber > 8;
    
    return {
      question: completed ? null : {
        text: getMockQuestion(questionNumber),
        number: questionNumber
      },
      completed: completed
    };
  }
  
  const response = await api.post('/interview/answer', { sessionId, answer });
  return response.data;
};

export const getFeedback = async (sessionId) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      overallScore: 82,
      scores: [
        { category: 'Technical Accuracy', score: 8.5 },
        { category: 'Depth of Knowledge', score: 7.5 },
        { category: 'Communication', score: 8.5 },
        { category: 'Problem Solving', score: 8.0 },
      ],
      strengths: [
        'Strong understanding of RAG architecture',
        'Good vector database fundamentals',
        'Clear technical communication',
        'Practical experience with embeddings'
      ],
      weaknesses: [
        'Prompt engineering concepts could be stronger',
        'Deployment strategies need improvement',
        'Production trade-offs understanding is limited'
      ],
      recommendations: [
        'Review Day 12 — Prompt Engineering',
        'Review Day 28 — AI Deployment',
        'Review Day 25 — Production Systems'
      ]
    };
  }
  
  const response = await api.get(`/interview/${sessionId}/feedback`);
  return response.data;
};

// Helper function for mock questions
function getMockQuestion(number) {
  const questions = {
    2: "How would you improve retrieval quality in a RAG system? What techniques would you use?",
    3: "Compare and contrast different vector database options. What factors would influence your choice?",
    4: "Explain how you would evaluate the performance of a RAG system in production.",
    5: "What are the main challenges when scaling a RAG system to millions of documents?",
    6: "How would you handle versioning and updates in a vector database?",
    7: "Describe a scenario where a RAG system might fail and how you would handle it.",
    8: "What are the key differences between fine-tuning and RAG? When would you choose one over the other?"
  };
  return questions[number] || "Explain your approach to building production-ready AI systems.";
}