window.TEK17Rules = window.TEK17Rules || {};

window.TEK17Rules.classifyMeasure = function classifyMeasure(input, riskResult, fireResult, legalReferences) {
  const drivers = [];
  const reasons = [];
  let value = 1;

  if (input.complexity === "medium") drivers.push("middels kompleksitet");
  if (input.consequence === "medium") drivers.push("middels konsekvens");
  if (input.coordination) drivers.push("tett samordning mellom flere fagområder");
  if (fireResult.finalValue === 3) drivers.push("brannklasse 3");
  if (input.taskType === "independent-control" && fireResult.finalValue >= 3) drivers.push("uavhengig kontroll av høyere brannklasse");

  if (drivers.length) {
    value = 2;
  }

  const highDrivers = [];
  if (input.complexity === "high") highDrivers.push("høy kompleksitet");
  if (input.consequence === "large") highDrivers.push("store konsekvenser ved feil");
  if (input.analysis) highDrivers.push("analyse eller fraviksvurdering");
  if (fireResult.finalValue === 4) highDrivers.push("brannklasse 4");
  if (riskResult.value === 6) highDrivers.push("risikoklasse 6");
  if (input.taskType === "fire-concept" && (input.analysis || fireResult.finalValue >= 3 || riskResult.value === 6)) {
    highDrivers.push("brannkonsept med særskilt dokumentasjonsbehov");
  }

  if (highDrivers.length) {
    value = 3;
  }

  reasons.push(`${labelTaskType(input.taskType)} vurderes som oppgave/fagområde etter SAK10.`);
  reasons.push(`Oppgaven vurderes med ${labelComplexity(input.complexity).toLowerCase()} kompleksitet og ${labelConsequence(input.consequence).toLowerCase()}.`);
  if (input.preaccepted && !input.analysis) reasons.push("Brannkonseptet bygger i hovedsak på preaksepterte ytelser.");
  if (input.analysis) reasons.push("Analyse eller fraviksvurdering trekker tiltaket opp i tiltaksklasse 3.");
  if (input.coordination) reasons.push("Tett samordning mellom flere fagområder trekker vurderingen opp.");
  if (fireResult.finalValue === 4) reasons.push("BKL 4 er en sterk indikator på høy konsekvens og behov for særskilt dokumentasjon.");
  if (riskResult.value === 6) reasons.push("Risikoklasse 6 trekker vurderingen opp fordi personsikkerheten normalt krever særlig kontroll med løsningene.");

  const allDrivers = [...drivers, ...highDrivers];
  if (allDrivers.length) {
    reasons.push(`Utslagsgivende forhold: ${Array.from(new Set(allDrivers)).join(", ")}.`);
  } else {
    reasons.push("Ingen forhold i denne vurderingen trekker opp fra tiltaksklasse 1.");
  }

  return {
    value,
    confidence: value === 1 ? "simple" : value === 2 ? "normal" : "complex",
    status: value === 1 ? "low-complexity" : value === 2 ? "moderate-complexity" : "high-complexity",
    statusLabel: value === 1 ? "Enkel oppgave" : value === 2 ? "Middels kompleksitet" : "Høy kompleksitet",
    taskType: input.taskType,
    taskLabel: labelTaskType(input.taskType),
    drivers: Array.from(new Set(allDrivers)),
    reasons,
    legalBasis: [legalReferences.measure93, legalReferences.measure94],
  };
};

function labelTaskType(value) {
  return {
    "fire-concept": "Brannkonsept / prosjektering av brannsikkerhet",
    "fire-detailing": "Detaljprosjektering av branntekniske ytelser",
    "independent-control": "Uavhengig kontroll av brannsikkerhet",
    "execution-follow-up": "Utførelsesoppfølging / kontroll på byggeplass",
  }[value] ?? "Brannteknisk oppgave";
}

function labelComplexity(value) {
  return { low: "Lav", medium: "Middels", high: "Høy" }[value];
}

function labelConsequence(value) {
  return { small: "små konsekvenser", medium: "middels konsekvenser", large: "store konsekvenser" }[value];
}
