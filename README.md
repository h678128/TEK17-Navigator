# TEK17-Navigator

Første produksjonsrettede versjon av TEK17 Navigator.

Applikasjonen har tre faner:

- Klassifisering av risikoklasse, brannklasse og tiltaksklasse
- TEK17-assistent med kontrollert svarflate og kildereferanser
- Hjemler og relevant fagstoff

## Kjøre Applikasjonen

TEK17 Navigator skal kunne kjøres på to måter: i nettleser og som desktop-applikasjon.

### Nettversjon

Når endringer pushes til `main`, publiserer GitHub Actions automatisk en statisk nettversjon til GitHub Pages:

```txt
https://h678128.github.io/TEK17-Navigator/
```

Nettversjonen kan brukes til klassifisering og kildebaserte assistentsvar. Lokal LLM med Ollama krever fortsatt at brukeren kjører appen lokalt, fordi modellen ligger på brukerens egen maskin.

### 1. Nettleser

Kjør lokal server:

```powershell
npm run serve
```

Åpne deretter:

```txt
http://127.0.0.1:5173
```

Dette er anbefalt nettlesermodus fordi lokal LLM-kobling til Ollama fungerer mer forutsigbart via lokal server enn ved å åpne `index.html` direkte.

### 2. Desktop-App

Installer avhengigheter først:

```powershell
npm install
```

Start desktop-appen:

```powershell
npm run desktop
```

Desktop-appen bruker Electron og laster samme TEK17 Navigator-kode som nettleserversjonen. Ved oppstart forsøker den å starte Ollama automatisk hvis `ollama.exe` finnes på maskinen.

Bygg Windows-versjon:

```powershell
npm run desktop:build
```

Ferdige filer legges i `dist/desktop/`:

- `TEK17 Navigator Setup 0.1.0.exe` - installer
- `TEK17 Navigator 0.1.0.exe` - portable versjon
- `win-unpacked/TEK17 Navigator.exe` - upakket app for lokal testing

## Lokal LLM

TEK17-assistenten kan bruke en lokal Ollama-modell hvis Ollama kjører på maskinen:

```powershell
ollama serve
```

Appen sjekker lokale modeller via `http://localhost:11434/api/tags`. Hvis `llama3.1:8b` ikke finnes, forsøker appen å laste den ned automatisk via `http://localhost:11434/api/pull` før spørsmålet sendes til `http://localhost:11434/api/chat`.
Hvis lokal LLM ikke er tilgjengelig, bruker assistenten automatisk den kildebaserte fallbacken i `answerBuilder.js`.

Kjør testene:

```powershell
node tests/scenario-tests.js
node tests/advisor-tests.js
```

## Struktur

```txt
TEK17-Navigator/
├── tools/                                 - lokale utviklingsverktøy
│   └── serve.cjs                          - enkel lokal webserver for nettlesermodus
├── src/                                   - all hovedkode for applikasjonen
│   ├── desktop/                           - desktop-wrapper for Electron
│   │   └── main.cjs                       - starter Electron-vindu og lokal statisk server
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
│           ├── localLlmClient.js          - valgfri kobling mot lokal Ollama-modell
│           └── answerBuilder.js           - bygger kildebundet svar med hjemmel
├── tests/                                 - scenario- og regeltester
│   ├── scenario-tests.js                  - tester RKL, BKL og TKL-scenarioer
│   └── advisor-tests.js                   - tester assistentens kildesøk og avgrensning
├── index.html                             - hovedside for TEK17 Navigator
├── package.json                           - npm-scripts for nettleser, desktop og tester
├── styles.css                             - styling for applikasjonen
└── README.md                              - prosjektbeskrivelse
```
