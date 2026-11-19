# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

## Zone vocabulary v0.5.0 / World Generator v0.10.0

39 canonical Zone Types: retain all 34; add Forest, Ruined Quarter, Cavern, Entertainment Quarter, Necropolis. Harbor is canonical, Port removed from Location vocabulary; Forest, Cave, Ruins promoted (Cave → Cavern, Ruins → Ruined Quarter). 70 Location profiles. Canonical labels in all regions (retire regional aliases). Existing Zone algorithm, 5–8 budget, Government public anchor, strict Inside majority, mandatory public Outside and Inside Authority/Commerce/Residence unchanged. New region weights and affinities editorial. Location algorithm remains v0.1 prototype with compatible data only; distributed-only Location influence, soft uniqueness, flexible hierarchy and Sites are pending. Existing saves retain Zone types and regenerate Location layer; archived snapshots remain historical.

Validation: {"n":300,"invalid":0,"legacyChanges":0,"counts":{"Administrative District":127,"Upper Town":44,"Necropolis":49,"Stronghold":57,"Refugee Camp":56,"Market District":92,"Military District":48,"Ruined Quarter":111,"Palace District":161,"Monastery":73,"Lower Town":145,"Underground City":52,"Citadel":95,"Cavern":45,"Noble Quarter":36,"Entertainment Quarter":84,"Artisan Quarter":102,"Cultural District":28,"Underworld":53,"Estate":36,"Industrial District":17,"Rebel Camp":61,"Academic District":42,"Residential District":136,"Military Camp":25,"Temple District":17,"Warehouse District":9,"Slum":55,"Enclave":39,"Forest":12,"Academy":33,"Harbor":44,"Foreign Quarter":33,"Farming Village":21,"Caravan Camp":27,"Freeport":39,"Farmland":5,"Mining Settlement":9,"Mining Grounds":4},"newWorlds":216}.

# Zone Framework v0.4.0 — Locked baseline (World Generator v0.8.0)

Government Anchor uses existing Faction fit only (no composite/split, social, novelty or government-function modifier). Other stages and coverage unchanged. A Zone Type appears at most once across all buckets; duplicate penalty removed. Regional weights revised; Underworld public weights retained at .25/.1, Secret 1. Only eight Secret-eligible types: Underworld, Underground City, Rebel Camp, Enclave, Stronghold, Monastery, Estate, Military Camp. Secret = hidden existence/discovery, independent of access and legality; no Secret quota (future Site/Location/Room can be secret). Secret physical region uses existing geographic weights with Inside bias 2.5 and Outsider Outside modifier, Underground City explicitly Inside-only; no generic fallback. Parent candidates use explicit list and same physical region, uniform draw with existing .8 nesting probability; no faction-fit host scoring. {"Underground City":["Lower Town","Slum","Residential District"],"Underworld":["Lower Town","Market District","Freeport","Harbor","Slum","Palace District"],"Rebel Camp":["Refugee Camp","Stronghold","Enclave"],"Enclave":["Lower Town","Residential District","Foreign Quarter"]}. No eligible host means standalone. Strict physical Inside majority: rare failed geography rerolls with incremented zone seed (max 64 attempts, explicit error rather than invalid output); Factions, city and signatures unchanged. Keep 5–8, at least one public Outside, public Inside Authority/Commerce/Residence and Government anchor. Existing saved geographies preserved. Location generator not implemented.

Regional weights (Inside, Outside, Secret): {"Administrative District":[1,0,0],"Military District":[1,0.5,0],"Temple District":[1,0.5,0],"Academic District":[1,0,0],"Market District":[1,0.5,0],"Industrial District":[1,0.5,0],"Warehouse District":[1,0.5,0],"Farmland":[0,1,0],"Mining Grounds":[0,1,0],"Residential District":[1,0.5,0],"Noble Quarter":[1,0,0],"Slum":[1,0.5,0],"Cultural District":[1,0,0],"Underworld":[0.25,0.1,1],"Foreign Quarter":[1,0.15,0],"Citadel":[1,0.5,0],"Palace District":[1,0,0],"Stronghold":[0.5,1,0.22],"Monastery":[0.5,1,0.22],"Academy":[1,0.5,0],"Harbor":[1,0.5,0],"Freeport":[0.5,1,0],"Artisan Quarter":[1,0.15,0],"Upper Town":[1,0,0],"Lower Town":[1,0,0],"Enclave":[1,1,0.4],"Estate":[0.15,1,0.12],"Underground City":[0,0,1],"Military Camp":[0,1,0.12],"Rebel Camp":[0,1,0.8],"Caravan Camp":[0.15,1,0],"Refugee Camp":[0.15,1,0],"Farming Village":[0,1,0],"Mining Settlement":[0,1,0]}.

