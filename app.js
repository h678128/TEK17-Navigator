const usageTypes = [
  {
    id: "bolig",
    name: "Bolig",
    riskClass: 4,
    note: "Overnatting, brukere kan normalt rømme selv.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: true,
      lowFireHazard: true,
    },
  },
  {
    id: "kontor",
    name: "Kontor",
    riskClass: 2,
    note: "Kjente rømningsforhold, ikke overnatting.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: false,
    },
  },
  {
    id: "skole",
    name: "Skole",
    riskClass: 3,
    note: "Ikke overnatting, liten brannfare.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "barnehage",
    name: "Barnehage",
    riskClass: 3,
    note: "Angitt som RKL 3 i TEK17-tabellen.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "lager",
    name: "Lager",
    riskClass: 2,
    note: "Kan ha begrenset personopphold og høyere brannfare.",
    criteria: {
      sporadicOccupancyOnly: true,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: false,
    },
  },
  {
    id: "salgslokale",
    name: "Salgslokale",
    riskClass: 5,
    note: "Publikum kjenner normalt ikke rømningsforholdene.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: false,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "forsamlingslokale",
    name: "Forsamlingslokale",
    riskClass: 5,
    note: "Publikumsbygg uten overnatting.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: false,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "hotell",
    name: "Hotell / overnatting",
    riskClass: 6,
    note: "Overnatting og ukjente rømningsforhold.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: false,
      usersCanSelfEvacuate: true,
      overnightStay: true,
      lowFireHazard: true,
    },
  },
  {
    id: "pleieinstitusjon",
    name: "Sykehjem / pleieinstitusjon",
    riskClass: 6,
    note: "Personer kan ikke nødvendigvis bringe seg selv i sikkerhet.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: false,
      usersCanSelfEvacuate: false,
      overnightStay: true,
      lowFireHazard: true,
    },
  },
  {
    id: "garasje",
    name: "Garasje",
    riskClass: 1,
    note: "Sporadisk personopphold. Etasjeantall vurderes separat.",
    criteria: {
      sporadicOccupancyOnly: true,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "annet",
    name: "Annet",
    riskClass: null,
    note: "Brukes når virksomheten ikke finnes i listen.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
  {
    id: "usikker",
    name: "Usikker",
    riskClass: null,
    note: "Start med nøytrale kriterier og dokumenter vurderingen.",
    criteria: {
      sporadicOccupancyOnly: false,
      usersKnowEscapeRoutes: true,
      usersCanSelfEvacuate: true,
      overnightStay: false,
      lowFireHazard: true,
    },
  },
];

const legalReferences = {
  risk: {
    title: "TEK17 § 11-2 Risikoklasser",
    tag: "TEK17",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11/i/11-2",
    summary:
      "Byggverk eller ulike bruksområder plasseres i risikoklasse ut fra trussel mot liv og helse. Kriteriene er personopphold, rømningsforutsetninger, overnatting og brannfare.",
  },
  fire: {
    title: "TEK17 § 11-3 Brannklasser",
    tag: "TEK17",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11/i/11-3",
    summary:
      "Byggverk eller ulike deler plasseres i brannklasse etter konsekvens ved brann. Preakseptert tabell kobler risikoklasse og totalt antall etasjer.",
  },
  mixedUse: {
    title: "TEK17 § 11-3, blandet bruk",
    tag: "TEK17",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11/i/11-3",
    summary:
      "Ved blandet bruk klassifiseres delene ut fra aktuell bruk og byggets totale antall etasjer. Underliggende etasje må minst ha samme brannklasse som overliggende.",
  },
  exceptions: {
    title: "TEK17 § 11-3, unntak og BKL 4",
    tag: "TEK17",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11/i/11-3",
    summary:
      "Bestemmelsen har egne unntak for enkelte bolig-, forsamlings-, salgs- og overnattingsbygg, og peker ut byggverk som må vurderes i brannklasse 4.",
  },
  measure93: {
    title: "SAK10 § 9-3 Fastsettelse av tiltaksklasser",
    tag: "SAK10",
    url: "https://www.dibk.no/regelverk/sak/3/9/9-3/",
    summary:
      "Oppgaver i en byggesak deles i tiltaksklasse 1, 2 eller 3. Klassen baseres på kompleksitet, vanskelighetsgrad og mulige konsekvenser av feil.",
  },
  measure94: {
    title: "SAK10 § 9-4 Oppdeling i tiltaksklasser",
    tag: "SAK10",
    url: "https://www.dibk.no/regelverk/sak/3/9/9-4/",
    summary:
      "Tiltaksklasse 1, 2 og 3 beskrives etter økende kompleksitet og konsekvens. Tiltaksklasse fastsettes for oppgaven/fagområdet i tiltaket.",
  },
};

const libraryItems = [
  legalReferences.risk,
  legalReferences.fire,
  legalReferences.exceptions,
  legalReferences.measure93,
  legalReferences.measure94,
  {
    title: "DIBK: Brann og konstruksjonssikkerhet",
    tag: "Fagstoff",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11",
    summary: "Inngang til kapittel 11 i byggteknisk forskrift med veiledning om sikkerhet ved brann.",
  },
];

const fireClassTable = {
  1: { 1: null, 2: 1, "3-4": 2, "5+": 2 },
  2: { 1: 1, 2: 1, "3-4": 2, "5+": 3 },
  3: { 1: 1, 2: 1, "3-4": 2, "5+": 3 },
  4: { 1: 1, 2: 1, "3-4": 2, "5+": 3 },
  5: { 1: 1, 2: 2, "3-4": 3, "5+": 3 },
  6: { 1: 1, 2: 2, "3-4": 2, "5+": 3 },
};

let state = {
  selectedUsage: usageTypes[0],
  riskResult: null,
  fireResult: null,
  measureResult: null,
};

const $ = (id) => document.getElementById(id);

function init() {
  bindTabs();
  renderTemplates();
  renderUsageOptions();
  renderLibrary();
  applyUsagePreset("bolig");

  $("usageType").addEventListener("change", (event) => applyUsagePreset(event.target.value));
  $("templateToggle").addEventListener("click", toggleTemplatePanel);
  $("riskButton").addEventListener("click", classifyRisk);
  $("fireButton").addEventListener("click", classifyFire);
  $("measureButton").addEventListener("click", classifyMeasure);
  $("lawButton").addEventListener("click", showLegalBasis);
  $("closeDialog").addEventListener("click", () => $("lawDialog").close());
  $("advisorButton").addEventListener("click", answerAdvisorQuestion);

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      $("advisorQuestion").value = button.dataset.question;
      answerAdvisorQuestion();
    });
  });
}

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === target);
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === `${target}Tab`);
      });
    });
  });
}

