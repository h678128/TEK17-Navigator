const {
  usageTypes,
  legalReferences,
  libraryItems,
  fireClassTable,
  fireClassExceptions,
  fireClassAnalysisTriggers,
} = window.TEK17Data;
const { classifyRisk: runRiskClassification, classifyFire: runFireClassification, classifyMeasure: runMeasureClassification } = window.TEK17Rules;
const { answerQuestion } = window.TEK17Advisor;

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
  applyUsagePreset("usikker");

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
  };
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

function readMeasureInput() {
  return {
    complexity: $("complexityLevel").value,
    consequence: $("failureConsequence").value,
    preaccepted: $("usesOnlyPreacceptedSolutions").checked,
    analysis: $("requiresFireEngineeringAnalysis").checked,
    coordination: $("multipleResponsibleDisciplines").checked,
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

  state.riskResult = runRiskClassification(input, usage, legalReferences);
  state.fireResult = null;
  state.measureResult = null;
  $("fireClassSection").disabled = !state.riskResult.value;
  $("measureClassSection").disabled = true;
  $("lawButton").classList.add("hidden");
  renderResults();
}

function classifyFire() {
  if (!state.riskResult?.value) return;

  state.fireResult = runFireClassification(
    readFireInput(),
    state.selectedUsage,
    state.riskResult,
    fireClassTable,
    legalReferences,
    fireClassExceptions,
    fireClassAnalysisTriggers,
  );
  state.measureResult = null;
  $("measureClassSection").disabled = false;
  $("lawButton").classList.add("hidden");
  renderResults();
}

function classifyMeasure() {
  if (!state.fireResult) return;

  state.measureResult = runMeasureClassification(
    readMeasureInput(),
    state.riskResult,
    state.fireResult,
    legalReferences,
  );
  $("lawButton").classList.remove("hidden");
  renderResults();
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
  $("advisorAnswer").innerHTML = answerQuestion($("advisorQuestion").value, legalReferences);
}

function setBooleanChoice(id, value) {
  $(id).value = value ? "true" : "false";
}

function readBooleanChoice(id) {
  return $(id).value === "true";
}

function formatFireClass(value) {
  return value ? `BKL ${value}` : "Ingen BKL";
}

init();
