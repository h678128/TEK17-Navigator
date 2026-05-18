window.TEK17Rules = window.TEK17Rules || {};

window.TEK17Rules.classifyRisk = function classifyRisk(input, usage, legalReferences) {
  const reasons = [];
  const derivedValue = deriveRiskClassFromCriteria(input);
  const mismatches = usage?.criteria ? getCriteriaMismatches(input, usage.criteria) : [];
  const warnings = getRiskInputWarnings(input);
  const manualRiskClass = Number(input.manualRiskClassOverride) || null;
  const standardMatch = Boolean(usage?.riskClass && !input.doesNotFitStandardType && mismatches.length === 0);
  let value = standardMatch ? usage.riskClass : derivedValue;
  let confidence = "preaccepted";
  let status = "preaccepted";

  reasons.push(describeRiskCriteria(input));

  if (standardMatch) {
    reasons.push(`${usage.name} er angitt som risikoklasse ${usage.riskClass} i TEK17-veiledningens virksomhetstabell.`);
  } else {
    confidence = "requires-assessment";
    status = derivedValue ? "criteria-derived" : "manual-assessment";
    if (derivedValue) {
      reasons.push(`Flervalget peker mot risikoklasse ${derivedValue} etter kriteriene i TEK17 § 11-2.`);
      value = derivedValue;
    } else if (usage?.riskClass) {
      reasons.push(`${usage.name} har normalt risikoklasse ${usage.riskClass}, men de endrede kriteriene treffer ikke rent i tabellen.`);
      value = mismatches.length || input.doesNotFitStandardType ? null : usage.riskClass;
    } else {
      reasons.push("Kriteriene treffer ikke rent i den preaksepterte tabellen.");
    }
  }

  if (mismatches.length) {
    confidence = "requires-assessment";
    reasons.push(`Valgene avviker fra malen for ${usage.name}: ${mismatches.join(", ")}.`);
  }

  if (usage?.riskClass && derivedValue && derivedValue !== usage.riskClass) {
    confidence = "requires-assessment";
    reasons.push(`Byggtypen foreslår RKL ${usage.riskClass}, mens kriteriene peker mot RKL ${derivedValue}. Kriteriene bør dokumenteres.`);
  }

  if (input.doesNotFitStandardType) {
    confidence = "requires-assessment";
    reasons.push("Brukeren har markert at bruken avviker fra standard byggtype.");
  }

  if (warnings.length) {
    confidence = "requires-assessment";
    reasons.push(...warnings);
  }

  if (!value && manualRiskClass) {
    value = manualRiskClass;
    confidence = "requires-assessment";
    status = "manual-override";
    reasons.push(`RKL ${manualRiskClass} er valgt manuelt for videre brannklasseberegning.`);
  }

  if (!value || confidence === "requires-assessment") {
    reasons.push("Resultatet bør kontrolleres av fagperson og dokumenteres med valgt hjemmel.");
  }

  if (!value) {
    status = "manual-assessment";
  }

  return {
    value,
    confidence,
    status,
    usageName: usage?.name ?? null,
    standardRiskClass: usage?.riskClass ?? null,
    derivedRiskClass: derivedValue,
    manualRiskClass,
    criteriaMismatches: mismatches,
    hasDeviation: Boolean(mismatches.length || input.doesNotFitStandardType || (usage?.riskClass && derivedValue && derivedValue !== usage.riskClass)),
    warnings,
    reasons,
    legalBasis: [legalReferences.risk],
  };
};

function deriveRiskClassFromCriteria(input) {
  const selfRescue = input.usersKnowEscapeRoutes && input.usersCanSelfEvacuate;

  if (input.sporadicOccupancyOnly && selfRescue && !input.overnightStay && input.lowFireHazard) return 1;
  if (selfRescue && !input.overnightStay && !input.lowFireHazard) return 2;
  if (!input.sporadicOccupancyOnly && selfRescue && !input.overnightStay && input.lowFireHazard) return 3;
  if (!input.sporadicOccupancyOnly && selfRescue && input.overnightStay && input.lowFireHazard) return 4;
  if (!input.sporadicOccupancyOnly && !selfRescue && !input.overnightStay && input.lowFireHazard) return 5;
  if (!input.sporadicOccupancyOnly && !selfRescue && input.overnightStay && input.lowFireHazard) return 6;

  return null;
}

function describeRiskCriteria(input) {
  const occupancy = input.sporadicOccupancyOnly ? "kun sporadisk personopphold" : "ikke bare sporadisk personopphold";
  const escapeKnowledge = input.usersKnowEscapeRoutes ? "brukerne kjenner rømningsforholdene" : "brukerne kjenner normalt ikke rømningsforholdene";
  const selfRescue = input.usersCanSelfEvacuate ? "brukerne kan selvredde" : "brukerne kan ikke nødvendigvis selvredde";
  const overnight = input.overnightStay ? "overnatting" : "ikke overnatting";
  const fireHazard = input.lowFireHazard ? "liten brannfare" : "ikke liten / forhøyet brannfare";

  return `Valgte kriterier: ${occupancy}, ${escapeKnowledge}, ${selfRescue}, ${overnight}, ${fireHazard}.`;
}

function getCriteriaMismatches(input, preset) {
  const labels = {
    sporadicOccupancyOnly: "personopphold",
    usersKnowEscapeRoutes: "kjennskap til rømningsforhold",
    usersCanSelfEvacuate: "evne til selvredning",
    overnightStay: "overnatting",
    lowFireHazard: "brannfare",
  };

  return Object.keys(labels)
    .filter((key) => input[key] !== preset[key])
    .map((key) => labels[key]);
}

function getRiskInputWarnings(input) {
  const warnings = [];

  if (input.sporadicOccupancyOnly && input.overnightStay) {
    warnings.push("Sporadisk personopphold kombinert med overnatting er uvanlig og bør vurderes særskilt.");
  }

  if (input.usersKnowEscapeRoutes && !input.usersCanSelfEvacuate) {
    warnings.push("Brukerne kan kjenne rømningsforholdene, men manglende evne til selvredning trekker vurderingen opp.");
  }

  if (!input.lowFireHazard && (!input.usersKnowEscapeRoutes || input.overnightStay)) {
    warnings.push("Forhøyet brannfare sammen med ukjente rømningsforhold eller overnatting passer dårlig i standardtabellen.");
  }

  return warnings;
}
