server/
├── scripts/
│   └── seed.js                    # Executes candidate & curriculum importers
│
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB / ORM connection setup
│   │   ├── env.js                 # Environment variable parsing & validation
│   │   ├── gemini.js              # Google Gen AI SDK client setup
│   │   └── vectorDb.js            # ChromaDB / Vector store client initialization
│   │
│   ├── routes/
│   │   ├── candidate.routes.js
│   │   ├── interview.routes.js     # Exposes POST /api/interview
│   │   └── curriculum.routes.js
│   │
│   ├── controllers/
│   │   ├── candidate.controller.js
│   │   ├── interview.controller.js # Endpoint handler for interview turns
│   │   └── curriculum.controller.js
│   │
│   ├── models/
│   │   ├── Candidate.js           # Schema matching candidates.json
│   │   ├── Curriculum.js          # Schema matching curriculum.json
│   │   └── InterviewSession.js    # Stateful session schema (sessionId, history, status)
│   │
│   ├── middleware/
│   │   ├── errorHandler.js        # Global Express error handler
│   │   └── validateRequest.js     # Zod/Joi validation execution middleware
│   │
│   ├── schemas/                   # [ADDED] Request validation schemas
│   │   ├── interview.schema.js    # Validates candidate payload & session state
│   │   └── candidate.schema.js
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── ai.service.js      # Direct SDK wrapper for Gemini execution
│   │   │   ├── promptBuilder.js   # Combines templates with context/retrieved chunk
│   │   │   ├── evaluator.js       # Turn answer scoring against curriculum
│   │   │   └── feedbackGenerator.js # Generates final summary, strengths, gaps, next
│   │   │
│   │   ├── interview/
│   │   │   ├── candidateAnalyzer.js# Extracts strengths & targeted topics from profile
│   │   │   ├── interviewPlanner.js# Plans candidate-specific module trajectory
│   │   │   ├── questionGenerator.js# Formulates adaptive technical questions
│   │   │   ├── sessionManager.js  # Retrieves/updates InterviewSession documents
│   │   │   └── scoringEngine.js   # Maintains overall interview metrics
│   │   │
│   │   ├── rag/
│   │   │   ├── embedding.service.js# Vector embedding generation
│   │   │   ├── vectorStore.js     # ChromaDB / Vector DB collection wrapper
│   │   │   ├── retriever.js       # Query processing & vector search
│   │   │   └── chunker.js         # Curriculum JSON to JSONL/chunk converter
│   │   │
│   │   └── importer/
│   │       ├── importCandidates.js# Bulk loads candidates.json into DB
│   │       └── importCurriculum.js# Processes curriculum.json into DB & Vector Store
│   │
│   ├── prompts/
│   │   ├── interviewer.prompt.js # System instructions for turn dialogue
│   │   ├── evaluator.prompt.js   # Rubric for candidate technical answers
│   │   ├── planner.prompt.js     # Instructions for planning topic coverage
│   │   └── feedback.prompt.js    # Structured output instructions for terminal state
│   │
│   ├── utils/
│   │   ├── logger.js              # Winston / Pino structured logger
│   │   ├── constants.js           # Global constants & default values
│   │   ├── topicMapper.js         # Maps curriculum days/modules to questions
│   │   └── scoreCalculator.js     # Mathematical scoring aggregates
│   │
│   ├── app.js                     # Express application configuration
│   └── server.js                  # HTTP server listener execution
│
├── package.json
└── .env