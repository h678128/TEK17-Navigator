window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.retrieveSources = function retrieveSources(question, sources) {
  const normalized = normalize(question);
  if (!normalized) return [];

  return sources
    .map((source) => ({ source, score: scoreSource(normalized, source) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((match) => match.source);
};

function scoreSource(normalizedQuestion, source) {
  return source.topics.reduce((score, topic) => {
    const normalizedTopic = normalize(topic);
    return normalizedQuestion.includes(normalizedTopic) ? score + normalizedTopic.length : score;
  }, 0);
}

function normalize(value) {
  return value.trim().toLowerCase();
}
