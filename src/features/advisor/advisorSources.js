window.TEK17Advisor = window.TEK17Advisor || {};

window.TEK17Advisor.sources = [
  {
    id: "risk",
    title: "Risikoklasse",
    referenceKey: "risk",
    topics: ["risikoklasse", "rkl", "bruk", "personopphold", "rømning", "selvredning", "overnatting", "brannfare"],
    shortAnswer:
      "Risikoklasse vurderes ut fra hvordan byggverket brukes og hvilken trussel brann kan gi for liv og helse.",
    practicalMeaning:
      "Se særlig på personopphold, om brukerne kjenner rømningsforholdene, om de kan bringe seg selv i sikkerhet, om det er overnatting og om brannfaren er liten.",
    assessmentNote:
      "Hvis byggtypen avviker fra tabellen eller kriteriene peker i ulike retninger, bør risikoklassen vurderes og dokumenteres av fagperson.",
  },
  {
    id: "fire",
    title: "Brannklasse",
    referenceKey: "fire",
    topics: ["brannklasse", "bkl", "etasjer", "konsekvens", "normal tabell", "bkl 1", "bkl 2", "bkl 3"],
    shortAnswer:
      "Brannklasse uttrykker konsekvensen en brann kan få for liv, helse, samfunnsmessige interesser og miljø.",
    practicalMeaning:
      "I normalsporet brukes risikoklasse og totalt antall etasjer. Deretter må unntak og forhold som kan gi BKL 4 vurderes.",
    assessmentNote:
      "Ved avvik fra normal tabell, blandet bruk eller store konsekvenser ved brann bør vurderingen kontrolleres særskilt.",
  },
  {
    id: "exceptions",
    title: "Unntak og BKL 4",
    referenceKey: "exceptions",
    topics: ["unntak", "bkl 4", "analyse", "under terreng", "samfunnsinteresser", "farlige stoffer", "kjemisk"],
    shortAnswer:
      "TEK17 § 11-3 har enkelte preaksepterte unntak og angir forhold der brannklasse 4 må vurderes.",
    practicalMeaning:
      "Unntak kan gi lavere brannklasse for bestemte bygg, mens forhold som byggverk under terreng, mer enn 16 etasjer eller vesentlige samfunnsinteresser kan utløse analysebehov.",
    assessmentNote:
      "Når BKL 4-forhold er aktuelle, holder det normalt ikke å bruke tabellen alene. Sikkerheten må dokumenteres ved analyse.",
  },
  {
    id: "measure",
    title: "Tiltaksklasse",
    referenceKeys: ["measure93", "measure94"],
    topics: ["tiltaksklasse", "tkl", "sak10", "ansvar", "prosjektering", "kontroll", "kompleksitet", "konsekvens"],
    shortAnswer:
      "Tiltaksklasse er en SAK10-vurdering av oppgaven eller fagområdet, ikke en ren TEK17-klasse for bygget.",
    practicalMeaning:
      "Vurder kompleksitet, vanskelighetsgrad og konsekvenser av feil. Brannkonsept, fravik, analyse og kontroll kan trekke opp.",
    assessmentNote:
      "Tiltaksklasse bør knyttes til den konkrete oppgaven, for eksempel brannkonsept, detaljprosjektering eller uavhengig kontroll.",
  },
  {
    id: "mixed",
    title: "Blandet bruk",
    referenceKey: "mixedUse",
    topics: ["blandet bruk", "flere bruk", "kombinasjon", "underliggende", "overliggende", "bruksområde"],
    shortAnswer:
      "Ved blandet bruk bør ulike bruksområder klassifiseres hver for seg før samlet brannklasse vurderes.",
    practicalMeaning:
      "Brannklasse må vurderes med utgangspunkt i total etasjehøyde og forholdet mellom underliggende og overliggende deler.",
    assessmentNote:
      "Blandet bruk er ofte et punkt der preakseptert tabell må brukes med faglig skjønn og tydelig dokumentasjon.",
  },
];
