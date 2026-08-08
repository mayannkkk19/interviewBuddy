Pasted code.json

File

curriculum.json:

Pasted code(1).json

File

Perfect—now we have both datasets:

Curriculum (31 days) → defines what can be asked and the learning objectives for each day. 
Candidate Profiles (20 candidates) → defines what should be asked, what to avoid, and where to probe deeper based on completion status, attempts, skipped missions, and learning signals. 
The Complete Pipeline
                   Curriculum JSON
                          │
                          ▼
               Curriculum Knowledge Base
                          │
          (Chunk by Day + Metadata + Embeddings)
                          │
                          ▼
                     Vector DB
                          ▲
                          │
          Candidate Profile JSON
                          │
                          ▼
                Candidate Analyzer
                          │
                          ▼
                Interview Planner
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    Interview Memory             Curriculum Retriever
            │                           │
            └─────────────┬─────────────┘
                          ▼
                 AI Interview Agent
                          │
                          ▼
              Response Evaluation Agent
                          │
                          ▼
                 Feedback Generator

Step 1 — Candidate Analyzer

Instead of treating all candidates equally, compute a candidate difficulty profile.

Example: Sarah Johnson (CAND-001)

She has:

Strong background (Senior Data Engineer, 9 years)
Completed almost every relevant AI module
Prompt Engineering required 4 attempts
Docker required 3 attempts
Monitoring was skipped 

The analyzer generates:

{
  "difficulty": "Hard",
  "strong_topics": [
    7,
    8,
    16,
    22,
    23,
    31
  ],
  "weak_topics": [
    12,
    28
  ],
  "avoid": [
    29
  ]
}

Step 2 — Interview Planner

The planner converts the profile into an interview roadmap.

Example:

Q1
Embeddings

↓

Q2
Vector DB

↓

Q3
Follow-up

↓

Q4
Retrieval

↓

Q5
Prompt Engineering

↓

Q6
Docker

↓

Q7
Scenario Question

↓

Q8
Architecture Discussion


Coverage:

Day 7

↓

Day 8

↓

Day 10

↓

Day 12

↓

Day 28

Step 3 — Question Generator

Prompt template:

Candidate:

Senior Data Engineer

Completed:
7
8
10
12
16
22
23
28
31

Weak:
12
28

Conversation:
...

Generate ONE interview question.

Rules:

Ask only one question.

Don't reveal answers.

Increase difficulty if previous answer was correct.

Ask follow-up if reasoning is weak.

Step 4 — Adaptive Follow-ups

Instead of static branching:

Was answer correct?

      YES

Increase depth

      NO

Ask conceptual clarification

      PARTIAL

Ask "why?"


Example:

Question

What is a vector database?

Candidate:

It stores embeddings.

LLM:

Good. Why can't we simply store embeddings inside SQLite?

Candidate:

...

LLM:

Suppose the database grows to 20 million vectors. What indexing strategy would you consider?

Now it feels like a real interview.

Step 5 — Memory

Conversation state:

{
  "question": 5,
  "covered": [
    7,
    8,
    10
  ],
  "candidate_claims": [
    "Embedding is a vector",
    "Pinecone is cloud hosted"
  ],
  "confidence": {
    "Embeddings": 0.95,
    "VectorDB": 0.65
  },
  "pending_followup": true
}

Step 6 — Scoring

Every answer gets structured scoring.

{
  "accuracy": 8,
  "depth": 6,
  "clarity": 9,
  "examples": 5,
  "confidence": 8
}


Also classify:

Strong

Medium

Weak

Incorrect

Step 7 — Feedback

Return structured JSON.

{
  "overallScore": 81,
  "strengths": [
    "Good RAG understanding",
    "Excellent explanation of embeddings"
  ],
  "weaknesses": [
    "Prompt Engineering needs improvement",
    "Docker deployment concepts were incomplete"
  ],
  "recommendedDays": [
    12,
    28
  ]
}

