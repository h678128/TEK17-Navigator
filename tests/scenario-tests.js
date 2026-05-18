const path = require("node:path");

global.window = global;

const root = path.resolve(__dirname, "..");

require(path.join(root, "src/data/buildingTypes.js"));
require(path.join(root, "src/data/legalReferences.js"));
require(path.join(root, "src/data/fireClassTable.js"));
require(path.join(root, "src/data/fireClassExceptions.js"));
require(path.join(root, "src/rules/riskClass.js"));
require(path.join(root, "src/rules/fireClass.js"));

const data = global.TEK17Data;
const rules = global.TEK17Rules;
const checks = [];

function risk(usageId) {
  const usage = data.usageTypes.find((item) => item.id === usageId);
  const input = { usageType: usageId, ...usage.criteria, doesNotFitStandardType: false };
  return rules.classifyRisk(input, usage, data.legalReferences);
}

function riskWithOverrides(usageId, overrides) {
  const usage = data.usageTypes.find((item) => item.id === usageId);
  const input = { usageType: usageId, ...usage.criteria, doesNotFitStandardType: false, ...overrides };
  return rules.classifyRisk(input, usage, data.legalReferences);
}

function fire(usageId, totalFloors, extra = {}) {
  const usage = data.usageTypes.find((item) => item.id === usageId);
  const riskResult = risk(usageId);
  const input = {
    totalFloors,
    grossAreaPerFloor: 1000,
    directToTerrain: false,
    rkl6DwellingTwoFloors: false,
    mainlyBelowGround: false,
    criticalInfrastructure: false,
    chemicalOrHazardousProduction: false,
    storesHazardousSubstances: false,
    ...extra,
  };

  return {
    riskResult,
    fireResult: rules.classifyFire(
      input,
      usage,
      riskResult,
      data.fireClassTable,
      data.legalReferences,
      data.fireClassExceptions,
      data.fireClassAnalysisTriggers,
    ),
  };
}

function expect(label, actual, expected) {
  checks.push({ label, actual, expected, ok: actual === expected });
}

// RKL examples from TEK17 § 11-2 tabell 1.
for (const usage of data.usageTypes.filter((item) => item.riskClass)) {
  expect(`${usage.name} -> RKL ${usage.riskClass}`, risk(usage.id).value, usage.riskClass);
}

expect("Bolig med ukjente romningsforhold -> kriterier peker mot RKL 6", riskWithOverrides("bolig", { usersKnowEscapeRoutes: false }).value, 6);
expect("Bolig med ukjente romningsforhold -> avvik fra byggtype", riskWithOverrides("bolig", { usersKnowEscapeRoutes: false }).hasDeviation, true);
expect("Bolig med ukjente romningsforhold -> kriteriebasert status", riskWithOverrides("bolig", { usersKnowEscapeRoutes: false }).status, "criteria-derived");
expect("Kontor med overnatting og hoy brannfare -> manuell vurdering", riskWithOverrides("kontor", { overnightStay: true }).value, null);
expect("Kontor med overnatting og hoy brannfare -> manuell status", riskWithOverrides("kontor", { overnightStay: true }).status, "manual-assessment");
expect("Kontor med manuell RKL etter vurdering -> bruker valgt RKL videre", riskWithOverrides("kontor", { overnightStay: true, manualRiskClassOverride: 4 }).value, 4);
expect("Kontor med manuell RKL etter vurdering -> manuell overstyring status", riskWithOverrides("kontor", { overnightStay: true, manualRiskClassOverride: 4 }).status, "manual-override");

// BKL normal table from TEK17 § 11-3 tabell 1.
expect("RKL 1 / 1 etasje -> ingen BKL", fire("garasje-en-etasje", 1).fireResult.finalValue, null);
expect("Kontor RKL 2 / 4 etasjer -> BKL 2", fire("kontor", 4).fireResult.finalValue, 2);
expect("Kontor RKL 2 / 5 etasjer -> BKL 3", fire("kontor", 5).fireResult.finalValue, 3);
expect("Skole RKL 3 / 2 etasjer -> BKL 1", fire("skole", 2).fireResult.finalValue, 1);
expect("Bolig RKL 4 / 3 etasjer normal -> BKL 2", fire("bolig", 3).fireResult.finalValue, 2);
expect("Hotell RKL 6 / 3 etasjer normal -> BKL 2", fire("hotell", 3).fireResult.finalValue, 2);
expect("Hotell RKL 6 / 5 etasjer -> BKL 3", fire("hotell", 5).fireResult.finalValue, 3);

// Exceptions from TEK17 § 11-3 preaksepterte ytelser nr. 3-7.
expect("Bolig RKL4 3 etasjer direkte terreng -> BKL 1 unntak", fire("bolig", 3, { directToTerrain: true }).fireResult.finalValue, 1);
expect("Salgslokale 2 etasjer <800 m2 -> BKL 1 unntak", fire("salgslokale", 2, { grossAreaPerFloor: 799 }).fireResult.finalValue, 1);
expect("Forsamlingslokale 2 etasjer 800 m2 -> normal BKL 2", fire("forsamlingslokale", 2, { grossAreaPerFloor: 800 }).fireResult.finalValue, 2);
expect("Hotell 2 etasjer <300 m2 -> BKL 1 unntak", fire("hotell", 2, { grossAreaPerFloor: 299 }).fireResult.finalValue, 1);
expect("Hotell 2 etasjer 300 m2 -> normal BKL 2", fire("hotell", 2, { grossAreaPerFloor: 300 }).fireResult.finalValue, 2);
expect("RKL6 bolig 2 etasjer flagg -> BKL 1 unntak", fire("tilrettelagt-bolig", 2, { rkl6DwellingTwoFloors: true }).fireResult.finalValue, 1);
expect("BKL4 trigger >16 etasjer -> BKL 4", fire("kontor", 17).fireResult.finalValue, 4);
expect("BKL4 trigger under terreng -> BKL 4", fire("kontor", 2, { mainlyBelowGround: true }).fireResult.finalValue, 4);

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} | ${check.label} | expected=${check.expected} actual=${check.actual}`);
}

const failed = checks.filter((check) => !check.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);

if (failed.length) {
  process.exit(1);
}
