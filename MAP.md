# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

## Zone vocabulary v0.5.0 / World Generator v0.10.0

39 canonical Zone Types: retain all 34; add Forest, Ruined Quarter, Cavern, Entertainment Quarter, Necropolis. Harbor is canonical, Port removed from Location vocabulary; Forest, Cave, Ruins promoted (Cave → Cavern, Ruins → Ruined Quarter). 70 Location profiles. Canonical labels in all regions (retire regional aliases). Existing Zone algorithm, 5–8 budget, Government public anchor, strict Inside majority, mandatory public Outside and Inside Authority/Commerce/Residence unchanged. New region weights and affinities editorial. Location algorithm remains v0.1 prototype with compatible data only; distributed-only Location influence, soft uniqueness, flexible hierarchy and Sites are pending. Existing saves retain Zone types and regenerate Location layer; archived snapshots remain historical.

Validation: {"n":300,"invalid":0,"legacyChanges":0,"counts":{"Administrative District":127,"Upper Town":44,"Necropolis":49,"Stronghold":57,"Refugee Camp":56,"Market District":92,"Military District":48,"Ruined Quarter":111,"Palace District":161,"Monastery":73,"Lower Town":145,"Underground City":52,"Citadel":95,"Cavern":45,"Noble Quarter":36,"Entertainment Quarter":84,"Artisan Quarter":102,"Cultural District":28,"Underworld":53,"Estate":36,"Industrial District":17,"Rebel Camp":61,"Academic District":42,"Residential District":136,"Military Camp":25,"Temple District":17,"Warehouse District":9,"Slum":55,"Enclave":39,"Forest":12,"Academy":33,"Harbor":44,"Foreign Quarter":33,"Farming Village":21,"Caravan Camp":27,"Freeport":39,"Farmland":5,"Mining Settlement":9,"Mining Grounds":4},"newWorlds":216}.

Location v0.1.0: generated Locations appear under home Zones with primary affiliation (Neutral or Faction). Preview reveals secrets; no travel or Location actions yet.

v0.4.0: unique Zone Types and strict physical Inside majority; Secret hosts use curated compatibility lists. Existing saved geography retained. See ZONE_GENERATOR.md.

Player-facing labels: root `The Lands` (provisional broad-world name), city node uses the actual generated city name. Internal Region identifiers remain Outside City and Inside City; no change to generation or hierarchy.

# Map — physical hierarchy MVP

Two geographic Regions: Outside City contains City Gate, which contains Inside City. Gate size zero; not a Zone. Generated Secret Zones occur once in their physical Region or under their valid host. All visible in preview; folders expand/collapse, preferences per save. Internal generation bucket Secret Zone retained for scoring and coverage; not a geographical folder. All nodes are conceptually occupiable, but navigation beyond current Gate quest is not implemented. Sizes of regions/zones are null until calibrated. No separate Street/Path object. Existing saves retain their zones, including older worlds with no public Outside Zone; New universe uses updated minimum.

Verified against 300 actual generated worlds with DOM double; live browser not tested.
