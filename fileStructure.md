server/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── openai.js
│   │   └── vectorDb.js
│   │
│   ├── routes/
│   │   ├── candidate.routes.js
│   │   ├── interview.routes.js
│   │   └── curriculum.routes.js
│   │
│   ├── controllers/
│   │   ├── candidate.controller.js
│   │   ├── interview.controller.js
│   │   └── curriculum.controller.js
│   │
│   ├── models/
│   │   ├── Candidate.js
│   │   ├── Curriculum.js
│   │   └── InterviewSession.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   │
│   ├── services/
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.service.js
│   │   │   ├── promptBuilder.js
│   │   │   ├── evaluator.js
│   │   │   └── feedbackGenerator.js
│   │   │
│   │   ├── interview/
│   │   │   ├── candidateAnalyzer.js
│   │   │   ├── interviewPlanner.js
│   │   │   ├── questionGenerator.js
│   │   │   ├── sessionManager.js
│   │   │   └── scoringEngine.js
│   │   │
│   │   ├── rag/
│   │   │   ├── embedding.service.js
│   │   │   ├── vectorStore.js
│   │   │   ├── retriever.js
│   │   │   └── chunker.js
│   │   │
│   │   └── importer/
│   │       ├── importCandidates.js
│   │       └── importCurriculum.js
│   │
│   ├── prompts/
│   │   ├── interviewer.prompt.js
│   │   ├── evaluator.prompt.js
│   │   ├── planner.prompt.js
│   │   └── feedback.prompt.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── constants.js
│   │   ├── topicMapper.js
│   │   └── scoreCalculator.js
│   │
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env