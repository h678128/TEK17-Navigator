window.TEK17Data = window.TEK17Data || {};

window.TEK17Data.fireClassExceptions = [
  {
    id: "rkl4-dwelling-three-floors-direct-terrain",
    label: "Boligbygning i RKL 4 med tre etasjer og direkte utgang",
    legalBasisKey: "exceptions",
    sourcePoint: "TEK17 § 11-3 preaksepterte ytelser nr. 3",
    resultValue: 1,
    applies(input, context) {
      return (
        context.usage.id === "bolig" &&
        context.riskClass === 4 &&
        input.totalFloors === 3 &&
        input.directToTerrain
      );
    },
    reason:
      "Boligbygning i RKL 4 med tre etasjer kan oppføres i BKL 1 når hver boenhet har utgang direkte til terreng uten rømning via trapp eller trapperom.",
  },
  {
    id: "assembly-or-sales-two-floors-under-800",
    label: "Forsamlingslokale eller salgslokale under 800 m2",
    legalBasisKey: "exceptions",
    sourcePoint: "TEK17 § 11-3 preaksepterte ytelser nr. 4",
    resultValue: 1,
    applies(input, context) {
      return (
        ["salgslokale", "forsamlingslokale"].includes(context.usage.id) &&
        input.totalFloors <= 2 &&
        input.grossAreaPerFloor < 800
      );
    },
    reason:
      "Forsamlingslokale eller salgslokale med høyst to etasjer og bruttoareal under 800 m2 per etasje kan oppføres i BKL 1.",
  },
  {
    id: "accommodation-two-floors-under-300",
    label: "Overnattingsbygning under 300 m2",
    legalBasisKey: "exceptions",
    sourcePoint: "TEK17 § 11-3 preaksepterte ytelser nr. 5",
    resultValue: 1,
    applies(input, context) {
      return context.usage.id === "hotell" && input.totalFloors <= 2 && input.grossAreaPerFloor < 300;
    },
    reason:
      "Overnattingsbygning i høyst to etasjer og med bruttoareal under 300 m2 i hver etasje kan oppføres i BKL 1.",
  },
  {
    id: "rkl6-dwelling-two-floors",
    label: "Boligbygning i RKL 6 med to etasjer",
    legalBasisKey: "exceptions",
    sourcePoint: "TEK17 § 11-3 preaksepterte ytelser nr. 7",
    resultValue: 1,
    applies(input, context) {
      return context.riskClass === 6 && input.totalFloors === 2 && input.rkl6DwellingTwoFloors;
    },
    reason: "Boligbygning i RKL 6 i to etasjer kan oppføres i BKL 1.",
  },
];

window.TEK17Data.fireClassAnalysisTriggers = [
  {
    id: "more-than-16-floors",
    sourcePoint: "TEK17 § 11-3 veiledning og preaksepterte ytelser nr. 8",
    applies(input) {
      return input.totalFloors > 16;
    },
    reason: "Byggverket har mer enn 16 etasjer.",
  },
  {
    id: "critical-infrastructure",
    sourcePoint: "TEK17 § 11-3 veiledning og preaksepterte ytelser nr. 8",
    applies(input) {
      return input.criticalInfrastructure;
    },
    reason: "Brann kan ramme vesentlige samfunnsinteresser.",
  },
  {
    id: "mainly-below-ground",
    sourcePoint: "TEK17 § 11-3 veiledning og preaksepterte ytelser nr. 8",
    applies(input) {
      return input.mainlyBelowGround;
    },
    reason: "Byggverket ligger i hovedsak under terreng.",
  },
  {
    id: "chemical-or-environmental-production",
    sourcePoint: "TEK17 § 11-3 veiledning og preaksepterte ytelser nr. 8",
    applies(input) {
      return input.chemicalOrHazardousProduction;
    },
    reason: "Byggverket gjelder kjemisk industri eller miljøfarlig produksjon.",
  },
  {
    id: "hazardous-substances",
    sourcePoint: "TEK17 § 11-3 veiledning og preaksepterte ytelser nr. 8",
    applies(input) {
      return input.storesHazardousSubstances;
    },
    reason: "Byggverket lagrer særlig brann-, helse- eller miljøfarlige stoffer.",
  },
];