Personalizing Interviews

The candidate dataset enables tailored interviews.

Emily Chen (CAND-003)
AI Engineer
Nearly every mission passed on the first attempt
31 commit days
30 first-try completions 

Interview style:

Fewer theory questions
More production scenarios
Architecture discussions
Trade-off questions
Gerald Combs (CAND-010)
Failed Vector Databases
Failed Retrieval Engine
Failed Multi-Agent
Skipped Security & Docker 

Interview style:

Easy

↓

Medium

↓

Clarification

↓

Practical example


Avoid advanced agent orchestration until fundamentals are assessed.

Mia Alvarez (CAND-011)

Skipped:

Embeddings
Vector Databases
Prompt Engineering
Chatbot Backend
Multi-Agent 

The planner should avoid assuming mastery and instead focus on completed setup and data-processing topics, while using skipped topics only as optional diagnostic questions.

Tech Stack Recommendation
LayerTechnology	
Backend	FastAPI
Session Store	Redis
LLM	GPT-5.5 / Gemini 2.5 Pro / Claude Sonnet 4
Embeddings	OpenAI text-embedding-3-small
Vector DB	ChromaDB (local)
Agent Orchestration	LangGraph
Evaluation	LLM with structured JSON output
Why this design stands out

Rather than implementing a linear "question → answer → next question" chatbot, this architecture separates the system into specialized components:

Candidate Analyzer to infer strengths, weaknesses, and interview difficulty from mission history.
Interview Planner to guarantee coverage across at least four curriculum days while prioritizing completed or weak topics.
Retriever to fetch only the relevant curriculum objectives for the current question.
Interview Agent to conduct the conversation and generate adaptive follow-ups.
Evaluation Agent to score responses consistently and produce transparent, structured feedback.

This modular approach makes the interview adaptive, explainable, and easy to extend—qualities that are typically valued in AI engineering hackathons.

We are going to build one with MERN stack

MERN is a great choice for this hackathon. Since the challenge requires an HTTP endpoint and a conversational AI agent, we can keep the architecture simple while still making it modular and scalable.

Proposed MERN Architecture
Frontend (React + Vite)
        │
        ▼
 Express.js API (Node)
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
MongoDB  AI Service     Session Manager
         │              │
         ▼              ▼
    OpenAI/Gemini     Conversation State
         │
         ▼
 Curriculum + Candidate Context

Tech Stack
Frontend
React (Vite)
TailwindCSS
React Router
Axios
React Markdown (for formatted feedback)

Pages

/
│
├── Home
├── Candidate Selection
├── Interview
└── Feedback

Backend
Node.js
Express
Mongoose
JWT (optional)


Packages

express
mongoose
dotenv
cors
axios
openai (or @google/genai)
uuid

Database (MongoDB)

We'll store only runtime data.

Candidate Collection

Import directly from the provided JSON.

{
    id: "CAND-001",
    name: "Sarah Johnson",
    role: "...",

    missions: [...],
    signals: {...}
}


The candidate profile comes directly from the provided dataset. 

Curriculum Collection

Each curriculum day becomes one MongoDB document.

{
    day: 11,

    module: 4,

    title: "...",

    tools: [...],

    objectives: [...]
}


The curriculum JSON already contains all the information needed to populate this collection. 

Interview Session
{
    sessionId,

    candidateId,

    currentQuestion:4,

    coveredDays:[
        7,
        8,
        10
    ],

    history:[
       {
          role:"assistant",
          content:"..."
       },
       {
          role:"user",
          content:"..."
       }
    ],

    scores:{
       embeddings:8,
       rag:7
    },

    completed:false
}

Folder Structure
server
│
├── controllers
│      interviewController.js
│
├── services
│      aiService.js
│      interviewPlanner.js
│      evaluationService.js
│
├── models
│      Candidate.js
│      Curriculum.js
│      InterviewSession.js
│
├── routes
│      interview.js
│
├── prompts
│      interviewerPrompt.js
│      evaluationPrompt.js
│
├── utils
│      questionSelector.js
│      feedbackFormatter.js
│
└── server.js


