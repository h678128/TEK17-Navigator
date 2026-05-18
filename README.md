# TEK17-Navigator

Første produksjonsrettede versjon av TEK17 Navigator.

Applikasjonen har tre faner:

- Klassifisering av risikoklasse, brannklasse og tiltaksklasse
- TEK17-assistent med kontrollert svarflate og kildereferanser
- Hjemler og relevant fagstoff

Åpne `index.html` i nettleseren for å teste applikasjonen lokalt.

Kjør testene:

```powershell
node tests/scenario-tests.js
node tests/advisor-tests.js
```

## Struktur

```txt
TEK17-Navigator/
├── src/                                   - all hovedkode for applikasjonen
│   ├── app/                               - nettleserapp, DOM-kobling og fanestyring
│   │   └── main.js                        - kobler UI, klassifiseringsregler og assistent sammen
│   ├── domain/                            - fagdomene for TEK17/SAK10-regler og data
│   │   ├── data/                          - regeldata, byggtyper, tabeller og hjemler
│   │   │   ├── buildingTypes.js           - virksomhetstyper og forslag til risikoklasse
│   │   │   ├── fireClassExceptions.js     - unntak og BKL 4-triggere for brannklasse
│   │   │   ├── fireClassTable.js          - normal tabell for brannklasse
│   │   │   └── legalReferences.js         - DIBK/SAK10-hjemler og fagstofflenker
│   │   └── rules/                         - ren klassifiseringslogikk uten DOM
│   │       ├── riskClass.js               - risikoklasse basert på byggtype og kriterier
│   │       ├── fireClass.js               - brannklasse basert på RKL, etasjer, unntak og analyseforhold
│   │       └── measureClass.js            - tiltaksklasse basert på SAK10-vurdering av oppgave/fagområde
│   └── features/                          - produktfunksjoner som bygger på domenet
│       └── advisor/                       - kontrollert TEK17-assistent
│           ├── advisor.js                 - orkestrerer spørsmål, kildesøk og svar
│           ├── advisorSources.js          - godkjente temaer, fagtekster og kildekoblinger
│           ├── retrieval.js               - finner relevante kilder basert på spørsmålet
│           └── answerBuilder.js           - bygger kildebundet svar med hjemmel
├── tests/                                 - scenario- og regeltester
│   ├── scenario-tests.js                  - tester RKL, BKL og TKL-scenarioer
│   └── advisor-tests.js                   - tester assistentens kildesøk og avgrensning
├── index.html                             - hovedside for TEK17 Navigator
├── styles.css                             - styling for applikasjonen
└── README.md                              - prosjektbeskrivelse
```
