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
  showAllTemplates: false,
  usageSearch: "",
  usageResultsOpen: false,
};

const $ = (id) => document.getElementById(id);
const riskCriteriaIds = [
  "sporadicOccupancyOnly",
  "usersKnowEscapeRoutes",
  "usersCanSelfEvacuate",
  "overnightStay",
  "lowFireHazard",
  "doesNotFitStandardType",
];
const tabIntroTexts = {
  advisor:
    "Spør en kontrollert TEK17-assistent om branntekniske krav, risikoklasse, brannklasse og tiltaksklasse. Svarene skal være korte, faglige og vise relevante kilder.",
  classify:
    "Brannfaglig klassifisering med sporbar hjemmel. Velg byggtype, juster kriteriene og få forslag til risikoklasse, brannklasse og tiltaksklasse med begrunnelse.",
  library:
    "Samlet oversikt over lovhjemler, veiledning og fagstoff som brukes i vurderingene. Bruk fanen til å kontrollere kilder og lese videre hos DIBK.",
};
const isLocalAssistantRuntime = window.TEK17Advisor.localLlmConfig.enabled;

function init() {
  bindAdvisorStatus();
  bindLlmOnboarding();
  bindTabs();
  bindRiskCriteria();
  renderTemplates();
  renderUsageOptions();
  renderLibrary();
  applyUsagePreset("usikker");

  $("usageTypeSearch").addEventListener("focus", () => {
    state.usageResultsOpen = true;
    state.usageSearch = "";
    $("usageTypeSearch").value = "";
    renderUsageCombobox();
  });
  $("usageTypeSearch").addEventListener("input", (event) => {
    state.usageSearch = event.target.value;
    state.usageResultsOpen = true;
    renderUsageCombobox();
  });
  $("usageTypeSearch").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeUsageCombobox();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const [firstResult] = getUsageSearchResults();
      if (state.usageSearch.trim() && firstResult) {
        applyUsagePreset(firstResult.id);
        $("usageTypeSearch").blur();
      } else {
        closeUsageCombobox();
      }
    }
  });
  $("usageTypeSearch").addEventListener("blur", () => {
    window.setTimeout(closeUsageCombobox, 120);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!$("usageChooser").contains(event.target)) {
      closeUsageCombobox();
    }
  });
  $("templateToggle").addEventListener("click", toggleTemplatePanel);
  $("allTemplatesToggle").addEventListener("click", toggleAllTemplates);
  $("riskButton").addEventListener("click", classifyRisk);
  $("manualRiskButton").addEventListener("click", classifyRisk);
  $("fireButton").addEventListener("click", classifyFire);
  $("measureButton").addEventListener("click", classifyMeasure);
  $("lawButton").addEventListener("click", showLegalBasis);
  $("closeDialog").addEventListener("click", () => $("lawDialog").close());
  $("advisorButton").addEventListener("click", answerAdvisorQuestion);
  $("checkOllamaButton").addEventListener("click", checkOllama);
  $("prepareLlmButton").addEventListener("click", prepareLlm);

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      $("advisorQuestion").value = button.dataset.question;
      answerAdvisorQuestion();
    });
  });
}

function bindAdvisorStatus() {
  window.TEK17Advisor.localLlmConfig.onStatus = updateAdvisorStatus;
  updateAdvisorStatus({
    kind: "idle",
    message: isLocalAssistantRuntime
      ? "Klar. Lokal LLM brukes hvis Ollama er tilgjengelig."
      : "Klar. Nettversjonen bruker kildebasert svar uten lokal LLM.",
  });
}

function bindLlmOnboarding() {
  $("llmOnboarding").dataset.mode = isLocalAssistantRuntime ? "local" : "pages";
  renderLlmSetupState(isLocalAssistantRuntime ? "unknown" : "pages");
}

