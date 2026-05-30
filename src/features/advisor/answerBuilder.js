window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.buildAnswer = function buildAnswer(question, matchedSources, legalReferences) {
  if (!question.trim()) {
    return `<p class="assistant-empty">Skriv inn et spørsmål først.</p>`;
  }

  if (!matchedSources.length) {
    return `
      <section>
        <h3>Utenfor kildegrunnlaget</h3>
        <p><strong>Kort svar:</strong> Dette spørsmålet treffer ikke de TEK17/SAK10-kildene som er koblet til assistenten ennå.</p>
        <p><strong>Hva du kan spørre om:</strong> Prøv risikoklasse, brannklasse, tiltaksklasse, blandet bruk, unntak, BKL 4 eller hva TEK17 er.</p>
      </section>
      ${boundaryNote()}
    `;
  }

  return `
    ${matchedSources.map((source) => renderSourceAnswer(source, legalReferences)).join("")}
    ${boundaryNote()}
  `;
};

function renderSourceAnswer(source, legalReferences) {
  const refs = getReferences(source, legalReferences);

  return `
    <section>
      <h3>${source.title}</h3>
      <p><strong>Kort svar:</strong> ${source.shortAnswer}</p>
      <p><strong>I praksis:</strong> ${source.practicalMeaning}</p>
      <p><strong>Vurder nærmere:</strong> ${source.assessmentNote}</p>
      <div class="source-list">
        ${refs.map(referenceLink).join("")}
      </div>
    </section>
  `;
}

function getReferences(source, legalReferences) {
  const keys = source.referenceKeys ?? [source.referenceKey];
  return keys.map((key) => legalReferences[key]).filter(Boolean);
}

function referenceLink(ref) {
  return `<p class="source-line"><span>${ref.tag}</span><a href="${ref.url}" target="_blank" rel="noreferrer">${ref.title}</a></p>`;
}

function boundaryNote() {
  return `<p class="field-note">Assistenten er avgrenset til godkjente TEK17/SAK10-kilder, inkludert relevante DIBK-veiledninger. Svarene skal vise referanser og markere usikkerhet når grunnlaget ikke er entydig.</p>`;
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
