/* ═══════════════════════════════════════════════════════════════
   SchoolDocForge v6 — Enterprise Modules (enterprise.js)
   Library · Inventory · Timetable · Discipline · Visitors ·
   Exam Bank · Audit Log · Birthdays · WhatsApp Blast · i18n ·
   PIN Lock · SVG Charts
   All client-side. No backend. No paid API.
═══════════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Render all enterprise modules
  renderBooks(); renderLoans(); renderLoanHistory();
  renderAssets();
  renderDiscipline();
  renderVisitors();
  renderQuestions(); populateQFilters();
  renderAuditLog();
  initLanguage();
  initPinLock();
  renderBirthdayWidget();
  // Refresh visitor date default
  const vd = document.getElementById('visitor-date-filter');
  if(vd && !vd.value) vd.value = new Date().toISOString().slice(0,10);
});

/* ════════ LIBRARY ════════ */
function switchLibTab(tab){
  ['books','loans','history'].forEach(t => {
    document.getElementById('libtab-'+t).style.display = t===tab?'':'none';
    const btn = document.querySelector(`.ent-tab[data-libtab="${t}"]`);
    if(btn) btn.classList.toggle('active', t===tab);
  });
}
window.switchLibTab = switchLibTab;

function showBookModal(b){
  openModal('Add Book', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Title *</label><input id="bk-title" class="form-input" value="${escapeHTML(b?.title||'')}"/></div>
    <div class="form-group"><label class="form-label">Author</label><input id="bk-author" class="form-input" value="${escapeHTML(b?.author||'')}"/></div>
    <div class="form-group"><label class="form-label">ISBN / Code</label><input id="bk-isbn" class="form-input" value="${escapeHTML(b?.isbn||'')}"/></div>
    <div class="form-group"><label class="form-label">Category</label><input id="bk-cat" class="form-input" value="${escapeHTML(b?.cat||'')}"/></div>
    <div class="form-group"><label class="form-label">Copies</label><input id="bk-copies" type="number" class="form-input" value="${b?.copies||1}"/></div>
    <div class="form-group"><label class="form-label">Shelf Location</label><input id="bk-shelf" class="form-input" value="${escapeHTML(b?.shelf||'')}"/></div>
  </div>`, () => {
    const data = { id: b?.id || 'b_'+Date.now(), title: SDF.field('bk-title').value.trim(), author: SDF.field('bk-author').value, isbn: SDF.field('bk-isbn').value, cat: SDF.field('bk-cat').value, copies:+SDF.field('bk-copies').value||1, shelf: SDF.field('bk-shelf').value };
    if(!data.title){ SDF.toast('Title required','error'); return false; }
    const list = lsGet('books', []); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('books', list); renderBooks(); refreshStats(); audit(idx>=0?'update':'create','book', data.title);
    SDF.toast('Saved'); return true;
  });
}
function renderBooks(){
  const list = lsGet('books', []);
  const q = (document.getElementById('book-search')?.value||'').toLowerCase();
  const filtered = q ? list.filter(b => Object.values(b).join(' ').toLowerCase().includes(q)) : list;
  const tbody = document.getElementById('books-tbody'); if(!tbody) return;
  const loans = lsGet('loans', []);
  tbody.innerHTML = filtered.length ? filtered.map(b => {
    const onLoan = loans.filter(l=>l.bookId===b.id).length;
    const status = onLoan>=b.copies ? 'Out' : 'Available';
    return `<tr><td>${escapeHTML(b.title)}</td><td>${escapeHTML(b.author||'')}</td><td>${escapeHTML(b.isbn||'')}</td><td>${escapeHTML(b.cat||'')}</td><td>${b.copies}</td><td><span class="lib-badge ${status==='Available'?'available':'borrowed'}">${status} (${b.copies-onLoan} free)</span></td><td><button class="btn-sm" onclick='editBook("${b.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteBook("${b.id}")'>🗑</button></td></tr>`;
  }).join('') : '<tr><td colspan="7" class="empty-table">No books</td></tr>';
}
function editBook(id){ const b = lsGet('books',[]).find(x=>x.id===id); if(b) showBookModal(b); }
function deleteBook(id){ if(!confirm('Delete book?')) return; lsSet('books', lsGet('books',[]).filter(b=>b.id!==id)); renderBooks(); refreshStats(); audit('delete','book', id); }
function importBooksCSV(e){ const f=e.target.files[0]; if(!f) return; Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{ const cur=lsGet('books',[]); const inc=r.data.map(x=>({...x,id:x.id||'b_'+Date.now()+Math.random(),copies:+x.copies||1})); lsSet('books', cur.concat(inc)); renderBooks(); refreshStats(); audit('import','books',inc.length); SDF.toast('Imported '+inc.length); }}); e.target.value=''; }
function exportBooksCSV(){ const list=lsGet('books',[]); if(!list.length){SDF.toast('No books','error');return;} saveAs(new Blob([Papa.unparse(list)],{type:'text/csv'}),'books.csv'); }
window.showBookModal=showBookModal; window.editBook=editBook; window.deleteBook=deleteBook;
window.importBooksCSV=importBooksCSV; window.exportBooksCSV=exportBooksCSV; window.renderBooks=renderBooks;

function showLoanModal(){
  const books = lsGet('books',[]); const students = lsGet('students',[]);
  if(!books.length){ SDF.toast('Add books first','error'); return; }
  if(!students.length){ SDF.toast('Add students first','error'); return; }
  openModal('Issue Book', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Book</label><select id="ln-book" class="form-input">${books.map(b=>`<option value="${b.id}">${escapeHTML(b.title)}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Borrower (Student)</label><select id="ln-st" class="form-input">${students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Days to Return</label><input id="ln-days" type="number" class="form-input" value="14"/></div>
  </div>`, () => {
    const bookId = SDF.field('ln-book').value; const stId = SDF.field('ln-st').value;
    const days = +SDF.field('ln-days').value || 14;
    const book = books.find(b=>b.id===bookId); const st = students.find(s=>s.id===stId);
    const loans = lsGet('loans', []);
    const onLoan = loans.filter(l=>l.bookId===bookId).length;
    if(onLoan >= book.copies){ SDF.toast('No copies left','error'); return false; }
    loans.push({ id:'l_'+Date.now(), bookId, bookTitle:book.title, stId, stName:st.name, issued: Date.now(), due: Date.now()+days*86400000 });
    lsSet('loans', loans); renderBooks(); renderLoans(); audit('issue','book', book.title+' → '+st.name);
    SDF.toast('Issued'); return true;
  });
}
function renderLoans(){
  const loans = lsGet('loans',[]); const tbody = document.getElementById('loans-tbody'); if(!tbody) return;
  const fine = 50; // ₦/day
  tbody.innerHTML = loans.length ? loans.map(l => {
    const left = Math.ceil((l.due - Date.now())/86400000);
    const fineAmt = left < 0 ? Math.abs(left)*fine : 0;
    return `<tr><td>${escapeHTML(l.bookTitle)}</td><td>${escapeHTML(l.stName)}</td><td>${new Date(l.issued).toLocaleDateString()}</td><td>${new Date(l.due).toLocaleDateString()}</td><td>${left>=0?left:'<span style="color:#b91c1c;">'+left+'</span>'}</td><td>${fineAmt?'₦'+fineAmt:'-'}</td><td><button class="btn-sm" onclick='returnBook("${l.id}")'>↩️ Return</button> <button class="btn-sm" onclick='libNotice("${l.id}")'>📨 Notice</button></td></tr>`;
  }).join('') : '<tr><td colspan="7" class="empty-table">No active loans</td></tr>';
}
function returnBook(id){
  const loans = lsGet('loans',[]); const idx = loans.findIndex(l=>l.id===id); if(idx<0) return;
  const l = loans[idx]; const left = Math.ceil((l.due - Date.now())/86400000);
  const fineAmt = left < 0 ? Math.abs(left)*50 : 0;
  const fp = fineAmt ? +prompt(`Fine due: ₦${fineAmt}. Amount paid:`, fineAmt) : 0;
  const history = lsGet('loan_history', []);
  history.unshift({ ...l, returned: Date.now(), finePaid: fp||0 });
  lsSet('loan_history', history);
  loans.splice(idx,1); lsSet('loans', loans);
  renderBooks(); renderLoans(); renderLoanHistory(); audit('return','book', l.bookTitle+' fine ₦'+(fp||0));
  SDF.toast('Returned');
}
function libNotice(id){
  const l = lsGet('loans',[]).find(x=>x.id===id); if(!l) return;
  const days = Math.max(0, Math.floor((Date.now()-l.due)/86400000));
  selectDocType('library-overdue'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-borrowerName').value = l.stName; SDF.field('cf-bookTitle').value = l.bookTitle; SDF.field('cf-daysOverdue').value = days; SDF.field('cf-fine').value = days*50; updateLivePreview(); }, 120);
}
function renderLoanHistory(){
  const h = lsGet('loan_history',[]); const tbody=document.getElementById('loan-history-tbody'); if(!tbody) return;
  tbody.innerHTML = h.length ? h.map(l=>`<tr><td>${escapeHTML(l.bookTitle)}</td><td>${escapeHTML(l.stName)}</td><td>${new Date(l.issued).toLocaleDateString()}</td><td>${new Date(l.returned).toLocaleDateString()}</td><td>₦${(l.finePaid||0).toLocaleString()}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-table">No history</td></tr>';
}
function exportLoansCSV(){ const l=lsGet('loans',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l)],{type:'text/csv'}),'loans.csv'); }
window.showLoanModal=showLoanModal; window.returnBook=returnBook; window.libNotice=libNotice; window.renderLoans=renderLoans; window.renderLoanHistory=renderLoanHistory; window.exportLoansCSV=exportLoansCSV;

