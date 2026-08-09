import React, { useState, useEffect, useRef } from "react";
import { fetchCandidates, startInterview, sendAnswer } from "./api";

const getCandidateId = (c, idx) =>
  c?.candidateId || c?.candidate_id || c?.id || `cand_${idx}`;

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [turn, setTurn] = useState(1);
  const [currentDay, setCurrentDay] = useState(null);
  const [engineState, setEngineState] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [isComplete, setIsComplete] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const chatContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch initial candidates list
  useEffect(() => {
    fetchCandidates()
      .then((data) => {
        setCandidates(data);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedCandidateId(getCandidateId(data[0], 0));
        } else {
          setSelectedCandidateId("cand_default");
        }
      })
      .catch((err) => {
        console.error("Failed to load candidates, using fallback:", err);
        setSelectedCandidateId("cand_default");
      });
  }, []);

  // Handle auto-scrolling to bottom on new messages
  useEffect(() => {
    if (!chatContainerRef.current) return;
    const timer = setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  // Focus input field when ready for candidate response
  useEffect(() => {
    if (sessionId && !isComplete && !loading) {
      inputRef.current?.focus();
    }
  }, [sessionId, isComplete, loading]);

  const handleResetSession = () => {
    setSessionId(null);
    setTurn(1);
    setCurrentDay(null);
    setEngineState(null);
    setMessages([]);
    setInput("");
    setIsComplete(false);
    setLastEvaluation(null);
    setFeedback(null);
  };

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const data = await startInterview(selectedCandidateId);
      setSessionId(data.sessionId);
      setTurn(data.turn);
      setCurrentDay(data.day);
      setEngineState(data.engineState);
      setMessages([
        { role: "assistant", content: data.content, day: data.day },
      ]);
    } catch (err) {
      console.error("Session start error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isComplete) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const data = await sendAnswer(sessionId, userText, engineState);
      setTurn(data.turn);
      if (data.evaluation) setLastEvaluation(data.evaluation);
      if (data.engineState) setEngineState(data.engineState);

      if (data.isComplete) {
        setIsComplete(true);
        setFeedback(data.feedback);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      } else {
        setCurrentDay(data.day);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content, day: data.day },
        ]);
      }
    } catch (err) {
      console.error("Send answer error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Candidate Selection Screen
  if (!sessionId) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Decorative Background Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative z-10">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase shadow-inner">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              AI Assessment Platform
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Technical Evaluator
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Select a candidate profile to initialize an adaptive, real-time technical evaluation tailored to their expertise.
            </p>
          </div>

          {/* Candidate Selection List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Candidate Profiles
                <span className="bg-slate-800 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-slate-700/50">
                  {candidates.length}
                </span>
              </label>
            </div>

            {candidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {candidates.map((c, idx) => {
                  const id = getCandidateId(c, idx);
                  const name = c.name || c.full_name || "Candidate Profile";
                  const role = c.role || c.jobRole || `Specialist ${idx + 1}`;
                  const experience = c.experience || c.level || "Senior level";
                  const isSelected = selectedCandidateId === id;

                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedCandidateId(id)}
                      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/40"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                        }`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-semibold text-sm text-slate-100 truncate group-hover:text-white">
                          {name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {role}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md">
                            {id}
                          </span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">{experience}</span>
                        </div>
                      </div>

                      {/* Radio Checkbox */}
                      <div
                        className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "border border-slate-700 group-hover:border-slate-500"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => setSelectedCandidateId("cand_default")}
                className="p-4 rounded-2xl border bg-blue-600/10 border-blue-500 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    D
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">Default Standard Profile</h3>
                    <p className="text-xs text-slate-400">Software Engineering Candidate</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">✓</div>
              </div>
            )}
          </div>

          {/* Start Action */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Ready to start evaluation assessment session</span>
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading || !selectedCandidateId}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>Initialize Interview</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Chat Assessment Interface
  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              AI Technical Assessment
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Session: {sessionId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 flex items-center gap-1.5 shadow-inner">
            <span className="text-slate-500 uppercase text-[10px] font-bold">Turn</span>
            <strong className="text-blue-400 font-mono text-xs">{turn}</strong>
          </div>

          {currentDay && (
            <div className="bg-blue-950/60 border border-blue-800/50 px-3 py-1.5 rounded-xl text-blue-300 hidden sm:flex items-center gap-1.5">
              <span className="text-blue-400/80 uppercase text-[10px] font-bold">Curriculum</span>
              <strong className="text-white text-xs">Day {currentDay}</strong>
            </div>
          )}

          <button
            onClick={handleResetSession}
            className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-4">
        
        {/* Messages Scroll Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 custom-scrollbar"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {msg.role === "user" ? "Candidate Response" : "AI Assessment Engine"}
                </span>
                {msg.day && msg.role === "assistant" && (
                  <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/80 px-1.5 py-0.2 rounded font-mono">
                    Day {msg.day}
                  </span>
                )}
              </div>

              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none shadow-slate-950/50"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 w-fit text-xs text-slate-400">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
              <span>Evaluating candidate response...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Live Score Floating Badge */}
        {lastEvaluation && !isComplete && (
          <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl text-xs flex flex-wrap justify-between items-center gap-2 text-slate-300 shadow-xl backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 font-medium">Turn Score:</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-lg font-mono">
                {lastEvaluation.score} / 10
              </span>
            </div>
            {lastEvaluation.shouldAskFollowUp && (
              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Follow-up Targeted
              </span>
            )}
          </div>
        )}

        {/* Active Input or Final Assessment Card */}
        <div className="shrink-0">
          {!isComplete ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your technical answer here..."
                disabled={loading}
                className="flex-1 bg-slate-900/90 border border-white/10 focus:border-blue-500/80 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-2"
              >
                <span>Submit</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-7-9-7-9 7 9 7z" />
                </svg>
              </button>
            </form>
          ) : (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-2xl backdrop-blur-md">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Assessment Complete
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">
                    Final Performance Evaluation
                  </h3>
                </div>
                <button
                  onClick={handleResetSession}
                  className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer w-fit"
                >
                  Start New Session
                </button>
              </div>

              {feedback && (
                <div className="space-y-4 text-xs text-slate-300">
                  <p className="text-slate-200 leading-relaxed text-sm bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                    {feedback.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedback.strengths?.length > 0 && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                          Key Strengths
                        </h4>
                        <ul className="space-y-1.5 text-slate-300 pl-1">
                          {feedback.strengths.map((st, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-500">•</span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feedback.gaps?.length > 0 && (
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                        <h4 className="font-bold text-amber-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1.5 text-slate-300 pl-1">
                          {feedback.gaps.map((gp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>{gp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {feedback.next?.length > 0 && (
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider">
                        Recommended Focus Topics
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {feedback.next.map((nx, i) => (
                          <span
                            key={i}
                            className="bg-slate-900 border border-slate-700/60 text-slate-200 px-3 py-1 rounded-lg text-xs"
                          >
                            {nx}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}