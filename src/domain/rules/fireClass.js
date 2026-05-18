window.TEK17Rules = window.TEK17Rules || {};

window.TEK17Rules.classifyFire = function classifyFire(input, usage, riskResult, fireClassTable, legalReferences, exceptions, analysisTriggers) {
  const legalBasis = [legalReferences.fire];
  const context = { usage, riskClass: riskResult.value };
  const bkl4Triggers = analysisTriggers.filter((trigger) => trigger.applies(input, context));

  if (bkl4Triggers.length) {
    const normalValue = getNormalFireClass(riskResult.value, input.totalFloors, fireClassTable);
    return {
      normalValue,
      finalValue: 4,
      confidence: "requires-analysis",
      status: "requires-analysis",
      statusLabel: "BKL 4 / analyse",
      tableBasis: `Normal tabell gir ${formatFireClass(normalValue)} for RKL ${riskResult.value} og ${input.totalFloors} etasje(r).`,
      specialRuleLabel: "BKL 4-forhold må dokumenteres ved analyse",
      reasons: [
        `Normal tabell gir ${formatFireClass(normalValue)} for RKL ${riskResult.value} og ${input.totalFloors} etasje(r).`,
        ...bkl4Triggers.map((trigger) => `${trigger.reason} (${trigger.sourcePoint})`),
        "Konsekvensen ved brann kan bli særlig stor, og sikkerheten må dokumenteres ved analyse.",
      ],
      legalBasis: [...legalBasis, legalReferences.exceptions],
      matchedException: null,
      matchedExceptionLabel: null,
      matchedAnalysisTriggers: bkl4Triggers.map((trigger) => trigger.id),
      analysisTriggerLabels: bkl4Triggers.map((trigger) => trigger.reason),
    };
  }

  const normalValue = getNormalFireClass(riskResult.value, input.totalFloors, fireClassTable);
  let finalValue = normalValue;
  let confidence = "preaccepted";
  let status = "normal-table";
  let specialRuleLabel = "Normal tabell er brukt";
  const tableBasis = `Normal tabell gir ${formatFireClass(normalValue)} for RKL ${riskResult.value} og ${input.totalFloors} etasje(r).`;
  const reasons = [tableBasis];

  const exception = exceptions.find((item) => item.applies(input, context));
  if (exception) {
    finalValue = exception.resultValue;
    confidence = "preaccepted-exception";
    status = "preaccepted-exception";
    specialRuleLabel = exception.label;
    reasons.push(`Unntak som slo inn: ${exception.label}.`);
    reasons.push(`${exception.reason} (${exception.sourcePoint})`);
    legalBasis.push(legalReferences[exception.legalBasisKey]);
  }

  return {
    normalValue,
    finalValue,
    confidence,
    status,
    statusLabel: status === "preaccepted-exception" ? "Unntak fra normal tabell" : "Normal tabell",
    tableBasis,
    specialRuleLabel,
    reasons,
    legalBasis,
    matchedException: exception?.id ?? null,
    matchedExceptionLabel: exception?.label ?? null,
    matchedAnalysisTriggers: [],
    analysisTriggerLabels: [],
  };
};

function getNormalFireClass(riskClass, floors, fireClassTable) {
  const floorKey = floors === 1 ? 1 : floors === 2 ? 2 : floors <= 4 ? "3-4" : "5+";
  return fireClassTable[riskClass][floorKey];
}

function formatFireClass(value) {
  return value ? `BKL ${value}` : "Ingen BKL";
}
