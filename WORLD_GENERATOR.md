# World Generator v0.9.0

Location Framework v0.1.0 added; see [LOCATION_GENERATOR.md](LOCATION_GENERATOR.md). Zone v0.4.0 unchanged.

# World Generator v0.8.0 — Locked Zone Framework v0.4.0

See [ZONE_GENERATOR.md](ZONE_GENERATOR.md) for current geography rules. Faction and signature generators unchanged. [Current Colab notebook](notebooks/Infaction_World_Generator_v0.8.0.ipynb).

# World Generator v0.6.0 — Balanced Zones

Faction generation unchanged; see [ZONE_GENERATOR.md](ZONE_GENERATOR.md) for current rules and holdout. Historical notes follow.

# Zone Framework v0.1.0 — World Generator v0.5.0

Extends the existing six-Faction generator without consuming any random draws before City/Faction/Knowledge/Carrier output. 15 Basic functions and 19 Composite types, 3 generation Regions (Inside City, Outside City, Secret Zone). Secret zones have a separate physicalRegion and optional parentId (one level, public host in same physical region). Faction association is not ownership. No forced Outside/Secret quota; City is core. Zone rows are curated editorial seeds, not independently validated reference ratings. Type strong/support/other = 95/65/18; Base strong/other = 95/45; 70:30 blend; dual Type uses existing P8 fit. All 84 canonical bases have 3 explicit strong candidates; all 13 Types have at least 2 strong Basic candidates. 

Government first, other factions shuffled. At most one initial Composite per faction; dual candidate must support both Types and strongly support one; weak/no fit deferred. Government must have public full Authority and may draw Administrative District. Candidate weighted sampling exponent 5; regional weights 1/.25/.32, natural weight and Outsider/Government/secret modifiers. Non-Inside penalty after two non-Inside zones; repeated type penalty (same type+Region forbidden). City Authority, Commerce, Residence each require >=1 coverage; 0/.5/1 contribution per function, no cross-region substitution. Completion favors full direct coverage/basic; Composite can close extra gaps. Deferred factions may seed Basic zones (72% chance, threshold 64); up to 2 optional preferred holes (62% per attempt), mainly City. Soft zone cap 10 for optional additions, no minimum Outside/Secret. No Location/Room/Story generation yet. Zones persistent in MVP state; v0.4 save migrates by hash of existing city and faction names, not a reroll. No new player UI; stage 3 remains quest-complete.

## Verification
Holdout seeds 40000–45999 (6000); 42272 zones; regions {"Inside City":32990,"Outside City":5387,"Secret Zone":3895}; all required coverage met, zero invalid placement/parent/faction/duplicate checks, zero change to legacy Faction, City, signature output; 5841 distinct unordered type+region combinations. 34/34 types appeared. Mean 7.05 zones, 5.40 factions with direct zone association; 87 worlds lacked strict Inside majority. Those are statistical targets, not absolute guarantees. 3424 zones scored <55 editorial affinity (often requirement completion). Live Pages/Colab not tested.

`InfactionWorld.generateZones(factions, seed, options)` or `require('./world-generator.js').generate(seed)`. Defaults are exported as data.zoneDefaults, zoneTypes, zoneFunctions, zoneRegions, zoneBaseAffinity. 

---

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
