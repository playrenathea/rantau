# World Generator v0.4.0 — P8 Tuned (2026-11-19)

Faction naming only: revised animal/base affinity data (205 changed cells), positive-affinity Top 13, weighted random permutation using exponential race key -ln(U)/(score/maxScore)^8. For dual Type a,b use ((a+b)/2 + sqrt((a+10)(b+10)) - 10)/2. Single Type uses original score. Random faction priority, uniqueness, ordered fallback beyond Top 13, grammar weighting, world allocation and signature Knowledge/Carrier naming remain unchanged. Signature naming still uses the previous rank-sum Top 6 and previous type combination formula. Existing saved universes are not explicitly migrated.

Verified 6,000 holdout seeds 30000–35999: 36,000 factions, 3,634 distinct names, 56/56 animals, 84/84 bases, Government Elephant 496, Confederation 697. Matches selected simulation. Editorial fit comparisons are not player-tested.

## Historical v0.3.0 reference (superseded for faction naming)

# Infaction — World Generator v0.3.0
Single shared implementation: `world-generator.js` (MVP and Colab). Data snapshot from [Faction Master](https://docs.google.com/spreadsheets/d/1L4XqtRhnK55OMpWpdgLijIMuq9xc7Q25908qi7WONII/edit), [Knowledge/Carrier Affinity](https://drive.google.com/file/d/1yHFb1OwrzzUWN9Qd8zRg7Y4K3e3sZHP7/view), [Animal Association vocabulary](https://drive.google.com/file/d/16sv3x_1NjoGehj3WFcmdAgQXq81lG4-i/view).
## Rules
Create seven slots. Government F1, Revolutionary F2; Elite/Poor distinct random F2–F6; Outsider random non-full F2–F7. Shuffle remaining eight types, fill empty slots then random single slots without replacement. Drop F7. No Size or Influence. 
Type affinity f(a,b)=a+sqrt(ab)+b; divide by 3 for dual (ranking invariant), single uses its own score. For knowledge/carrier use f(normalized type affinity, faction base affinity), using 50:50 forward/reverse matrices. Independently rank top six by affinity, randomly permute ranks 1–6, minimize sum, random rank breaks ties. Remaining candidates fallback in affinity order if uniqueness requires; random faction priority handles unique Base and Animal. Equal affinity ties alphabetic. Grammar allowed only; preferred weight 3, others 1. City = Government Animal possessive + uniform sampled associated flavor + City. All associated words included.
Government first, then max type priority (5 Gov/Religious/Academic; 4 Military/Revolutionary/Conspiracy; 3 Cultural/Clan; 2 Merchant/Criminal/Elite; 1 Outsider/Poor); random ties. Top three signature Knowledge, top two Carrier linked to their own Knowledge. Independent naming, no Carrier×Knowledge matrix and no extra uniqueness constraint for signature bases.
MVP uses shared generator via script tag; existing gate interactions unchanged; legacy save reset once due to schema change. Signature objects in world state, not automatically learned/owned. 
## Run
Node: `node -e "console.log(require('./world-generator.js').generate(42))"`.
Colab notebook executes the same JS via Node; no divergent Python reimplementation. Seeded testing supported.
