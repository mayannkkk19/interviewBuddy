import React, { useState, useEffect, useRef } from "react";
import { fetchCandidates, startInterview, sendAnswer } from "./api";

// Standardized candidate ID lookup
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

  // 1. Fetch Candidates on Mount
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

  // 2. Conditional Auto-scroll
  useEffect(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom || messages.length <= 2) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // 3. Focus Input on Active Turn
  useEffect(() => {
    if (sessionId && !isComplete && !loading) {
      inputRef.current?.focus();
    }
  }, [sessionId, isComplete, loading]);

  // Reset Session State
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

  // Start Assessment
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

  // Send Answer Turn
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div>
            <h1 className="text-xl font-bold text-blue-400">
              AI Technical Interviewer
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a candidate profile to initialize evaluation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Target Candidate
            </label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {candidates.length > 0 ? (
                candidates.map((c, idx) => {
                  const id = getCandidateId(c, idx);
                  const name = c.name || c.full_name || "Candidate";
                  const role = c.role || c.jobRole || `Profile #${idx + 1}`;

                  return (
                    <option key={id} value={id}>
                      {name} — {role} (ID: {id})
                    </option>
                  );
                })
              ) : (
                <option value="cand_default">Default Candidate Profile</option>
              )}
            </select>
          </div>

          <button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Initializing Session..." : "Start Technical Assessment"}
          </button>
        </div>
      </div>
    );
  }

  // 2. Main Chat Engine Interface
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="font-bold text-sm text-white">
            AI Technical Assessment Engine
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Session: {sessionId}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="bg-slate-800 px-3 py-1 rounded-md text-slate-300 border border-slate-700">
            Turn: <strong className="text-blue-400">{turn}</strong>
          </span>
          {currentDay && (
            <span className="bg-blue-950 border border-blue-800/60 px-3 py-1 rounded-md text-blue-300">
              Curriculum Target:{" "}
              <strong className="text-white">Day {currentDay}</strong>
            </span>
          )}
          <button
            onClick={handleResetSession}
            className="ml-2 text-slate-400 hover:text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md text-[11px] transition-colors"
          >
            New Session
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col space-y-4 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.day && msg.role === "assistant" && (
                <span className="text-[10px] text-slate-500 mt-1">
                  Topic Mapping: Day {msg.day}
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 w-fit animate-pulse">
              Evaluating technical depth...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {lastEvaluation && !isComplete && (
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs flex justify-between items-center text-slate-300 shadow-md">
            <div>
              <span>Turn Score: </span>
              <strong className="text-emerald-400 font-semibold">
                {lastEvaluation.score} / 10
              </strong>
            </div>
            {lastEvaluation.shouldAskFollowUp && (
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded text-[10px]">
                Gap Detected - Follow-up Target
              </span>
            )}
          </div>
        )}

        {!isComplete ? (
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your technical explanation..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              Submit
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 border border-emerald-800/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-emerald-400">
                Final Candidate Evaluation Report
              </h3>
              <button
                onClick={handleResetSession}
                className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 px-3 py-1 rounded-full font-medium transition-colors"
              >
                Start New Assessment
              </button>
            </div>

            {feedback && (
              <div className="space-y-4 text-xs text-slate-300">
                <p className="text-slate-200 leading-relaxed">
                  {feedback.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {feedback.strengths?.length > 0 && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <h4 className="font-semibold text-emerald-300 mb-2">
                        Strengths
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {feedback.strengths.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.gaps?.length > 0 && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <h4 className="font-semibold text-amber-300 mb-2">
                        Gaps Identified
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {feedback.gaps.map((gp, i) => (
                          <li key={i}>{gp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {feedback.next?.length > 0 && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="font-semibold text-blue-300 mb-2">
                      Recommended Review Topics
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {feedback.next.map((nx, i) => (
                        <span
                          key={i}
                          className="bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px]"
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
  );
}