# TEK17 Navigator Arkitektur

Dette dokumentet beskriver målbildet for applikasjonen. Dagens app er fortsatt lett å kjøre lokalt, men strukturen er lagt opp slik at vi kan bygge videre mot en ferdig løsning uten å skrive om alt på nytt.

## Produktdeler

1. TEK17-assistent
   - Hovedside i applikasjonen.
   - Skal svare kontrollert fra godkjente TEK17/SAK10-kilder.
   - Skal alltid vise relevante kilder eller si at grunnlaget ikke er tilstrekkelig.

2. Klassifisering
   - Vurderer risikoklasse, brannklasse og tiltaksklasse.
   - Skiller mellom preakseptert forslag, avvik, unntak og manuell faglig vurdering.
   - Viser beslutningsspor og hjemmel for valgt klassifisering.

3. Hjemler og fagstoff
   - Samler kilder som brukes av regelmotoren og assistenten.
   - Skal på sikt kunne brukes som kildegrunnlag for RAG/LLM.

## Kodeinndeling

```txt
src/app/
  main.js
  Nettleserapp og UI-kobling. Skal ikke eie fagreglene.

src/domain/data/
  Statisk regeldata, byggtyper, tabeller, hjemler og kildehenvisninger.

src/domain/rules/
  Rene klassifiseringsregler. Skal kunne testes uten DOM og uten nettleser.

src/features/advisor/
  TEK17-assistenten. Dagens versjon er lokal og kildebundet; senere kan den kobles til backend/RAG.

tests/
  Scenarioer som kontrollerer at regelmotoren gir forventede RKL/BKL/TKL-resultater.
```

## Neste Arkitektursteg

1. Skille assistentens kilder fra svarlogikken.
2. Lage backend-grenseflate for søk i kilder og LLM-svar.
3. Legge TEK17/SAK10-kilder i en strukturert kildepakke.
4. Lage eksport/rapport for klassifisering.
5. Flytte frontend til et komponentbasert oppsett når vi trenger mer kompleks UI.