Paired fresh holdout 78000–79999; additional validation 80000–83999. Mean 7.093 → 7.138; anchors {"Palace District":1440,"Administrative District":140,"Citadel":420} → {"Administrative District":914,"Citadel":452,"Palace District":634}; Secret worlds 1273 → 1213; social contrast 1251 → 1200; nested 462 → 663; duplicates 160 → 0; physical Inside majority 1998 → 2000; weak affinity 875/14187 → 747/14275. Zero detected structural violations or change to legacy city/factions/signatures on 6,000 updated seeds. See zone-generator-holdout-v0.4.json. Editorial proxies, not playtesting. Browser and Colab runtime not independently tested.

## v0.3.1 — Secret eligibility

World Generator v0.7.1. Secret means hidden existence/discovery, not access restriction or remoteness. Only 10 Zone templates eligible: Underworld and Underground City 1, Rebel Camp .8, Enclave .4, Stronghold and Monastery .22, Estate and Military Camp .12, Warehouse District .08, Military District .05. All remaining templates zero. Inside/Outside weights, faction modifiers, required coverage, pruning and physical hierarchy unchanged. Secret Sites/Locations/Rooms are future content; access restriction remains Law/Gate. Existing saves retain their generated geography; New Universe applies revised weights.

Paired 2,000 seeds 70000–71999: secret zones 1,622 → 1,446; universes with secret zone 1,362 → 1,265; naturally secret types 1,206 → 1,231; other eligible types 215 after update; public/ineligible secret types 0. All updated universes maintain 5–8 zones, public outside minimum, mandatory inside coverage and government anchor; unchanged city/factions/signatures. See zone-secret-holdout-v0.3.1.json. Browser not tested.

# Zone Framework v0.3.0 — spatial hierarchy

World Generator v0.7.0. Minimum one non-secret Outside Zone, protected during pruning. Outsider gets stronger outside placement and completion preference. Remaining v0.2 policies preserved. Secret generation bucket remains internal; buildSpatialTree projects physical placement, optional host, two geographical regions and mandatory zero-size City Gate. No fabricated Site/Location/Room, travel size or travel gameplay. Existing worlds preserved; use New universe for new guarantee.

Holdout seeds 60000–61999: machine-readable report zone-generator-holdout-v0.3.json. Faction/city/signatures unchanged. No structural violations in updated holdout.

## Previous baseline

# Zone Framework v0.2.0 — World Generator v0.6.0

Gameplay priorities: compact city core, distinct government identity, functional diversity, social contrast, hidden opportunities. No equal territory requirement. Unified Basic/Composite selection (composite bonus, single-side basic affinity with penalty); no deferred selection stage. Government anchor remains public full Authority; government secondary function increases functional utility. Type/Base 80:20; Base strong/support/weak 95/65/25, supporting inferred from shared full functions. Adaptive completion selects candidates, not a randomly chosen missing function. Required City coverage unchanged; optional additions depend on fit, novelty and stochastic budget. Shared marginal utility uses functional gain, affinity, region and representation (40/30/20/10), with social contrast weighting; pruning removes lowest marginal value subject to public requirements, expansion fills to five, cap eight. Secret host alignment after balancing; weak host cutoff on both old and new fit, physical compatibility remains heuristic. No new vocabulary or location content. Existing saved v0.5 worlds retained (new universe uses new generator).

## Holdout 50,000–55,999

