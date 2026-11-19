Location v0.1.0: generated Locations appear under home Zones with primary affiliation (Neutral or Faction). Preview reveals secrets; no travel or Location actions yet.

v0.4.0: unique Zone Types and strict physical Inside majority; Secret hosts use curated compatibility lists. Existing saved geography retained. See ZONE_GENERATOR.md.

Player-facing labels: root `The Lands` (provisional broad-world name), city node uses the actual generated city name. Internal Region identifiers remain Outside City and Inside City; no change to generation or hierarchy.

# Map — physical hierarchy MVP

Two geographic Regions: Outside City contains City Gate, which contains Inside City. Gate size zero; not a Zone. Generated Secret Zones occur once in their physical Region or under their valid host. All visible in preview; folders expand/collapse, preferences per save. Internal generation bucket Secret Zone retained for scoring and coverage; not a geographical folder. All nodes are conceptually occupiable, but navigation beyond current Gate quest is not implemented. Sizes of regions/zones are null until calibrated. No separate Street/Path object. Existing saves retain their zones, including older worlds with no public Outside Zone; New universe uses updated minimum.

Verified against 300 actual generated worlds with DOM double; live browser not tested.