function bindRiskCriteria() {
  riskCriteriaIds.forEach((id) => {
    $(id).addEventListener("change", () => {
      if (state.riskResult) {
        classifyRisk();
      }
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
      $("introText").textContent = tabIntroTexts[target];
    });
  });
}

function renderTemplates() {
  const visibleTemplates = usageTypes
    .filter((usage) => usage.riskClass)
    .filter((usage) => state.showAllTemplates || usage.featured)
    .slice()
    .sort((a, b) => a.riskClass - b.riskClass || a.name.localeCompare(b.name, "no"))
  $("templateList").innerHTML = visibleTemplates
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
  $("usageType").value = state.selectedUsage.id;
  $("usageTypeSearch").value = state.usageResultsOpen ? state.usageSearch : state.selectedUsage.name;
  renderUsageCombobox();
}

function renderUsageCombobox() {
  const results = getUsageSearchResults();

  const resultBox = $("usageTypeResults");
  resultBox.classList.toggle("hidden", !state.usageResultsOpen);
  resultBox.innerHTML = results.length
    ? results
        .map(
          (usage) => `
            <button type="button" class="combobox-option" data-usage-id="${usage.id}">
              <span>${usage.name}</span>
              <small>${usage.riskClass ? `RKL ${usage.riskClass}` : "Vurderes"}</small>
            </button>
          `,
        )
        .join("")
    : `<p class="combobox-empty">Ingen treff. Velg Annet eller juster søket.</p>`;

  resultBox.querySelectorAll("[data-usage-id]").forEach((button) => {
    button.addEventListener("click", () => {
      applyUsagePreset(button.dataset.usageId);
      $("usageTypeSearch").blur();
    });
  });
}

function getUsageSearchResults() {
  const query = state.usageSearch.trim().toLowerCase();
  return usageTypes
    .filter((usage) => !query || usage.name.toLowerCase().includes(query) || usage.note.toLowerCase().includes(query))
    .slice()
    .sort((a, b) => {
      const riskA = a.riskClass ?? 99;
      const riskB = b.riskClass ?? 99;
      return riskA - riskB || a.name.localeCompare(b.name, "no");
    });
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
  state = {
    ...state,
    selectedUsage: usage,
    riskResult: null,
    fireResult: null,
    measureResult: null,
    usageSearch: "",
    usageResultsOpen: false,
  };

  $("usageType").value = usage.id;
  $("usageTypeSearch").value = usage.name;
  Object.entries(usage.criteria).forEach(([key, value]) => {
    setBooleanChoice(key, value);
  });
  setBooleanChoice("doesNotFitStandardType", usage.id === "annet");

  document.querySelectorAll("[data-template-id]").forEach((button) => {
    button.classList.toggle("active", button.dataset.templateId === usage.id);
  });

  $("fireClassSection").disabled = true;
  $("measureClassSection").disabled = true;
  $("manualRiskClass").value = "";
  $("manualRiskControl").classList.add("hidden");
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
    manualRiskClassOverride: $("manualRiskClass").value,
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
    taskType: $("measureTaskType").value,
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
  $("allTemplatesToggle").classList.toggle("hidden", isCollapsed);
}

function closeUsageCombobox() {
  state.usageResultsOpen = false;
  state.usageSearch = "";
  $("usageTypeSearch").value = state.selectedUsage.name;
  $("usageTypeResults").classList.add("hidden");
}

function toggleAllTemplates() {
  state.showAllTemplates = !state.showAllTemplates;
  $("allTemplatesToggle").textContent = state.showAllTemplates ? "Vis færre" : "Vis alle";
  $("allTemplatesToggle").setAttribute("aria-expanded", String(state.showAllTemplates));
  renderTemplates();
}