/* ════════ INVENTORY / ASSETS ════════ */
function showAssetModal(a){
  openModal('Add Asset', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Asset Name *</label><input id="as-name" class="form-input" value="${escapeHTML(a?.name||'')}"/></div>
    <div class="form-group"><label class="form-label">Tag No.</label><input id="as-tag" class="form-input" value="${escapeHTML(a?.tag||'AST-'+Date.now())}"/></div>
    <div class="form-group"><label class="form-label">Category</label><input id="as-cat" class="form-input" placeholder="Furniture / IT / Lab" value="${escapeHTML(a?.cat||'')}"/></div>
    <div class="form-group"><label class="form-label">Custodian</label><input id="as-cust" class="form-input" value="${escapeHTML(a?.custodian||'')}"/></div>
    <div class="form-group"><label class="form-label">Acquired</label><input id="as-acq" type="date" class="form-input" value="${a?.acquired||new Date().toISOString().slice(0,10)}"/></div>
    <div class="form-group"><label class="form-label">Cost (₦)</label><input id="as-cost" type="number" class="form-input" value="${a?.cost||0}"/></div>
    <div class="form-group"><label class="form-label">Useful Life (years)</label><input id="as-life" type="number" class="form-input" value="${a?.life||5}"/></div>
    <div class="form-group"><label class="form-label">Condition</label><select id="as-cond" class="form-input"><option ${a?.condition==='New'?'selected':''}>New</option><option ${a?.condition==='Good'?'selected':''}>Good</option><option ${a?.condition==='Fair'?'selected':''}>Fair</option><option ${a?.condition==='Poor'?'selected':''}>Poor</option><option ${a?.condition==='Damaged'?'selected':''}>Damaged</option></select></div>
  </div>`, () => {
    const data = { id:a?.id||'a_'+Date.now(), name:SDF.field('as-name').value.trim(), tag:SDF.field('as-tag').value, cat:SDF.field('as-cat').value, custodian:SDF.field('as-cust').value, acquired:SDF.field('as-acq').value, cost:+SDF.field('as-cost').value||0, life:+SDF.field('as-life').value||5, condition:SDF.field('as-cond').value };
    if(!data.name){ SDF.toast('Name required','error'); return false; }
    const list = lsGet('assets',[]); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('assets', list); renderAssets(); refreshStats(); audit(idx>=0?'update':'create','asset', data.name);
    SDF.toast('Saved'); return true;
  });
}
function depreciate(a){
  const yrs = (Date.now() - new Date(a.acquired).getTime())/(365.25*86400000);
  const per = (a.cost||0)/(a.life||5);
  return Math.max(0, (a.cost||0) - per*Math.max(0,yrs));
}
function renderAssets(){
  const list = lsGet('assets',[]);
  const cats = [...new Set(list.map(a=>a.cat).filter(Boolean))];
  const cf = document.getElementById('asset-cat-filter');
  const cur = cf?.value || '';
  if(cf) cf.innerHTML = '<option value="">All Categories</option>' + cats.map(c=>`<option ${c===cur?'selected':''}>${escapeHTML(c)}</option>`).join('');
  const q = (document.getElementById('asset-search')?.value||'').toLowerCase();
  let filtered = cur ? list.filter(a=>a.cat===cur) : list;
  if(q) filtered = filtered.filter(a => Object.values(a).join(' ').toLowerCase().includes(q));
  const tbody = document.getElementById('assets-tbody'); if(!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(a => `<tr><td>${escapeHTML(a.name)}</td><td><code>${escapeHTML(a.tag||'')}</code></td><td>${escapeHTML(a.cat||'')}</td><td>${escapeHTML(a.custodian||'')}</td><td>${escapeHTML(a.acquired||'')}</td><td>₦${(a.cost||0).toLocaleString()}</td><td>₦${depreciate(a).toLocaleString(undefined,{maximumFractionDigits:0})}</td><td>${escapeHTML(a.condition||'')}</td><td><button class="btn-sm" onclick='editAsset("${a.id}")'>✏️</button> <button class="btn-sm" onclick='printAssetTag("${a.id}")'>🏷️</button> <button class="btn-sm btn-danger" onclick='deleteAsset("${a.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="9" class="empty-table">No assets</td></tr>';
  // Chart
  const byCat = {}; list.forEach(a => { byCat[a.cat||'Uncategorised'] = (byCat[a.cat||'Uncategorised']||0)+(+a.cost||0); });
  const max = Math.max(1, ...Object.values(byCat));
  const ch = document.getElementById('assets-chart'); if(ch){ if(Object.keys(byCat).length){ ch.style.display=''; ch.innerHTML = '<div class="chart-title">Asset Value by Category</div>' + Object.keys(byCat).map(k=>`<div class="chart-bar-h"><span class="lbl">${escapeHTML(k)}</span><div class="bar"><div class="fill" style="width:${byCat[k]/max*100}%"></div></div><span class="val">₦${byCat[k].toLocaleString()}</span></div>`).join(''); } else ch.style.display='none'; }
}
function editAsset(id){ const a=lsGet('assets',[]).find(x=>x.id===id); if(a) showAssetModal(a); }
function deleteAsset(id){ if(!confirm('Delete asset?')) return; lsSet('assets', lsGet('assets',[]).filter(a=>a.id!==id)); renderAssets(); refreshStats(); audit('delete','asset',id); }
function printAssetTag(id){
  const a = lsGet('assets',[]).find(x=>x.id===id); if(!a) return;
  selectDocType('asset-tag'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-assetName').value=a.name; SDF.field('cf-tagNo').value=a.tag; SDF.field('cf-custodian').value=a.custodian; SDF.field('cf-acquired').value=a.acquired; updateLivePreview(); },120);
}
function importAssetsCSV(e){ const f=e.target.files[0]; if(!f) return; Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{ const cur=lsGet('assets',[]); const inc=r.data.map(x=>({...x,id:x.id||'a_'+Date.now()+Math.random(),cost:+x.cost||0,life:+x.life||5})); lsSet('assets', cur.concat(inc)); renderAssets(); refreshStats(); audit('import','assets',inc.length); SDF.toast('Imported '+inc.length); }}); e.target.value=''; }
function exportAssetsCSV(){ const l=lsGet('assets',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l)],{type:'text/csv'}),'assets.csv'); }
window.showAssetModal=showAssetModal; window.editAsset=editAsset; window.deleteAsset=deleteAsset; window.printAssetTag=printAssetTag; window.importAssetsCSV=importAssetsCSV; window.exportAssetsCSV=exportAssetsCSV; window.renderAssets=renderAssets;

