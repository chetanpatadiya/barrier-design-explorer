(function(){
 'use strict';
 const core=window.BarrierCore;let count=0;let demo=true;
 const synthetic = [
   {name:'PE (illustrative)',thicknessUm:35,pOxygen:100000,pWater:400,source:'SYNTHETIC EXAMPLE — not measured'},
   {name:'EVOH (illustrative)',thicknessUm:10,pOxygen:100,pWater:1500,source:'SYNTHETIC EXAMPLE — not measured'},
   {name:'PE (illustrative)',thicknessUm:35,pOxygen:100000,pWater:400,source:'SYNTHETIC EXAMPLE — not measured'}
 ];
 let layers=synthetic.map(o=>({...o,id:++count}));
 const $=id=>document.getElementById(id);
 const fmt=(v,d=3)=> !Number.isFinite(v)?'—':(Math.abs(v)>0 && (Math.abs(v)<0.001 || Math.abs(v)>=1e6)?v.toExponential(3):Number(v.toPrecision(d+2)).toLocaleString('en-US',{maximumFractionDigits:Math.max(0,d)}));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function getConditions(){return {temperatureC:$('temp').value,outsideRH:$('outside').value,insideRH:$('inside').value,oxygenDpAtm:$('oxygenDp').value};}
 function clearDemo(){demo=false;$('demoBanner').classList.add('hidden');$('modeLabel').textContent='USER-DATA MODE • Verify each material coefficient';}
 function loadDemo(){demo=true; layers=synthetic.map(o=>({...o,id:++count}));$('demoBanner').classList.remove('hidden');$('modeLabel').textContent='ILLUSTRATIVE DEMO • Synthetic coefficients';renderRows();update();}
 function blankStart(){clearDemo();layers=[{id:++count,name:'Layer 1',thicknessUm:25,pOxygen:'',pWater:'',source:''},{id:++count,name:'Layer 2',thicknessUm:25,pOxygen:'',pWater:'',source:''}];renderRows();update();}
 function fields(l){return `<div class="layer-heading"><span class="tag">L${layers.indexOf(l)+1}</span><div class="layer-arrows"><button type="button" data-action="up" data-id="${l.id}" title="Move layer up" aria-label="Move layer up">↑</button><button type="button" data-action="down" data-id="${l.id}" title="Move layer down" aria-label="Move layer down">↓</button><button type="button" data-action="remove" data-id="${l.id}" title="Remove layer" aria-label="Remove layer">×</button></div></div>
 <div class="layer-fields">
 <label>Material / description<input type="text" data-id="${l.id}" data-field="name" value="${esc(l.name)}" placeholder="e.g., PE grade A" maxlength="100"/></label>
 <label>Thickness · µm<input type="number" min="0.001" max="100000" step="any" data-id="${l.id}" data-field="thicknessUm" value="${esc(l.thicknessUm)}"/></label>
 <label>O₂ permeability <span class="help" title="cm³(STP) × µm / (m² × day × atm)">ⓘ</span><small>cm³·µm / (m²·day·atm)</small><input type="number" min="0" step="any" data-id="${l.id}" data-field="pOxygen" value="${esc(l.pOxygen)}" placeholder="Required for OTR"/></label>
 <label>H₂O permeability <span class="help" title="g × µm / (m² × day × kPa)">ⓘ</span><small>g·µm / (m²·day·kPa)</small><input type="number" min="0" step="any" data-id="${l.id}" data-field="pWater" value="${esc(l.pWater)}" placeholder="Required for WVTR"/></label>
 <label class="source-field">Data source / grade / test conditions <input type="text" data-id="${l.id}" data-field="source" value="${esc(l.source)}" placeholder="DOI, data sheet, or test report" maxlength="350"/></label>
 </div>`;}
 function renderRows(){ $('layerList').innerHTML=layers.map(l=>`<section class="layer" data-layer="${l.id}">${fields(l)}</section>`).join('');$('layerCount').textContent=String(layers.length);renderSelect();}
 function renderSelect(){const sel=$('whatIfLayer');const old=sel.value;sel.innerHTML=layers.map(l=>`<option value="${l.id}">${esc(l.name || 'Unnamed')} · L${layers.indexOf(l)+1}</option>`).join('');if(layers.some(l=>String(l.id)===old))sel.value=old;}
 function valRow(label, value, unit, id){ $(id).textContent=value===null?'Enter data':fmt(value);$(id+'Unit').textContent=value===null?'Incomplete inputs':unit;}
 function bars(containerId,shares){const e=$(containerId);if(!shares?.length){e.innerHTML='<p class="subtle">All layer permeability inputs are required for this calculation.</p>';return;}e.innerHTML=shares.map((pct,i)=>`<div class="share"><div class="share-top"><span>Layer ${i+1} · ${esc(layers[i].name)}</span><strong>${fmt(pct,1)}%</strong></div><div class="track"><span style="width:${Math.max(0,Math.min(100,pct))}%"></span></div></div>`).join('');}
 function update(){const r=core.evaluate(layers,getConditions());
   valRow('OTR',r.oxygen.value,'cm³(STP) / m²·day','otr');valRow('WVTR',r.water.value===null?null:Math.abs(r.water.value),'g / m²·day (magnitude)','wvtr');
   $('thickness').textContent=r.totalThicknessUm===null?'—':fmt(r.totalThicknessUm,2);$('waterDp').textContent=r.deltaWaterKpa===null?'—':fmt(r.deltaWaterKpa,4)+' kPa';
   $('direction').textContent=r.deltaWaterKpa===null?'—':r.deltaWaterKpa>0?'Outside → inside':r.deltaWaterKpa<0?'Inside → outside':'Zero vapor-pressure gradient';
   bars('oxygenBars',r.oxygen.shares);bars('waterBars',r.water.shares);
   $('warningList').innerHTML=r.warnings.map(w=>`<li>${esc(w)}</li>`).join('');
   const idx=layers.findIndex(l=>String(l.id)===$('whatIfLayer').value);const factor=Number($('scale').value)/100;$('scaleLabel').textContent=fmt(factor,2)+'×';
   if(idx<0||!Number.isFinite(factor)){ $('whatIfResults').textContent='Choose a layer.';return;}
   const variant=layers.map((l,i)=>i===idx?{...l,thicknessUm:Number(l.thicknessUm)*factor}:{...l});
   const vr=core.evaluate(variant,getConditions());
   function diff(base,newval){return base===null||newval===null||base===0?'—':`${(100*(newval/base-1))>=0?'+':''}${fmt(100*(newval/base-1),1)}%`;}
   $('whatIfResults').innerHTML=`<div>Scenario thickness: <strong>${fmt(vr.totalThicknessUm,2)} µm</strong></div><div>OTR change: <strong>${diff(r.oxygen.value,vr.oxygen.value)}</strong></div><div>WVTR change: <strong>${diff(r.water.value,vr.water.value)}</strong></div>`;
   return r;
 }
 function save(filename,body,type){const blob=new Blob([body],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 $('layerList').addEventListener('input',e=>{const id=Number(e.target.dataset.id),field=e.target.dataset.field;if(!id||!field)return;const l=layers.find(x=>x.id===id);if(!l)return;l[field]=e.target.value;if(field==='name')renderSelect();update();});
 $('layerList').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(!btn)return;const id=Number(btn.dataset.id),i=layers.findIndex(x=>x.id===id);if(i<0)return;const action=btn.dataset.action;
  if(action==='remove'){if(layers.length===1){alert('Keep at least one layer.');return;}layers.splice(i,1);}
  if(action==='up'&&i>0)[layers[i-1],layers[i]]=[layers[i],layers[i-1]];
  if(action==='down'&&i<layers.length-1)[layers[i+1],layers[i]]=[layers[i],layers[i+1]];
  renderRows();update();});
 ['temp','outside','inside','oxygenDp','scale','whatIfLayer'].forEach(id=>$(id).addEventListener('input',update));
 $('addLayer').addEventListener('click',()=>{layers.push({id:++count,name:'New layer',thicknessUm:10,pOxygen:'',pWater:'',source:''});renderRows();update();});
 $('loadDemo').addEventListener('click',loadDemo);$('blank').addEventListener('click',blankStart);
 $('exportJSON').addEventListener('click',()=>save('barrier-design-v0.1.json',JSON.stringify({tool:'Barrier Design Explorer',version:'0.1',status:'IN DEVELOPMENT',syntheticExample:demo,units:{thickness:'µm',oxygenPermeability:'cm3(STP)*µm/(m2*day*atm)',waterPermeability:'g*µm/(m2*day*kPa)'},conditions:getConditions(),layers,results:core.evaluate(layers,getConditions())},null,2),'application/json'));
 $('exportCSV').addEventListener('click',()=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=[['layer','material','thickness_um','pO2_cm3_um_per_m2_day_atm','pH2O_g_um_per_m2_day_kPa','source'],...layers.map((l,i)=>[i+1,l.name,l.thicknessUm,l.pOxygen,l.pWater,l.source])];save('barrier-layers-v0.1.csv',rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv;charset=utf-8');});
 $('print').addEventListener('click',()=>window.print());
 renderRows();update();
})();
