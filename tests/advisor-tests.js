const path = require("node:path");

global.window = global;

const root = path.resolve(__dirname, "..");

require(path.join(root, "src/domain/data/legalReferences.js"));
require(path.join(root, "src/features/advisor/advisorSources.js"));
require(path.join(root, "src/features/advisor/retrieval.js"));
require(path.join(root, "src/features/advisor/answerBuilder.js"));
require(path.join(root, "src/features/advisor/localLlmClient.js"));
require(path.join(root, "src/features/advisor/advisor.js"));

const data = global.TEK17Data;
const advisor = global.TEK17Advisor;
advisor.localLlmConfig.enabled = false;
const checks = [];

function expectIncludes(label, actual, expected) {
  checks.push({ label, actual, expected, ok: actual.includes(expected) });
}

(async () => {
  expectIncludes(
    "TEK17-spørsmål henter grunnkilde",
    await advisor.answerQuestion("Hva er TEK17?", data.legalReferences),
    "byggteknisk forskrift",
  );
  expectIncludes(
    "Risikoklasse-spørsmål henter RKL-kilde",
    await advisor.answerQuestion("Hva avgjør risikoklasse for hotell?", data.legalReferences),
    "Risikoklasse",
  );
  expectIncludes(
    "BKL 4-spørsmål henter unntak/analyse-kilde",
    await advisor.answerQuestion("Når får et bygg BKL 4?", data.legalReferences),
    "Unntak og BKL 4",
  );
  expectIncludes(
    "Utenfor kildegrunnlag avgrenses",
    await advisor.answerQuestion("Hva er beste kaffemaskin?", data.legalReferences),
    "Utenfor kildegrunnlaget",
  );

  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/api/tags")) {
      return mockJsonResponse({ models: [] });
    }
    if (url.endsWith("/api/pull")) {
      return mockJsonResponse({ status: "success" });
    }
    if (url.endsWith("/api/chat")) {
      return mockJsonResponse({ message: { content: "Kort lokalt svar med kilde." } });
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  advisor.localLlmConfig.enabled = true;
  advisor.localLlmConfig.autoPull = true;
  advisor.localLlmConfig.baseUrl = "http://ollama.test";
  const statusEvents = [];
  advisor.localLlmConfig.onStatus = (event) => statusEvents.push(event.kind);
  advisor.resetLocalModelCheck();
  const localAnswer = await advisor.askLocalLlm("Hva avgjør risikoklasse?", [advisor.sources[0]], data.legalReferences);
  advisor.localLlmConfig.enabled = false;
  advisor.localLlmConfig.onStatus = null;
  global.fetch = originalFetch;

  expectIncludes("Lokal LLM laster ned manglende modell", calls.map((call) => call.url).join(" "), "/api/pull");
  expectIncludes("Lokal LLM svar rendres", localAnswer, "Lokalt LLM-svar");
  expectIncludes("Lokal LLM viser status", statusEvents.join(" "), "pulling");

  const checkCalls = [];
  global.fetch = async (url) => {
    checkCalls.push(url);
    if (url.endsWith("/api/tags")) {
      return mockJsonResponse({ models: [{ name: "llama3.1:8b" }] });
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  advisor.localLlmConfig.enabled = true;
  advisor.localLlmConfig.onStatus = (event) => statusEvents.push(event.kind);
  const checkResult = await advisor.checkLocalLlm();
  advisor.localLlmConfig.enabled = false;
  advisor.localLlmConfig.onStatus = null;
  global.fetch = originalFetch;

  expectIncludes("Ollama-sjekk bruker tags", checkCalls.join(" "), "/api/tags");
  expectIncludes("Ollama-sjekk finner modell", String(checkResult.modelAvailable), "true");

  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} | ${check.label} | expected includes=${check.expected}`);
  }

  const failed = checks.filter((check) => !check.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} advisor checks passed`);

  if (failed.length) {
    process.exit(1);
  }
})();

function mockJsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}
