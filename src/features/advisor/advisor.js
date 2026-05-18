window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.answerQuestion = function answerQuestion(question, legalReferences) {
  const matchedSources = window.TEK17Advisor.retrieveSources(question, window.TEK17Advisor.sources);
  return window.TEK17Advisor.buildAnswer(question, matchedSources, legalReferences);
};
