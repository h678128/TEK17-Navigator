# TEK17-Navigator

Første produksjonsrettede versjon av TEK17 Navigator.

Applikasjonen har tre faner:

- Klassifisering av risikoklasse, brannklasse og tiltaksklasse
- TEK17-assistent med kontrollert svarflate og kildereferanser
- Hjemler og relevant fagstoff

Åpne `index.html` i nettleseren for å teste applikasjonen lokalt.

Kjør scenario-testene:

```powershell
node tests/scenario-tests.js
```

## Struktur

```txt
src/app/                  nettleserapp, DOM-kobling og fanestyring
src/domain/data/          regeldata, byggtyper, tabeller og hjemler
src/domain/rules/         klassifiseringslogikk for RKL, BKL og TKL
src/features/advisor/     kontrollert TEK17-assistent
docs/                     arkitektur og videre produktbeslutninger
tests/                    scenario- og regeltester
```

Se `docs/architecture.md` for målbildet for ferdig applikasjon.