/* ════════ TIMETABLE BUILDER ════════ */
const TT_DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const TT_PERIODS = 8;
function loadTimetable(){
  const cls = document.getElementById('tt-class-select').value;
  const grid = document.getElementById('timetable-grid'); if(!grid) return;
  if(!cls){ grid.innerHTML=''; return; }
  const data = lsGet('tt_'+cls, {});
  // headers
  let html = '<div class="tt-head">Period</div>' + TT_DAYS.map(d=>`<div class="tt-head">${d}</div>`).join('');
  for(let p=1;p<=TT_PERIODS;p++){
    html += `<div class="tt-head">P${p}</div>`;
    TT_DAYS.forEach(d => {
      const v = data[d+'_'+p] || '';
      const conflict = isTeacherConflict(cls, d, p, v) ? ' conflict' : '';
      html += `<div class="tt-cell${v?' filled':''}${conflict}" onclick="editTTCell('${cls}','${d}',${p})">${escapeHTML(v||'+')}</div>`;
    });
  }
  grid.innerHTML = html;
}
function editTTCell(cls,d,p){
  const data = lsGet('tt_'+cls, {});
  const cur = data[d+'_'+p] || '';
  const v = prompt(`${d} P${p} — enter "Subject / Teacher" or leave blank to clear:`, cur);
  if(v === null) return;
  if(v.trim()) data[d+'_'+p] = v.trim(); else delete data[d+'_'+p];
  lsSet('tt_'+cls, data); loadTimetable(); audit('update','timetable', cls+' '+d+' P'+p);
}
function isTeacherConflict(cls, d, p, val){
  if(!val) return false;
  const teacher = (val.split('/')[1]||'').trim().toLowerCase(); if(!teacher) return false;
  const classes = [...new Set(lsGet('students',[]).map(s=>s.class).filter(Boolean))];
  return classes.filter(c => c!==cls).some(c => { const data = lsGet('tt_'+c, {}); const v = data[d+'_'+p]||''; return (v.split('/')[1]||'').trim().toLowerCase() === teacher; });
}
function clearTimetable(){
  const cls = document.getElementById('tt-class-select').value; if(!cls){ SDF.toast('Pick class','error'); return; }
  if(!confirm('Clear timetable for '+cls+'?')) return;
  lsSet('tt_'+cls, {}); loadTimetable();
}
function exportTimetable(){
  const cls = document.getElementById('tt-class-select').value; if(!cls){ SDF.toast('Pick class','error'); return; }
  const data = lsGet('tt_'+cls, {});
  const rows = [];
  TT_DAYS.forEach(d => { for(let p=1;p<=TT_PERIODS;p++){ rows.push({class:cls,day:d,period:p,value:data[d+'_'+p]||''}); } });
  saveAs(new Blob([Papa.unparse(rows)],{type:'text/csv'}), `timetable-${cls}.csv`);
}
function printTimetable(){
  const cls = document.getElementById('tt-class-select').value; if(!cls){ SDF.toast('Pick class','error'); return; }
  const data = lsGet('tt_'+cls, {});
  const lines = [];
  TT_DAYS.forEach(d => { for(let p=1;p<=TT_PERIODS;p++){ if(data[d+'_'+p]) lines.push(`${d},P${p},${data[d+'_'+p]},`); } });
  selectDocType('class-timetable'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-classLevel').value=cls; SDF.field('cf-rows').value=lines.join('\n'); updateLivePreview(); },120);
}
window.loadTimetable=loadTimetable; window.editTTCell=editTTCell; window.clearTimetable=clearTimetable; window.exportTimetable=exportTimetable; window.printTimetable=printTimetable;

/* ════════ DISCIPLINE LOG ════════ */
function showDiscModal(e){
  const students = lsGet('students',[]);
  openModal('Log Incident / Merit', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Student</label><select id="ds-st" class="form-input">${students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Type</label><select id="ds-type" class="form-input"><option value="incident">Incident (negative)</option><option value="merit">Merit (positive)</option></select></div>
    <div class="form-group"><label class="form-label">Points (±)</label><input id="ds-pts" type="number" class="form-input" value="-2"/></div>
    <div class="form-group form-group-full"><label class="form-label">Description</label><textarea id="ds-desc" rows="3" class="form-input"></textarea></div>
    <div class="form-group form-group-full"><label class="form-label">Action Taken</label><input id="ds-act" class="form-input"/></div>
  </div>`, () => {
    const stId = SDF.field('ds-st').value; const st = students.find(s=>s.id===stId);
    const data = { id:'d_'+Date.now(), t: Date.now(), stId, stName: st?.name||'', stClass: st?.class||'', type: SDF.field('ds-type').value, pts:+SDF.field('ds-pts').value||0, desc: SDF.field('ds-desc').value, action: SDF.field('ds-act').value };
    const list = lsGet('discipline',[]); list.unshift(data); lsSet('discipline', list);
    renderDiscipline(); audit('log','discipline', st?.name||''); SDF.toast('Logged');
    return true;
  });
}
function renderDiscipline(){
  const list = lsGet('discipline',[]);
  const filt = document.getElementById('disc-filter')?.value || '';
  const q = (document.getElementById('disc-search')?.value||'').toLowerCase();
  let f = filt ? list.filter(d=>d.type===filt) : list;
  if(q) f = f.filter(d => Object.values(d).join(' ').toLowerCase().includes(q));
  const tbody = document.getElementById('disc-tbody'); if(!tbody) return;
  tbody.innerHTML = f.length ? f.map(d=>`<tr class="disc-row"><td>${new Date(d.t).toLocaleDateString()}</td><td>${escapeHTML(d.stName)} <span style="color:#888;font-size:.75rem;">(${escapeHTML(d.stClass)})</span></td><td>${d.type==='merit'?'<span class="disc-pos">★ Merit</span>':'<span class="disc-neg">⚠ Incident</span>'}</td><td>${d.pts>0?'+':''}${d.pts}</td><td>${escapeHTML(d.desc||'')}</td><td>${escapeHTML(d.action||'')}</td><td><button class="btn-sm" onclick='discNotice("${d.id}")'>📨 Notice</button> <button class="btn-sm btn-danger" onclick='deleteDisc("${d.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-table">No entries</td></tr>';
}
function deleteDisc(id){ if(!confirm('Delete entry?')) return; lsSet('discipline', lsGet('discipline',[]).filter(d=>d.id!==id)); renderDiscipline(); audit('delete','discipline',id); }
function discNotice(id){
  const d = lsGet('discipline',[]).find(x=>x.id===id); if(!d) return;
  selectDocType('parent-notice'); proceedToStep3();
  setTimeout(()=>{ SDF.field('cf-studentName').value=d.stName; SDF.field('cf-classLevel').value=d.stClass; SDF.field('cf-type').value=d.type==='merit'?'Merit':'Caution'; SDF.field('cf-body').value=`${d.desc}\n\nAction taken: ${d.action}\nPoints: ${d.pts}`; SDF.field('cf-date').value=new Date(d.t).toISOString().slice(0,10); updateLivePreview(); },120);
}
function exportDisciplineCSV(){ const l=lsGet('discipline',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l.map(d=>({date:new Date(d.t).toISOString().slice(0,10),student:d.stName,class:d.stClass,type:d.type,points:d.pts,description:d.desc,action:d.action})))],{type:'text/csv'}),'discipline.csv'); }
window.showDiscModal=showDiscModal; window.renderDiscipline=renderDiscipline; window.deleteDisc=deleteDisc; window.discNotice=discNotice; window.exportDisciplineCSV=exportDisciplineCSV;

