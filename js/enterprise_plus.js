/* ═══════════════════════════════════════════════════════════════
   SchoolDocForge v7 — Enterprise Plus Modules
   Health/Clinic · Transport · Cafeteria · Hostel · Homework ·
   Quiz Player · KPI Dashboard · Expenses · Notes · Global Search ·
   QR Sync · Calendar · Themes · Notifications · Tour · Currency ·
   Honor Roll · Bulk QR · Trend Charts · Auto-IDs
   100% client-side. No backend. No paid API.
═══════════════════════════════════════════════════════════════ */
'use strict';

const V7_VERSION = '7.1.0-enterprise-plus-hmg';

document.addEventListener('DOMContentLoaded', () => {
  // Render all v7 modules
  renderClinic();
  renderTransport();
  renderCafeteria();
  renderHostel();
  renderHomework();
  renderKPIDashboard();
  renderExpenses();
  renderNotes();
  renderCalendar();
  renderHonorRoll();
  renderTrendCharts();
  initTheme();
  initCurrency();
  initGlobalSearch();
  initTourGuide();
  initBrowserNotifications();
  populateTransportSelects();
});

/* ════════ THEMES (Light/Dark/Sepia/HC/Solarized) ════════ */
function initTheme(){
  const t = localStorage.getItem('sdf_theme') || 'light';
  applyTheme(t);
}
function applyTheme(t){
  document.body.classList.remove('theme-sepia','theme-hc','theme-solarized','dark','dark-mode');
  if(t === 'dark') document.body.classList.add('dark','dark-mode');
  else if(t === 'sepia') document.body.classList.add('theme-sepia');
  else if(t === 'hc') document.body.classList.add('theme-hc');
  else if(t === 'solarized') document.body.classList.add('theme-solarized');
  localStorage.setItem('sdf_theme', t);
  const sel = document.getElementById('theme-select'); if(sel) sel.value = t;
}
function setTheme(t){ applyTheme(t); if(window.SDF) SDF.toast('Theme: ' + t); audit('theme','set',t); }
window.setTheme = setTheme; window.applyTheme = applyTheme;

/* ════════ CURRENCY SWITCHER ════════ */
const CURRENCIES = {
  NGN: { sym: '₦', name: 'Nigerian Naira' },
  GHS: { sym: 'GH₵', name: 'Ghanaian Cedi' },
  KES: { sym: 'KSh', name: 'Kenyan Shilling' },
  ZAR: { sym: 'R',   name: 'South African Rand' },
  XOF: { sym: 'CFA', name: 'West African CFA Franc' },
  USD: { sym: '$',   name: 'US Dollar' },
  GBP: { sym: '£',   name: 'British Pound' },
  EUR: { sym: '€',   name: 'Euro' },
};
function initCurrency(){
  const cur = localStorage.getItem('sdf_currency') || 'NGN';
  window._SDF_CURRENCY = cur;
  const sel = document.getElementById('currency-select');
  if(sel){
    sel.innerHTML = Object.keys(CURRENCIES).map(k => `<option value="${k}" ${k===cur?'selected':''}>${CURRENCIES[k].sym} ${k}</option>`).join('');
  }
}
function setCurrency(c){ localStorage.setItem('sdf_currency', c); window._SDF_CURRENCY = c; if(window.SDF) SDF.toast('Currency: ' + c); }
function curSym(){ return CURRENCIES[window._SDF_CURRENCY || 'NGN'].sym; }
window.setCurrency = setCurrency; window.curSym = curSym;

