> UI rollback: the live MVP currently uses the restored v0.10.0 UI/runtime. Unified Place generation is retained in `world-place-generator.js` and `place-generator.js`; Colab remains pinned to v0.11.0. Integration into the original UI is pending.

# Infaction — Unified Place Generator v0.1.0 / World v0.11.0
Active navigation prototype: [GitHub Pages](https://playrenathea.github.io/rantau/). Data snapshot: [Place Master Data v0.1.0](https://docs.google.com/spreadsheets/d/1uxvNhDWZJ5w6jrWJzsT6vr4vvd5wkkIa_TNQMK9x6fI/edit). [Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb) shares the exact pinned JS source.
## Model
One Place type, 126 rows, Scale 1–5; roles derived by generation (Location 1–2, Site 2–4, Zone 4–5). Global Type uniqueness across roles. The Land contains the named City and outside Places directly; City contains inside Places. Empty Zones valid; same-scale containment allowed, no cycles. No Gate or NPCs, events, inventory, faction influence or travel-time simulation in this MVP. Faction identities and naming are preserved.
## Pipeline
1. Sample independent centered counts first: Zone 6–9 with weights 1,2,2,1; Location 20–30 with weights 1,2,3,4,5,6,5,4,3,2,1. Means 7.5 and 25.
2. Greedy Zone selection: function coverage bonus/overlap penalty, faction coverage bonus/overlap penalty (nonexclusive selection scores, not actual influence), random, spatial affinity and additive Type bias.
3. Geography for Zones: fixed endpoints respected; flexible 10% Outside. Mean 1.5 Outside is reference target, not a quota.
4. Assign strictly defining mandatory Locations before global greedy Location selection; a shared mandatory anchor goes to its strongest eligible host. Count includes mandatory. No duplication.
5. Match other Locations to geographically compatible Zones using normalized directional ordinal ranks averaged 50:50. Random tie-breaker; absolute minimum mutual score 65 and both directional scores >=45. If no adequate fit, direct City or The Land fallback; flexible fallback 50:50.
6. Enumerate eligible unselected Site Types and host Zones. Uniform random candidate; claim >=2 mutually compatible direct Locations, leaving >=1 direct Location in the host. Recalculate until no candidate. Scale and geography constraints apply. Site groups can include mandatory Locations within their original Zone. No nested Sites required for MVP.
7. Visibility fixed endpoints or independent 10% Hidden for flexible; parent visibility does not mutate child visibility. Debug reveal allows testing hidden destinations. Visible is not equivalent to discovered.
## Baseline parameters (provisional)
Zone weights function/faction/random/spatial = .50/.30/.15/.05; Location = .45/.30/.20/.05. Overlap penalty coefficients .2. Function targets 1 and 2 respectively. Mandatory mapping is explicit in place-generator.js; semantic data and thresholds need review, not final balance.
## Validation
Initial 200-seed structural holdout: means Zone 7.44, Location 25.095, Site 3.10, Outside Zone 1.79; no structural failure. Source snapshot commit a7a63f6aa9532f39f3d1f356b9cded323d2c6529. Older Zone/Location architecture, docs, notebook versions and historical outputs are not current specifications.