/* ════════ VISITOR LOG ════════ */
function showVisitorModal(){
  openModal('Sign In Visitor', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Name *</label><input id="vs-name" class="form-input"/></div>
    <div class="form-group"><label class="form-label">Phone</label><input id="vs-phone" class="form-input"/></div>
    <div class="form-group"><label class="form-label">Visiting (Person)</label><input id="vs-visit" class="form-input"/></div>
    <div class="form-group"><label class="form-label">Purpose</label><input id="vs-purpose" class="form-input"/></div>
  </div>`, () => {
    const name = SDF.field('vs-name').value.trim(); if(!name){ SDF.toast('Name required','error'); return false; }
    const data = { id:'v_'+Date.now(), name, phone: SDF.field('vs-phone').value, visiting: SDF.field('vs-visit').value, purpose: SDF.field('vs-purpose').value, in: Date.now(), out: null, date: new Date().toISOString().slice(0,10) };
    const list = lsGet('visitors',[]); list.unshift(data); lsSet('visitors', list);
    renderVisitors(); audit('signin','visitor', name);
    SDF.toast('Signed in. Print badge?'); 
    if(confirm('Print visitor badge?')){
      selectDocType('visitor-badge'); proceedToStep3();
      setTimeout(()=>{ SDF.field('cf-visitorName').value=name; SDF.field('cf-purpose').value=data.purpose; SDF.field('cf-visiting').value=data.visiting; SDF.field('cf-date').value=data.date; SDF.field('cf-photo').value=name.charAt(0); updateLivePreview(); },120);
    }
    return true;
  });
}
function renderVisitors(){
  const list = lsGet('visitors',[]);
  const date = document.getElementById('visitor-date-filter')?.value;
  const f = date ? list.filter(v=>v.date===date) : list;
  const tbody = document.getElementById('visitors-tbody'); if(!tbody) return;
  tbody.innerHTML = f.length ? f.map(v=>`<tr><td>${escapeHTML(v.name)}</td><td>${escapeHTML(v.phone||'')}</td><td>${escapeHTML(v.visiting||'')}</td><td>${escapeHTML(v.purpose||'')}</td><td>${new Date(v.in).toLocaleTimeString()}</td><td>${v.out?new Date(v.out).toLocaleTimeString():'<em>still in</em>'}</td><td>${v.out?'':'<button class="btn-sm btn-primary" onclick="signoutVisitor(\''+v.id+'\')">Sign Out</button>'} <button class="btn-sm btn-danger" onclick="deleteVisitor('${v.id}')">🗑</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-table">No visitors</td></tr>';
}
function signoutVisitor(id){ const list=lsGet('visitors',[]); const v=list.find(x=>x.id===id); if(v){ v.out=Date.now(); lsSet('visitors',list); renderVisitors(); audit('signout','visitor',v.name); SDF.toast('Signed out'); } }
function deleteVisitor(id){ if(!confirm('Delete entry?')) return; lsSet('visitors', lsGet('visitors',[]).filter(v=>v.id!==id)); renderVisitors(); audit('delete','visitor',id); }
function exportVisitorsCSV(){ const date=document.getElementById('visitor-date-filter')?.value; const list=lsGet('visitors',[]).filter(v=>!date||v.date===date); saveAs(new Blob([Papa.unparse(list.map(v=>({name:v.name,phone:v.phone,visiting:v.visiting,purpose:v.purpose,signed_in:new Date(v.in).toISOString(),signed_out:v.out?new Date(v.out).toISOString():''})))],{type:'text/csv'}),`visitors-${date||'all'}.csv`); }
window.showVisitorModal=showVisitorModal; window.signoutVisitor=signoutVisitor; window.deleteVisitor=deleteVisitor; window.renderVisitors=renderVisitors; window.exportVisitorsCSV=exportVisitorsCSV;

/* ════════ EXAM BANK ════════ */
function switchExamTab(t){
  ['bank','paper'].forEach(x => { document.getElementById('extab-'+x).style.display = x===t?'':'none'; const b=document.querySelector(`.ent-tab[data-extab="${x}"]`); if(b) b.classList.toggle('active',x===t); });
  if(t==='paper') populatePaperSelectors();
}
window.switchExamTab = switchExamTab;
function showQuestionModal(q){
  openModal('Add Question', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Subject</label><input id="q-subj" class="form-input" value="${escapeHTML(q?.subj||'')}"/></div>
    <div class="form-group"><label class="form-label">Class</label><input id="q-class" class="form-input" value="${escapeHTML(q?.cls||'')}"/></div>
    <div class="form-group"><label class="form-label">Type</label><select id="q-type" class="form-input"><option ${q?.type==='Objective'?'selected':''}>Objective</option><option ${q?.type==='Theory'?'selected':''}>Theory</option><option ${q?.type==='True/False'?'selected':''}>True/False</option><option ${q?.type==='Fill-in'?'selected':''}>Fill-in</option></select></div>
    <div class="form-group"><label class="form-label">Difficulty</label><select id="q-diff" class="form-input"><option>Easy</option><option ${q?.diff==='Medium'?'selected':''}>Medium</option><option ${q?.diff==='Hard'?'selected':''}>Hard</option></select></div>
    <div class="form-group form-group-full"><label class="form-label">Question *</label><textarea id="q-text" class="form-input" rows="3">${escapeHTML(q?.text||'')}</textarea></div>
    <div class="form-group form-group-full"><label class="form-label">Answer (optional, for markscheme)</label><input id="q-ans" class="form-input" value="${escapeHTML(q?.ans||'')}"/></div>
  </div>`, () => {
    const data={ id:q?.id||'q_'+Date.now(), subj:SDF.field('q-subj').value, cls:SDF.field('q-class').value, type:SDF.field('q-type').value, diff:SDF.field('q-diff').value, text:SDF.field('q-text').value.trim(), ans:SDF.field('q-ans').value };
    if(!data.text){ SDF.toast('Question text required','error'); return false; }
    const list = lsGet('questions',[]); const idx=list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('questions', list); renderQuestions(); populateQFilters(); audit(idx>=0?'update':'create','question',data.subj+'/'+data.cls);
    SDF.toast('Saved'); return true;
  });
}
function populateQFilters(){
  const list = lsGet('questions',[]);
  const subjs = [...new Set(list.map(q=>q.subj).filter(Boolean))]; const cls = [...new Set(list.map(q=>q.cls).filter(Boolean))];
  const sf = document.getElementById('q-subj-filter'); const cf = document.getElementById('q-class-filter');
  if(sf) sf.innerHTML = '<option value="">All Subjects</option>' + subjs.map(s=>`<option>${escapeHTML(s)}</option>`).join('');
  if(cf) cf.innerHTML = '<option value="">All Classes</option>' + cls.map(c=>`<option>${escapeHTML(c)}</option>`).join('');
  const es=document.getElementById('exam-subj'); const ec=document.getElementById('exam-class');
  if(es) es.innerHTML = subjs.map(s=>`<option>${escapeHTML(s)}</option>`).join('');
  if(ec) ec.innerHTML = cls.map(c=>`<option>${escapeHTML(c)}</option>`).join('');
}
function populatePaperSelectors(){ populateQFilters(); }
function renderQuestions(){
  const list = lsGet('questions',[]);
  const sf=document.getElementById('q-subj-filter')?.value||''; const cf=document.getElementById('q-class-filter')?.value||'';
  let f = list;
  if(sf) f = f.filter(q=>q.subj===sf); if(cf) f = f.filter(q=>q.cls===cf);
  const tbody = document.getElementById('questions-tbody'); if(!tbody) return;
  tbody.innerHTML = f.length ? f.map(q=>`<tr><td>${escapeHTML(q.subj||'')}</td><td>${escapeHTML(q.cls||'')}</td><td>${escapeHTML(q.type||'')}</td><td style="max-width:380px;">${escapeHTML((q.text||'').slice(0,160))}${q.text&&q.text.length>160?'…':''}</td><td>${escapeHTML(q.diff||'')}</td><td><button class="btn-sm" onclick='editQ("${q.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteQ("${q.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty-table">No questions</td></tr>';
}
function editQ(id){ const q=lsGet('questions',[]).find(x=>x.id===id); if(q) showQuestionModal(q); }
function deleteQ(id){ if(!confirm('Delete?')) return; lsSet('questions', lsGet('questions',[]).filter(q=>q.id!==id)); renderQuestions(); audit('delete','question',id); }
function importQuestionsCSV(e){ const f=e.target.files[0]; if(!f) return; Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{ const cur=lsGet('questions',[]); const inc=r.data.map(x=>({...x,id:x.id||'q_'+Date.now()+Math.random()})); lsSet('questions', cur.concat(inc)); renderQuestions(); populateQFilters(); audit('import','questions',inc.length); SDF.toast('Imported '+inc.length); }}); e.target.value=''; }
function exportQuestionsCSV(){ const l=lsGet('questions',[]); if(!l.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(l)],{type:'text/csv'}),'questions.csv'); }
function generateExamPaper(){
  const subj = document.getElementById('exam-subj').value; const cls = document.getElementById('exam-class').value;
  const n = +document.getElementById('exam-count').value || 20;
  const dur = +document.getElementById('exam-dur').value || 60;
  const title = document.getElementById('exam-title').value || 'Examination';
  const pool = lsGet('questions',[]).filter(q => (!subj||q.subj===subj) && (!cls||q.cls===cls));
  if(!pool.length){ SDF.toast('No questions in pool','error'); return; }
  // Fisher–Yates shuffle, take n
  const arr = pool.slice();
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  const chosen = arr.slice(0, n);
  document.getElementById('exam-paper-output').innerHTML = `<div class="exam-paper print-target"><h2 style="text-align:center;margin:0 0 .3rem;">${escapeHTML(title)}</h2><div style="text-align:center;font-size:.9rem;color:#555;">${escapeHTML(subj)} · ${escapeHTML(cls)} · Duration: ${dur} mins</div><hr/><ol>${chosen.map(q=>`<li class="qq">${escapeHTML(q.text)}</li>`).join('')}</ol></div><div style="text-align:center;margin-top:1rem;"><button class="btn-primary" onclick="exportExamPaperToGenerator('${escapeHTML(title)}','${escapeHTML(subj)}','${escapeHTML(cls)}',${dur})">⬇️ Send to Generator (for PDF/print)</button></div>`;
  window._lastExamQs = chosen;
  audit('generate','exam-paper', title);
}
function exportExamPaperToGenerator(title, subj, cls, dur){
  selectDocType('exam-paper'); proceedToStep3();
  setTimeout(()=>{
    SDF.field('cf-title').value = title; SDF.field('cf-subject').value = subj; SDF.field('cf-classLevel').value = cls; SDF.field('cf-duration').value = dur;
    SDF.field('cf-instructions').value = 'Answer ALL questions.';
    SDF.field('cf-questions').value = (window._lastExamQs||[]).map(q=>q.text).join('\n');
    updateLivePreview();
  }, 120);
}
window.showQuestionModal=showQuestionModal; window.editQ=editQ; window.deleteQ=deleteQ; window.renderQuestions=renderQuestions; window.populateQFilters=populateQFilters;
window.importQuestionsCSV=importQuestionsCSV; window.exportQuestionsCSV=exportQuestionsCSV; window.generateExamPaper=generateExamPaper; window.exportExamPaperToGenerator=exportExamPaperToGenerator;

