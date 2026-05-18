window.TEK17Data = window.TEK17Data || {};

window.TEK17Data.legalReferences = {
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

window.TEK17Data.libraryItems = [
  window.TEK17Data.legalReferences.risk,
  window.TEK17Data.legalReferences.fire,
  window.TEK17Data.legalReferences.exceptions,
  window.TEK17Data.legalReferences.measure93,
  window.TEK17Data.legalReferences.measure94,
  {
    title: "DIBK: Brann og konstruksjonssikkerhet",
    tag: "Fagstoff",
    url: "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11",
    summary: "Inngang til kapittel 11 i byggteknisk forskrift med veiledning om sikkerhet ved brann.",
  },
];
