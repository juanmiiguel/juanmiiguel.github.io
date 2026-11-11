import{SECTORS,defaultConfig,calculate,validateConfig,parseSaved}from './engine.js';
const $=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n),storageKey='presupuestaia-v2-config';
let config=parseSaved(localStorage.getItem(storageKey));
const escape=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
function renderExtras(){
 $('extraSettings').innerHTML=config.extras.map((e,i)=>`<div class="extra-row"><div><label for="extraName${i}">Nombre del extra</label><input id="extraName${i}" maxlength="80" value="${escape(e.name)}" required></div><div><label for="extraPrice${i}">Precio (€)</label><input id="extraPrice${i}" type="number" min="0" max="100000" step=".01" value="${e.price}" required></div><button class="remove-extra secondary" type="button" data-remove="${i}" aria-label="Eliminar extra ${i+1}">Eliminar</button></div>`).join('');
 $('chosenExtras').innerHTML=config.extras.length?config.extras.map((e,i)=>`<label class="check"><input type="checkbox" value="${i}"> ${escape(e.name)} (+${fmt(e.price)})</label>`).join(''):'<p>No hay extras configurados.</p>';
}
function syncExtras(){
 config.extras=config.extras.map((e,i)=>({...e,name:$('extraName'+i).value,price:Number($('extraPrice'+i).value)}));
}
function render(){
 $('business').value=config.name;$('sector').value=config.sector;$('rate').value=config.rate;$('minimum').value=config.minimum;$('tax').value=config.tax;
 $('unit').textContent=SECTORS[config.sector].unit;
 $('quantityLabel').textContent='Cantidad ('+SECTORS[config.sector].unit+')';
 $('brand').textContent=config.name;renderExtras();quote();
}
function readForm(){syncExtras();return{name:$('business').value.trim(),sector:$('sector').value,rate:Number($('rate').value),minimum:Number($('minimum').value),tax:Number($('tax').value),extras:config.extras.map(e=>({...e}))}}
function quote(){try{const selected=[...$('chosenExtras').querySelectorAll('input:checked')].map(x=>Number(x.value)),r=calculate(config,Number($('quantity').value),selected);$('total').textContent=fmt(r.total);$('breakdown').textContent=`Base: ${fmt(r.base)} · Extras: ${fmt(r.extras)} · IVA (${config.tax}%): ${fmt(r.taxAmount)}`;$('status').textContent='Estimación orientativa, no vinculante.'}catch(e){$('total').textContent='—';$('breakdown').textContent='';$('status').textContent=e.message}}
$('addExtra').addEventListener('click',()=>{
 syncExtras();if(config.extras.length>=500){$('status').textContent='Máximo de 500 extras por motivos de rendimiento.';return}
 const id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
 config.extras.push({id,name:'Nuevo servicio',price:0});renderExtras();$('extraName'+(config.extras.length-1)).focus();$('status').textContent='Nuevo extra añadido. Guarda las tarifas para conservarlo.';
});
$('extraSettings').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;syncExtras();config.extras.splice(Number(b.dataset.remove),1);renderExtras();quote();$('status').textContent='Extra eliminado. Guarda las tarifas para conservar el cambio.'});
$('sector').addEventListener('change',()=>{const business=$('business').value.trim();config=defaultConfig($('sector').value);if(business.length>=2)config.name=business;render();$('status').textContent='Sector cambiado. Guarda para conservar la configuración.'});
$('settings').addEventListener('submit',e=>{e.preventDefault();try{const next=readForm();validateConfig(next);config=next;localStorage.setItem(storageKey,JSON.stringify(config));render();$('status').textContent='Configuración guardada en este navegador.'}catch(err){$('status').textContent=err.message}});
$('estimate').addEventListener('submit',e=>{e.preventDefault();quote()});$('chosenExtras').addEventListener('change',quote);$('quantity').addEventListener('input',quote);
$('reset').addEventListener('click',()=>{config=defaultConfig($('sector').value);localStorage.removeItem(storageKey);render();$('status').textContent='Restablecido.'});
$('export').addEventListener('click',()=>{try{const c=readForm();validateConfig(c);const blob=new Blob([JSON.stringify(c,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='presupuestaia-config.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){$('status').textContent=e.message}});
render();