Frontend

client
│
├── pages
│      Home.jsx
│      Interview.jsx
│      Feedback.jsx
│
├── components
│      ChatWindow.jsx
│      QuestionCard.jsx
│      AnswerBox.jsx
│      ProgressBar.jsx
│
├── services
│      api.js
│
└── App.jsx

API Design
Start Interview
POST /api/interview/start


Request

{
    "candidateId":"CAND-001"
}


Response

{
    "sessionId":"uuid",
    "question":"Explain what embeddings are."
}

Submit Answer
POST /api/interview/answer


Request

{
    "sessionId":"...",
    "answer":"..."
}


Response

{
    "question":"Why is a vector database preferred over SQLite?"
}

End Interview
POST /api/interview/end


Returns

{
    "overallScore":82,
    "strengths":[...],
    "weaknesses":[...],
    "recommendations":[...]
}

AI Service

The AI service has three responsibilities:

1. Generate Question

Input

Candidate Profile

Completed missions

Previous answers

Covered curriculum days

Conversation history


Output

Next interview question

2. Evaluate Answer

Return structured JSON

{
    "score":8,
    "accuracy":true,
    "confidence":"High",
    "followUpNeeded":true,
    "reason":"Candidate understood embeddings but missed similarity search."
}

3. Generate Feedback

Example

{
    "overallScore":84,
    "strengths":[
        "...",
        "..."
    ],

    "weaknesses":[
        "...",
        "..."
    ],

    "recommendedDays":[
        12,
        22
    ]
}

Interview Flow
Candidate Selected

↓

Create Session

↓

Choose First Topic

↓

LLM Generates Question

↓

Candidate Answers

↓

LLM Evaluates

↓

Need Follow-up?

YES

↓

Ask Follow-up

↓

Update Scores

↓

Next Curriculum Day

↓

8 Questions Complete

↓

Generate Feedback

Development Plan
Phase 1 (Core)
Import curriculum JSON into MongoDB.
Import candidate profiles into MongoDB.
Build the three interview endpoints.
Implement in-memory or MongoDB-backed interview sessions.
Integrate an LLM to ask and evaluate questions.
Phase 2 (Adaptive Interviews)
Prioritize completed missions.
Increase weight for topics requiring multiple attempts.
Skip topics the candidate never attempted unless using them as optional stretch questions.
Ensure coverage of at least four curriculum days and a minimum of eight questions.
Phase 3 (Polish)
Chat-style React UI.
Progress indicator (e.g., "Question 3 of 8").
Streaming LLM responses (optional).
Rich feedback dashboard with scores by topic and recommended curriculum days to revisit.

This design keeps the project within the MERN ecosystem while making the interview logic modular enough to evolve into a more sophisticated AI agent later without major architectural changes.

What i understand is, there was a cohort of abtalks, and there are candidates who joined the cohort, now they have a profile about what they learnt and their skills, now we have to build an agent (RAG) based and it can read the candidates profile then asks questions based on per candidates profile, maintains the context fully per candidate.

Yes, you've understood the problem almost correctly. There's just one important distinction.

What the hackathon is actually simulating

Think of it like this:

ABTalks → AI Cohort → Candidates → Interview Agent

ABTalks conducted a 31-day AI Engineering Cohort.
Every day had different topics (RAG, Prompt Engineering, MCP, Agents, Deployment, etc.). 
Many candidates attended the cohort.
For every candidate, you're given their learning history:
completed missions
skipped missions
attempts
learning signals
experience
job role 

Now imagine you're building an AI interviewer for ABTalks.

Your agent's job

Suppose Sarah starts an interview.

Your backend does something like:

Load Candidate Profile

↓

Sarah
Senior Data Engineer