function classifyRisk() {
  const input = readRiskInput();
  const usage = usageTypes.find((item) => item.id === input.usageType);

  state.riskResult = runRiskClassification(input, usage, legalReferences);
  state.fireResult = null;
  state.measureResult = null;
  $("fireClassSection").disabled = !state.riskResult.value;
  $("measureClassSection").disabled = true;
  renderManualRiskControl(state.riskResult);
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
    riskEl.className = `result-card ${getRiskCardVariant(state.riskResult)}`;
    riskEl.innerHTML = `
      <span class="result-label">Risikoklasse</span>
      <strong>${state.riskResult.value ? `RKL ${state.riskResult.value}` : "Vurdering"}</strong>
      <span class="result-status">${formatRiskStatus(state.riskResult)}</span>
      ${renderRiskDecisionDetails(state.riskResult)}
    `;
    reasons.push(...state.riskResult.reasons);
    $("resultHint").textContent = getRiskResultHint(state.riskResult);
  } else {
    riskEl.className = "result-card muted";
    riskEl.innerHTML = `<span class="result-label">Risikoklasse</span><strong>Ikke klassifisert</strong>`;
    $("resultHint").textContent = "Kjør risikoklasse først.";
  }

  if (state.fireResult) {
    const variant = getFireCardVariant(state.fireResult);
    fireEl.className = `result-card ${variant}`;
    fireEl.innerHTML = `
      <span class="result-label">Brannklasse</span>
      <strong>${formatFireClass(state.fireResult.finalValue)}</strong>
      <span class="result-status">${formatFireStatus(state.fireResult)}</span>
      ${renderFireDecisionDetails(state.fireResult)}
    `;
    reasons.push(...state.fireResult.reasons);
    $("resultHint").textContent = "Brannklasse er satt. Vurder tiltaksklasse for oppgaven.";
  } else {
    fireEl.className = "result-card muted";
    fireEl.innerHTML = `<span class="result-label">Brannklasse</span><strong>${state.riskResult?.value ? "Ikke klassifisert" : "Venter på RKL"}</strong>`;
  }

  if (state.measureResult) {
    measureEl.className = `result-card ${getMeasureCardVariant(state.measureResult)}`;
    measureEl.innerHTML = `
      <span class="result-label">Tiltaksklasse</span>
      <strong>TKL ${state.measureResult.value}</strong>
      <span class="result-status">${state.measureResult.statusLabel}</span>
      ${renderMeasureDecisionDetails(state.measureResult)}
    `;
    reasons.push(...state.measureResult.reasons);
    $("resultHint").textContent = "Klassifiseringen er klar. Hjemmel er tilgjengelig.";
  } else {
    measureEl.className = "result-card muted";
    measureEl.innerHTML = `<span class="result-label">Tiltaksklasse</span><strong>${state.fireResult ? "Ikke vurdert" : "Venter på BKL"}</strong>`;
  }

  $("reasonList").innerHTML = reasons.length
    ? reasons.map((reason) => `<li>${reason}</li>`).join("")
    : "<li>Velg byggtype eller start med egne kriterier.</li>";
}

function getRiskCardVariant(result) {
  if (!result.value) return "warn";
  return result.status === "preaccepted" ? "good" : "warn";
}

function formatRiskStatus(result) {
  if (result.status === "preaccepted") return "Preakseptert forslag";
  if (result.status === "manual-override") return "Manuelt valgt RKL";
  if (result.value && result.hasDeviation) return "Avvik fra byggtype";
  if (result.value) return "Kriteriebasert forslag";
  return "Krever faglig vurdering";
}

function getRiskResultHint(result) {
  if (!result.value) return "Risikoklasse må vurderes manuelt før brannklasse.";
  if (result.status === "manual-override") return "Brannklasse kan beregnes med manuelt valgt RKL. Vurderingen bør dokumenteres.";
  if (result.hasDeviation) return "Risikoklasse er satt fra kriteriene. Avviket bør dokumenteres før brannklasse.";
  return "Risikoklasse er satt. Gå videre til brannklasse.";
}

