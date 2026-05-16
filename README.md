# TEK17-Navigator

Statisk demo/mock for TEK17 Navigator.

Demoen har tre faner:

- Klassifisering av risikoklasse, brannklasse og tiltaksklasse
- TEK17-assistent som simulerer en kontrollert GPT-wrapper med kildereferanser
- Hjemler og relevant fagstoff

Åpne `index.html` i nettleseren for å teste demoen.

Kjør scenario-testene:

```powershell
node tests/scenario-tests.js
```

## Struktur

```txt
src/data/      regeldata, byggtyper og hjemler
src/rules/     klassifiseringslogikk
src/advisor/   mock for TEK17-assistent
src/ui/        kobling mellom DOM og regelmotor
```