Baseline and tuned share identical seed set and Factions. {
  "baseline": {
    "n": 6000,
    "zones": 42097,
    "mean": 7.016166666666667,
    "regions": {
      "Inside City": 32691,
      "Secret Zone": 3886,
      "Outside City": 5520
    },
    "inside": 0.7765636506164335,
    "hidden": 0.5538333333333333,
    "contrast": 0.485,
    "govCov": 0.5405620888977477,
    "govAssoc": 0.2072951963324696,
    "functions": 7.382333333333333,
    "rep": 0.8998888888888888,
    "weak": 0.08311756182150747,
    "weakOld": 0.08311756182150747,
    "oldMean": 76.2722094017293,
    "primary": 0.9582868137872057,
    "red": 0.06751074898448821,
    "host": 1547,
    "hostWeak": 0.35488041370394313,
    "types": 34,
    "unique": 5867,
    "bad": 0,
    "legacy": 0,
    "counts": {
      "3": 5,
      "4": 78,
      "5": 529,
      "6": 1543,
      "7": 1679,
      "8": 1438,
      "9": 670,
      "10": 58
    },
    "majority": 0.9853333333333333,
    "noOutside": 0.3215
  },
  "tuned": {
    "n": 6000,
    "zones": 40795,
    "mean": 6.799166666666666,
    "regions": {
      "Inside City": 31637,
      "Secret Zone": 5116,
      "Outside City": 4042
    },
    "inside": 0.7755117048657924,
    "hidden": 0.689,
    "contrast": 0.6568333333333334,
    "govCov": 0.6575642814430935,
    "govAssoc": 0.2668925652780546,
    "functions": 7.4976666666666665,
    "rep": 0.8894722222222222,
    "weak": 0.05191812722147322,
    "weakOld": 0.1347469052579973,
    "oldMean": 73.90803946464926,
    "primary": 0.9684520161784532,
    "red": 0.05691874004167177,
    "host": 1607,
    "hostWeak": 0,
    "types": 34,
    "unique": 5783,
    "bad": 0,
    "legacy": 0,
    "counts": {
      "5": 918,
      "6": 1350,
      "7": 1751,
      "8": 1981
    },
    "majority": 0.9875,
    "noOutside": 0.45
  }
}

New affinity definition differs; do not compare its weak-rate directly against old without fixed scoring. Old balanced dual-type fit worsens (tradeoff for single-side basic representation). These are editorial proxies, not player testing. Live browser/Colab not independently tested.

## Previous baseline

# Zone Framework v0.1.0 — World Generator v0.5.0

Extends the existing six-Faction generator without consuming any random draws before City/Faction/Knowledge/Carrier output. 15 Basic functions and 19 Composite types, 3 generation Regions (Inside City, Outside City, Secret Zone). Secret zones have a separate physicalRegion and optional parentId (one level, public host in same physical region). Faction association is not ownership. No forced Outside/Secret quota; City is core. Zone rows are curated editorial seeds, not independently validated reference ratings. Type strong/support/other = 95/65/18; Base strong/other = 95/45; 70:30 blend; dual Type uses existing P8 fit. All 84 canonical bases have 3 explicit strong candidates; all 13 Types have at least 2 strong Basic candidates. 

Government first, other factions shuffled. At most one initial Composite per faction; dual candidate must support both Types and strongly support one; weak/no fit deferred. Government must have public full Authority and may draw Administrative District. Candidate weighted sampling exponent 5; regional weights 1/.25/.32, natural weight and Outsider/Government/secret modifiers. Non-Inside penalty after two non-Inside zones; repeated type penalty (same type+Region forbidden). City Authority, Commerce, Residence each require >=1 coverage; 0/.5/1 contribution per function, no cross-region substitution. Completion favors full direct coverage/basic; Composite can close extra gaps. Deferred factions may seed Basic zones (72% chance, threshold 64); up to 2 optional preferred holes (62% per attempt), mainly City. Soft zone cap 10 for optional additions, no minimum Outside/Secret. No Location/Room/Story generation yet. Zones persistent in MVP state; v0.4 save migrates by hash of existing city and faction names, not a reroll. No new player UI; stage 3 remains quest-complete.

## Verification
Holdout seeds 40000–45999 (6000); 42272 zones; regions {"Inside City":32990,"Outside City":5387,"Secret Zone":3895}; all required coverage met, zero invalid placement/parent/faction/duplicate checks, zero change to legacy Faction, City, signature output; 5841 distinct unordered type+region combinations. 34/34 types appeared. Mean 7.05 zones, 5.40 factions with direct zone association; 87 worlds lacked strict Inside majority. Those are statistical targets, not absolute guarantees. 3424 zones scored <55 editorial affinity (often requirement completion). Live Pages/Colab not tested.

`InfactionWorld.generateZones(factions, seed, options)` or `require('./world-generator.js').generate(seed)`. Defaults are exported as data.zoneDefaults, zoneTypes, zoneFunctions, zoneRegions, zoneBaseAffinity. 
