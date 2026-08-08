export function createInterviewState(candidateProfile) {
  return {
    candidateProfile,

    conversationHistory: [],

    questionsAsked: 0,

    topicsCovered: [],

    strengths: [],

    weaknesses: [],

    currentTopic: null,

    isComplete: false
  };
}