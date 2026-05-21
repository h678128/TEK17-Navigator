window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.localLlmConfig = {
  enabled: true,
  baseUrl: "http://localhost:11434",
  model: "llama3.1:8b",
  autoPull: true,
};

let localModelReadyPromise = null;

window.TEK17Advisor.askLocalLlm = async function askLocalLlm(question, matchedSources, legalReferences) {
  const config = window.TEK17Advisor.localLlmConfig;
  if (!config.enabled || !matchedSources.length) return null;

  await ensureLocalModel(config);

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "Du er TEK17 Navigator sin lokale fagassistent. Svar kun på norsk. Bruk bare kildegrunnlaget i meldingen fra brukeren. Ikke finn på paragrafer, krav eller tall. Hvis kildegrunnlaget ikke er nok, si at spørsmålet må vurderes nærmere mot TEK17/SAK10.",
        },
        {
          role: "user",
          content: buildLocalPrompt(question, matchedSources, legalReferences),
        },
      ],
      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Lokal LLM svarte med HTTP ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.message?.content?.trim();
  if (!content) return null;

  return renderLocalLlmAnswer(question, content, matchedSources, legalReferences);
};

window.TEK17Advisor.ensureLocalModel = ensureLocalModel;
window.TEK17Advisor.resetLocalModelCheck = function resetLocalModelCheck() {
  localModelReadyPromise = null;
};

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
  if (await hasLocalModel(config)) return;
  await pullLocalModel(config);
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

function buildLocalPrompt(question, matchedSources, legalReferences) {
  const sourceText = matchedSources
    .map((source) => {
      const refs = getReferences(source, legalReferences);
      return [
        `Tema: ${source.title}`,
        `Kort svar: ${source.shortAnswer}`,
        `Praktisk betydning: ${source.practicalMeaning}`,
        `Vurder nærmere: ${source.assessmentNote}`,
        `Kilder: ${refs.map((ref) => ref.title).join(", ")}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Spørsmål: ${question}`,
    "",
    "Kildegrunnlag:",
    sourceText,
    "",
    "Svarstruktur:",
    "1. Kort svar",
    "2. Relevant hjemmel",
    "3. Hva betyr dette i praksis",
    "4. Når må fagperson vurdere nærmere",
  ].join("\n");
}

function renderLocalLlmAnswer(question, answer, matchedSources, legalReferences) {
  const references = uniqueReferences(matchedSources, legalReferences);

  return `
    <p><strong>Spørsmål:</strong> ${escapeHtml(question)}</p>
    <section>
      <h3>Lokalt LLM-svar</h3>
      ${answer
        .split("\n")
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("")}
      ${references.map(referenceLink).join("")}
    </section>
    <p class="field-note">Svaret er generert lokalt fra hentede TEK17/SAK10-kilder. Kontroller hjemmel ved faglig bruk.</p>
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
