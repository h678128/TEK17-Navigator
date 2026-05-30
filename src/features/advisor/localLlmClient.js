window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.localLlmConfig = {
  enabled: isLocalRuntime() || isLocalLlmEnabledByUser(),
  baseUrl: "http://localhost:11434",
  model: "llama3.1:8b",
  autoPull: true,
  keepAlive: "10m",
  generationOptions: {
    temperature: 0.1,
    top_k: 20,
    top_p: 0.8,
    num_ctx: 2048,
    num_predict: 320,
  },
  onStatus: null,
};

let localModelReadyPromise = null;

window.TEK17Advisor.askLocalLlm = async function askLocalLlm(question, matchedSources, legalReferences) {
  const config = window.TEK17Advisor.localLlmConfig;
  if (!config.enabled || !matchedSources.length) return null;

  notifyLocalLlmStatus("checking", "Sjekker lokal LLM og modell...");
  await ensureLocalModel(config);

  notifyLocalLlmStatus("generating", "Lokal LLM skriver et kort svar...");
  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      stream: false,
      keep_alive: config.keepAlive,
      messages: [
        {
          role: "system",
          content:
            "Du er TEK17 Navigator sin lokale fagassistent. Svar kun på norsk. Bruk bare forskrift og veiledning som ligger i kildegrunnlaget. Ikke finn på paragrafer, krav eller tall. Hvis kildegrunnlaget ikke er nok, si at spørsmålet må vurderes nærmere mot TEK17/SAK10.",
        },
        {
          role: "user",
          content: buildLocalPrompt(question, matchedSources, legalReferences),
        },
      ],
      options: config.generationOptions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lokal LLM svarte med HTTP ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.message?.content?.trim();
  if (!content) return null;

  notifyLocalLlmStatus("ready", `Assistent klar med ${config.model}.`);
  return renderLocalLlmAnswer(content, matchedSources, legalReferences);
};

window.TEK17Advisor.ensureLocalModel = ensureLocalModel;
window.TEK17Advisor.resetLocalModelCheck = function resetLocalModelCheck() {
  localModelReadyPromise = null;
};
window.TEK17Advisor.checkLocalLlm = checkLocalLlm;
window.TEK17Advisor.prepareLocalLlm = async function prepareLocalLlm() {
  const config = window.TEK17Advisor.localLlmConfig;
  notifyLocalLlmStatus("checking", "Sjekker Ollama og lokal modell...");
  await ensureLocalModel(config);
  enableLocalLlm();
  return checkLocalLlm();
};

async function checkLocalLlm() {
  const config = window.TEK17Advisor.localLlmConfig;
  notifyLocalLlmStatus("checking", "Sjekker om Ollama kjører...");
  const hasModel = await hasLocalModel(config);
  const status = hasModel ? "ready" : "missing-model";
  notifyLocalLlmStatus(status, hasModel ? `Assistent klar med ${config.model}.` : `${config.model} er ikke lastet ned ennå.`);
  if (hasModel) enableLocalLlm();

  return {
    ollamaAvailable: true,
    modelAvailable: hasModel,
    model: config.model,
  };
}

async function ensureLocalModel(config) {
  if (!config.autoPull) return;

  if (!localModelReadyPromise) {
    localModelReadyPromise = ensureLocalModelOnce(config).catch((error) => {
      localModelReadyPromise = null;
      throw error;
    });
  }

  await localModelReadyPromise;
}

async function ensureLocalModelOnce(config) {
  if (await hasLocalModel(config)) {
    notifyLocalLlmStatus("ready", `Assistent klar med ${config.model}.`);
    return;
  }

  notifyLocalLlmStatus("pulling", `Laster ned ${config.model}. Dette kan ta litt tid første gang.`);
  await pullLocalModel(config);
  notifyLocalLlmStatus("ready", `Assistent klar med ${config.model}.`);
}

async function hasLocalModel(config) {
  const response = await fetch(`${config.baseUrl}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama svarte med HTTP ${response.status} ved modellkontroll`);
  }

  const payload = await response.json();
  const models = payload.models ?? [];
  return models.some((item) => isSameModel(item.name, config.model) || isSameModel(item.model, config.model));
}

async function pullLocalModel(config) {
  const response = await fetch(`${config.baseUrl}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama klarte ikke å laste ned ${config.model}. HTTP ${response.status}`);
  }
}

function isSameModel(candidate, requested) {
  if (!candidate) return false;
  return candidate === requested || `${candidate}:latest` === requested || candidate === `${requested}:latest`;
}

function notifyLocalLlmStatus(kind, message) {
  const handler = window.TEK17Advisor.localLlmConfig.onStatus;
  if (typeof handler === "function") {
    handler({ kind, message });
  }
}

function enableLocalLlm() {
  window.TEK17Advisor.localLlmConfig.enabled = true;
  try {
    window.localStorage?.setItem("tek17LocalLlmEnabled", "true");
  } catch (error) {
    console.info("Kunne ikke lagre lokal LLM-status.", error);
  }
}

function isLocalRuntime() {
  const location = window.location;
  if (!location) return true;

  return (
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1" ||
    location.hostname === "[::1]"
  );
}

function isLocalLlmEnabledByUser() {
  try {
    return window.localStorage?.getItem("tek17LocalLlmEnabled") === "true";
  } catch (error) {
    return false;
  }
}

function buildLocalPrompt(question, matchedSources, legalReferences) {
  const sourceText = matchedSources
    .map((source) => {
      const refs = getReferences(source, legalReferences);
      return [
        `Tema: ${source.title}`,
        `Kort svar: ${source.shortAnswer}`,
        `Praktisk betydning: ${source.practicalMeaning}`,
        `Vurder nærmere: ${source.assessmentNote}`,
        "Kilder:",
        refs.map((ref) => `- ${ref.tag}: ${ref.title}. ${ref.summary}`).join("\n"),
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Spørsmål: ${question}`,
    "",
    "Kildegrunnlag:",
    sourceText,
    "",
    "Svar med maks 8 korte linjer:",
    "1. Kort svar",
    "2. Relevant hjemmel",
    "3. Praktisk betydning",
    "4. Når må fagperson vurdere nærmere",
  ].join("\n");
}

function renderLocalLlmAnswer(answer, matchedSources, legalReferences) {
  const references = uniqueReferences(matchedSources, legalReferences);

  return `
    <section>
      <h3>Lokalt LLM-svar</h3>
      ${answer
        .split("\n")
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")}
      <div class="source-list">
        ${references.map(referenceLink).join("")}
      </div>
    </section>
    <p class="field-note">Svaret er generert lokalt fra hentede forskrifts- og veiledningskilder. Kontroller hjemmel ved faglig bruk.</p>
  `;
}

function uniqueReferences(matchedSources, legalReferences) {
  const refs = matchedSources.flatMap((source) => getReferences(source, legalReferences));
  return Array.from(new Map(refs.map((ref) => [ref.title, ref])).values());
}

function getReferences(source, legalReferences) {
  const keys = source.referenceKeys ?? [source.referenceKey];
  return keys.map((key) => legalReferences[key]).filter(Boolean);
}

function referenceLink(ref) {
  return `<p class="source-line"><span>${ref.tag}</span><a href="${ref.url}" target="_blank" rel="noreferrer">${ref.title}</a></p>`;
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
