window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.buildAnswer = function buildAnswer(question, matchedSources, legalReferences) {
  if (!question.trim()) {
    return "Skriv inn et spørsmål først.";
  }

  if (!matchedSources.length) {
    return `
      <p><strong>Spørsmål:</strong> ${escapeHtml(question)}</p>
      <section>
        <h3>Utenfor kildegrunnlaget</h3>
        <p>Dette spørsmålet treffer ikke de TEK17/SAK10-kildene som er koblet til assistenten ennå.</p>
        <p>Prøv å spørre om risikoklasse, brannklasse, tiltaksklasse, blandet bruk, unntak eller BKL 4.</p>
      </section>
      ${boundaryNote()}
    `;
  }

  return `
    <p><strong>Spørsmål:</strong> ${escapeHtml(question)}</p>
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
      ${refs.map(referenceLink).join("")}
    </section>
  `;
}

function getReferences(source, legalReferences) {
  const keys = source.referenceKeys ?? [source.referenceKey];
  return keys.map((key) => legalReferences[key]).filter(Boolean);
}

function referenceLink(ref) {
  return `<p class="source-line">Kilde: <a href="${ref.url}" target="_blank" rel="noreferrer">${ref.title}</a></p>`;
}

function boundaryNote() {
  return `<p class="field-note">Assistenten er avgrenset til godkjente TEK17/SAK10-kilder. Svarene skal vise referanser og markere usikkerhet når grunnlaget ikke er entydig.</p>`;
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
