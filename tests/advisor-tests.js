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

  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} | ${check.label} | expected includes=${check.expected}`);
  }

  const failed = checks.filter((check) => !check.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} advisor checks passed`);

  if (failed.length) {
    process.exit(1);
  }
})();
