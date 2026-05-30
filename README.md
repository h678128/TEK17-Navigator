# TEK17 Navigator

TEK17 Navigator er en nett- og desktopapp for brannteknisk orientering i TEK17 og SAK10.

Appen samler tre arbeidsflater:

- TEK17-assistent med kildebundne svar
- klassifisering av risikoklasse, brannklasse og tiltaksklasse
- hjemler, veiledning og relevant fagstoff

Målet er ikke å erstatte faglig vurdering, men å gjøre det raskere å finne riktig spor, se aktuelle hjemler og dokumentere hvorfor en vurdering peker i en bestemt retning.

## Nettversjon

Den publiserte webappen ligger her:

```txt
https://h678128.github.io/TEK17-Navigator/
```

GitHub Pages oppdateres fra `main` via prosjektets Pages-workflow. Nettversjonen kan brukes til klassifisering og kildebaserte assistentsvar uten installasjon.

Lokal LLM i nettversjonen krever at Ollama kjører på brukerens egen maskin. Ved bruk fra GitHub Pages kan Ollama måtte startes med:

```powershell
$env:OLLAMA_ORIGINS="https://h678128.github.io"
ollama serve
```

## Desktopversjon

Desktopappen bygges med Electron og bruker samme fagdata og UI som nettversjonen.

Siste desktopversjon kan lastes ned fra:

```txt
https://github.com/h678128/TEK17-Navigator/releases/latest
```

Release-siden inneholder normalt:

- installer for Windows
- portable Windows-app

Desktopappen forsøker å starte Ollama automatisk hvis `ollama.exe` finnes på maskinen. Ollama må likevel være installert for at lokal LLM skal fungere.

## Lokal Utvikling

Installer avhengigheter:

```powershell
npm install
```

Start lokal nettversjon:

```powershell
npm run serve
```

Åpne deretter:

```txt
http://127.0.0.1:5173
```

Start desktopappen lokalt:

```powershell
npm run desktop
```

Bygg desktopappen:

```powershell
npm run desktop:build
```

Ferdige desktopfiler legges i:

```txt
dist/desktop/
```

## Release

Desktop-release bygges av GitHub Actions når en versjonstag pushes, for eksempel:

```powershell
git tag -a v0.1.2 -m "TEK17 Navigator v0.1.2"
git push origin v0.1.2
```

Workflowen bygger Windows-app og publiserer filene på GitHub Releases.

## Lokal LLM

TEK17-assistenten kan bruke en lokal Ollama-modell:

```powershell
ollama serve
ollama pull llama3.1:8b
```

Appen bruker Ollama-endepunktene:

- `GET /api/tags` for å sjekke lokale modeller
- `POST /api/pull` for å hente modellen hvis den mangler
- `POST /api/chat` for lokale svar

Hvis Ollama ikke svarer, faller assistenten tilbake til kildebaserte svar uten LLM.

## Faglig Avgrensning

Assistenten skal bare svare fra kilder som er lagt inn i appen. RAG-grunnlaget omfatter både forskrift og veiledning der det er relevant, blant annet:

- TEK17 kapittel 11
- veiledning til TEK17 kapittel 11
- TEK17 § 11-2 om risikoklasser
- veiledning til TEK17 § 11-2
- TEK17 § 11-3 om brannklasser
- veiledning til TEK17 § 11-3
- SAK10 kapittel 9 om tiltaksklasser

Ved konkrete byggesaker må svar og klassifisering alltid kontrolleres mot DIBK og faglig vurdering.

## Tester

Kjør hele testpakken:

```powershell
npm test
```

Testene dekker:

- klassifiseringsscenarioer for RKL, BKL og TKL
- assistentens kildesøk
- fallback når spørsmålet er utenfor kildegrunnlaget
- lokal LLM-integrasjon mot mockede Ollama-kall

## Prosjektstruktur

```txt
TEK17-Navigator/
|-- .github/workflows/          GitHub Pages og desktop-release
|-- tools/                      Lokale utviklingsverktøy
|-- src/
|   |-- app/                    UI, faner og DOM-kobling
|   |-- desktop/                Electron-wrapper
|   |-- domain/
|   |   |-- data/               Byggtyper, tabeller, hjemler og veiledning
|   |   `-- rules/              Klassifiseringslogikk
|   `-- features/
|       `-- advisor/            TEK17-assistent, RAG og lokal LLM
|-- tests/                      Scenario- og assistenttester
|-- index.html                  Hovedside
|-- styles.css                  Styling
|-- package.json                NPM-scripts og desktop-build
`-- README.md
```