/* ════════ HEALTH / CLINIC ════════ */
function showClinicModal(e){
  const students = lsGet('students',[]);
  if(!students.length){ SDF.toast('Add students first','error'); return; }
  openModal(e?'Edit Clinic Record':'New Clinic Record', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Student</label><select id="cl-st" class="form-input">${students.map(s=>`<option value="${s.id}" ${e?.stId===s.id?'selected':''}>${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Date</label><input id="cl-date" type="date" class="form-input" value="${e?.date||new Date().toISOString().slice(0,10)}"/></div>
    <div class="form-group"><label class="form-label">Type</label><select id="cl-type" class="form-input"><option ${e?.type==='Visit'?'selected':''}>Visit</option><option ${e?.type==='Vaccination'?'selected':''}>Vaccination</option><option ${e?.type==='Allergy'?'selected':''}>Allergy</option><option ${e?.type==='Injury'?'selected':''}>Injury</option><option ${e?.type==='Medication'?'selected':''}>Medication</option></select></div>
    <div class="form-group"><label class="form-label">Temperature (°C)</label><input id="cl-temp" type="number" step="0.1" class="form-input" value="${e?.temp||''}"/></div>
    <div class="form-group"><label class="form-label">Blood Pressure</label><input id="cl-bp" class="form-input" value="${e?.bp||''}" placeholder="120/80"/></div>
    <div class="form-group form-group-full"><label class="form-label">Symptoms / Complaint (Subjective)</label><textarea id="cl-s" class="form-input" rows="2">${escapeHTML(e?.subj||'')}</textarea></div>
    <div class="form-group form-group-full"><label class="form-label">Findings (Objective)</label><textarea id="cl-o" class="form-input" rows="2">${escapeHTML(e?.obj||'')}</textarea></div>
    <div class="form-group form-group-full"><label class="form-label">Diagnosis (Assessment)</label><textarea id="cl-a" class="form-input" rows="2">${escapeHTML(e?.assess||'')}</textarea></div>
    <div class="form-group form-group-full"><label class="form-label">Treatment / Plan</label><textarea id="cl-p" class="form-input" rows="2">${escapeHTML(e?.plan||'')}</textarea></div>
    <div class="form-group"><label class="form-label">Nurse / Officer</label><input id="cl-nurse" class="form-input" value="${escapeHTML(e?.nurse||'')}"/></div>
  </div>`, () => {
    const stId = SDF.field('cl-st').value; const st = students.find(s=>s.id===stId);
    const data = {
      id: e?.id || 'cl_'+Date.now(), stId, stName: st?.name||'', stClass: st?.class||'',
      date: SDF.field('cl-date').value, type: SDF.field('cl-type').value,
      temp: SDF.field('cl-temp').value, bp: SDF.field('cl-bp').value,
      subj: SDF.field('cl-s').value, obj: SDF.field('cl-o').value,
      assess: SDF.field('cl-a').value, plan: SDF.field('cl-p').value,
      nurse: SDF.field('cl-nurse').value
    };
    const list = lsGet('clinic',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.unshift(data);
    lsSet('clinic', list); renderClinic(); audit(idx>=0?'update':'create','clinic', data.stName);
    SDF.toast('Saved'); return true;
  });
}
function renderClinic(){
  const list = lsGet('clinic',[]);
  const tbody = document.getElementById('clinic-tbody'); if(!tbody) return;
  const q = (document.getElementById('clinic-search')?.value||'').toLowerCase();
  const f = q ? list.filter(c => Object.values(c).join(' ').toLowerCase().includes(q)) : list;
  tbody.innerHTML = f.length ? f.map(c=>`<tr><td>${escapeHTML(c.date)}</td><td>${escapeHTML(c.stName)} <small style="color:#888;">(${escapeHTML(c.stClass)})</small></td><td><span class="lib-badge ${c.type==='Vaccination'?'available':(c.type==='Allergy'?'overdue':'borrowed')}">${escapeHTML(c.type)}</span></td><td>${escapeHTML(c.subj?.slice(0,60)||'')}</td><td>${escapeHTML(c.assess?.slice(0,60)||'')}</td><td><button class="btn-sm" onclick='editClinic("${c.id}")'>✏️</button> <button class="btn-sm" onclick='printSOAP("${c.id}")'>🧪 SOAP</button> <button class="btn-sm btn-danger" onclick='deleteClinic("${c.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty-table">No clinic records</td></tr>';
}
function editClinic(id){ const e = lsGet('clinic',[]).find(x=>x.id===id); if(e) showClinicModal(e); }
function deleteClinic(id){ if(!confirm('Delete record?')) return; lsSet('clinic', lsGet('clinic',[]).filter(c=>c.id!==id)); renderClinic(); audit('delete','clinic',id); }
function printSOAP(id){
  const c = lsGet('clinic',[]).find(x=>x.id===id); if(!c) return;
  selectDocType('soap-note'); proceedToStep3();
  setTimeout(()=>{
    SDF.field('cf-studentName').value = c.stName;
    SDF.field('cf-date').value = c.date;
    SDF.field('cf-temp').value = c.temp; SDF.field('cf-bp').value = c.bp;
    SDF.field('cf-subjective').value = c.subj;
    SDF.field('cf-objective').value = c.obj;
    SDF.field('cf-assessment').value = c.assess;
    SDF.field('cf-plan').value = c.plan;
    SDF.field('cf-nurse').value = c.nurse;
    updateLivePreview();
  }, 120);
}
function exportClinicCSV(){ const l=lsGet('clinic',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l)],{type:'text/csv'}),'clinic.csv'); }
window.showClinicModal=showClinicModal; window.editClinic=editClinic; window.deleteClinic=deleteClinic; window.renderClinic=renderClinic; window.printSOAP=printSOAP; window.exportClinicCSV=exportClinicCSV;

/* ════════ TRANSPORT ════════ */
function showBusModal(b){
  openModal(b?'Edit Bus':'Add Bus', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Plate Number *</label><input id="bs-plate" class="form-input" value="${escapeHTML(b?.plate||'')}"/></div>
    <div class="form-group"><label class="form-label">Route</label><input id="bs-route" class="form-input" placeholder="Ikeja → Maryland" value="${escapeHTML(b?.route||'')}"/></div>
    <div class="form-group"><label class="form-label">Driver</label><input id="bs-driver" class="form-input" value="${escapeHTML(b?.driver||'')}"/></div>
    <div class="form-group"><label class="form-label">Driver Phone</label><input id="bs-phone" class="form-input" value="${escapeHTML(b?.phone||'')}"/></div>
    <div class="form-group"><label class="form-label">Capacity</label><input id="bs-cap" type="number" class="form-input" value="${b?.cap||30}"/></div>
    <div class="form-group form-group-full"><label class="form-label">Pickup Points (one per line)</label><textarea id="bs-stops" class="form-input" rows="3">${escapeHTML((b?.stops||[]).join('\n'))}</textarea></div>
  </div>`, () => {
    const data = { id:b?.id||'bs_'+Date.now(), plate:SDF.field('bs-plate').value.trim(), route:SDF.field('bs-route').value, driver:SDF.field('bs-driver').value, phone:SDF.field('bs-phone').value, cap:+SDF.field('bs-cap').value||30, stops: SDF.field('bs-stops').value.split('\n').filter(Boolean) };
    if(!data.plate){ SDF.toast('Plate required','error'); return false; }
    const list = lsGet('buses',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('buses', list); renderTransport(); populateTransportSelects(); audit(idx>=0?'update':'create','bus', data.plate);
    SDF.toast('Saved'); return true;
  });
}
function renderTransport(){
  const buses = lsGet('buses',[]);
  const stuAssign = lsGet('bus_assignments', {}); // {studentId: busId}
  const wrap = document.getElementById('buses-list'); if(!wrap) return;
  wrap.innerHTML = buses.length ? `<div class="ent-grid-2">` + buses.map(b => {
    const onBus = Object.values(stuAssign).filter(v=>v===b.id).length;
    return `<div class="bus-card"><div class="bus-route">🚌 ${escapeHTML(b.plate)} <span class="bus-pill">${escapeHTML(b.route||'No route')}</span></div>
      <div style="font-size:.85rem;margin-top:.4rem;">👤 ${escapeHTML(b.driver||'No driver')} · 📞 ${escapeHTML(b.phone||'-')}</div>
      <div style="font-size:.82rem;color:#666;margin-top:.3rem;">Capacity: ${onBus}/${b.cap} · Stops: ${b.stops?.length||0}</div>
      <details style="margin-top:.3rem;font-size:.82rem;"><summary style="cursor:pointer;color:var(--navy);">Pickup stops</summary><ul style="margin:.3rem 0 0;padding-left:1.2rem;">${(b.stops||[]).map(s=>`<li>${escapeHTML(s)}</li>`).join('')||'<li><em>None</em></li>'}</ul></details>
      <div style="margin-top:.5rem;display:flex;gap:.4rem;flex-wrap:wrap;"><button class="btn-sm" onclick='editBus("${b.id}")'>✏️ Edit</button> <button class="btn-sm" onclick='printRoster("${b.id}")'>🧾 Roster</button> <button class="btn-sm" onclick='printBusPass("${b.id}")'>🎫 Pass</button> <button class="btn-sm btn-danger" onclick='deleteBus("${b.id}")'>🗑</button></div>
    </div>`;
  }).join('') + '</div>' : '<p class="history-empty">No buses yet. Add one to start.</p>';
}
function editBus(id){ const b = lsGet('buses',[]).find(x=>x.id===id); if(b) showBusModal(b); }
function deleteBus(id){ if(!confirm('Delete bus?')) return; lsSet('buses', lsGet('buses',[]).filter(b=>b.id!==id)); renderTransport(); populateTransportSelects(); audit('delete','bus',id); }
function populateTransportSelects(){
  const buses = lsGet('buses',[]); const students = lsGet('students',[]);
  const ba = document.getElementById('ba-bus'); if(ba) ba.innerHTML = '<option value="">— Bus —</option>' + buses.map(b=>`<option value="${b.id}">${escapeHTML(b.plate)} (${escapeHTML(b.route||'')})</option>`).join('');
  const bs = document.getElementById('ba-student'); if(bs) bs.innerHTML = '<option value="">— Student —</option>' + students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('');
}
function assignBus(){
  const bus = document.getElementById('ba-bus').value; const st = document.getElementById('ba-student').value;
  if(!bus||!st){ SDF.toast('Pick bus and student','error'); return; }
  const map = lsGet('bus_assignments', {}); map[st] = bus;
  lsSet('bus_assignments', map); renderTransport(); audit('assign','bus', st+' → '+bus); SDF.toast('Assigned');
}
function unassignBus(){
  const st = document.getElementById('ba-student').value;
  if(!st){ SDF.toast('Pick student','error'); return; }
  const map = lsGet('bus_assignments', {}); delete map[st];
  lsSet('bus_assignments', map); renderTransport(); audit('unassign','bus', st); SDF.toast('Unassigned');
}
function printRoster(busId){
  const b = lsGet('buses',[]).find(x=>x.id===busId); if(!b) return;
  const map = lsGet('bus_assignments', {});
  const students = lsGet('students',[]).filter(s => map[s.id]===busId);
  const rows = students.map(s => `${s.name},${s.class||''},${s.gphone||s.phone||''}`).join('\n');
  selectDocType('transport-roster'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-plate').value=b.plate; SDF.field('cf-route').value=b.route; SDF.field('cf-driver').value=b.driver; SDF.field('cf-date').value=new Date().toISOString().slice(0,10); SDF.field('cf-students').value=rows; updateLivePreview(); }, 120);
}
function printBusPass(busId){
  const b = lsGet('buses',[]).find(x=>x.id===busId); if(!b) return;
  selectDocType('transport-pass'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-plate').value=b.plate; SDF.field('cf-route').value=b.route; SDF.field('cf-driver').value=b.driver; SDF.field('cf-validUntil').value = new Date(Date.now()+90*86400000).toISOString().slice(0,10); updateLivePreview(); },120);
}
window.showBusModal=showBusModal; window.editBus=editBus; window.deleteBus=deleteBus; window.renderTransport=renderTransport;
window.assignBus=assignBus; window.unassignBus=unassignBus; window.printRoster=printRoster; window.printBusPass=printBusPass;
window.populateTransportSelects=populateTransportSelects;

/* ════════ CAFETERIA / MENU ════════ */
const MENU_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
function renderCafeteria(){
  const menu = lsGet('cafe_menu', {});
  const wrap = document.getElementById('cafe-menu'); if(!wrap) return;
  wrap.innerHTML = '<div class="menu-grid">' + MENU_DAYS.map(d => `<div class="menu-day"><h5>${d}</h5>
    <div style="font-size:.78rem;color:#888;margin-bottom:.2rem;">Breakfast</div><input class="form-input" style="font-size:.85rem;margin-bottom:.3rem;" data-d="${d}" data-meal="breakfast" value="${escapeHTML(menu[d]?.breakfast||'')}" oninput="saveCafeMenu()"/>
    <div style="font-size:.78rem;color:#888;margin-bottom:.2rem;">Lunch</div><input class="form-input" style="font-size:.85rem;margin-bottom:.3rem;" data-d="${d}" data-meal="lunch" value="${escapeHTML(menu[d]?.lunch||'')}" oninput="saveCafeMenu()"/>
    <div style="font-size:.78rem;color:#888;margin-bottom:.2rem;">Snack</div><input class="form-input" style="font-size:.85rem;" data-d="${d}" data-meal="snack" value="${escapeHTML(menu[d]?.snack||'')}" oninput="saveCafeMenu()"/>
  </div>`).join('') + '</div>';
}
function saveCafeMenu(){
  const menu = {};
  document.querySelectorAll('#cafe-menu input[data-d]').forEach(i => {
    const d = i.dataset.d, m = i.dataset.meal;
    if(!menu[d]) menu[d] = {}; menu[d][m] = i.value;
  });
  lsSet('cafe_menu', menu);
}
function printWeeklyMenu(){
  const menu = lsGet('cafe_menu', {});
  const rows = MENU_DAYS.map(d => `${d}:: B: ${menu[d]?.breakfast||''} | L: ${menu[d]?.lunch||''} | S: ${menu[d]?.snack||''}`).join('\n');
  selectDocType('cafe-menu'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-week').value = `Week of ${new Date().toLocaleDateString()}`; SDF.field('cf-meals').value=rows; updateLivePreview(); },120);
}
function printMealTickets(){
  const students = lsGet('students',[]);
  if(!students.length){ SDF.toast('Add students first','error'); return; }
  const date = prompt('Date for meal tickets (YYYY-MM-DD):', new Date().toISOString().slice(0,10));
  if(!date) return;
  showLoading('Generating meal tickets…');
  (async () => {
    const zip = new JSZip();
    for(let i=0;i<students.length;i++){
      const s = students[i];
      const html = renderDocument('meal-ticket', profileFromForm(), { studentName: s.name, classLevel: s.class, date, mealType: 'Lunch' });
      const div = document.createElement('div'); div.style.cssText='position:absolute;left:-10000px;'; div.innerHTML = html; document.body.appendChild(div);
      try{ const c = await html2canvas(div.firstElementChild||div,{scale:2,backgroundColor:'#fff'}); const blob = await new Promise(r=>c.toBlob(r,'image/png')); zip.file(`meal_${s.name||i}.png`, blob); }catch(e){}
      document.body.removeChild(div);
      document.getElementById('loading-text').textContent=`Ticket ${i+1}/${students.length}…`;
    }
    const z = await zip.generateAsync({type:'blob'}); saveAs(z, `meal-tickets-${date}.zip`);
    hideLoading(); audit('batch','meal-tickets', students.length); SDF.toast('Tickets ready');
  })();
}
window.renderCafeteria=renderCafeteria; window.saveCafeMenu=saveCafeMenu; window.printWeeklyMenu=printWeeklyMenu; window.printMealTickets=printMealTickets;

/* ════════ HOSTEL / DORMITORY ════════ */
function showRoomModal(r){
  openModal(r?'Edit Room':'Add Room', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Room No. *</label><input id="rm-no" class="form-input" value="${escapeHTML(r?.no||'')}"/></div>
    <div class="form-group"><label class="form-label">Block / Wing</label><input id="rm-block" class="form-input" value="${escapeHTML(r?.block||'')}"/></div>
    <div class="form-group"><label class="form-label">Type</label><select id="rm-type" class="form-input"><option ${r?.type==='Male'?'selected':''}>Male</option><option ${r?.type==='Female'?'selected':''}>Female</option><option ${r?.type==='Staff'?'selected':''}>Staff</option></select></div>
    <div class="form-group"><label class="form-label">Beds (capacity)</label><input id="rm-beds" type="number" class="form-input" value="${r?.beds||4}"/></div>
    <div class="form-group form-group-full"><label class="form-label">Notes</label><input id="rm-notes" class="form-input" value="${escapeHTML(r?.notes||'')}"/></div>
  </div>`, () => {
    const data = { id:r?.id||'rm_'+Date.now(), no: SDF.field('rm-no').value.trim(), block:SDF.field('rm-block').value, type:SDF.field('rm-type').value, beds:+SDF.field('rm-beds').value||4, notes: SDF.field('rm-notes').value };
    if(!data.no){ SDF.toast('Room number required','error'); return false; }
    const list = lsGet('rooms',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('rooms', list); renderHostel(); audit(idx>=0?'update':'create','room', data.no);
    SDF.toast('Saved'); return true;
  });
}
function renderHostel(){
  const rooms = lsGet('rooms',[]);
  const assign = lsGet('hostel_assignments', {}); // {studentId: roomId}
  const wrap = document.getElementById('rooms-grid'); if(!wrap) return;
  wrap.innerHTML = rooms.length ? '<div class="room-grid">' + rooms.map(r => {
    const occ = Object.values(assign).filter(v=>v===r.id).length;
    const cls = occ===0?'empty':(occ>=r.beds?'full':'partial');
    return `<div class="room-box ${cls}" onclick='manageRoom("${r.id}")'>
      <div style="font-weight:700;">${escapeHTML(r.no)}</div>
      <div style="font-size:.7rem;color:#555;">${escapeHTML(r.block||'')} · ${escapeHTML(r.type)}</div>
      <div style="font-size:.85rem;margin-top:.2rem;">${occ}/${r.beds}</div>
    </div>`;
  }).join('') + '</div>' : '<p class="history-empty">No rooms yet.</p>';
}
function manageRoom(id){
  const r = lsGet('rooms',[]).find(x=>x.id===id); if(!r) return;
  const assign = lsGet('hostel_assignments', {});
  const students = lsGet('students',[]);
  const inRoom = students.filter(s => assign[s.id]===id);
  const occ = inRoom.length;
  const free = students.filter(s => !assign[s.id]);
  const body = `<div><strong>Block:</strong> ${escapeHTML(r.block||'-')} · <strong>Type:</strong> ${escapeHTML(r.type)} · <strong>Beds:</strong> ${occ}/${r.beds}</div>
    <h4 style="margin-top:1rem;">Current Occupants</h4>
    ${inRoom.length ? inRoom.map(s=>`<div style="display:flex;justify-content:space-between;padding:.3rem .5rem;border-bottom:1px solid #eee;font-size:.85rem;"><span>${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</span><button class="btn-sm btn-danger" onclick='removeOccupant("${s.id}","${id}")'>Remove</button></div>`).join('') : '<p style="color:#888;">Room is empty.</p>'}
    ${occ<r.beds ? `<h4 style="margin-top:1rem;">Assign new occupant</h4>
      <select id="ho-stu" class="form-input">${free.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')||'<option value="">No unassigned students</option>'}</select>
      <button class="btn-primary" style="margin-top:.5rem;" onclick='addOccupant("${id}")'>Assign</button>` : '<p style="color:#b91c1c;margin-top:1rem;">Room is full.</p>'}`;
  openModal('Room ' + r.no, body, () => false);
  document.getElementById('modal-confirm').style.display = 'none';
}
function addOccupant(roomId){
  const stId = SDF.field('ho-stu').value; if(!stId) return;
  const assign = lsGet('hostel_assignments', {}); assign[stId] = roomId;
  lsSet('hostel_assignments', assign); closeModal(); renderHostel(); audit('assign','hostel', stId+' → '+roomId);
  SDF.toast('Assigned');
}
function removeOccupant(stId, roomId){
  if(!confirm('Remove from room?')) return;
  const assign = lsGet('hostel_assignments', {}); delete assign[stId];
  lsSet('hostel_assignments', assign); closeModal(); renderHostel(); audit('remove','hostel', stId);
  SDF.toast('Removed');
}
window.showRoomModal=showRoomModal; window.renderHostel=renderHostel; window.manageRoom=manageRoom; window.addOccupant=addOccupant; window.removeOccupant=removeOccupant;

/* ════════ HOMEWORK TRACKER ════════ */
function showHomeworkModal(h){
  openModal(h?'Edit Assignment':'Add Assignment', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Title *</label><input id="hw-title" class="form-input" value="${escapeHTML(h?.title||'')}"/></div>
    <div class="form-group"><label class="form-label">Class</label><input id="hw-class" class="form-input" value="${escapeHTML(h?.cls||'')}"/></div>
    <div class="form-group"><label class="form-label">Subject</label><input id="hw-subj" class="form-input" value="${escapeHTML(h?.subj||'')}"/></div>
    <div class="form-group"><label class="form-label">Teacher</label><input id="hw-teacher" class="form-input" value="${escapeHTML(h?.teacher||'')}"/></div>
    <div class="form-group"><label class="form-label">Assigned</label><input id="hw-assigned" type="date" class="form-input" value="${h?.assigned||new Date().toISOString().slice(0,10)}"/></div>
    <div class="form-group"><label class="form-label">Due Date</label><input id="hw-due" type="date" class="form-input" value="${h?.due||''}"/></div>
    <div class="form-group form-group-full"><label class="form-label">Description</label><textarea id="hw-desc" class="form-input" rows="3">${escapeHTML(h?.desc||'')}</textarea></div>
  </div>`, () => {
    const data = { id:h?.id||'hw_'+Date.now(), title:SDF.field('hw-title').value.trim(), cls:SDF.field('hw-class').value, subj:SDF.field('hw-subj').value, teacher:SDF.field('hw-teacher').value, assigned:SDF.field('hw-assigned').value, due:SDF.field('hw-due').value, desc:SDF.field('hw-desc').value, submissions: h?.submissions||{} };
    if(!data.title){ SDF.toast('Title required','error'); return false; }
    const list = lsGet('homework',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.unshift(data);
    lsSet('homework', list); renderHomework(); audit(idx>=0?'update':'create','homework', data.title);
    SDF.toast('Saved'); return true;
  });
}
function renderHomework(){
  const list = lsGet('homework',[]);
  const wrap = document.getElementById('hw-list'); if(!wrap) return;
  wrap.innerHTML = list.length ? '<div class="hw-row" style="font-weight:700;background:var(--navy);color:#fff;"><span>Assignment</span><span>Subject</span><span>Class</span><span>Due</span><span>Actions</span></div>' + list.map(h => {
    const overdueCls = (h.due && new Date(h.due) < new Date()) ? 'overdue' : '';
    return `<div class="hw-row ${overdueCls}"><span><strong>${escapeHTML(h.title)}</strong><br/><small style="color:#888;">${escapeHTML(h.teacher||'')}</small></span><span>${escapeHTML(h.subj||'')}</span><span>${escapeHTML(h.cls||'')}</span><span>${escapeHTML(h.due||'')}</span><span><button class="btn-sm" onclick='manageSubmissions("${h.id}")'>📋 Submissions</button> <button class="btn-sm" onclick='editHW("${h.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteHW("${h.id}")'>🗑</button></span></div>`;
  }).join('') : '<p class="history-empty">No assignments. Click + to add.</p>';
}
function editHW(id){ const h=lsGet('homework',[]).find(x=>x.id===id); if(h) showHomeworkModal(h); }
function deleteHW(id){ if(!confirm('Delete assignment?')) return; lsSet('homework', lsGet('homework',[]).filter(h=>h.id!==id)); renderHomework(); audit('delete','homework',id); }
function manageSubmissions(id){
  const list = lsGet('homework',[]); const h = list.find(x=>x.id===id); if(!h) return;
  const students = lsGet('students',[]).filter(s => !h.cls || s.class === h.cls);
  h.submissions = h.submissions || {};
  const body = `<p><strong>${escapeHTML(h.title)}</strong> · Due: ${escapeHTML(h.due||'-')}</p>
    <div style="max-height:360px;overflow-y:auto;">
    ${students.map(s => {
      const st = h.submissions[s.id] || 'pending';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem;border-bottom:1px solid #eee;font-size:.85rem;"><span>${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</span><select class="form-input hw-sub" data-sid="${s.id}" style="max-width:160px;font-size:.8rem;"><option value="pending" ${st==='pending'?'selected':''}>Pending</option><option value="submitted" ${st==='submitted'?'selected':''}>Submitted</option><option value="late" ${st==='late'?'selected':''}>Late</option><option value="missing" ${st==='missing'?'selected':''}>Missing</option></select></div>`;
    }).join('')}
    </div>`;
  openModal('Submissions: ' + h.title, body, () => {
    document.querySelectorAll('.hw-sub').forEach(sel => { h.submissions[sel.dataset.sid] = sel.value; });
    const idx = list.findIndex(x=>x.id===h.id); list[idx]=h; lsSet('homework', list);
    audit('update','submissions', h.title); SDF.toast('Saved'); return true;
  });
}
window.showHomeworkModal=showHomeworkModal; window.editHW=editHW; window.deleteHW=deleteHW; window.manageSubmissions=manageSubmissions; window.renderHomework=renderHomework;

/* ════════ KPI DASHBOARD ════════ */
const KPI_DEFAULTS = [
  { key:'enrol_target', name:'Enrolment Target', target:300 },
  { key:'fee_collect_pct', name:'Fee Collection %', target:90 },
  { key:'attend_pct', name:'Avg Attendance %', target:85 },
  { key:'overdue_books', name:'Library Overdue (max)', target:5, inverse:true },
];
function renderKPIDashboard(){
  const targets = lsGet('kpi_targets', {});
  KPI_DEFAULTS.forEach(k => { if(!(k.key in targets)) targets[k.key] = k.target; });
  lsSet('kpi_targets', targets);
  const students = lsGet('students',[]);
  const payments = lsGet('students',[]).reduce((a,s)=>({paid:a.paid+(s.paid||0), fees:a.fees+(s.fees||0)}),{paid:0,fees:0});
  const loans = lsGet('loans',[]);
  const overdue = loans.filter(l => l.due < Date.now()).length;
  // Attendance: average across all saved att_ keys
  let attTotal=0, attCount=0;
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.startsWith('sdf_'+SDF.state.activeBranch+'_att_')){ try{ const map = JSON.parse(localStorage.getItem(k)); Object.values(map).forEach(v=>{ if(v==='P') attTotal++; if(v) attCount++; }); }catch{} } }
  const attPct = attCount ? Math.round(attTotal/attCount*100) : 0;
  const feePct = payments.fees ? Math.round(payments.paid/payments.fees*100) : 0;
  const kpis = [
    { key:'enrol_target', name:'Enrolment', val: students.length, target: targets.enrol_target, unit:'' },
    { key:'fee_collect_pct', name:'Fee Collection', val: feePct, target: targets.fee_collect_pct, unit:'%' },
    { key:'attend_pct', name:'Attendance', val: attPct, target: targets.attend_pct, unit:'%' },
    { key:'overdue_books', name:'Library Overdue', val: overdue, target: targets.overdue_books, unit:'', inverse:true },
  ];
  const wrap = document.getElementById('kpi-grid'); if(!wrap) return;
  wrap.innerHTML = kpis.map(k => {
    let pct = k.target ? Math.min(100, Math.round((k.val/k.target)*100)) : 0;
    if(k.inverse) pct = k.target ? Math.max(0, 100 - Math.round((k.val/Math.max(1,k.target*2))*100)) : 0;
    const cls = pct >= 80 ? '' : (pct >= 50 ? 'warn' : 'danger');
    return `<div class="kpi-card">
      <div class="kpi-name">${k.name}</div>
      <div class="kpi-value">${k.val}${k.unit}</div>
      <div class="kpi-target">${k.inverse?'Max':'Target'}: ${k.target}${k.unit} · <a href="#" onclick="event.preventDefault();setKpiTarget('${k.key}','${k.name}')">edit</a></div>
      <div class="kpi-bar"><div class="kpi-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}
function setKpiTarget(key, name){
  const targets = lsGet('kpi_targets', {});
  const v = +prompt(`New target for "${name}":`, targets[key]||0);
  if(!isNaN(v)){ targets[key] = v; lsSet('kpi_targets', targets); renderKPIDashboard(); audit('update','kpi', name+'='+v); }
}
window.renderKPIDashboard = renderKPIDashboard; window.setKpiTarget = setKpiTarget;

/* ════════ EXPENSES TRACKER ════════ */
function showExpenseModal(e){
  openModal(e?'Edit Expense':'Add Expense / Income', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Date</label><input id="ex-date" type="date" class="form-input" value="${e?.date||new Date().toISOString().slice(0,10)}"/></div>
    <div class="form-group"><label class="form-label">Type</label><select id="ex-type" class="form-input"><option value="expense" ${e?.type==='expense'?'selected':''}>Expense (-)</option><option value="income" ${e?.type==='income'?'selected':''}>Income (+)</option></select></div>
    <div class="form-group"><label class="form-label">Category</label><input id="ex-cat" class="form-input" placeholder="Salaries / Utilities / Donations …" value="${escapeHTML(e?.cat||'')}"/></div>
    <div class="form-group"><label class="form-label">Amount</label><input id="ex-amt" type="number" class="form-input" value="${e?.amt||0}"/></div>
    <div class="form-group form-group-full"><label class="form-label">Description</label><input id="ex-desc" class="form-input" value="${escapeHTML(e?.desc||'')}"/></div>
    <div class="form-group"><label class="form-label">Payment Method</label><select id="ex-meth" class="form-input"><option>Cash</option><option ${e?.meth==='Transfer'?'selected':''}>Transfer</option><option ${e?.meth==='POS'?'selected':''}>POS</option><option ${e?.meth==='Cheque'?'selected':''}>Cheque</option></select></div>
    <div class="form-group"><label class="form-label">Reference</label><input id="ex-ref" class="form-input" value="${escapeHTML(e?.ref||'')}"/></div>
  </div>`, () => {
    const data = { id:e?.id||'ex_'+Date.now(), date:SDF.field('ex-date').value, type:SDF.field('ex-type').value, cat:SDF.field('ex-cat').value, amt:+SDF.field('ex-amt').value||0, desc:SDF.field('ex-desc').value, meth:SDF.field('ex-meth').value, ref:SDF.field('ex-ref').value };
    const list = lsGet('expenses',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.unshift(data);
    lsSet('expenses', list); renderExpenses(); audit(idx>=0?'update':'create','expense', data.cat+' '+data.amt);
    SDF.toast('Saved'); return true;
  });
}
function renderExpenses(){
  const list = lsGet('expenses',[]);
  const tbody = document.getElementById('exp-tbody'); if(!tbody) return;
  const filt = document.getElementById('exp-filter')?.value || '';
  const f = filt ? list.filter(x=>x.type===filt) : list;
  tbody.innerHTML = f.length ? f.map(e => `<tr><td>${escapeHTML(e.date)}</td><td><span class="${e.type==='income'?'exp-income':'exp-out'}">${e.type==='income'?'+':'-'} ${curSym()}${(e.amt||0).toLocaleString()}</span></td><td>${escapeHTML(e.cat||'')}</td><td>${escapeHTML(e.desc||'')}</td><td>${escapeHTML(e.meth||'')}</td><td>${escapeHTML(e.ref||'')}</td><td><button class="btn-sm" onclick='editExp("${e.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteExp("${e.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-table">No entries</td></tr>';
  // Summary
  const income = list.filter(x=>x.type==='income').reduce((a,b)=>a+(b.amt||0),0);
  const expense = list.filter(x=>x.type==='expense').reduce((a,b)=>a+(b.amt||0),0);
  const sum = document.getElementById('exp-summary');
  if(sum) sum.innerHTML = `<strong>Income:</strong> <span class="exp-income">${curSym()}${income.toLocaleString()}</span> · <strong>Expense:</strong> <span class="exp-out">${curSym()}${expense.toLocaleString()}</span> · <strong>Net:</strong> ${curSym()}${(income-expense).toLocaleString()}`;
}
function editExp(id){ const e = lsGet('expenses',[]).find(x=>x.id===id); if(e) showExpenseModal(e); }
function deleteExp(id){ if(!confirm('Delete?')) return; lsSet('expenses', lsGet('expenses',[]).filter(e=>e.id!==id)); renderExpenses(); audit('delete','expense',id); }
function exportExpensesCSV(){ const l=lsGet('expenses',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l)],{type:'text/csv'}),'expenses.csv'); }
window.showExpenseModal=showExpenseModal; window.renderExpenses=renderExpenses; window.editExp=editExp; window.deleteExp=deleteExp; window.exportExpensesCSV=exportExpensesCSV;

/* ════════ STICKY NOTES BOARD ════════ */
function addNote(){
  const txt = prompt('Note text:'); if(!txt) return;
  const colors = ['','color-blue','color-green','color-pink','color-purple'];
  const c = colors[Math.floor(Math.random()*colors.length)];
  const list = lsGet('notes',[]); list.unshift({ id:'n_'+Date.now(), txt, color:c, t:Date.now() });
  lsSet('notes', list); renderNotes(); audit('add','note', txt.slice(0,30));
}
function deleteNote(id){ if(!confirm('Delete note?')) return; lsSet('notes', lsGet('notes',[]).filter(n=>n.id!==id)); renderNotes(); }
function renderNotes(){
  const list = lsGet('notes',[]);
  const wrap = document.getElementById('notes-grid'); if(!wrap) return;
  wrap.innerHTML = list.length ? list.map(n=>`<div class="note-card ${n.color}"><button class="note-del" onclick='deleteNote("${n.id}")'>✕</button>${escapeHTML(n.txt)}<div class="note-time">${new Date(n.t).toLocaleString()}</div></div>`).join('') : '<p class="history-empty">No notes. Add one!</p>';
}
window.addNote=addNote; window.deleteNote=deleteNote; window.renderNotes=renderNotes;

/* ════════ GLOBAL SEARCH ════════ */
function initGlobalSearch(){
  const inp = document.getElementById('gsearch'); if(!inp) return;
  inp.addEventListener('input', () => { runGlobalSearch(inp.value); });
  inp.addEventListener('focus', () => { runGlobalSearch(inp.value); });
  document.addEventListener('click', (e) => { if(!e.target.closest('.gsearch-wrap')) document.getElementById('gsearch-results').style.display='none'; });
}
function runGlobalSearch(q){
  const res = document.getElementById('gsearch-results'); if(!res) return;
  q = (q||'').toLowerCase().trim();
  if(!q){ res.style.display='none'; return; }
  const buckets = [
    { name:'Students', items: lsGet('students',[]).map(s=>({label:s.name, sub:s.class, anchor:'#students'})) },
    { name:'Staff',    items: lsGet('staff',[]).map(s=>({label:s.name, sub:s.position||s.dept, anchor:'#staff'})) },
    { name:'Books',    items: lsGet('books',[]).map(b=>({label:b.title, sub:b.author, anchor:'#library'})) },
    { name:'Assets',   items: lsGet('assets',[]).map(a=>({label:a.name, sub:a.tag, anchor:'#inventory'})) },
    { name:'Questions',items: lsGet('questions',[]).map(qq=>({label:qq.text?.slice(0,80), sub:qq.subj+'/'+qq.cls, anchor:'#exam-bank'})) },
    { name:'Clinic',   items: lsGet('clinic',[]).map(c=>({label:c.stName+' — '+c.type, sub:c.date, anchor:'#clinic'})) },
    { name:'Notes',    items: lsGet('notes',[]).map(n=>({label:n.txt?.slice(0,80), sub:new Date(n.t).toLocaleDateString(), anchor:'#notes'})) },
  ];
  let html = '';
  let hits = 0;
  buckets.forEach(b => {
    const matched = b.items.filter(x => x.label && x.label.toLowerCase().includes(q));
    if(matched.length){
      hits += matched.length;
      html += `<div class="gsearch-cat">${b.name} (${matched.length})</div>`;
      html += matched.slice(0,8).map(m => `<div class="gsearch-hit" onclick="location.hash='${m.anchor}';document.getElementById('gsearch-results').style.display='none'">${escapeHTML(m.label)} <small>${escapeHTML(m.sub||'')}</small></div>`).join('');
    }
  });
  res.innerHTML = hits ? html : '<div style="padding:.7rem;text-align:center;color:#888;font-size:.85rem;">No matches.</div>';
  res.style.display = 'block';
}
window.runGlobalSearch = runGlobalSearch;

/* ════════ QR SYNC (device-to-device backup transfer) ════════ */
async function showSyncQR(){
  const ov = document.getElementById('sync-overlay'); if(!ov) return;
  ov.style.display = 'flex';
  // Collect data, compress to JSON string, chunk into QR codes
  const dump = JSON.stringify(collectAllData());
  // For QR safety, limit to ~1500 chars; if longer, show download instead
  if(dump.length > 1500){
    document.getElementById('sync-content').innerHTML = `<p style="color:#fca5a5;">Data too large (${(dump.length/1024).toFixed(1)} KB) for QR. Use Backup file instead.</p>
      <button class="btn-primary" onclick="fullBackup()">🗄️ Use File Backup</button>`;
    return;
  }
  const qrEl = document.getElementById('sync-qr-target');
  qrEl.innerHTML = '';
  if(window.QRCode) new QRCode(qrEl, { text: dump, width: 280, height: 280, correctLevel: QRCode.CorrectLevel.L });
  document.getElementById('sync-content').innerHTML = '';
  audit('export','qr-sync','show');
}
function hideSyncQR(){ document.getElementById('sync-overlay').style.display='none'; }
function importFromQRData(){
  const raw = prompt('Paste scanned QR data (JSON) here:');
  if(!raw) return;
  if(!confirm('Importing will overwrite current branch data. Continue?')) return;
  try{
    const obj = JSON.parse(raw);
    const data = obj.data || obj;
    Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
    audit('import','qr-sync','received');
    SDF.toast('Imported. Reloading…','success');
    setTimeout(()=>location.reload(), 800);
  }catch{ SDF.toast('Bad QR data','error'); }
}
window.showSyncQR = showSyncQR; window.hideSyncQR = hideSyncQR; window.importFromQRData = importFromQRData;

/* ════════ CALENDAR (Month view) ════════ */
let _calMonth = new Date();
function renderCalendar(){
  const wrap = document.getElementById('cal-wrap'); if(!wrap) return;
  const events = lsGet('cal_events',[]);
  const m = _calMonth.getMonth(); const y = _calMonth.getFullYear();
  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const start = first.getDay(); // 0=Sun
  const days = last.getDate();
  const today = new Date();
  let html = '';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=> html += `<div class="cal-head">${d}</div>`);
  for(let i=0;i<start;i++) html += `<div class="cal-day muted"></div>`;
  for(let d=1; d<=days; d++){
    const isToday = (today.getFullYear()===y && today.getMonth()===m && today.getDate()===d);
    const iso = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ev = events.filter(e => e.date===iso);
    html += `<div class="cal-day ${isToday?'today':''}" onclick='showCalDay("${iso}")' title="${ev.map(e=>e.title).join(', ')}">${d}${ev.length?'<span class="cal-dot"></span>':''}</div>`;
  }
  document.getElementById('cal-month').textContent = first.toLocaleDateString(undefined,{month:'long', year:'numeric'});
  wrap.innerHTML = html;
}
function calPrev(){ _calMonth = new Date(_calMonth.getFullYear(), _calMonth.getMonth()-1, 1); renderCalendar(); }
function calNext(){ _calMonth = new Date(_calMonth.getFullYear(), _calMonth.getMonth()+1, 1); renderCalendar(); }
function showCalDay(iso){
  const events = lsGet('cal_events',[]).filter(e => e.date===iso);
  const body = `<p><strong>${iso}</strong></p>
    <div style="max-height:220px;overflow:auto;border:1px solid var(--border);padding:.5rem;border-radius:6px;margin-bottom:.6rem;">${events.length ? events.map(e=>`<div style="padding:.3rem 0;border-bottom:1px solid #eee;font-size:.88rem;">📌 ${escapeHTML(e.title)} <button class="btn-sm btn-danger" style="float:right;" onclick='deleteCalEvent("${e.id}");closeModal();showCalDay("${iso}")'>✕</button></div>`).join('') : '<p style="color:#888;">No events.</p>'}</div>
    <input id="ce-title" class="form-input" placeholder="New event title"/>
    <button class="btn-primary" style="margin-top:.5rem;" onclick='addCalEvent("${iso}")'>+ Add Event</button>`;
  openModal('Day: ' + iso, body, () => false);
  document.getElementById('modal-confirm').style.display='none';
}
function addCalEvent(iso){
  const title = SDF.field('ce-title').value.trim(); if(!title) return;
  const list = lsGet('cal_events',[]); list.push({id:'ce_'+Date.now(), date:iso, title}); lsSet('cal_events', list);
  closeModal(); renderCalendar(); audit('add','calendar', iso+' '+title); SDF.toast('Added');
}
function deleteCalEvent(id){ lsSet('cal_events', lsGet('cal_events',[]).filter(e=>e.id!==id)); renderCalendar(); audit('delete','calendar',id); }
window.renderCalendar=renderCalendar; window.calPrev=calPrev; window.calNext=calNext; window.showCalDay=showCalDay; window.addCalEvent=addCalEvent; window.deleteCalEvent=deleteCalEvent;

/* ════════ HONOR ROLL ════════ */
function renderHonorRoll(){
  const w = document.getElementById('honor-roll'); if(!w) return;
  // Pull from report-card history if available — for simplicity, use a stored "scores" map: { studentId: avg }
  const scores = lsGet('student_scores', {});
  const students = lsGet('students',[]);
  const arr = students.map(s => ({ name: s.name, cls: s.class, score: +scores[s.id] || 0 })).filter(s => s.score > 0).sort((a,b)=>b.score-a.score).slice(0,10);
  if(!arr.length){ w.innerHTML = '<p class="history-empty" style="padding:1rem;">No scores recorded yet. Use "Set Score" below for any student.</p>'; return; }
  w.innerHTML = arr.map((s,i) => `<div class="honor-row"><div class="honor-rank ${i===0?'r1':(i===1?'r2':(i===2?'r3':''))}">${i+1}</div><div class="honor-name">${escapeHTML(s.name)} <small style="color:#888;">${escapeHTML(s.cls||'')}</small></div><div class="honor-score">${s.score.toFixed(1)}</div></div>`).join('');
}
function setStudentScore(){
  const students = lsGet('students',[]);
  if(!students.length){ SDF.toast('No students','error'); return; }
  openModal('Set Student Average Score', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Student</label><select id="ss-st" class="form-input">${students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')}</select></div>
    <div class="form-group form-group-full"><label class="form-label">Average Score (0–100)</label><input id="ss-score" type="number" step="0.1" class="form-input"/></div>
  </div>`, () => {
    const scores = lsGet('student_scores', {});
    scores[SDF.field('ss-st').value] = +SDF.field('ss-score').value || 0;
    lsSet('student_scores', scores); renderHonorRoll(); audit('update','score', SDF.field('ss-score').value);
    SDF.toast('Saved'); return true;
  });
}
window.renderHonorRoll = renderHonorRoll; window.setStudentScore = setStudentScore;

/* ════════ TREND LINE CHARTS (SVG) ════════ */
function renderTrendCharts(){
  const w = document.getElementById('trend-charts'); if(!w) return;
  // Fees over last 8 weeks
  const payments = lsGet('payments',[]);
  const weeks = [];
  const now = Date.now();
  for(let i=7;i>=0;i--){
    const wStart = now - (i+1)*7*86400000; const wEnd = now - i*7*86400000;
    const total = payments.filter(p => p.t >= wStart && p.t < wEnd).reduce((a,b)=>a+(b.amt||0), 0);
    weeks.push({ label: `${i===0?'Now':i+'w ago'}`, val: total });
  }
  w.innerHTML = `<div class="chart-wrap"><div class="chart-title">Fees Collected (Last 8 Weeks)</div>${renderSVGLine(weeks)}</div>`;
}
function renderSVGLine(series){
  const W = 600, H = 200, pad = 30;
  const max = Math.max(1, ...series.map(s=>s.val));
  const stepX = (W - 2*pad) / Math.max(1, series.length-1);
  const points = series.map((s,i) => [pad + i*stepX, H - pad - (s.val/max)*(H - 2*pad)]);
  const path = points.map((p,i)=> (i===0?`M${p[0]},${p[1]}`:`L${p[0]},${p[1]}`)).join(' ');
  const grids = [0,1,2,3,4].map(i => `<line class="grid" x1="${pad}" y1="${pad + i*(H-2*pad)/4}" x2="${W-pad}" y2="${pad + i*(H-2*pad)/4}"/>`).join('');
  const labels = series.map((s,i)=>`<text class="label" x="${pad + i*stepX}" y="${H-pad+14}" text-anchor="middle">${s.label}</text>`).join('');
  const dots = points.map(p=>`<circle class="point" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`).join('');
  const values = series.map((s,i) => s.val ? `<text class="label" x="${pad + i*stepX}" y="${points[i][1]-8}" text-anchor="middle">${(s.val/1000).toFixed(0)}k</text>`:'').join('');
  return `<svg class="line-chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${grids}<line class="axis" x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}"/><line class="axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}"/><path class="line" d="${path}"/>${dots}${labels}${values}</svg>`;
}
window.renderTrendCharts = renderTrendCharts;

/* ════════ BULK QR GENERATOR ════════ */
function generateBulkQR(){
  const txt = document.getElementById('bqr-input').value.trim();
  if(!txt){ SDF.toast('Paste items (one per line)','error'); return; }
  const items = txt.split('\n').filter(Boolean);
  if(items.length > 100){ SDF.toast('Max 100 items at a time','error'); return; }
  const wrap = document.getElementById('bqr-output'); wrap.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'bqr-grid';
  items.forEach((item,i) => {
    const cell = document.createElement('div'); cell.className='bqr-cell';
    const qr = document.createElement('div'); cell.appendChild(qr);
    new QRCode(qr, { text: item, width: 100, height: 100 });
    const lbl = document.createElement('div'); lbl.textContent = item.slice(0,30); cell.appendChild(lbl);
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  audit('generate','bulk-qr', items.length);
  SDF.toast(items.length + ' QR codes generated');
}
async function downloadBulkQRZip(){
  const cells = document.querySelectorAll('.bqr-cell canvas, .bqr-cell img');
  if(!cells.length){ SDF.toast('Generate QR codes first','error'); return; }
  showLoading('Packaging QR codes…');
  const zip = new JSZip();
  for(let i=0;i<cells.length;i++){
    const c = cells[i];
    let blob;
    if(c.tagName === 'CANVAS'){ blob = await new Promise(r => c.toBlob(r,'image/png')); }
    else { const r = await fetch(c.src); blob = await r.blob(); }
    zip.file(`qr_${i+1}.png`, blob);
  }
  const z = await zip.generateAsync({type:'blob'}); saveAs(z, 'bulk-qr.zip');
  hideLoading(); SDF.toast('ZIP ready');
}
window.generateBulkQR = generateBulkQR; window.downloadBulkQRZip = downloadBulkQRZip;

/* ════════ AUTO-ID GENERATOR ════════ */
function genAutoIDs(){
  const pattern = document.getElementById('aid-pattern').value || 'GA/{YEAR}/{####}';
  const count = +document.getElementById('aid-count').value || 5;
  const start = +document.getElementById('aid-start').value || 1;
  const year = new Date().getFullYear();
  const ids = [];
  for(let i=0;i<count;i++){
    let id = pattern.replace('{YEAR}', year);
    const m = id.match(/\{(#+)\}/);
    if(m){ const len = m[1].length; id = id.replace(m[0], String(start+i).padStart(len,'0')); }
    ids.push(id);
  }
  document.getElementById('aid-output').value = ids.join('\n');
}
function copyAutoIDs(){ const t = document.getElementById('aid-output'); t.select(); document.execCommand('copy'); SDF.toast('Copied'); }
window.genAutoIDs = genAutoIDs; window.copyAutoIDs = copyAutoIDs;

/* ════════ QUIZ PLAYER ════════ */
let _quizState = null;
function startQuiz(){
  const subj = document.getElementById('qz-subj').value;
  const cls = document.getElementById('qz-class').value;
  const n = +document.getElementById('qz-count').value || 10;
  const pool = lsGet('questions',[]).filter(q => (!subj||q.subj===subj) && (!cls||q.cls===cls));
  if(!pool.length){ SDF.toast('No questions in bank for this filter','error'); return; }
  const arr = pool.slice(); for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  _quizState = { qs: arr.slice(0,n), idx: 0, answers: [], startTime: Date.now() };
  renderQuizQ();
}
function renderQuizQ(){
  const q = _quizState.qs[_quizState.idx];
  const total = _quizState.qs.length;
  const wrap = document.getElementById('quiz-stage');
  if(!q){ finishQuiz(); return; }
  const pct = Math.round((_quizState.idx / total) * 100);
  wrap.innerHTML = `<div class="quiz-wrap">
    <div class="quiz-progress"><span>Question ${_quizState.idx+1} of ${total}</span><span>${q.subj} · ${q.cls}</span></div>
    <div class="quiz-bar"><div class="quiz-bar-fill" style="width:${pct}%"></div></div>
    <div class="quiz-q"><strong>${_quizState.idx+1}.</strong> ${escapeHTML(q.text)}</div>
    <input id="qz-answer" class="form-input" placeholder="Type your answer…"/>
    <div style="margin-top:1rem;display:flex;gap:.5rem;justify-content:space-between;">
      <button class="btn-ghost" onclick="skipQuestion()">Skip</button>
      <button class="btn-primary" onclick="submitAnswer()">Submit →</button>
    </div>
  </div>`;
  document.getElementById('qz-answer').focus();
}
function submitAnswer(){
  const ans = document.getElementById('qz-answer').value.trim();
  const q = _quizState.qs[_quizState.idx];
  const correct = q.ans && ans && q.ans.toLowerCase().trim() === ans.toLowerCase().trim();
  _quizState.answers.push({ q: q.text, given: ans, correct: q.ans, isCorrect: correct });
  _quizState.idx++;
  renderQuizQ();
}
function skipQuestion(){ _quizState.answers.push({ q: _quizState.qs[_quizState.idx].text, given: '', correct: _quizState.qs[_quizState.idx].ans, isCorrect: false }); _quizState.idx++; renderQuizQ(); }
function finishQuiz(){
  const total = _quizState.qs.length;
  const correct = _quizState.answers.filter(a=>a.isCorrect).length;
  const unmarked = _quizState.qs.filter(q=>!q.ans).length;
  const mins = Math.round((Date.now() - _quizState.startTime)/60000);
  const wrap = document.getElementById('quiz-stage');
  wrap.innerHTML = `<div class="quiz-wrap">
    <h3>🎯 Quiz Complete</h3>
    <p><strong>Score: ${correct} / ${total - unmarked} marked</strong> (${unmarked} questions had no marking key) · Time: ${mins} min</p>
    <div style="max-height:300px;overflow:auto;border:1px solid var(--border);border-radius:6px;padding:.5rem;margin-top:.5rem;">
      ${_quizState.answers.map((a,i)=>`<div style="padding:.4rem;border-bottom:1px solid #eee;font-size:.85rem;"><strong>${i+1}.</strong> ${escapeHTML(a.q)}<br/>Your answer: <span class="${a.isCorrect?'health-pos':'health-neg'}">${escapeHTML(a.given||'(skipped)')}</span>${a.correct?` · Expected: <em>${escapeHTML(a.correct)}</em>`:''}</div>`).join('')}
    </div>
    <button class="btn-primary" style="margin-top:1rem;" onclick="document.getElementById('quiz-stage').innerHTML=''">Close</button>
  </div>`;
  audit('complete','quiz', `${correct}/${total}`);
}
window.startQuiz=startQuiz; window.submitAnswer=submitAnswer; window.skipQuestion=skipQuestion;

/* ════════ DATA EXPORT BUNDLE (all CSVs in one ZIP) ════════ */
async function exportAllDataBundle(){
  showLoading('Packaging data…');
  const zip = new JSZip();
  const sets = [
    ['students', lsGet('students',[])],
    ['staff', lsGet('staff',[])],
    ['books', lsGet('books',[])],
    ['loans', lsGet('loans',[])],
    ['loan_history', lsGet('loan_history',[])],
    ['assets', lsGet('assets',[])],
    ['questions', lsGet('questions',[])],
    ['discipline', lsGet('discipline',[])],
    ['visitors', lsGet('visitors',[])],
    ['clinic', lsGet('clinic',[])],
    ['buses', lsGet('buses',[])],
    ['expenses', lsGet('expenses',[])],
    ['homework', lsGet('homework',[])],
    ['payments', lsGet('payments',[])],
    ['cal_events', lsGet('cal_events',[])],
    ['notes', lsGet('notes',[])],
  ];
  sets.forEach(([name,data]) => { if(data.length) zip.file(name+'.csv', Papa.unparse(data)); });
  zip.file('audit-log.csv', Papa.unparse(JSON.parse(localStorage.getItem('sdf_audit')||'[]')));
  zip.file('README.txt', 'SchoolDocForge data export bundle.\nGenerated: ' + new Date().toISOString() + '\nBranch: ' + SDF.state.activeBranch + '\n');
  const z = await zip.generateAsync({type:'blob'}); saveAs(z, `sdf-data-bundle-${Date.now()}.zip`);
  hideLoading(); audit('export','bundle','all'); SDF.toast('Bundle ready');
}
window.exportAllDataBundle = exportAllDataBundle;

/* ════════ BROWSER NOTIFICATIONS ════════ */
function initBrowserNotifications(){
  if(!('Notification' in window)) return;
  // Check birthdays & overdue books on load (only if permission granted)
  if(Notification.permission === 'granted') runDailyChecks();
}
function enableNotifications(){
  if(!('Notification' in window)){ SDF.toast('Browser does not support notifications','error'); return; }
  Notification.requestPermission().then(p => {
    if(p === 'granted'){ SDF.toast('Notifications enabled'); runDailyChecks(); audit('grant','notifications'); }
    else SDF.toast('Permission denied','error');
  });
}
function runDailyChecks(){
  // Birthdays today
  const today = new Date(); const todayKey = (today.getMonth()+1)+'-'+today.getDate();
  const all = lsGet('students',[]).concat(lsGet('staff',[]));
  const bdays = all.filter(p => { if(!p.dob) return false; const d = new Date(p.dob); return !isNaN(d) && (d.getMonth()+1)+'-'+d.getDate() === todayKey; });
  if(bdays.length){
    new Notification('🎂 Birthdays Today', { body: bdays.map(b=>b.name).join(', '), icon:'./icons/icon-192.png' });
  }
  // Overdue books
  const overdue = lsGet('loans',[]).filter(l => l.due < Date.now());
  if(overdue.length){
    new Notification('📚 Library Overdue', { body: `${overdue.length} book(s) overdue`, icon:'./icons/icon-192.png' });
  }
}
window.enableNotifications = enableNotifications;

/* ════════ TOUR GUIDE (first-visit walkthrough) ════════ */
const TOUR_STEPS = [
  { sel: '#hero', title: 'Welcome!', text: 'SchoolDocForge v7 — your full school operations platform. 100% free, offline-capable, no AI API. Let\'s take a quick tour.' },
  { sel: '#branch-bar', title: 'Multi-Branch Bar', text: 'Switch campuses, change language, lock the app with a PIN, or search globally.' },
  { sel: '#features', title: 'Feature Cards', text: '60+ features — every card here is fully working. Click around to explore.' },
  { sel: '#generator', title: 'Document Generator', text: 'The 4-step wizard turns any data into a polished printable document.' },
  { sel: '#students', title: 'Student Records', text: 'Manage students, fees, attendance, batch generation, WhatsApp blasts.' },
  { sel: '#library', title: 'Library, Inventory & More', text: 'Below this section: full Library, Inventory, Exam Bank, Timetable, Discipline, Visitors, Clinic, Transport, Cafeteria, Hostel, and more.' },
  { sel: '#kpi-section', title: 'KPI Dashboard', text: 'Track enrolment, fee collection %, attendance %, and library overdues at a glance.' },
  { sel: '#stats-section', title: 'Done!', text: 'Everything is stored locally. Use 🗄️ Backup regularly. Now go forth and forge!' },
];
let _tourIdx = 0;
function startTour(){ _tourIdx = 0; showTourStep(); }
function showTourStep(){
  removeTourElements();
  if(_tourIdx >= TOUR_STEPS.length){ localStorage.setItem('sdf_tour_done','1'); return; }
  const step = TOUR_STEPS[_tourIdx];
  const target = document.querySelector(step.sel);
  if(!target){ _tourIdx++; showTourStep(); return; }
  target.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(()=>{
    const rect = target.getBoundingClientRect();
    const spot = document.createElement('div'); spot.className='tour-spotlight';
    spot.style.cssText = `top:${rect.top-8}px;left:${rect.left-8}px;width:${rect.width+16}px;height:${rect.height+16}px;`;
    document.body.appendChild(spot);
    const bubble = document.createElement('div'); bubble.className='tour-bubble';
    bubble.innerHTML = `<h4>${step.title}</h4><div>${step.text}</div><div class="tour-actions"><button class="skip" onclick="endTour()">Skip</button><button onclick="nextTour()">${_tourIdx===TOUR_STEPS.length-1?'Finish':'Next →'}</button></div>`;
    document.body.appendChild(bubble);
    const top = Math.min(window.innerHeight - 220, rect.bottom + 12);
    bubble.style.top = top + 'px';
    bubble.style.left = Math.min(window.innerWidth - 340, Math.max(20, rect.left)) + 'px';
  }, 400);
}
function nextTour(){ _tourIdx++; showTourStep(); }
function endTour(){ removeTourElements(); localStorage.setItem('sdf_tour_done','1'); }
function removeTourElements(){ document.querySelectorAll('.tour-spotlight,.tour-bubble').forEach(e=>e.remove()); }
function initTourGuide(){ if(!localStorage.getItem('sdf_tour_done')) setTimeout(startTour, 1500); }
window.startTour=startTour; window.nextTour=nextTour; window.endTour=endTour;

/* ════════ EMAIL DRAFTS (mailto blast) ════════ */
function openEmailBlast(scope){
  const list = scope==='staff' ? lsGet('staff',[]) : lsGet('students',[]);
  const valid = list.filter(p => p.email);
  if(!valid.length){ SDF.toast('No emails found','error'); return; }
  openModal('Email Blast — ' + scope, `<label class="form-label">Subject</label>
    <input id="em-subj" class="form-input" placeholder="Subject"/>
    <label class="form-label" style="margin-top:.5rem;">Message (use {name}, {class}, {balance})</label>
    <textarea id="em-body" class="form-input" rows="4">Dear {name},

…

Regards,
${SDF.field('school-name')?.value||'School'}</textarea>
    <div class="blast-list" id="em-list" style="margin-top:.6rem;">Click "Build links" to generate mailto links.</div>`, () => false);
  document.getElementById('modal-confirm').textContent = 'Build links';
  document.getElementById('modal-confirm').onclick = () => {
    const subj = document.getElementById('em-subj').value;
    const body = document.getElementById('em-body').value;
    const html = valid.map(p => {
      const b = body.replace(/\{name\}/g,p.name).replace(/\{class\}/g,p.class||'').replace(/\{balance\}/g, curSym()+(((p.fees||0)-(p.paid||0))||0).toLocaleString());
      const url = `mailto:${encodeURIComponent(p.email)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(b)}`;
      return `<div class="blast-row"><span>${escapeHTML(p.name)} <small style="color:#888;">${escapeHTML(p.email)}</small></span><a href="${url}" target="_blank" style="background:#0078d4;">Email</a></div>`;
    }).join('');
    document.getElementById('em-list').innerHTML = html;
    audit('blast','email', scope+' '+valid.length);
  };
}
window.openEmailBlast = openEmailBlast;

/* ════════ GPA CALCULATOR ════════ */
function calcGPA(){
  const out = document.getElementById('gpa-output');
  const scale = document.getElementById('gpa-scale').value;
  const rows = document.getElementById('gpa-input').value.split('\n').filter(Boolean);
  // Each line: Course, Credits, Score
  let totalP = 0, totalC = 0;
  const detail = [];
  rows.forEach(r => {
    const [c, cr, sc] = r.split(',').map(x => (x||'').trim());
    const credits = +cr || 0; const score = +sc || 0;
    let grade, point;
    if(scale === 'ng4'){ // Nigerian 4.0
      if(score>=70){ grade='A';point=4.0; } else if(score>=60){ grade='B';point=3.0; } else if(score>=50){ grade='C';point=2.0; } else if(score>=45){ grade='D';point=1.0; } else { grade='F';point=0; }
    } else if(scale === 'ng5'){ // Nigerian 5.0
      if(score>=70){ grade='A';point=5.0; } else if(score>=60){ grade='B';point=4.0; } else if(score>=50){ grade='C';point=3.0; } else if(score>=45){ grade='D';point=2.0; } else if(score>=40){ grade='E';point=1.0; } else { grade='F';point=0; }
    } else if(scale === 'uk'){
      if(score>=70){ grade='1st';point=4.0; } else if(score>=60){ grade='2:1';point=3.5; } else if(score>=50){ grade='2:2';point=3.0; } else if(score>=40){ grade='3rd';point=2.0; } else { grade='Fail';point=0; }
    } else { // us
      if(score>=90){ grade='A';point=4.0; } else if(score>=80){ grade='B';point=3.0; } else if(score>=70){ grade='C';point=2.0; } else if(score>=60){ grade='D';point=1.0; } else { grade='F';point=0; }
    }
    totalP += point * credits; totalC += credits;
    detail.push(`${c} — ${credits} cr × ${score} → ${grade} (${point})`);
  });
  const gpa = totalC ? (totalP/totalC).toFixed(2) : '0.00';
  out.innerHTML = `<div style="font-family:monospace;font-size:.85rem;">${detail.join('<br/>')}</div><hr/><div style="font-size:1.4rem;font-weight:bold;color:var(--teal);">GPA: ${gpa}</div><div style="color:#666;font-size:.85rem;">Total credits: ${totalC} · Total points: ${totalP.toFixed(2)}</div>`;
}
window.calcGPA = calcGPA;
