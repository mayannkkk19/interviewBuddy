export function compileSessionFeedback(evaluations = []) {
  if (!evaluations.length) {
    return {
      summary: 'Interview completed with no evaluation records.',
      strengths: [],
      gaps: [],
      next: [],
    };
  }

  const totalScore = evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = Number((totalScore / evaluations.length).toFixed(1));

  const strengths = [...new Set(evaluations.flatMap((e) => e.strengths || []))];

  // Filter out non-gap fallback statements
  const rawGaps = evaluations.flatMap((e) => e.weaknesses || e.missingConcepts || []);
  const gaps = [...new Set(rawGaps.filter((g) => 
    g && 
    !g.toLowerCase().includes('sufficient understanding') && 
    !g.toLowerCase().includes('no significant gaps')
  ))];

  const next = [...new Set(evaluations.flatMap((e) => e.missingConcepts || []))];

  return {
    summary: `Candidate completed interview with an average evaluation score of ${averageScore}/10 across ${evaluations.length} turns.`,
    strengths,
    gaps,
    next,
  };
}