function renderRiskDecisionDetails(result) {
  if (!result.usageName && !result.derivedRiskClass && !result.criteriaMismatches?.length) return "";

  const standardText = result.standardRiskClass
    ? `${result.usageName}, normalt RKL ${result.standardRiskClass}`
    : result.usageName ?? "Egendefinert vurdering";
  const criteriaText = result.derivedRiskClass
    ? `Kriteriene peker mot RKL ${result.derivedRiskClass}`
    : "Kriteriene treffer ikke rent i tabellen";
  const mismatchText = result.criteriaMismatches?.length
    ? `<span>Avvik: ${result.criteriaMismatches.join(", ")}</span>`
    : "";
  const manualText = result.status === "manual-override"
    ? `<span>Brukes videre: RKL ${result.value}</span>`
    : "";

  return `
    <div class="risk-decision">
      <span>Virksomhetstype: ${standardText}</span>
      <span>${criteriaText}</span>
      ${mismatchText}
      ${manualText}
    </div>
  `;
}

function renderManualRiskControl(result) {
  const shouldShow = result?.status === "manual-assessment" || result?.status === "manual-override";
  $("manualRiskControl").classList.toggle("hidden", !shouldShow);
}

function getFireCardVariant(result) {
  if (result.finalValue === 4) return "danger";
  return result.status === "preaccepted-exception" ? "warn" : "good";
}

function formatFireStatus(result) {
  return result.statusLabel ?? (result.confidence === "requires-analysis" ? "Analyse kreves" : "Preakseptert forslag");
}

function renderFireDecisionDetails(result) {
  const triggerText = result.analysisTriggerLabels?.length
    ? `<span>BKL 4-trigger: ${result.analysisTriggerLabels.join(", ")}</span>`
    : "";

  return `
    <div class="risk-decision">
      <span>${result.tableBasis}</span>
      <span>Særregel: ${result.specialRuleLabel}</span>
      ${triggerText}
    </div>
  `;
}

function getMeasureCardVariant(result) {
  if (result.value === 3) return "warn";
  return result.value === 2 ? "warn" : "good";
}

function renderMeasureDecisionDetails(result) {
  const driverText = result.drivers?.length ? result.drivers.join(", ") : "Ingen forhold trekker opp";

  return `
    <div class="risk-decision">
      <span>Oppgave: ${result.taskLabel}</span>
      <span>Utslag: ${driverText}</span>
    </div>
  `;
}

