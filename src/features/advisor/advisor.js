window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.answerQuestion = function answerQuestion(question, legalReferences) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return "Skriv inn et spørsmål først.";
  }

  const matched = [];
  if (normalized.includes("risiko") || normalized.includes("rkl")) matched.push("risk");
  if (normalized.includes("brannklasse") || normalized.includes("bkl") || normalized.includes("etasj")) matched.push("fire");
  if (normalized.includes("tiltak") || normalized.includes("tkl") || normalized.includes("ansvar")) matched.push("measure");
  if (normalized.includes("blandet") || normalized.includes("flere bruk") || normalized.includes("kombinasjon")) matched.push("mixed");

  const answer = buildAdvisorAnswer(matched.length ? matched : ["risk", "fire"], legalReferences);

  return `
    <p><strong>Spørsmål:</strong> ${escapeHtml(question)}</p>
    ${answer}
    <p class="field-note">Assistenten er avgrenset til godkjente kilder. Svarene skal vise referanser og markere usikkerhet når grunnlaget ikke er entydig.</p>
  `;
};

function buildAdvisorAnswer(topics, legalReferences) {
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