Completed:
7
8
10
12
16
22
23
28
31

Weak:
Prompt Engineering
Docker

Skipped:
Monitoring


Then the agent retrieves the curriculum for only those topics.

Instead of sending all 31 days to the LLM, it retrieves only the relevant curriculum entries (for example, Embeddings, Vector Databases, Retrieval, Prompt Engineering, MCP, etc.) based on Sarah's completed missions.  

Then the interview begins

Agent:

Explain what embeddings are.

Candidate:

...

Agent:

Good. You mentioned embeddings are vectors.
How are they generated?

Candidate:

...

Agent:

Nice.
Now suppose your vector database has 20 million vectors.
Would you still use ChromaDB?

Notice that every next question depends on the previous answer.

So where does RAG come in?

This is something many people misunderstand.

You are not building a chatbot over the candidate profile.

You're building an interviewer that uses RAG as its knowledge source.

The retrieval pipeline looks like:

Candidate selected

↓

Read candidate profile

↓

Determine interview plan

↓

Retrieve curriculum content

↓

Give relevant context to LLM

↓

Generate next interview question


The LLM doesn't need to memorize the entire curriculum because your backend retrieves the relevant curriculum chunks first.

Candidate profile is NOT the knowledge base

Think of the candidate profile as metadata.

It answers:

What has the candidate learned?
What should be asked?
Which topics were skipped?
Which topics were difficult?
How experienced is the candidate?

The curriculum is the actual knowledge source used to generate technically correct questions.

Context management

Yes, you also need to maintain interview context.

Example:

Q1
Embeddings

↓

Answered well

↓

Q2
Similarity Search

↓

Answered poorly

↓

Follow-up

↓

Q3
Vector Database

↓

Answered well

↓

Q4
RAG Pipeline


The agent remembers:

questions already asked
candidate answers
candidate confidence
weak areas
covered curriculum days
score

This context is stored per interview session (e.g., in MongoDB or in-memory with a session ID) so every candidate has an independent conversation state.

I would divide the backend into these services
Candidate Service
        │
        │ reads candidate profile
        ▼
Interview Planner
        │
        │ selects next topic
        ▼
Curriculum Retriever (RAG)
        │
        │ fetches relevant curriculum
        ▼
LLM
        │
        │ asks question
        ▼
Evaluation Service
        │
        ▼
Interview Session


Each service has a single responsibility, making the codebase easier to maintain and test.

One suggestion

Since this is a 31-day curriculum, I actually wouldn't use a vector database initially.

The curriculum contains only 31 learning units. That's tiny. A simple lookup by day number is enough to retrieve the relevant curriculum entry efficiently. 

If the judges specifically expect a RAG implementation, you can still create embeddings and store the curriculum in ChromaDB (or another vector store), but functionally you'll often know exactly which day(s) to retrieve from the candidate profile. The vector database becomes more useful if you later add semantic retrieval—for example, asking for "all topics related to deployment" or "everything about agents" instead of retrieving by explicit day IDs. This gives you the benefits of RAG while keeping the architecture appropriate for the dataset size.

Yes. I think you've now got the core idea. I would make one refinement to your mental model so you build the right architecture.

The system is not just a RAG chatbot.

It is an AI Interview System where RAG is only one component.

Think of the flow like a human interviewer.

Candidate walks in
        │
        ▼
Read Resume/Profile
        │
        ▼
Plan Interview
        │
        ▼
Ask Question
        │
        ▼
Listen to Answer
        │
        ▼
Evaluate Answer
        │
        ▼
Decide Next Question
        │
        ▼
Repeat
        │
        ▼
Generate Feedback

The LLM is only doing the reasoning. Everything else should be handled by your backend.

Let's map your datasets.
Dataset 1
Curriculum

This answers:

What knowledge is available?

Day 7
Embeddings

Objectives:
- Understand embeddings
- Generate embeddings
- Compare embeddings
Day 8
Vector Databases