function showLegalBasis() {
  const refs = [
    ...(state.riskResult?.legalBasis ?? []),
    ...(state.fireResult?.legalBasis ?? []),
    ...(state.measureResult?.legalBasis ?? []),
  ];
  const uniqueRefs = Array.from(new Map(refs.map((item) => [item.title, item])).values());

  $("lawContent").innerHTML = `
    ${renderClassificationTrace()}
    ${renderRiskLegalTrace(state.riskResult)}
    ${renderFireLegalTrace(state.fireResult, state.riskResult)}
    ${renderMeasureLegalTrace(state.measureResult)}
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

function renderClassificationTrace() {
  return `
    <article class="law-item decision-trace">
      <h3>Denne klassifiseringen</h3>
      <div class="trace-grid">
        ${renderTraceRow("Risikoklasse", state.riskResult?.value ? `RKL ${state.riskResult.value}` : "Ikke fastsatt")}
        ${renderTraceRow("Brannklasse", state.fireResult ? formatFireClass(state.fireResult.finalValue) : "Ikke fastsatt")}
        ${renderTraceRow("Tiltaksklasse", state.measureResult ? `TKL ${state.measureResult.value}` : "Ikke vurdert")}
      </div>
    </article>
  `;
}

function renderRiskLegalTrace(result) {
  if (!result) return "";

  const standardText = result.standardRiskClass
    ? `${result.usageName}, normalt RKL ${result.standardRiskClass}`
    : result.usageName ?? "Ikke valgt";
  const criteriaText = result.derivedRiskClass
    ? `Kriteriene peker mot RKL ${result.derivedRiskClass}`
    : "Kriteriene treffer ikke rent i tabellen";
  const deviationText = result.criteriaMismatches?.length
    ? result.criteriaMismatches.join(", ")
    : result.hasDeviation
      ? "Avviker fra standard byggtype"
      : "Ingen avvik fra valgt virksomhetstype";

  return `
    <article class="law-item decision-trace">
      <span class="tag">TEK17 § 11-2</span>
      <h3>Risikoklassegrunnlag</h3>
      <div class="trace-grid">
        ${renderTraceRow("Virksomhetstype", standardText)}
        ${renderTraceRow("Kriterier", criteriaText)}
        ${renderTraceRow("Avvik", deviationText)}
        ${result.status === "manual-override" ? renderTraceRow("Brukes videre", `RKL ${result.value}`) : ""}
        ${renderTraceRow("Status", formatRiskStatus(result))}
      </div>
      ${renderReasonList(result.reasons)}
    </article>
  `;
}

function renderFireLegalTrace(result, riskResult) {
  if (!result) return "";

  return `
    <article class="law-item decision-trace">
      <span class="tag">TEK17 § 11-3</span>
      <h3>Brannklassegrunnlag</h3>
      <div class="trace-grid">
        ${renderTraceRow("Normal tabell", result.tableBasis ?? `${formatFireClass(result.normalValue)} for RKL ${riskResult?.value ?? "-"} og valgt etasjeantall`)}
        ${renderTraceRow("Særregel", result.specialRuleLabel ?? "Normal tabell er brukt")}
        ${result.analysisTriggerLabels?.length ? renderTraceRow("BKL 4-trigger", result.analysisTriggerLabels.join(", ")) : ""}
        ${renderTraceRow("Resultat", formatFireClass(result.finalValue))}
        ${renderTraceRow("Status", formatFireStatus(result))}
      </div>
      ${renderReasonList(result.reasons)}
    </article>
  `;
}

function renderMeasureLegalTrace(result) {
  if (!result) return "";

  return `
    <article class="law-item decision-trace">
      <span class="tag">SAK10 §§ 9-3 og 9-4</span>
      <h3>Tiltaksklassegrunnlag</h3>
      <div class="trace-grid">
        ${renderTraceRow("Oppgave", result.taskLabel)}
        ${renderTraceRow("Resultat", `TKL ${result.value}`)}
        ${renderTraceRow("Utslag", result.drivers?.length ? result.drivers.join(", ") : "Ingen forhold trekker opp")}
        ${renderTraceRow("Status", result.statusLabel)}
      </div>
      ${renderReasonList(result.reasons)}
    </article>
  `;
}

function renderTraceRow(label, value) {
  return `
    <div class="trace-row">
      <span class="trace-label">${label}</span>
      <span class="trace-value">${value}</span>
    </div>
  `;
}

function renderReasonList(reasons) {
  return reasons?.length ? `<ul class="trace-reasons">${reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>` : "";
}

async function answerAdvisorQuestion() {
  $("advisorButton").disabled = true;
  updateAdvisorStatus({
    kind: "checking",
    message: "Henter relevante kilder...",
  });
  $("advisorAnswer").innerHTML = `<p class="field-note">Henter relevante kilder og sjekker lokal LLM. Første gang kan modellen lastes ned automatisk.</p>`;
  try {
    const answer = await answerQuestion($("advisorQuestion").value, legalReferences);
    $("advisorAnswer").innerHTML = answer;
  } finally {
    $("advisorButton").disabled = false;
  }
}

function updateAdvisorStatus(status) {
  const statusEl = $("advisorLlmStatus");
  if (!statusEl) return;

  statusEl.dataset.status = status.kind;
  statusEl.querySelector("p").textContent = status.message;

  if (status.kind === "ready") renderLlmSetupState("ready");
  if (status.kind === "pulling") renderLlmSetupState("pulling");
  if (status.kind === "fallback") renderLlmSetupState(isLocalAssistantRuntime ? "ollama-missing" : "pages");
}

async function checkOllama() {
  setLlmButtonsDisabled(true);
  renderLlmSetupState("checking");

  try {
    const result = await window.TEK17Advisor.checkLocalLlm();
    renderLlmSetupState(result.modelAvailable ? "ready" : "missing-model");
  } catch (error) {
    console.info("Ollama er ikke tilgjengelig.", error);
    updateAdvisorStatus({
      kind: "fallback",
      message: isLocalAssistantRuntime
        ? "Fant ikke Ollama. Start Ollama og prøv igjen."
        : "Nettleseren fikk ikke kontakt med lokal Ollama. Bruk kildebasert svar eller kjør appen lokalt.",
    });
    renderLlmSetupState(isLocalAssistantRuntime ? "ollama-missing" : "pages");
  } finally {
    setLlmButtonsDisabled(false);
  }
}

async function prepareLlm() {
  setLlmButtonsDisabled(true);
  renderLlmSetupState("pulling");

  try {
    await window.TEK17Advisor.prepareLocalLlm();
    renderLlmSetupState("ready");
  } catch (error) {
    console.info("Klarte ikke å klargjøre lokal LLM.", error);
    updateAdvisorStatus({
      kind: "fallback",
      message: isLocalAssistantRuntime
        ? "Klarte ikke å klargjøre lokal LLM. Kontroller at Ollama kjører."
        : "Nettversjonen kan ikke starte Ollama. Installer/start Ollama lokalt først.",
    });
    renderLlmSetupState(isLocalAssistantRuntime ? "ollama-missing" : "pages");
  } finally {
    setLlmButtonsDisabled(false);
  }
}

function renderLlmSetupState(status) {
  const onboarding = $("llmOnboarding");
  const text = $("llmOnboardingText");
  if (!onboarding || !text) return;

  onboarding.dataset.status = status;

  const messages = {
    pages:
      "Du er på nettversjonen. Klassifisering og kildebaserte svar fungerer med en gang. For lokal LLM må Ollama installeres og appen kjøres lokalt på PC-en.",
    unknown:
      "Sjekk om Ollama kjører. Hvis den gjør det, kan appen klargjøre modellen automatisk.",
    checking: "Sjekker om Ollama kjører og om modellen finnes lokalt.",
    "ollama-missing": "Ollama svarer ikke ennå. Installer Ollama hvis den mangler, eller start Ollama og prøv igjen.",
    "missing-model": "Ollama kjører, men modellen mangler. Trykk Klargjør assistent for å laste den ned.",
    pulling: "Modellen lastes ned eller klargjøres. Dette kan ta litt tid første gang.",
    ready: "Lokal assistent er klar. Spørsmål kan nå besvares med lokal LLM og kildegrunnlag.",
  };

  text.textContent = messages[status] ?? messages.unknown;
  updateSetupSteps(status);
}

function updateSetupSteps(status) {
  const stepStates = {
    pages: { install: "todo", run: "todo", model: "todo" },
    unknown: { install: "todo", run: "todo", model: "todo" },
    checking: { install: "current", run: "current", model: "todo" },
    "ollama-missing": { install: "todo", run: "current", model: "todo" },
    "missing-model": { install: "done", run: "done", model: "current" },
    pulling: { install: "done", run: "done", model: "current" },
    ready: { install: "done", run: "done", model: "done" },
  };

  const states = stepStates[status] ?? stepStates.unknown;
  document.querySelectorAll("#llmSetupSteps [data-step]").forEach((step) => {
    step.dataset.state = states[step.dataset.step] ?? "todo";
  });
}

function setLlmButtonsDisabled(disabled) {
  $("checkOllamaButton").disabled = disabled;
  $("prepareLlmButton").disabled = disabled;
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