function renderTemplates() {
  $("templateList").innerHTML = usageTypes
    .filter((usage) => usage.riskClass)
    .slice()
    .sort((a, b) => a.riskClass - b.riskClass || a.name.localeCompare(b.name, "no"))
    .map(
      (usage) => `
        <button type="button" class="template-card" data-template-id="${usage.id}">
          <span class="template-title">${usage.name}<span>RKL ${usage.riskClass}</span></span>
          <small>${usage.note}</small>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => applyUsagePreset(button.dataset.templateId));
  });
}

function renderUsageOptions() {
  $("usageType").innerHTML = usageTypes
    .map((usage) => `<option value="${usage.id}">${usage.name}</option>`)
    .join("");
}

function renderLibrary() {
  $("libraryGrid").innerHTML = libraryItems
    .map(
      (item) => `
        <article class="library-card">
          <span class="tag">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a href="${item.url}" target="_blank" rel="noreferrer">Åpne kilde</a>
        </article>
      `,
    )
    .join("");
}

function applyUsagePreset(usageId) {
  const usage = usageTypes.find((item) => item.id === usageId) ?? usageTypes[0];
  state = { selectedUsage: usage, riskResult: null, fireResult: null, measureResult: null };

  $("usageType").value = usage.id;
  Object.entries(usage.criteria).forEach(([key, value]) => {
    setBooleanChoice(key, value);
  });
  setBooleanChoice("doesNotFitStandardType", usage.id === "annet");
  setBooleanChoice("singleFloorRisk", usage.id === "garasje");

  document.querySelectorAll("[data-template-id]").forEach((button) => {
    button.classList.toggle("active", button.dataset.templateId === usage.id);
  });

  $("fireClassSection").disabled = true;
  $("measureClassSection").disabled = true;
  $("lawButton").classList.add("hidden");
  renderResults();
}

function readRiskInput() {
  return {
    usageType: $("usageType").value,
    sporadicOccupancyOnly: readBooleanChoice("sporadicOccupancyOnly"),
    usersKnowEscapeRoutes: readBooleanChoice("usersKnowEscapeRoutes"),
    usersCanSelfEvacuate: readBooleanChoice("usersCanSelfEvacuate"),
    overnightStay: readBooleanChoice("overnightStay"),
    lowFireHazard: readBooleanChoice("lowFireHazard"),
    doesNotFitStandardType: readBooleanChoice("doesNotFitStandardType"),
    singleFloorRisk: readBooleanChoice("singleFloorRisk"),
  };
}

function toggleTemplatePanel() {
  const panel = $("templatePanel");
  const isCollapsed = panel.classList.toggle("collapsed");
  $("templateToggle").textContent = isCollapsed ? "Vis forslag" : "Skjul forslag";
  $("templateToggle").setAttribute("aria-expanded", String(!isCollapsed));
}

function classifyRisk() {
  const input = readRiskInput();
  const usage = usageTypes.find((item) => item.id === input.usageType);
  const reasons = [];
  const derivedValue = deriveRiskClassFromCriteria(input);
  const mismatches = usage?.criteria ? getCriteriaMismatches(input, usage.criteria) : [];
  const warnings = getRiskInputWarnings(input);
  const standardMatch = Boolean(usage?.riskClass && !input.doesNotFitStandardType && mismatches.length === 0);
  let value = standardMatch ? usage.riskClass : derivedValue;
  let confidence = "preaccepted";

  reasons.push(describeRiskCriteria(input));

  if (standardMatch) {
    reasons.push(`${usage.name} er angitt som risikoklasse ${usage.riskClass} i TEK17-veiledningens virksomhetstabell.`);
  } else {
    confidence = "requires-assessment";
    if (derivedValue) {
      reasons.push(`Flervalget peker mot risikoklasse ${derivedValue} etter kriteriene i TEK17 § 11-2.`);
      value = derivedValue;
    } else if (usage?.riskClass) {
      reasons.push(`${usage.name} har normalt risikoklasse ${usage.riskClass}, men kriteriene treffer ikke rent i tabellen.`);
      value = usage.riskClass;
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

  if (!value || confidence === "requires-assessment") {
    reasons.push("Resultatet bør kontrolleres av fagperson og dokumenteres med valgt hjemmel.");
  }

  state.riskResult = {
    value,
    confidence,
    reasons,
    legalBasis: [legalReferences.risk],
  };
  state.fireResult = null;
  state.measureResult = null;
  $("fireClassSection").disabled = !value;
  $("measureClassSection").disabled = true;
  $("lawButton").classList.add("hidden");
  renderResults();
}

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

function setBooleanChoice(id, value) {
  $(id).value = value ? "true" : "false";
}

function readBooleanChoice(id) {
  return $(id).value === "true";
}

function describeRiskCriteria(input) {
  const occupancy = input.sporadicOccupancyOnly ? "kun sporadisk personopphold" : "ikke bare sporadisk personopphold";
  const escapeKnowledge = input.usersKnowEscapeRoutes ? "brukerne kjenner rømningsforholdene" : "brukerne kjenner normalt ikke rømningsforholdene";
  const selfRescue = input.usersCanSelfEvacuate ? "brukerne kan selvredde" : "brukerne kan ikke nødvendigvis selvredde";
  const overnight = input.overnightStay ? "overnatting" : "ikke overnatting";
  const fireHazard = input.lowFireHazard ? "liten brannfare" : "ikke liten / forhøyet brannfare";
  const floorScope = input.singleFloorRisk ? "én etasje" : "flere etasjer eller ikke avklart";

  return `Valgte kriterier: ${occupancy}, ${escapeKnowledge}, ${selfRescue}, ${overnight}, ${fireHazard}, ${floorScope}.`;
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

  if (input.usageType === "garasje" && !input.singleFloorRisk) {
    warnings.push("Garasje er valgt uten at én etasje er bekreftet. Kontroller at risikoklasse 1 fortsatt er riktig.");
  }

  return warnings;
}

function readFireInput() {
  return {
    totalFloors: Number($("totalFloors").value),
    grossAreaPerFloor: Number($("grossAreaPerFloor").value),
    directToTerrain: $("directToTerrain").checked,
    rkl6DwellingTwoFloors: $("rkl6DwellingTwoFloors").checked,
    mainlyBelowGround: $("mainlyBelowGround").checked,
    criticalInfrastructure: $("criticalInfrastructure").checked,
    chemicalOrHazardousProduction: $("chemicalOrHazardousProduction").checked,
    storesHazardousSubstances: $("storesHazardousSubstances").checked,
  };
}

function classifyFire() {
  if (!state.riskResult?.value) return;

  const input = readFireInput();
  const usage = state.selectedUsage;
  const reasons = [];
  const legalBasis = [legalReferences.fire];
  const bkl4Triggers = [
    input.totalFloors > 16 && "Byggverket har mer enn 16 etasjer.",
    input.mainlyBelowGround && "Byggverket ligger i hovedsak under terreng.",
    input.criticalInfrastructure && "Brann kan ramme vesentlige samfunnsinteresser.",
    input.chemicalOrHazardousProduction && "Byggverket gjelder kjemisk industri eller miljøfarlig produksjon.",
    input.storesHazardousSubstances && "Byggverket lagrer særlig farlige stoffer.",
  ].filter(Boolean);

  if (bkl4Triggers.length) {
    state.fireResult = {
      normalValue: getNormalFireClass(state.riskResult.value, input.totalFloors),
      finalValue: 4,
      confidence: "requires-analysis",
      reasons: [
        ...bkl4Triggers,
        "Konsekvensen ved brann kan bli særlig stor, og sikkerheten må dokumenteres ved analyse.",
      ],
      legalBasis: [...legalBasis, legalReferences.exceptions],
    };
    state.measureResult = null;
    $("measureClassSection").disabled = false;
    $("lawButton").classList.add("hidden");
    renderResults();
    return;
  }

  const normalValue = getNormalFireClass(state.riskResult.value, input.totalFloors);
  let finalValue = normalValue;
  let confidence = "preaccepted";

  reasons.push(`Normal tabell gir ${formatFireClass(normalValue)} for RKL ${state.riskResult.value} og ${input.totalFloors} etasje(r).`);

  const exception = findFireClassException(usage, state.riskResult.value, input);
  if (exception) {
    finalValue = exception.value;
    confidence = "preaccepted-exception";
    reasons.push(exception.reason);
    legalBasis.push(legalReferences.exceptions);
  }

  state.fireResult = {
    normalValue,
    finalValue,
    confidence,
    reasons,
    legalBasis,
  };
  state.measureResult = null;
  $("measureClassSection").disabled = false;
  $("lawButton").classList.add("hidden");
  renderResults();
}

function getNormalFireClass(riskClass, floors) {
  const floorKey = floors === 1 ? 1 : floors === 2 ? 2 : floors <= 4 ? "3-4" : "5+";
  return fireClassTable[riskClass][floorKey];
}

function findFireClassException(usage, riskClass, input) {
  if (usage.id === "bolig" && riskClass === 4 && input.totalFloors === 3 && input.directToTerrain) {
    return {
      value: 1,
      reason: "Boligbygning i RKL 4 med tre etasjer kan oppføres i BKL 1 når hver boenhet har direkte utgang til terreng.",
    };
  }

  if (
    ["salgslokale", "forsamlingslokale"].includes(usage.id) &&
    input.totalFloors <= 2 &&
    input.grossAreaPerFloor < 800
  ) {
    return {
      value: 1,
      reason: "Forsamlingslokale eller salgslokale med høyst to etasjer og bruttoareal under 800 m2 per etasje kan oppføres i BKL 1.",
    };
  }

  if (usage.id === "hotell" && input.totalFloors <= 2 && input.grossAreaPerFloor < 300) {
    return {
      value: 1,
      reason: "Overnattingsbygning med høyst to etasjer og bruttoareal under 300 m2 per etasje kan oppføres i BKL 1.",
    };
  }

  if (riskClass === 6 && input.totalFloors === 2 && input.rkl6DwellingTwoFloors) {
    return {
      value: 1,
      reason: "Boligbygning i RKL 6 i to etasjer kan etter unntak oppføres i BKL 1.",
    };
  }

  return null;
}

function classifyMeasure() {
  if (!state.fireResult) return;

  const complexity = $("complexityLevel").value;
  const consequence = $("failureConsequence").value;
  const preaccepted = $("usesOnlyPreacceptedSolutions").checked;
  const analysis = $("requiresFireEngineeringAnalysis").checked;
  const coordination = $("multipleResponsibleDisciplines").checked;
  const reasons = [];
  let value = 1;

  if (complexity === "medium" || consequence === "medium" || coordination || state.fireResult.finalValue === 3) {
    value = 2;
  }

  if (
    complexity === "high" ||
    consequence === "large" ||
    analysis ||
    state.fireResult.finalValue === 4 ||
    state.riskResult.value === 6
  ) {
    value = 3;
  }

  reasons.push(`Oppgaven vurderes med ${labelComplexity(complexity).toLowerCase()} kompleksitet og ${labelConsequence(consequence).toLowerCase()}.`);
  if (preaccepted && !analysis) reasons.push("Brannkonseptet bygger i hovedsak på preaksepterte ytelser.");
  if (analysis) reasons.push("Analyse eller fraviksvurdering trekker tiltaket opp i tiltaksklasse 3 i denne demoen.");
  if (coordination) reasons.push("Tett samordning mellom flere fagområder trekker vurderingen opp.");
  if (state.fireResult.finalValue === 4) reasons.push("BKL 4 er en sterk indikator på høy konsekvens og behov for særskilt dokumentasjon.");

  state.measureResult = {
    value,
    confidence: value === 1 ? "simple" : value === 2 ? "normal" : "complex",
    reasons,
    legalBasis: [legalReferences.measure93, legalReferences.measure94],
  };
  $("lawButton").classList.remove("hidden");
  renderResults();
}

function labelComplexity(value) {
  return { low: "Lav", medium: "Middels", high: "Høy" }[value];
}

function labelConsequence(value) {
  return { small: "små konsekvenser", medium: "middels konsekvenser", large: "store konsekvenser" }[value];
}

function renderResults() {
  const riskEl = $("riskResult");
  const fireEl = $("fireResult");
  const measureEl = $("measureResult");
  const reasons = [];

  if (state.riskResult) {
    riskEl.className = `result-card ${state.riskResult.confidence === "preaccepted" ? "good" : "warn"}`;
    riskEl.innerHTML = `
      <span class="result-label">Risikoklasse</span>
      <strong>${state.riskResult.value ? `RKL ${state.riskResult.value}` : "Vurdering"}</strong>
      <span>${state.riskResult.confidence === "preaccepted" ? "Preakseptert forslag" : "Krever begrunnelse"}</span>
    `;
    reasons.push(...state.riskResult.reasons);
    $("resultHint").textContent = state.riskResult.value
      ? "Risikoklasse er satt. Gå videre til brannklasse."
      : "Risikoklasse må vurderes manuelt.";
  } else {
    riskEl.className = "result-card muted";
    riskEl.innerHTML = `<span class="result-label">Risikoklasse</span><strong>Ikke klassifisert</strong>`;
    $("resultHint").textContent = "Kjør risikoklasse først.";
  }

  if (state.fireResult) {
    const variant = state.fireResult.finalValue === 4 ? "danger" : "good";
    fireEl.className = `result-card ${variant}`;
    fireEl.innerHTML = `
      <span class="result-label">Brannklasse</span>
      <strong>${formatFireClass(state.fireResult.finalValue)}</strong>
      <span>${state.fireResult.confidence === "requires-analysis" ? "Analyse kreves" : "Preakseptert forslag"}</span>
    `;
    reasons.push(...state.fireResult.reasons);
    $("resultHint").textContent = "Brannklasse er satt. Vurder tiltaksklasse for oppgaven.";
  } else {
    fireEl.className = "result-card muted";
    fireEl.innerHTML = `<span class="result-label">Brannklasse</span><strong>${state.riskResult?.value ? "Ikke klassifisert" : "Venter på RKL"}</strong>`;
  }

  if (state.measureResult) {
    measureEl.className = `result-card ${state.measureResult.value === 3 ? "warn" : "good"}`;
    measureEl.innerHTML = `
      <span class="result-label">Tiltaksklasse</span>
      <strong>TKL ${state.measureResult.value}</strong>
      <span>Forslag for brannkonsept/oppgave</span>
    `;
    reasons.push(...state.measureResult.reasons);
    $("resultHint").textContent = "Klassifisering ferdig. Hjemmel er tilgjengelig.";
  } else {
    measureEl.className = "result-card muted";
    measureEl.innerHTML = `<span class="result-label">Tiltaksklasse</span><strong>${state.fireResult ? "Ikke vurdert" : "Venter på BKL"}</strong>`;
  }

  $("reasonList").innerHTML = reasons.length
    ? reasons.map((reason) => `<li>${reason}</li>`).join("")
    : "<li>Velg byggtype eller start med egne kriterier.</li>";

  $("flowStatus").textContent = state.measureResult
    ? "Ferdig"
    : state.fireResult
      ? "BKL satt"
      : state.riskResult
        ? "RKL satt"
        : "Demo";
}

function formatFireClass(value) {
  return value ? `BKL ${value}` : "Ingen BKL";
}

function showLegalBasis() {
  const refs = [
    ...(state.riskResult?.legalBasis ?? []),
    ...(state.fireResult?.legalBasis ?? []),
    ...(state.measureResult?.legalBasis ?? []),
  ];
  const uniqueRefs = Array.from(new Map(refs.map((item) => [item.title, item])).values());
  const decisionReasons = [
    ...(state.riskResult?.reasons ?? []),
    ...(state.fireResult?.reasons ?? []),
    ...(state.measureResult?.reasons ?? []),
  ];

  $("lawContent").innerHTML = `
    <article class="law-item">
      <h3>Denne klassifiseringen</h3>
      <p>Risikoklasse: ${state.riskResult?.value ? `RKL ${state.riskResult.value}` : "ikke fastsatt"}</p>
      <p>Brannklasse: ${state.fireResult ? formatFireClass(state.fireResult.finalValue) : "ikke fastsatt"}</p>
      <p>Tiltaksklasse: ${state.measureResult ? `TKL ${state.measureResult.value}` : "ikke vurdert"}</p>
      <ul>${decisionReasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>
    </article>
    ${uniqueRefs
      .map(
        (ref) => `
          <article class="law-item">
            <span class="tag">${ref.tag}</span>
            <h3>${ref.title}</h3>
            <p>${ref.summary}</p>
            <a href="${ref.url}" target="_blank" rel="noreferrer">Åpne hos DIBK</a>
          </article>
        `,
      )
      .join("")}
  `;

  $("lawDialog").showModal();
}

function answerAdvisorQuestion() {
  const question = $("advisorQuestion").value.trim();
  const normalized = question.toLowerCase();

  if (!question) {
    $("advisorAnswer").innerHTML = "Skriv inn et spørsmål først.";
    return;
  }

  const matched = [];
  if (normalized.includes("risiko") || normalized.includes("rkl")) matched.push("risk");
  if (normalized.includes("brannklasse") || normalized.includes("bkl") || normalized.includes("etasj")) matched.push("fire");
  if (normalized.includes("tiltak") || normalized.includes("tkl") || normalized.includes("ansvar")) matched.push("measure");
  if (normalized.includes("blandet") || normalized.includes("flere bruk") || normalized.includes("kombinasjon")) matched.push("mixed");

  const answer = buildAdvisorAnswer(matched.length ? matched : ["risk", "fire"]);
  $("advisorAnswer").innerHTML = `
    <p><strong>Spørsmål:</strong> ${escapeHtml(question)}</p>
    ${answer}
    <p class="field-note">Demoen simulerer en GPT-wrapper. I produksjon bør modellen bare få svare fra godkjente kilder, med sitater/referanser og tydelig usikkerhet.</p>
  `;
}

function buildAdvisorAnswer(topics) {
  const blocks = [];

  if (topics.includes("risk")) {
    blocks.push(`
      <section>
        <h3>Risikoklasse</h3>
        <p>Risikoklasse vurderes etter bruk og personsikkerhet: sporadisk personopphold, om brukerne kjenner rømningsforholdene, om de kan bringe seg selv i sikkerhet, overnatting og brannfare.</p>
        ${referenceLink(legalReferences.risk)}
      </section>
    `);
  }

  if (topics.includes("fire")) {
    blocks.push(`
      <section>
        <h3>Brannklasse</h3>
        <p>Brannklasse fastsettes etter konsekvens ved brann. I normalsporet brukes risikoklasse og totalt antall etasjer, før eventuelle unntak eller BKL 4-forhold vurderes.</p>
        ${referenceLink(legalReferences.fire)}
      </section>
    `);
  }

  if (topics.includes("measure")) {
    blocks.push(`
      <section>
        <h3>Tiltaksklasse</h3>
        <p>Tiltaksklasse hører til SAK10 og gjelder oppgaven/fagområdet i byggesaken. Den vurderes etter kompleksitet, vanskelighetsgrad og mulige konsekvenser av feil og mangler.</p>
        ${referenceLink(legalReferences.measure93)}
        ${referenceLink(legalReferences.measure94)}
      </section>
    `);
  }

  if (topics.includes("mixed")) {
    blocks.push(`
      <section>
        <h3>Blandet bruk</h3>
        <p>Ved flere bruksområder bør hver del klassifiseres etter aktuell bruk. Brannklasse må vurderes med utgangspunkt i byggets totale etasjeantall og sammenhengen mellom underliggende og overliggende deler.</p>
        ${referenceLink(legalReferences.mixedUse)}
      </section>
    `);
  }

  return blocks.join("");
}

function referenceLink(ref) {
  return `<p class="source-line">Kilde: <a href="${ref.url}" target="_blank" rel="noreferrer">${ref.title}</a></p>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char];
  });
}

init();