Objectives:
- Chroma
- Pinecone
- Similarity Search

This is your knowledge base.

Dataset 2
Candidate

This answers:

Who is the candidate?

Example

Sarah

Experience:
9 years

Completed:
7
8
10
12
16

Attempts:
Prompt Engineering -> 4
Docker -> 3

Skipped:
Monitoring

This is not knowledge.

This is metadata used to personalize the interview.

What happens when Sarah starts an interview?

Your backend should perform something like this.

Step 1

Load candidate

candidate = Sarah
Step 2

Analyze profile

Strong

Embeddings
Vector DB
RAG

Weak

Prompt Engineering
Docker
Step 3

Create interview plan

Q1 Embeddings

↓

Q2 Vector Database

↓

Q3 Retrieval

↓

Q4 Prompt Engineering

↓

Q5 Docker

Notice this happens before the interview starts.

Step 4

Retrieve curriculum

Suppose we're asking about Embeddings.

Instead of giving GPT the whole curriculum

31 days

give it only

Day 7

Objectives

Examples

Tools

This is where RAG comes in.

Step 5

LLM generates question

Prompt

Candidate:

Senior Data Engineer

Experience:
9 years

Weak topic:
Prompt Engineering

Curriculum:

Day 7
Embeddings

Conversation:

None

Generate ONE interview question.

Output

Explain what embeddings are and why they are useful in semantic search.

Step 6

Candidate answers

Embeddings are vectors...
Step 7

Evaluation

Another LLM call

Question

...

Answer

...

Returns

{
  "accuracy": 8,
  "depth": 6,
  "clarity": 9,
  "needsFollowUp": true,
  "missingConcepts": [
    "distance metrics"
  ]
}
Step 8

Planner decides

Instead of randomly asking another question

Planner checks

Need follow-up?

YES

Next question

Which distance metric would you use and why?

Notice something important.

The LLM does not decide the interview flow.

Your backend does.

The LLM only

asks questions
evaluates answers
generates feedback

Everything else is deterministic.

Where should conversation context live?

Not inside GPT.

Inside MongoDB.

Interview Session

sessionId

candidateId

coveredTopics

questionNumber

history

scores

followUpPending

weakTopics

strongTopics

completed

Every API call loads this session.

POST /answer

↓

Load session

↓

Evaluate answer

↓

Update scores

↓

Generate next question

↓

Save session

This makes the interview resumable and keeps the backend in control.

Should you use a Vector Database?

This is where many hackathon teams over-engineer things.

Your curriculum has only 31 days.

That's roughly 31 documents.

A vector database is not technically necessary because you often know exactly which day(s) to retrieve from the candidate profile.

However, because the hackathon explicitly mentions building a RAG-based agent, I'd still include one.

A practical compromise is:

Curriculum JSON

↓

Chunk by day

↓

Generate embeddings

↓

Store in ChromaDB

During the interview, your planner can retrieve by topic or day while still using semantic search when needed. That demonstrates a real RAG pipeline without forcing every retrieval through vector similarity.

I would organize the backend like this
server/
│
├── routes/
│   └── interview.routes.js
│
├── controllers/
│   └── interview.controller.js
│
├── services/
│   ├── candidateAnalyzer.service.js
│   ├── interviewPlanner.service.js
│   ├── retriever.service.js
│   ├── ai.service.js
│   ├── evaluation.service.js
│   └── feedback.service.js
│
├── models/
│   ├── Candidate.js
│   ├── Curriculum.js
│   └── InterviewSession.js
│
├── prompts/
│   ├── question.prompt.js
│   ├── evaluation.prompt.js
│   └── feedback.prompt.js
│
├── utils/
│   ├── scoring.js
│   └── topicMapper.js
│
└── server.js

Each service has one responsibility:

