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