/* ════════ AUDIT LOG ════════ */
function renderAuditLog(){
  const log = JSON.parse(localStorage.getItem('sdf_audit')||'[]');
  const list = document.getElementById('audit-list'); if(!list) return;
  list.innerHTML = log.length ? log.slice(0,200).map(e=>`<div class="audit-row"><span>${new Date(e.t).toLocaleString()}</span><span class="audit-action ${e.action==='delete'?'delete':e.action==='update'?'update':''}">${escapeHTML(e.action)}</span><span>${escapeHTML(e.entity)} ${e.details?'· '+escapeHTML(e.details):''} <em style="color:#888;">[${escapeHTML(e.branch||'?')}]</em></span></div>`).join('') : '<p class="history-empty" style="padding:1.5rem;text-align:center;">No actions logged yet.</p>';
}
function exportAuditCSV(){ const log = JSON.parse(localStorage.getItem('sdf_audit')||'[]'); if(!log.length){SDF.toast('None','error');return;} saveAs(new Blob([Papa.unparse(log.map(e=>({...e,time:new Date(e.t).toISOString()})))],{type:'text/csv'}),'audit-log.csv'); }
function clearAuditLog(){ if(!confirm('Clear audit log?')) return; localStorage.removeItem('sdf_audit'); renderAuditLog(); }
window.renderAuditLog = renderAuditLog; window.exportAuditCSV = exportAuditCSV; window.clearAuditLog = clearAuditLog;
// auto-refresh audit list when actions logged
const _origAudit = window.audit;
window.audit = function(...a){ _origAudit(...a); renderAuditLog(); };