Candidate Analyzer: Reads the candidate profile and identifies strengths, weaknesses, skipped topics, and interview difficulty.
Interview Planner: Chooses the next topic and ensures balanced curriculum coverage.
Retriever (RAG): Fetches the relevant curriculum chunks.
AI Service: Generates interview questions and follow-ups using the retrieved context.
Evaluation Service: Scores answers and determines whether a follow-up is needed.
Feedback Service: Produces the final interview report.

This separation will make the project much easier to debug, extend, and explain during the hackathon.

we are going to write the code, give me the file structure, We are building it using MERN stack

Since you're building this as a MERN + AI Agent application, I'd recommend organizing it as if it's a production application rather than a simple CRUD app. Keep the AI logic separate from Express routes so you can later swap LLMs, vector databases, or even add LangGraph without rewriting your API.

Overall Project Structure
ai-interviewer/
│
├── client/                     # React + Vite
│
├── server/                     # Express + MongoDB + AI
│
├── data/                       # Initial JSON files
│   ├── curriculum.json
│   └── candidates.json
│
├── README.md
├── .gitignore
└── docker-compose.yml          # Optional
Frontend (React)
client/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── CandidateSelection.jsx
│   │   ├── Interview.jsx
│   │   ├── Feedback.jsx
│   │   └── NotFound.jsx
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── CandidateCard/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── TypingIndicator.jsx
│   │   │
│   │   ├── Progress/
│   │   │   └── ProgressBar.jsx
│   │   │
│   │   └── Feedback/
│   │       ├── ScoreCard.jsx
│   │       ├── Strengths.jsx
│   │       └── Weaknesses.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── interviewApi.js
│   │
│   ├── hooks/
│   │   ├── useInterview.js
│   │   └── useSession.js
│   │
│   ├── context/
│   │   └── InterviewContext.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
Backend (Express)
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
MongoDB Collections
Candidates
{
  _id,
  candidateId,
  name,
  role,
  experience,
  missions,
  signals
}
Curriculum
{
  _id,
  day,
  module,
  title,
  objectives,
  tools,
  embeddings
}
InterviewSessions
{
  sessionId,
  candidateId,

  status,

  currentQuestion,

  currentTopic,

  coveredTopics,

  coveredDays,

  history,

  scores,

  followUpPending,

  interviewPlan,

  feedback,

  startedAt,

  completedAt
}
API Structure
/api

GET

/candidates

GET

/candidates/:id

POST

/interview/start

POST

/interview/answer

POST

/interview/end

GET

/interview/:sessionId
AI Pipeline (inside the backend)
Request

↓

Interview Controller

↓

Candidate Analyzer

↓

Interview Planner

↓

RAG Retriever

↓

Prompt Builder

↓

LLM

↓

Evaluator

↓

Session Manager

↓

Response

Each module has a single responsibility:

Candidate Analyzer reads the candidate profile and derives strengths, weaknesses, skipped topics, and interview difficulty.
Interview Planner selects the next curriculum topic and ensures balanced coverage.
Retriever (RAG) fetches the relevant curriculum chunks.
Prompt Builder constructs the LLM prompt with candidate data, retrieved context, and conversation history.
LLM generates the interview question or follow-up.
Evaluator scores the candidate's answer and identifies gaps.
Session Manager persists conversation history, scores, and interview progress.
Development Order

To keep development manageable, I'd build the project in this sequence:

Backend foundation: Express server, MongoDB connection, models, and basic routes.
Data import: Load curriculum.json and candidates.json into MongoDB.
Interview session APIs: Implement /start, /answer, and /end with session persistence.
AI integration: Connect the LLM for question generation and answer evaluation.
RAG layer: Add curriculum chunking, embeddings, and retrieval.
React frontend: Candidate selection, chat interface, progress indicator, and feedback dashboard.
Polish: Streaming responses, better scoring visualizations, and deployment.

This structure keeps the Express layer thin, isolates AI-specific logic from business logic, and makes it easy to replace the LLM or vector store later without affecting the rest of the application.