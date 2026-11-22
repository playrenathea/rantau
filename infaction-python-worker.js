/* Infaction native v0.4.8 Python-in-browser worker.
   Never substitutes the legacy JavaScript world generator or static world data. */
'use strict';
const PYODIDE_URL='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
const ROOT='./';
const PATHS=[
  'notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb',
  'notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb',
  'notebooks/Infaction_Faction_Naming_Zone_Location_Generator_v0.4.3_City_Experiment_Revised.ipynb',
  'infaction_placement_locked.py','infaction_city_locked.py',
  'data/infaction_neutral_static_v2_locked.json',
  'data/infaction_city_score_original_locked.json',
  'data/infaction_master_v0.4.json',
  'infaction_v048_integrated_selection.py',
  'data/infaction_missing_8_place_affinity_book1_recovered.json',
  'infaction_site_proximity_checkpoint.py',
  'experiments/infaction_targeted_farm_ship_site_prune_v2.py',
  'experiments/infaction_targeted_farm_ship_site_filter_v2.json',
  'infaction_site_postprocess_v3.py',
  'infaction_world_json_export_v048.py',
  'infaction_hidden_restricted_locked.py',
  'infaction_ownership_hidden_restricted_locked.py',
  'data/infaction_animal_place_flavor_v2.json',
  'infaction_place_naming_locked.py',
  'data/infaction_place_impression_tags_v2.json'
];
let interpreter=null,assetText=null,inFlight=false,ready=false;
const say=(message)=>self.postMessage({type:'status',message});
async function load(){
  if(ready)return interpreter;
  if(!interpreter){
    say('Loading Python engine');
    importScripts(PYODIDE_URL);
    interpreter=await loadPyodide({indexURL:PYODIDE_URL.replace('pyodide.js','')});
  }
  say('Loading original v0.4.8 generator and Book1');
  const entries=await Promise.all(PATHS.map(async path=>{
    const response=await fetch(ROOT+path,{cache:'no-store'});
    if(!response.ok)throw Error('Source '+path+': HTTP '+response.status);
    return [path,await response.text()];
  }));
  assetText=Object.fromEntries(entries);
  if(!assetText['data/infaction_master_v0.4.json'].trim())throw Error('Master Book1 data not available');
  // The archived notebook's IPython display import is unused in generator cells.
  const historical='notebooks/Infaction_Faction_Naming_Zone_Location_Generator_v0.4.3_City_Experiment_Revised.ipynb';
  const nb=JSON.parse(assetText[historical]);
  const source=nb.cells[1].source.join('');
  if(!source.includes('from IPython.display import display, Markdown'))throw Error('Archived generator import changed');
  nb.cells[1].source=source.replace('from IPython.display import display, Markdown','').split(/(?<=\n)/);
  assetText[historical]=JSON.stringify(nb);
  const bytes=new TextEncoder().encode(JSON.stringify(assetText));
  interpreter.FS.writeFile('/infaction_browser_assets.json',bytes);
  ready=true;
  return interpreter;
}
const BOOTSTRAP=String.raw`
import io, json, urllib.request, contextlib
from pathlib import Path
with open('/infaction_browser_assets.json', encoding='utf-8') as _assets_file:
    ASSET_TEXT=json.load(_assets_file)
def _asset_urlopen(url, timeout=None, *args, **kwargs):
    u = url.full_url if hasattr(url,'full_url') else str(url)
    marker='/main/'
    if marker not in u:raise ValueError('Non-repository URL not supported by native browser runner: '+u)
    path=u.split(marker,1)[1].split('?',1)[0]
    if path not in ASSET_TEXT:raise FileNotFoundError('Missing local generator asset: '+path)
    return io.BytesIO(ASSET_TEXT[path].encode('utf-8'))
urllib.request.urlopen=_asset_urlopen
nb=json.loads(ASSET_TEXT['notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb'])
run_scope={'__name__':'__main__'}
with contextlib.redirect_stdout(io.StringIO()) as captured:
    for index in (1,2,3):
        src=''.join(nb['cells'][index]['source'])
        exec(compile(src, 'infaction_v048_browser_cell_'+str(index), 'exec'), run_scope)
full_world=run_scope['full_world']
assert len(full_world['factions'])==6
assert full_world['place_naming']['vocabulary_version']=='animal-place-flavor-v2-active-2026-11-22'
assert full_world['place_naming']['impression_version']=='impression-tags-v2-active-2026-11-22'
assert isinstance(full_world['access_nodes'],list)
result_json=json.dumps(full_world,ensure_ascii=False,allow_nan=False)
# Remove temporary Colab export files after serializing, to keep rerolls lightweight.
for _pattern in ('infaction_world_named_seed_*.json','infaction_world_with_sites_experimental_*.json'):
    for _temp in Path.cwd().glob(_pattern):
        _temp.unlink(missing_ok=True)
`;
self.onmessage=async event=>{
 if(event.data?.type!=='generate'||inFlight)return;
 inFlight=true;
 try{
  const py=await load();
  say('Generating Factions, Zones, Locations and Sites');
  await py.runPythonAsync(BOOTSTRAP);
  say('Building ownership, access and names');
  const raw=py.globals.get('result_json');
  const world=JSON.parse(raw);
  if(world.generator_version!=='0.4.8')throw Error('Unexpected generator version');
  self.postMessage({type:'world',world});
 }catch(error){
  self.postMessage({type:'error',message:String(error?.message||error),traceback:String(error?.stack||'').slice(0,4500)});
 }finally{inFlight=false;}
};