/* ════════ BIRTHDAY WIDGET ════════ */
function renderBirthdayWidget(){
  const today = new Date(); const weekFromNow = new Date(today.getTime()+7*86400000);
  const all = lsGet('students',[]).concat(lsGet('staff',[]));
  const hits = all.filter(p => {
    if(!p.dob) return false;
    const d = new Date(p.dob); if(isNaN(d)) return false;
    const m = d.getMonth(), day = d.getDate();
    for(let i=0;i<7;i++){ const c = new Date(today.getTime()+i*86400000); if(c.getMonth()===m && c.getDate()===day) return true; }
    return false;
  });
  const w = document.getElementById('bday-widget'); if(!w) return;
  if(!hits.length){ w.innerHTML=''; return; }
  w.innerHTML = `<div class="bday-widget"><h4>🎂 Birthdays this week</h4><div class="bday-list">${hits.map(h=>`<span class="bday-chip">${escapeHTML(h.name)} <small style="color:#888;">${new Date(h.dob).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></span>`).join('')}</div></div>`;
}
window.renderBirthdayWidget = renderBirthdayWidget;

/* ════════ WHATSAPP BLAST ════════ */
function openWhatsAppBlast(scope){
  const list = scope==='staff' ? lsGet('staff',[]) : lsGet('students',[]);
  const valid = list.filter(p => (p.phone||p.gphone));
  if(!valid.length){ SDF.toast('No phone numbers found','error'); return; }
  const tplBody = `<label class="form-label">Message template (use {name}, {class}, {balance})</label>
    <textarea id="wb-msg" class="form-input" rows="3">Dear {name}, kindly note: {balance}. — ${SDF.field('school-name').value||'School'}</textarea>
    <p style="font-size:.8rem;color:#666;margin-top:.5rem;">Tip: WhatsApp shows a per-recipient link below. Click each to open WhatsApp.</p>
    <div class="blast-list" id="wb-list" style="margin-top:.6rem;">Type message and click "Build links".</div>`;
  openModal('WhatsApp Blast — ' + scope, tplBody, () => false);
  document.getElementById('modal-confirm').textContent = 'Build links';
  document.getElementById('modal-confirm').onclick = () => {
    const msg = document.getElementById('wb-msg').value;
    const html = valid.map(p => {
      const phone = (p.phone||p.gphone||'').replace(/[^0-9]/g,'');
      const tel = phone.startsWith('0') ? '234' + phone.slice(1) : phone;
      const m = msg.replace(/\{name\}/g, p.name).replace(/\{class\}/g, p.class||'').replace(/\{balance\}/g, '₦'+(((p.fees||0)-(p.paid||0))||0).toLocaleString());
      return `<div class="blast-row"><span>${escapeHTML(p.name)} <small style="color:#888;">${phone}</small></span><a href="https://wa.me/${tel}?text=${encodeURIComponent(m)}" target="_blank">Send</a></div>`;
    }).join('');
    document.getElementById('wb-list').innerHTML = html;
    audit('blast','whatsapp', scope+' '+valid.length);
  };
}
window.openWhatsAppBlast = openWhatsAppBlast;

/* ════════ i18n ════════ */
const I18N = {
  en: { hero_title:'Professional School<br/><em>Operations Platform</em><br/>in One Free App', hero_sub:'Generate documents. Manage students, staff, fees, attendance, library, inventory, timetables, discipline & visitors. All branded. All offline-capable. All free.' },
  yo: { hero_title:'Ètò Ìṣàkóso Ilé-Ẹ̀kọ́ <em>Ọjọgbọn</em><br/>nínú Ohun-èlò Ọ̀fẹ́', hero_sub:'Ṣe àwọn ìwé. Ṣàkóso àwọn akẹ́kọ̀ọ́, olùkọ́, owó-ìwé, lílọ-sí-ilé-ìwé, ilé-ìkàwé, dúkìá àti ojúmọ́. Gbogbo rẹ̀ jẹ́ ọ̀fẹ́.' },
  ha: { hero_title:'Dandalin <em>Sarrafa Makaranta</em><br/>na Ƙwararru kyauta', hero_sub:'Ƙirƙiri takardu. Sarrafa ɗalibai, ma\'aikata, kuɗi, halartar, ɗakin karatu, kayan aiki, lokuta da baƙi. Duk kyauta.' },
  ig: { hero_title:'Ikpo <em>Nlekota Ulo Akwukwo</em><br/>n\'efu', hero_sub:'Mepụta akwụkwọ. Jikwaa ụmụ akwụkwọ, ndị ọrụ, ụgwọ akwụkwọ, ọbịbịa, ọbá akwụkwọ, ngwa, oge, na ndị ọbịa. Niile n\'efu.' },
  fr: { hero_title:'Plateforme <em>Professionnelle</em><br/>de Gestion Scolaire Gratuite', hero_sub:'Générez des documents. Gérez élèves, personnel, frais, présence, bibliothèque, inventaire, emplois du temps, discipline & visiteurs. Tout gratuit, hors-ligne.' },
};
function setLanguage(lang){
  SDF.state.language = lang; localStorage.setItem('sdf_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if(I18N[lang] && I18N[lang][k]) el.innerHTML = I18N[lang][k]; });
  SDF.toast('Language: ' + lang);
}
function initLanguage(){ const s=document.getElementById('lang-select'); if(s){ s.value = SDF.state.language; setLanguage(SDF.state.language); } }
window.setLanguage = setLanguage; window.initLanguage = initLanguage;

/* ════════ PIN LOCK ════════ */
function initPinLock(){
  const pin = localStorage.getItem('sdf_pin');
  if(pin && sessionStorage.getItem('sdf_unlocked') !== '1') showPinLock(pin);
}
function toggleLock(){
  let pin = localStorage.getItem('sdf_pin');
  if(!pin){
    const v = prompt('Set a 4-digit PIN for this device (or leave blank to skip):');
    if(!v) return;
    if(!/^\d{4}$/.test(v)){ SDF.toast('PIN must be exactly 4 digits','error'); return; }
    localStorage.setItem('sdf_pin', v); SDF.toast('PIN set. App will lock.');
    pin = v;
  }
  sessionStorage.removeItem('sdf_unlocked'); showPinLock(pin);
}
function showPinLock(realPin){
  if(document.querySelector('.pin-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'pin-overlay';
  ov.innerHTML = `<h2>🔒 ${document.getElementById('school-name')?.value || 'SchoolDocForge'}</h2>
    <p>Enter your 4-digit PIN to unlock</p>
    <div class="pin-dots"><span class="pin-dot"></span><span class="pin-dot"></span><span class="pin-dot"></span><span class="pin-dot"></span></div>
    <div class="pin-pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button class="pin-key" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="pin-error" id="pin-err"></div>
    <button class="btn-sm" style="margin-top:1rem;background:transparent;color:#aaa;border:1px solid #555;" onclick="if(confirm('Reset PIN? This will remove the lock.')){localStorage.removeItem('sdf_pin');location.reload();}">Reset PIN</button>`;
  document.body.appendChild(ov);
  let entered = '';
  ov.querySelectorAll('.pin-key').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.k;
    if(k === '⌫'){ entered = entered.slice(0,-1); }
    else if(k === 'OK'){
      if(entered === realPin){ sessionStorage.setItem('sdf_unlocked','1'); ov.remove(); SDF.toast('Unlocked'); audit('unlock','pin'); return; }
      else { document.getElementById('pin-err').textContent = 'Wrong PIN. Try again.'; entered = ''; audit('fail','pin'); }
    }
    else if(entered.length < 4) entered += k;
    ov.querySelectorAll('.pin-dot').forEach((d,i)=>d.classList.toggle('filled', i < entered.length));
  }));
}
window.toggleLock = toggleLock;
