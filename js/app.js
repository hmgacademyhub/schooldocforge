/* ═══════════════════════════════════════════════════════════════
   SchoolDocForge v6 ENTERPRISE — Core Engine (app.js)
   Original logic by Adewale Samson Adeagbo (v1–v5)
   Enterprise Enhancement Layer (v6) for: branch-aware storage,
     audit hooks, i18n, multi-module integration.
   100% client-side. No backend. No AI API. MIT.
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── GLOBAL STATE ── */
const APP_VERSION = '7.1.0-enterprise-plus-hmg';
const SDF = {
  state: {
    currentStep: 1,
    currentDocType: null,
    currentDocHTML: '',
    currentDocName: '',
    activeProfile: 'default',
    activeBranch: localStorage.getItem('sdf_active_branch') || 'main',
    language: localStorage.getItem('sdf_lang') || 'en',
    zoom: 1,
    bulkData: { 'id-card': [], 'certificate': [], 'fee-receipt': [] },
    logo: '',
  },
  field: id => document.getElementById(id),
  toast: (msg, type='info') => {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(SDF._tt);
    SDF._tt = setTimeout(()=>{ t.className = 'toast'; }, 2800);
  },
};
window.SDF = SDF;

/* ── BRANCH-AWARE STORAGE ── */
function bkey(k){ return `sdf_${SDF.state.activeBranch}_${k}`; }
function lsGet(k, fallback){ try{ const v = localStorage.getItem(bkey(k)); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } }
function lsSet(k, v){ try{ localStorage.setItem(bkey(k), JSON.stringify(v)); }catch(e){ SDF.toast('Storage full','error'); } }
window.bkey = bkey; window.lsGet = lsGet; window.lsSet = lsSet;

/* ── AUDIT HOOK (real impl in enterprise.js) ── */
function audit(action, entity, details){
  try{
    const log = JSON.parse(localStorage.getItem('sdf_audit') || '[]');
    log.unshift({ t: Date.now(), action, entity, details: details||'', branch: SDF.state.activeBranch });
    if(log.length > 500) log.length = 500;
    localStorage.setItem('sdf_audit', JSON.stringify(log));
  }catch(e){}
}
window.audit = audit;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initProfiles();
  initBranches();
  initStep1Listeners();
  loadActiveProfile();
  renderHistory();
  renderTemplates();
  renderStudentTable();
  renderStaffTable();
  refreshFeeTable();
  populateAttClass();
  refreshStats();
  initKeyboard();
  initScroll();
  initBanner();
  initDarkMode();
  // Mobile nav handlers
  const ham = document.getElementById('hamburger');
  if(ham){ ham.addEventListener('click', ()=>{ document.getElementById('mobile-nav').classList.add('open'); document.getElementById('mobile-nav-overlay').classList.add('open'); }); }
});

/* ── DARK MODE ── */
function initDarkMode(){
  if(localStorage.getItem('sdf_dark')==='1' || localStorage.getItem('sdf_theme')==='dark') document.body.classList.add('dark','dark-mode');
}
function toggleDarkMode(){
  document.body.classList.toggle('dark');
  document.body.classList.toggle('dark-mode', document.body.classList.contains('dark'));
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('sdf_dark', isDark?'1':'0');
  const btn = document.getElementById('dark-mode-toggle');
  if(btn) btn.textContent = isDark ? '☀️' : '🌙';
}
window.toggleDarkMode = toggleDarkMode;

/* ── KEYBOARD ── */
function initKeyboard(){
  document.addEventListener('keydown', e => {
    if(e.altKey){
      switch(e.key.toLowerCase()){
        case 'd': toggleDarkMode(); e.preventDefault(); break;
        case 'k': toggleKbdHelp(); e.preventDefault(); break;
        case 'g': document.getElementById('generator').scrollIntoView({behavior:'smooth'}); e.preventDefault(); break;
        case 's': saveCurrentProfile(); e.preventDefault(); break;
        case 'p': window.print(); e.preventDefault(); break;
        case 'q': addToQueue(); e.preventDefault(); break;
        case 't': saveTemplate(); e.preventDefault(); break;
        case 'b': fullBackup(); e.preventDefault(); break;
        case 'l': if(window.toggleLock){toggleLock();e.preventDefault();} break;
        case '1': case '2': case '3': case '4': goToStep(parseInt(e.key)); e.preventDefault(); break;
      }
    } else if(e.key==='Escape'){
      closeModal(); closeMobileNav();
      const k=document.getElementById('kbd-panel'); if(k) k.style.display='none';
    }
  });
}
function toggleKbdHelp(){ const p=document.getElementById('kbd-panel'); if(p) p.style.display = p.style.display==='none'?'block':'none'; }
window.toggleKbdHelp = toggleKbdHelp;

/* ── SCROLL / PROGRESS BAR ── */
function initScroll(){
  window.addEventListener('scroll', () => {
    const top = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(100, (top / h) * 100);
    const bar = document.getElementById('progress-bar-fill'); if(bar) bar.style.width = pct + '%';
    const btt = document.getElementById('back-to-top'); if(btt) btt.classList.toggle('show', top > 600);
  });
}

/* ── MOBILE NAV ── */
function closeMobileNav(){
  document.getElementById('mobile-nav')?.classList.remove('open');
  document.getElementById('mobile-nav-overlay')?.classList.remove('open','show');
}
window.closeMobileNav = closeMobileNav;

/* ── ANNOUNCEMENT BANNER ── */
function initBanner(){
  const txt = localStorage.getItem('sdf_banner');
  if(txt && localStorage.getItem('sdf_banner_dismissed') !== txt){
    document.getElementById('announcement-banner').style.display='block';
    document.getElementById('announcement-text').textContent = txt;
  }
}
function setBanner(){
  const v = document.getElementById('announce-input').value.trim();
  if(!v) return;
  localStorage.setItem('sdf_banner', v);
  localStorage.removeItem('sdf_banner_dismissed');
  initBanner();
  SDF.toast('Banner set');
}
function clearBanner(){
  localStorage.removeItem('sdf_banner');
  document.getElementById('announcement-banner').style.display='none';
  SDF.toast('Banner cleared');
}
function dismissBanner(){
  const txt = localStorage.getItem('sdf_banner');
  if(txt) localStorage.setItem('sdf_banner_dismissed', txt);
  document.getElementById('announcement-banner').style.display='none';
}
window.setBanner=setBanner; window.clearBanner=clearBanner; window.dismissBanner=dismissBanner;

/* ── BRANCH MANAGEMENT ── */
function initBranches(){
  const branches = JSON.parse(localStorage.getItem('sdf_branches') || '[{"id":"main","name":"Main Campus"}]');
  const sel = document.getElementById('branch-select');
  if(!sel) return;
  sel.innerHTML = branches.map(b=>`<option value="${b.id}" ${b.id===SDF.state.activeBranch?'selected':''}>${escapeHTML(b.name)}</option>`).join('');
  const tag = document.getElementById('active-branch-tag');
  if(tag){ const cur = branches.find(b=>b.id===SDF.state.activeBranch) || branches[0]; tag.textContent = (cur.name||'MAIN').toUpperCase().slice(0,12); }
}
function switchBranch(id){
  SDF.state.activeBranch = id;
  localStorage.setItem('sdf_active_branch', id);
  audit('switch','branch', id);
  // Reload everything for new branch
  initProfiles(); loadActiveProfile();
  renderStudentTable(); renderStaffTable(); refreshFeeTable(); populateAttClass();
  renderHistory(); renderTemplates(); refreshStats();
  if(window.renderBooks) renderBooks();
  if(window.renderAssets) renderAssets();
  if(window.renderDiscipline) renderDiscipline();
  if(window.renderVisitors) renderVisitors();
  if(window.renderQuestions) renderQuestions();
  initBranches();
  SDF.toast('Branch switched: ' + id);
}
function addBranch(){
  const name = prompt('New branch name (e.g. "Ikeja Annex"):');
  if(!name) return;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,30);
  const branches = JSON.parse(localStorage.getItem('sdf_branches') || '[{"id":"main","name":"Main Campus"}]');
  if(branches.find(b=>b.id===id)){ SDF.toast('Branch already exists','error'); return; }
  branches.push({id,name});
  localStorage.setItem('sdf_branches', JSON.stringify(branches));
  audit('create','branch', name);
  initBranches();
  SDF.toast('Branch added: ' + name);
}
window.switchBranch=switchBranch; window.addBranch=addBranch;

/* ── PROFILES ── */
function initProfiles(){
  const profiles = lsGet('profiles', {});
  const sel = document.getElementById('saved-profiles-select');
  if(!sel) return;
  sel.innerHTML = '<option value="">— Select —</option>';
  Object.keys(profiles).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = k;
    sel.appendChild(opt);
  });
  const active = lsGet('active_profile', '');
  if(active && profiles[active]) sel.value = active;
}
function profileFromForm(){
  return {
    name: SDF.field('school-name').value, motto: SDF.field('school-motto').value, type: SDF.field('school-type').value,
    address: SDF.field('school-address').value, city: SDF.field('school-city').value, state: SDF.field('school-state').value,
    phone: SDF.field('school-phone').value, phone2: SDF.field('school-phone2').value, email: SDF.field('school-email').value,
    website: SDF.field('school-website').value, regNo: SDF.field('school-reg-no').value,
    principal: SDF.field('school-principal').value, vicePrincipal: SDF.field('school-vice-principal').value,
    founded: SDF.field('school-founded').value, session: SDF.field('school-session').value, term: SDF.field('school-term').value,
    bankName: SDF.field('school-bank-name').value, accountName: SDF.field('school-account-name').value, accountNo: SDF.field('school-account-no').value,
    primaryColor: SDF.field('school-primary-color').value, accentColor: SDF.field('school-accent-color').value,
    docFont: SDF.field('school-doc-font').value,
    logo: SDF.state.logo || lsGet('school_logo','')
  };
}
function applyProfileToForm(p){
  const set = (id, v) => { const el = SDF.field(id); if(el) el.value = v || ''; };
  set('school-name', p.name); set('school-motto', p.motto); set('school-type', p.type);
  set('school-address', p.address); set('school-city', p.city); set('school-state', p.state);
  set('school-phone', p.phone); set('school-phone2', p.phone2); set('school-email', p.email);
  set('school-website', p.website); set('school-reg-no', p.regNo);
  set('school-principal', p.principal); set('school-vice-principal', p.vicePrincipal);
  set('school-founded', p.founded); set('school-session', p.session); set('school-term', p.term);
  set('school-bank-name', p.bankName); set('school-account-name', p.accountName); set('school-account-no', p.accountNo);
  set('school-primary-color', p.primaryColor || '#1a2e4a'); set('school-accent-color', p.accentColor || '#c9921a');
  set('school-doc-font', p.docFont || 'Georgia, serif');
  if(p.logo){ SDF.state.logo = p.logo; const pv = document.getElementById('logo-preview'); if(pv) pv.innerHTML = `<img src="${p.logo}" style="max-height:80px;margin-top:.5rem;border:1px solid #ccc;border-radius:6px;"/>`; lsSet('school_logo', p.logo); }
}
function saveCurrentProfile(){
  const name = SDF.field('school-name').value.trim();
  if(!name){ SDF.toast('Enter School Name first','error'); return; }
  const profiles = lsGet('profiles', {});
  if(Object.keys(profiles).length >= 10 && !profiles[name]){ SDF.toast('Max 10 profiles per branch','error'); return; }
  profiles[name] = profileFromForm();
  lsSet('profiles', profiles); lsSet('active_profile', name);
  audit('save','profile', name);
  initProfiles();
  SDF.field('saved-profiles-select').value = name;
  SDF.toast('Profile saved: ' + name, 'success');
  refreshStats();
}
function loadSavedProfile(name){
  if(!name) return;
  const profiles = lsGet('profiles', {});
  if(profiles[name]){ applyProfileToForm(profiles[name]); lsSet('active_profile', name); SDF.toast('Loaded: ' + name); }
}
function loadActiveProfile(){
  const active = lsGet('active_profile', '');
  if(active){ const profiles = lsGet('profiles', {}); if(profiles[active]) applyProfileToForm(profiles[active]); }
}
function duplicateProfile(){
  const name = SDF.field('school-name').value.trim();
  if(!name){ SDF.toast('Nothing to duplicate','error'); return; }
  const copy = prompt('New profile name:', name + ' (copy)');
  if(!copy) return;
  const profiles = lsGet('profiles', {});
  profiles[copy] = { ...profileFromForm(), name: copy };
  lsSet('profiles', profiles); initProfiles();
  SDF.toast('Duplicated as ' + copy);
}
function deleteCurrentProfile(){
  const sel = SDF.field('saved-profiles-select');
  const name = sel.value;
  if(!name){ SDF.toast('Pick a profile','error'); return; }
  if(!confirm('Delete profile "' + name + '"?')) return;
  const profiles = lsGet('profiles', {});
  delete profiles[name];
  lsSet('profiles', profiles); initProfiles();
  audit('delete','profile', name);
  SDF.toast('Deleted');
}
function exportProfile(){
  const blob = new Blob([JSON.stringify(profileFromForm(),null,2)],{type:'application/json'});
  saveAs(blob, (SDF.field('school-name').value || 'profile') + '.json');
}
function importProfile(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev => { try{ applyProfileToForm(JSON.parse(ev.target.result)); SDF.toast('Imported'); }catch{ SDF.toast('Bad JSON','error'); } };
  r.readAsText(f); e.target.value='';
}
function handleLogoUpload(e){
  const f = e.target.files[0]; if(!f) return;
  if(f.size > 2*1024*1024){ SDF.toast('Logo too large (max 2MB)','error'); return; }
  const r = new FileReader();
  r.onload = ev => { SDF.state.logo = ev.target.result; lsSet('school_logo', ev.target.result); document.getElementById('logo-preview').innerHTML = `<img src="${ev.target.result}" style="max-height:80px;margin-top:.5rem;border:1px solid #ccc;border-radius:6px;"/>`; };
  r.readAsDataURL(f);
}
window.saveCurrentProfile=saveCurrentProfile; window.loadSavedProfile=loadSavedProfile; window.duplicateProfile=duplicateProfile;
window.deleteCurrentProfile=deleteCurrentProfile; window.exportProfile=exportProfile; window.importProfile=importProfile;
window.handleLogoUpload=handleLogoUpload;

function initStep1Listeners(){
  const logoSaved = lsGet('school_logo','');
  if(logoSaved){ SDF.state.logo = logoSaved; const pv = document.getElementById('logo-preview'); if(pv) pv.innerHTML = `<img src="${logoSaved}" style="max-height:80px;margin-top:.5rem;border:1px solid #ccc;border-radius:6px;"/>`; }
}

/* ── FULL BACKUP / RESTORE ── */
function collectAllData(){
  const all = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i); if(k && k.startsWith('sdf_')) all[k] = localStorage.getItem(k);
  }
  return { version: APP_VERSION, exportedAt: new Date().toISOString(), data: all };
}
async function fullBackup(){
  const dump = collectAllData();
  const json = JSON.stringify(dump,null,2);
  const encrypt = document.getElementById('encrypt-backup')?.checked;
  if(encrypt){
    const pw = prompt('Set a password for this encrypted backup:'); if(!pw) return;
    try{
      const enc = await encryptText(json, pw);
      const blob = new Blob([enc], {type:'application/octet-stream'});
      saveAs(blob, `sdf-backup-${Date.now()}.enc`);
      audit('export','backup','encrypted');
      SDF.toast('Encrypted backup saved');
    }catch(e){ SDF.toast('Encryption failed','error'); }
    return;
  }
  const blob = new Blob([json],{type:'application/json'});
  saveAs(blob, `sdf-backup-${Date.now()}.json`);
  audit('export','backup','plain');
  SDF.toast('Backup downloaded');
}
async function fullRestore(e){
  const f = e.target.files[0]; if(!f) return;
  if(!confirm('Restoring will overwrite existing data. Continue?')){ e.target.value=''; return; }
  const r = new FileReader();
  r.onload = async ev => {
    let payload = ev.target.result;
    if(f.name.endsWith('.enc')){
      const pw = prompt('Backup password:'); if(!pw) return;
      try{ payload = await decryptText(payload, pw); }catch{ SDF.toast('Wrong password / corrupt file','error'); return; }
    }
    try{
      const obj = JSON.parse(payload);
      const data = obj.data || obj;
      Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
      audit('import','backup', f.name);
      SDF.toast('Restored. Reloading…','success');
      setTimeout(()=>location.reload(), 800);
    }catch{ SDF.toast('Bad backup file','error'); }
  };
  r.readAsText(f); e.target.value='';
}
window.fullBackup=fullBackup; window.fullRestore=fullRestore;

/* ── Web Crypto helpers ── */
async function deriveKey(pw, salt){
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations: 120000, hash:'SHA-256'}, keyMat, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
async function encryptText(text, pw){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(pw, salt);
  const ct   = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, new TextEncoder().encode(text));
  const buf  = new Uint8Array(salt.length+iv.length+ct.byteLength);
  buf.set(salt,0); buf.set(iv,salt.length); buf.set(new Uint8Array(ct), salt.length+iv.length);
  return btoa(String.fromCharCode(...buf));
}
async function decryptText(b64, pw){
  const buf  = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
  const salt = buf.slice(0,16), iv = buf.slice(16,28), ct = buf.slice(28);
  const key  = await deriveKey(pw, salt);
  const pt   = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
  return new TextDecoder().decode(pt);
}
window.encryptText = encryptText; window.decryptText = decryptText;

/* ── STEP NAV ── */
function goToStep(n){
  document.querySelectorAll('.gen-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('step-' + n)?.classList.add('active');
  document.querySelector(`.step-tab[data-step="${n}"]`)?.classList.add('active');
  SDF.state.currentStep = n;
  const h = document.querySelector('#step-' + n + ' .step-heading'); if(h) h.focus();
}
function selectDocType(t){
  SDF.state.currentDocType = t;
  document.querySelectorAll('.doc-type-card').forEach(c => c.classList.toggle('selected', c.dataset.type === t));
  const btn = document.getElementById('proceed-to-step3'); if(btn) btn.disabled = false;
}
function proceedToStep3(){
  if(!SDF.state.currentDocType){ SDF.toast('Pick a document type','error'); return; }
  goToStep(3);
  buildCustomiseFields();
  updateLivePreview();
}
function filterDocTypes(q){
  q = (q||'').toLowerCase();
  document.querySelectorAll('.doc-type-card').forEach(c => {
    const tags = (c.dataset.tags || '') + ' ' + c.textContent;
    c.style.display = tags.toLowerCase().includes(q) ? '' : 'none';
  });
}
window.goToStep=goToStep; window.selectDocType=selectDocType; window.proceedToStep3=proceedToStep3; window.filterDocTypes=filterDocTypes;

/* ── CUSTOMISE FIELDS BUILDER ── */
const DOC_FIELDS = {
  letterhead: [['date','Date','date'],['recipient','Recipient'],['subject','Subject'],['body','Body','textarea']],
  certificate: [['recipientName','Recipient Name'],['certType','Certificate Type','select',['Merit','Completion','Achievement','Excellence','Participation','Honour']],['awardDesc','Award Description','textarea'],['date','Date','date'],['signatory','Signatory Title']],
  banner: [['title','Title'],['subtitle','Subtitle'],['eventDate','Event Date','date'],['venue','Venue'],['details','Details','textarea']],
  'id-card': [['holderName','Full Name'],['holderClass','Class / Department'],['idNumber','ID Number'],['bloodGroup','Blood Group'],['guardianPhone','Guardian / Emergency Phone'],['qrText','QR Encoded Text (URL or ID)']],
  'report-card': [['studentName','Student Name'],['studentClass','Class'],['admNo','Admission No.'],['subjects','Subjects (one per line: Subject,CA,Exam)','textarea'],['teacherRemark','Teacher Remark','textarea'],['principalRemark','Principal Remark']],
  'official-letter': [['date','Date','date'],['recipient','Recipient'],['address','Address','textarea'],['subject','Subject'],['body','Body','textarea'],['signatory','Signatory Name'],['signatoryTitle','Signatory Title']],
  'timetable': [['title','Title'],['rows','Rows (Subject,Date,Time,Venue per line)','textarea']],
  'admission-form': [['session','Session'],['formNo','Form Number']],
  'fee-receipt': [['receiptNo','Receipt No.'],['studentName','Student Name'],['studentClass','Class'],['amount','Amount (₦)','number'],['purpose','Purpose'],['paymentMethod','Payment Method','select',['Cash','Bank Transfer','POS','Cheque']],['date','Date','date']],
  'newsletter': [['title','Title'],['edition','Edition'],['body','Articles','textarea']],
  'permission-slip': [['eventName','Event Name'],['eventDate','Date','date'],['venue','Venue'],['details','Details','textarea']],
  'academic-calendar': [['session','Session'],['events','Events (Date,Event per line)','textarea']],
  'staff-payslip': [['staffName','Staff Name'],['staffId','Staff ID'],['dept','Department'],['period','Period (e.g. Aug 2025)'],['basic','Basic Salary (₦)','number'],['allowances','Allowances (₦)','number'],['deductions','Deductions (₦)','number']],
  'transfer-letter': [['studentName','Student Name'],['admNo','Admission No.'],['classLeft','Class Left'],['reason','Reason','textarea'],['date','Date','date']],
  'lesson-note': [['subject','Subject'],['classLevel','Class'],['topic','Topic'],['date','Date','date'],['objectives','Objectives','textarea'],['materials','Materials'],['intro','Introduction','textarea'],['development','Development','textarea'],['conclusion','Conclusion','textarea']],
  'fee-voucher': [['studentName','Student Name'],['studentClass','Class'],['amount','Amount (₦)','number'],['dueDate','Due Date','date'],['purpose','Purpose']],
  'suspension-letter': [['studentName','Student Name'],['admNo','Admission No.'],['classLevel','Class'],['offence','Offence','textarea'],['startDate','Start Date','date'],['days','Days','number']],
  'clearance-form': [['studentName','Student Name'],['admNo','Admission No.'],['classLevel','Class'],['date','Date','date']],
  // v6
  'transcript': [['studentName','Student Name'],['admNo','Admission No.'],['terms','Term Records (Term,Subject,Score per line)','textarea']],
  'visitor-badge': [['visitorName','Visitor Name'],['purpose','Purpose'],['visiting','Visiting (Person)'],['date','Date','date'],['photo','Photo Initial']],
  'exam-paper': [['title','Paper Title'],['subject','Subject'],['classLevel','Class'],['duration','Duration (mins)','number'],['instructions','Instructions','textarea'],['questions','Questions (one per line)','textarea']],
  'library-card': [['borrowerName','Borrower'],['borrowerClass','Class / Dept'],['cardNo','Card No.'],['validUntil','Valid Until','date']],
  'asset-tag': [['assetName','Asset Name'],['tagNo','Tag No.'],['custodian','Custodian'],['acquired','Acquired On','date']],
  'parent-notice': [['studentName','Student'],['classLevel','Class'],['type','Type','select',['Merit','Caution','Suspension','Achievement','Reminder']],['body','Message','textarea'],['date','Date','date']],
  'continuous-assessment': [['studentClass','Class'],['subject','Subject'],['rows','Rows (Name,Test1,Test2,Assignment,Project per line)','textarea']],
  'class-timetable': [['classLevel','Class'],['rows','Rows (Day,Period,Subject,Teacher per line)','textarea']],
  'staff-id-card': [['holderName','Full Name'],['holderClass','Department / Position'],['idNumber','Staff ID'],['bloodGroup','Blood Group'],['guardianPhone','Next of Kin Phone'],['qrText','QR Text']],
  'inventory-report': [['title','Report Title'],['period','Period'],['summary','Summary','textarea']],
  'library-overdue': [['borrowerName','Borrower'],['bookTitle','Book Title'],['daysOverdue','Days Overdue','number'],['fine','Fine (₦)','number']],
};
function buildCustomiseFields(){
  const t = SDF.state.currentDocType;
  const fields = DOC_FIELDS[t] || [];
  const wrap = document.getElementById('customise-fields');
  wrap.innerHTML = '<div class="form-grid">' + fields.map(f => {
    const [id,label,type,opts] = f;
    if(type === 'textarea') return `<div class="form-group form-group-full"><label class="form-label">${label}</label><textarea class="form-input" id="cf-${id}" rows="4" oninput="updateLivePreview()"></textarea></div>`;
    if(type === 'select') return `<div class="form-group"><label class="form-label">${label}</label><select class="form-input" id="cf-${id}" onchange="updateLivePreview()">${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`;
    return `<div class="form-group"><label class="form-label">${label}</label><input class="form-input" type="${type||'text'}" id="cf-${id}" oninput="updateLivePreview()"/></div>`;
  }).join('') + '</div>';
  document.getElementById('customise-title').textContent = '✏️ ' + (document.querySelector(`.doc-type-card[data-type="${t}"] .doc-type-name`)?.textContent?.replace(/v6/,'').trim() || t);
}
window.buildCustomiseFields = buildCustomiseFields;

function readCustomiseValues(){
  const t = SDF.state.currentDocType; const fields = DOC_FIELDS[t] || [];
  const v = {};
  fields.forEach(f => { const el = document.getElementById('cf-' + f[0]); v[f[0]] = el ? el.value : ''; });
  return v;
}
let _lpTimer;
function updateLivePreview(){
  clearTimeout(_lpTimer);
  _lpTimer = setTimeout(()=>{
    const html = renderDocument(SDF.state.currentDocType, profileFromForm(), readCustomiseValues());
    const wrap = document.getElementById('live-preview-doc'); if(wrap) wrap.innerHTML = html;
  }, 300);
}
window.updateLivePreview = updateLivePreview;
function toggleLivePreview(){
  const wrap = document.getElementById('live-preview-wrap');
  if(!wrap) return;
  wrap.style.display = wrap.style.display === 'none' ? '' : 'none';
}
window.toggleLivePreview = toggleLivePreview;

/* ── WATERMARK ── */
function applyWMPreset(v){
  const c = document.getElementById('wm-custom'); if(!c) return;
  c.style.display = v === 'custom' ? '' : 'none';
  updateLivePreview();
}
function getWatermark(){
  const preset = document.getElementById('wm-preset')?.value;
  const txt = preset === 'custom' ? document.getElementById('wm-custom').value : preset;
  if(!txt) return null;
  return { text: txt, opacity: parseFloat(document.getElementById('wm-opacity').value||'.15'), color: document.getElementById('wm-color').value||'#888' };
}
window.applyWMPreset = applyWMPreset; window.getWatermark = getWatermark;

/* ── GENERATE & PREVIEW ── */
function generateAndPreview(){
  const html = renderDocument(SDF.state.currentDocType, profileFromForm(), readCustomiseValues());
  SDF.state.currentDocHTML = html;
  SDF.state.currentDocName = (SDF.state.currentDocType + '-' + Date.now());
  document.getElementById('doc-preview-container').innerHTML = html;
  goToStep(4);
  addToHistory();
  audit('generate','document', SDF.state.currentDocType);
  refreshStats();
  burstConfetti();
}
window.generateAndPreview = generateAndPreview;

/* ── DOWNLOADS ── */
async function snapshotPreview(){
  const node = document.getElementById('doc-preview-container').firstElementChild || document.getElementById('doc-preview-container');
  return await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
}
async function downloadPDF(){
  showLoading('Building PDF…');
  try{
    const canvas = await snapshotPreview();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'pt', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const img = canvas.toDataURL('image/png');
    const ratio = Math.min(w/canvas.width, h/canvas.height);
    pdf.addImage(img, 'PNG', (w-canvas.width*ratio)/2, 20, canvas.width*ratio, canvas.height*ratio);
    pdf.save(SDF.state.currentDocName + '.pdf');
    audit('download','pdf', SDF.state.currentDocType);
  }catch(e){ SDF.toast('PDF failed: ' + e.message,'error'); }
  hideLoading();
}
async function downloadPNG(){
  showLoading('Building PNG…');
  try{ const c = await snapshotPreview(); c.toBlob(b => saveAs(b, SDF.state.currentDocName + '.png')); audit('download','png', SDF.state.currentDocType); }
  catch(e){ SDF.toast('PNG failed','error'); }
  hideLoading();
}
async function downloadJPG(){
  showLoading('Building JPG…');
  try{ const c = await snapshotPreview(); c.toBlob(b => saveAs(b, SDF.state.currentDocName + '.jpg'), 'image/jpeg', 0.92); audit('download','jpg', SDF.state.currentDocType); }
  catch(e){ SDF.toast('JPG failed','error'); }
  hideLoading();
}
function zoomPreview(delta){
  SDF.state.zoom = Math.max(0.4, Math.min(2, SDF.state.zoom + delta));
  document.getElementById('doc-preview-container').style.transform = 'scale(' + SDF.state.zoom + ')';
  document.getElementById('zoom-level').textContent = Math.round(SDF.state.zoom * 100) + '%';
}
function resetZoom(){ SDF.state.zoom = 1; document.getElementById('doc-preview-container').style.transform = 'scale(1)'; document.getElementById('zoom-level').textContent = '100%'; }
function shareWhatsApp(){ const url = location.href; const msg = encodeURIComponent('Generated with SchoolDocForge: ' + url); window.open('https://wa.me/?text=' + msg, '_blank'); }
function copyDocLink(){ navigator.clipboard.writeText(location.href).then(()=>SDF.toast('Link copied')); }
window.downloadPDF=downloadPDF; window.downloadPNG=downloadPNG; window.downloadJPG=downloadJPG;
window.zoomPreview=zoomPreview; window.resetZoom=resetZoom; window.shareWhatsApp=shareWhatsApp; window.copyDocLink=copyDocLink;

/* ── HISTORY ── */
function addToHistory(){
  const arr = lsGet('history', []);
  arr.unshift({ t: Date.now(), type: SDF.state.currentDocType, name: SDF.state.currentDocName });
  if(arr.length > 200) arr.length = 200;
  lsSet('history', arr);
  renderHistory();
}
function renderHistory(){
  const arr = lsGet('history', []);
  const list = document.getElementById('history-list'); if(!list) return;
  if(!arr.length){ list.innerHTML = '<p class="history-empty">No documents yet.</p>'; return; }
  list.innerHTML = arr.map(h => `<div class="history-item"><strong>${h.type}</strong> <span style="color:#888;font-size:.8rem;">${new Date(h.t).toLocaleString()}</span></div>`).join('');
}
function filterHistory(){
  const q = document.getElementById('history-search').value.toLowerCase();
  const tf = document.getElementById('history-type-filter').value;
  const arr = lsGet('history', []).filter(h => (!tf || h.type === tf) && (h.type.toLowerCase().includes(q) || (h.name||'').toLowerCase().includes(q)));
  const list = document.getElementById('history-list');
  list.innerHTML = arr.length ? arr.map(h => `<div class="history-item"><strong>${h.type}</strong> <span style="color:#888;font-size:.8rem;">${new Date(h.t).toLocaleString()}</span></div>`).join('') : '<p class="history-empty">No matches.</p>';
}
function clearDocHistory(){ if(confirm('Clear history?')){ lsSet('history', []); renderHistory(); audit('clear','history'); } }
window.filterHistory=filterHistory; window.clearDocHistory=clearDocHistory;

/* ── TEMPLATES ── */
function saveTemplate(){
  const name = (document.getElementById('template-name-input').value || prompt('Template name?') || '').trim();
  if(!name) return;
  const templates = lsGet('templates', {});
  templates[name] = { type: SDF.state.currentDocType, fields: readCustomiseValues(), watermark: getWatermark() };
  lsSet('templates', templates); renderTemplates();
  audit('save','template', name);
  SDF.toast('Template saved');
}
function loadTemplate(name){
  if(!name) return; const tpl = lsGet('templates', {})[name]; if(!tpl) return;
  selectDocType(tpl.type); proceedToStep3();
  setTimeout(()=>{ Object.keys(tpl.fields).forEach(k => { const el = document.getElementById('cf-' + k); if(el) el.value = tpl.fields[k]; }); updateLivePreview(); }, 100);
}
function deleteTemplate(){
  const name = document.getElementById('template-select').value; if(!name) return;
  if(!confirm('Delete template "' + name + '"?')) return;
  const t = lsGet('templates', {}); delete t[name]; lsSet('templates', t); renderTemplates();
  audit('delete','template', name);
}
function renderTemplates(){
  const templates = lsGet('templates', {});
  const sel = document.getElementById('template-select');
  if(sel){ sel.innerHTML = '<option value="">— Load template —</option>' + Object.keys(templates).map(k=>`<option>${escapeHTML(k)}</option>`).join(''); }
  const list = document.getElementById('tgallery-list');
  if(list){
    const keys = Object.keys(templates);
    list.innerHTML = keys.length ? keys.map(k => `<div class="tgallery-card"><h4>${escapeHTML(k)}</h4><p>Type: ${templates[k].type}</p><div style="display:flex;gap:.4rem;"><button class="btn-sm" onclick="loadTemplate('${k.replace(/'/g,"\\'")}')">Load</button><button class="btn-sm btn-danger" onclick="(function(){if(confirm('Delete?')){const t=lsGet('templates',{});delete t['${k.replace(/'/g,"\\'")}'];lsSet('templates',t);renderTemplates();}})()">Delete</button></div></div>`).join('') : '<p class="history-empty">No templates saved yet.</p>';
  }
  refreshStats();
}
function filterTemplates(q){
  const list = document.getElementById('tgallery-list');
  if(!list) return;
  q = (q||'').toLowerCase();
  Array.from(list.children).forEach(c => { c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'; });
}
function clearAllTemplates(){ if(confirm('Clear ALL templates?')){ lsSet('templates', {}); renderTemplates(); audit('clear','templates'); } }
function exportAllTemplates(){ const blob = new Blob([JSON.stringify(lsGet('templates',{}),null,2)],{type:'application/json'}); saveAs(blob,'templates.json'); }
function importTemplates(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev => { try{ const obj = JSON.parse(ev.target.result); const cur = lsGet('templates',{}); lsSet('templates', { ...cur, ...obj }); renderTemplates(); SDF.toast('Templates imported'); }catch{ SDF.toast('Bad JSON','error'); } };
  r.readAsText(f); e.target.value='';
}
window.saveTemplate=saveTemplate; window.loadTemplate=loadTemplate; window.deleteTemplate=deleteTemplate;
window.filterTemplates=filterTemplates; window.clearAllTemplates=clearAllTemplates; window.exportAllTemplates=exportAllTemplates; window.importTemplates=importTemplates;

/* ── PRINT QUEUE ── */
function addToQueue(){
  if(!SDF.state.currentDocHTML){ SDF.toast('Generate a document first','error'); return; }
  const q = lsGet('pqueue', []);
  q.push({ name: SDF.state.currentDocName, type: SDF.state.currentDocType, html: SDF.state.currentDocHTML });
  lsSet('pqueue', q); renderQueue();
  SDF.toast('Added to queue');
}
function renderQueue(){
  const q = lsGet('pqueue', []);
  const list = document.getElementById('print-queue-list'); if(!list) return;
  list.innerHTML = q.length ? q.map((d,i) => `<div class="pq-item"><span>${i+1}. ${d.type} — ${d.name}</span><button class="btn-sm btn-danger" onclick="removeFromQueue(${i})">✕</button></div>`).join('') : '<p class="history-empty">No documents queued.</p>';
  document.getElementById('pq-print-all-btn').disabled = q.length === 0;
}
function removeFromQueue(i){ const q = lsGet('pqueue',[]); q.splice(i,1); lsSet('pqueue', q); renderQueue(); }
function clearQueue(){ if(confirm('Clear queue?')){ lsSet('pqueue',[]); renderQueue(); } }
function printAllQueued(){
  const q = lsGet('pqueue', []); if(!q.length) return;
  const w = window.open('','_blank');
  w.document.write('<html><head><title>Print Queue</title><style>.pq-page{page-break-after:always;}</style></head><body>' + q.map(d => '<div class="pq-page">' + d.html + '</div>').join('') + '</body></html>');
  w.document.close(); setTimeout(()=>w.print(), 500);
}
window.addToQueue=addToQueue; window.removeFromQueue=removeFromQueue; window.clearQueue=clearQueue; window.printAllQueued=printAllQueued;

/* ── STUDENT RECORDS ── */
function showStudentModal(s){
  openModal('Add Student', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Full Name *</label><input id="sm-name" class="form-input" value="${s?.name||''}"/></div>
    <div class="form-group"><label class="form-label">Class</label><input id="sm-class" class="form-input" value="${s?.class||''}"/></div>
    <div class="form-group"><label class="form-label">Adm No.</label><input id="sm-adm" class="form-input" value="${s?.admNo||''}"/></div>
    <div class="form-group"><label class="form-label">Gender</label><select id="sm-gender" class="form-input"><option value="">—</option><option ${s?.gender==='Male'?'selected':''}>Male</option><option ${s?.gender==='Female'?'selected':''}>Female</option></select></div>
    <div class="form-group"><label class="form-label">DOB</label><input id="sm-dob" type="date" class="form-input" value="${s?.dob||''}"/></div>
    <div class="form-group"><label class="form-label">Phone</label><input id="sm-phone" class="form-input" value="${s?.phone||''}"/></div>
    <div class="form-group"><label class="form-label">Guardian</label><input id="sm-guardian" class="form-input" value="${s?.guardian||''}"/></div>
    <div class="form-group"><label class="form-label">Guardian Phone</label><input id="sm-gphone" class="form-input" value="${s?.gphone||''}"/></div>
    <div class="form-group form-group-full"><label class="form-label">Address</label><input id="sm-addr" class="form-input" value="${s?.addr||''}"/></div>
    <div class="form-group"><label class="form-label">Total Fees (₦)</label><input id="sm-fees" type="number" class="form-input" value="${s?.fees||0}"/></div>
    <div class="form-group"><label class="form-label">Paid (₦)</label><input id="sm-paid" type="number" class="form-input" value="${s?.paid||0}"/></div>
  </div>`, ()=>{
    const data = {
      id: s?.id || ('s_' + Date.now()),
      name: SDF.field('sm-name').value.trim(), class: SDF.field('sm-class').value, admNo: SDF.field('sm-adm').value,
      gender: SDF.field('sm-gender').value, dob: SDF.field('sm-dob').value, phone: SDF.field('sm-phone').value,
      guardian: SDF.field('sm-guardian').value, gphone: SDF.field('sm-gphone').value, addr: SDF.field('sm-addr').value,
      fees: +SDF.field('sm-fees').value || 0, paid: +SDF.field('sm-paid').value || 0
    };
    if(!data.name){ SDF.toast('Name required','error'); return false; }
    const list = lsGet('students', []);
    const idx = list.findIndex(x => x.id === data.id);
    if(idx >= 0) list[idx] = data; else list.push(data);
    lsSet('students', list); renderStudentTable(); refreshFeeTable(); populateAttClass();
    audit(idx>=0?'update':'create','student', data.name);
    refreshStats();
    SDF.toast('Saved');
    return true;
  });
}
function renderStudentTable(){
  const list = lsGet('students', []);
  const q = (document.getElementById('student-search')?.value||'').toLowerCase();
  const tbody = document.getElementById('students-tbody'); if(!tbody) return;
  const filtered = q ? list.filter(s => Object.values(s).join(' ').toLowerCase().includes(q)) : list;
  tbody.innerHTML = filtered.length ? filtered.map(s => `<tr>
    <td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.class||'')}</td><td>${escapeHTML(s.admNo||'')}</td>
    <td>${escapeHTML(s.gender||'')}</td><td>${escapeHTML(s.phone||'')}</td>
    <td>₦${((s.fees||0)-(s.paid||0)).toLocaleString()}</td>
    <td><button class="btn-sm" onclick='editStudent("${s.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteStudent("${s.id}")'>🗑</button></td>
  </tr>`).join('') : '<tr><td colspan="7" class="empty-table">No students</td></tr>';
}
function editStudent(id){ const s = lsGet('students',[]).find(x=>x.id===id); if(s) showStudentModal(s); }
function deleteStudent(id){
  if(!confirm('Delete student?')) return;
  const list = lsGet('students',[]).filter(s => s.id !== id);
  lsSet('students', list); renderStudentTable(); refreshFeeTable();
  audit('delete','student', id); refreshStats();
}
function filterStudentTable(){ renderStudentTable(); }
function exportStudentCSV(){
  const list = lsGet('students',[]);
  if(!list.length){ SDF.toast('No students','error'); return; }
  const csv = Papa.unparse(list); saveAs(new Blob([csv],{type:'text/csv'}), 'students.csv');
}
function downloadStudentCSVTemplate(){
  const csv = Papa.unparse([{id:'',name:'Jane Doe',class:'JSS1',admNo:'001',gender:'Female',dob:'2012-05-01',phone:'',guardian:'Mr. Doe',gphone:'08012345678',addr:'',fees:50000,paid:0}]);
  saveAs(new Blob([csv],{type:'text/csv'}), 'students-template.csv');
}
function importStudentCSV(e){
  const f = e.target.files[0]; if(!f) return;
  Papa.parse(f, { header: true, skipEmptyLines: true, complete: res => {
    const cur = lsGet('students', []);
    const incoming = res.data.map(r => ({ ...r, id: r.id || ('s_' + Date.now() + Math.random()), fees: +r.fees||0, paid: +r.paid||0 }));
    lsSet('students', cur.concat(incoming)); renderStudentTable(); refreshFeeTable(); populateAttClass();
    SDF.toast('Imported ' + incoming.length); audit('import','students', incoming.length); refreshStats();
  }});
  e.target.value='';
}
function promoteAllStudents(){
  if(!confirm('Promote ALL students to next class (e.g. JSS1→JSS2)?')) return;
  const next = {'KG1':'KG2','KG2':'Nursery 1','Nursery 1':'Nursery 2','Nursery 2':'Primary 1','Primary 1':'Primary 2','Primary 2':'Primary 3','Primary 3':'Primary 4','Primary 4':'Primary 5','Primary 5':'Primary 6','Primary 6':'JSS1','JSS1':'JSS2','JSS2':'JSS3','JSS3':'SSS1','SSS1':'SSS2','SSS2':'SSS3','SSS3':'Graduated'};
  const list = lsGet('students',[]).map(s => ({ ...s, class: next[s.class] || s.class }));
  lsSet('students', list); renderStudentTable(); populateAttClass();
  audit('promote','students','all'); SDF.toast('Promoted');
}
function batchFromStudents(){
  const list = lsGet('students',[]); if(!list.length){ SDF.toast('No students','error'); return; }
  openModal('Batch Generate', `<label class="form-label">Document type</label><select id="bf-type" class="form-input"><option value="id-card">ID Card</option><option value="report-card">Report Card</option><option value="fee-receipt">Fee Receipt</option><option value="library-card">Library Card</option></select><p style="margin-top:.5rem;font-size:.85rem;color:#666;">Will create ${list.length} PDFs in a ZIP.</p>`, async ()=>{
    const type = document.getElementById('bf-type').value;
    closeModal(); showLoading('Batch generating…');
    const zip = new JSZip();
    for(let i=0;i<list.length;i++){
      const s = list[i];
      const fields = { holderName: s.name, holderClass: s.class, idNumber: s.admNo, guardianPhone: s.gphone, qrText: s.admNo, studentName: s.name, studentClass: s.class, admNo: s.admNo, borrowerName: s.name, borrowerClass: s.class, cardNo: s.admNo };
      const html = renderDocument(type, profileFromForm(), fields);
      const div = document.createElement('div'); div.style.cssText='position:absolute;left:-10000px;top:0;'; div.innerHTML = html; document.body.appendChild(div);
      try{ const c = await html2canvas(div.firstElementChild || div, {scale:2,backgroundColor:'#fff'}); const blob = await new Promise(r => c.toBlob(r,'image/png')); zip.file((s.name||'doc') + '_' + i + '.png', blob); }catch(e){}
      document.body.removeChild(div);
      document.getElementById('loading-text').textContent = `Batch ${i+1}/${list.length}…`;
    }
    const z = await zip.generateAsync({type:'blob'}); saveAs(z, 'batch-' + type + '.zip');
    hideLoading(); audit('batch','students', list.length); SDF.toast('Batch ready');
    return true;
  });
}
window.showStudentModal=showStudentModal; window.editStudent=editStudent; window.deleteStudent=deleteStudent;
window.filterStudentTable=filterStudentTable; window.exportStudentCSV=exportStudentCSV; window.downloadStudentCSVTemplate=downloadStudentCSVTemplate;
window.importStudentCSV=importStudentCSV; window.promoteAllStudents=promoteAllStudents; window.batchFromStudents=batchFromStudents;

/* ── STAFF RECORDS ── */
function showStaffModal(st){
  openModal('Add Staff', `<div class="form-grid">
    <div class="form-group"><label class="form-label">Full Name *</label><input id="st-name" class="form-input" value="${st?.name||''}"/></div>
    <div class="form-group"><label class="form-label">Position</label><input id="st-pos" class="form-input" value="${st?.position||''}"/></div>
    <div class="form-group"><label class="form-label">Department</label><input id="st-dept" class="form-input" value="${st?.dept||''}"/></div>
    <div class="form-group"><label class="form-label">Phone</label><input id="st-phone" class="form-input" value="${st?.phone||''}"/></div>
    <div class="form-group"><label class="form-label">Email</label><input id="st-email" class="form-input" value="${st?.email||''}"/></div>
    <div class="form-group"><label class="form-label">DOB</label><input id="st-dob" type="date" class="form-input" value="${st?.dob||''}"/></div>
    <div class="form-group"><label class="form-label">Salary (₦)</label><input id="st-sal" type="number" class="form-input" value="${st?.salary||0}"/></div>
    <div class="form-group"><label class="form-label">Status</label><select id="st-status" class="form-input"><option ${st?.status==='Active'?'selected':''}>Active</option><option ${st?.status==='On Leave'?'selected':''}>On Leave</option><option ${st?.status==='Inactive'?'selected':''}>Inactive</option></select></div>
  </div>`, ()=>{
    const data = { id: st?.id || ('t_'+Date.now()), name: SDF.field('st-name').value.trim(), position: SDF.field('st-pos').value, dept: SDF.field('st-dept').value, phone: SDF.field('st-phone').value, email: SDF.field('st-email').value, dob: SDF.field('st-dob').value, salary:+SDF.field('st-sal').value||0, status: SDF.field('st-status').value };
    if(!data.name){ SDF.toast('Name required','error'); return false; }
    const list = lsGet('staff', []); const idx = list.findIndex(x=>x.id===data.id);
    if(idx>=0) list[idx]=data; else list.push(data);
    lsSet('staff', list); renderStaffTable(); audit(idx>=0?'update':'create','staff', data.name); SDF.toast('Saved');
    return true;
  });
}
function renderStaffTable(){
  const list = lsGet('staff', []);
  const q = (document.getElementById('staff-search')?.value||'').toLowerCase();
  const tbody = document.getElementById('staff-tbody'); if(!tbody) return;
  const f = q ? list.filter(s => Object.values(s).join(' ').toLowerCase().includes(q)) : list;
  tbody.innerHTML = f.length ? f.map(s => `<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.position||'')}</td><td>${escapeHTML(s.dept||'')}</td><td>${escapeHTML(s.phone||'')}</td><td>₦${(s.salary||0).toLocaleString()}</td><td>${escapeHTML(s.status||'')}</td><td><button class="btn-sm" onclick='editStaff("${s.id}")'>✏️</button> <button class="btn-sm btn-danger" onclick='deleteStaff("${s.id}")'>🗑</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-table">No staff</td></tr>';
}
function editStaff(id){ const s=lsGet('staff',[]).find(x=>x.id===id); if(s) showStaffModal(s); }
function deleteStaff(id){ if(!confirm('Delete staff?')) return; lsSet('staff', lsGet('staff',[]).filter(s=>s.id!==id)); renderStaffTable(); audit('delete','staff',id); }
function filterStaffTable(){ renderStaffTable(); }
function exportStaffCSV(){ const list = lsGet('staff',[]); if(!list.length){SDF.toast('No staff','error');return;} saveAs(new Blob([Papa.unparse(list)],{type:'text/csv'}),'staff.csv'); }
function importStaffCSV(e){ const f=e.target.files[0]; if(!f) return; Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{ const cur=lsGet('staff',[]); const inc=r.data.map(x=>({...x,id:x.id||('t_'+Date.now()+Math.random()),salary:+x.salary||0})); lsSet('staff', cur.concat(inc)); renderStaffTable(); SDF.toast('Imported '+inc.length); audit('import','staff',inc.length); }}); e.target.value=''; }
function batchFromStaff(){
  const list = lsGet('staff',[]); if(!list.length){ SDF.toast('No staff','error'); return; }
  showLoading('Generating staff ID cards…');
  (async ()=>{
    const zip = new JSZip();
    for(let i=0;i<list.length;i++){
      const s = list[i];
      const fields = { holderName: s.name, holderClass: s.position+' / '+s.dept, idNumber: s.id, qrText: s.id, guardianPhone: s.phone };
      const html = renderDocument('staff-id-card', profileFromForm(), fields);
      const div = document.createElement('div'); div.style.cssText='position:absolute;left:-10000px;'; div.innerHTML = html; document.body.appendChild(div);
      try{ const c = await html2canvas(div.firstElementChild||div,{scale:2,backgroundColor:'#fff'}); const blob = await new Promise(r=>c.toBlob(r,'image/png')); zip.file((s.name||'staff')+'_'+i+'.png', blob); }catch(e){}
      document.body.removeChild(div);
      document.getElementById('loading-text').textContent=`Staff ${i+1}/${list.length}…`;
    }
    const z = await zip.generateAsync({type:'blob'}); saveAs(z,'staff-id-cards.zip');
    hideLoading(); audit('batch','staff', list.length); SDF.toast('Staff ID cards ready');
  })();
}
function batchPayslips(){
  const list = lsGet('staff',[]); if(!list.length){ SDF.toast('No staff','error'); return; }
  const period = prompt('Pay period (e.g. Aug 2025):','Aug 2025'); if(!period) return;
  showLoading('Building payslips…');
  (async ()=>{
    const zip = new JSZip();
    for(let i=0;i<list.length;i++){
      const s = list[i];
      const fields = { staffName: s.name, staffId: s.id, dept: s.dept, period, basic: s.salary, allowances: 0, deductions: 0 };
      const html = renderDocument('staff-payslip', profileFromForm(), fields);
      const div = document.createElement('div'); div.style.cssText='position:absolute;left:-10000px;'; div.innerHTML = html; document.body.appendChild(div);
      try{ const c = await html2canvas(div.firstElementChild||div,{scale:2,backgroundColor:'#fff'}); const blob = await new Promise(r=>c.toBlob(r,'image/png')); zip.file(`payslip-${s.name||i}.png`, blob); }catch(e){}
      document.body.removeChild(div);
      document.getElementById('loading-text').textContent=`Payslip ${i+1}/${list.length}…`;
    }
    const z = await zip.generateAsync({type:'blob'}); saveAs(z,`payslips-${period.replace(/\s+/g,'_')}.zip`);
    hideLoading(); audit('batch','payslips', list.length); SDF.toast('Payslips ready');
  })();
}
window.showStaffModal=showStaffModal; window.editStaff=editStaff; window.deleteStaff=deleteStaff;
window.filterStaffTable=filterStaffTable; window.exportStaffCSV=exportStaffCSV; window.importStaffCSV=importStaffCSV;
window.batchFromStaff=batchFromStaff; window.batchPayslips=batchPayslips;

/* ── FEE MANAGEMENT ── */
function showFeeModal(){
  const students = lsGet('students',[]);
  if(!students.length){ SDF.toast('Add students first','error'); return; }
  openModal('Record Payment', `<div class="form-grid">
    <div class="form-group form-group-full"><label class="form-label">Student</label><select id="fm-student" class="form-input">${students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.class||'')})</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Amount (₦)</label><input id="fm-amount" type="number" class="form-input"/></div>
    <div class="form-group"><label class="form-label">Method</label><select id="fm-method" class="form-input"><option>Cash</option><option>Transfer</option><option>POS</option></select></div>
    <div class="form-group form-group-full"><label class="form-label">Purpose</label><input id="fm-purpose" class="form-input" value="School Fees"/></div>
  </div>`, ()=>{
    const id = SDF.field('fm-student').value; const amt = +SDF.field('fm-amount').value || 0;
    if(amt<=0){ SDF.toast('Amount required','error'); return false; }
    const list = lsGet('students',[]); const s = list.find(x=>x.id===id); if(!s) return false;
    s.paid = (s.paid||0) + amt;
    lsSet('students', list);
    const pay = lsGet('payments',[]);
    pay.unshift({ id:'p_'+Date.now(), studentId:id, name:s.name, amt, method: SDF.field('fm-method').value, purpose: SDF.field('fm-purpose').value, t: Date.now() });
    lsSet('payments', pay);
    refreshFeeTable(); renderStudentTable(); audit('payment','fee', s.name+' ₦'+amt); refreshStats();
    SDF.toast('Payment recorded'); return true;
  });
}
function refreshFeeTable(){
  const list = lsGet('students',[]);
  const cls = document.getElementById('fee-class-filter')?.value || '';
  const cf = document.getElementById('fee-class-filter');
  if(cf){ const classes = [...new Set(list.map(s=>s.class).filter(Boolean))]; cf.innerHTML = '<option value="">All Classes</option>'+classes.map(c=>`<option ${c===cls?'selected':''}>${escapeHTML(c)}</option>`).join(''); }
  const filtered = cls ? list.filter(s=>s.class===cls) : list;
  const tbody = document.getElementById('fees-tbody'); if(!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(s => {
    const bal = (s.fees||0)-(s.paid||0); const status = bal<=0?'Paid':((s.paid||0)>0?'Partial':'Unpaid');
    return `<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.class||'')}</td><td>₦${(s.fees||0).toLocaleString()}</td><td>₦${(s.paid||0).toLocaleString()}</td><td>₦${bal.toLocaleString()}</td><td><span class="lib-badge ${status==='Paid'?'available':(status==='Unpaid'?'overdue':'borrowed')}">${status}</span></td><td><button class="btn-sm" onclick='quickPayment("${s.id}")'>💵 Pay</button></td></tr>`;
  }).join('') : '<tr><td colspan="7" class="empty-table">No data</td></tr>';
  const collected = list.reduce((a,b)=>a+(b.paid||0),0); const outstanding = list.reduce((a,b)=>a+Math.max(0,(b.fees||0)-(b.paid||0)),0);
  document.getElementById('fee-total-collected').textContent = '₦'+collected.toLocaleString();
  document.getElementById('fee-total-outstanding').textContent = '₦'+outstanding.toLocaleString();
}
function quickPayment(id){ const amt = +prompt('Amount paid (₦):'); if(amt>0){ const list=lsGet('students',[]); const s=list.find(x=>x.id===id); s.paid=(s.paid||0)+amt; lsSet('students',list); refreshFeeTable(); renderStudentTable(); audit('payment','fee', s.name+' ₦'+amt); } }
function importFeeStructure(e){ const f=e.target.files[0]; if(!f) return; Papa.parse(f,{header:true,skipEmptyLines:true,complete:r=>{ const list=lsGet('students',[]); r.data.forEach(row=>{ const s=list.find(x=>x.class===row.class||x.name===row.name); if(s) s.fees=+row.fees||0; }); lsSet('students', list); refreshFeeTable(); SDF.toast('Fee structure applied'); }}); e.target.value=''; }
function exportFeeReport(){ const list=lsGet('students',[]).map(s=>({name:s.name,class:s.class,fees:s.fees||0,paid:s.paid||0,balance:(s.fees||0)-(s.paid||0)})); saveAs(new Blob([Papa.unparse(list)],{type:'text/csv'}),'fee-report.csv'); }
window.showFeeModal=showFeeModal; window.refreshFeeTable=refreshFeeTable; window.quickPayment=quickPayment; window.importFeeStructure=importFeeStructure; window.exportFeeReport=exportFeeReport;

/* ── ATTENDANCE ── */
function populateAttClass(){
  const classes = [...new Set(lsGet('students',[]).map(s=>s.class).filter(Boolean))];
  const sel = document.getElementById('att-class'); if(sel) sel.innerHTML = '<option value="">Select Class</option>' + classes.map(c=>`<option>${escapeHTML(c)}</option>`).join('');
  const tt = document.getElementById('tt-class-select'); if(tt) tt.innerHTML = '<option value="">Select class…</option>' + classes.map(c=>`<option>${escapeHTML(c)}</option>`).join('');
  const today = new Date().toISOString().slice(0,10);
  const d = document.getElementById('att-date'); if(d && !d.value) d.value = today;
  const vd = document.getElementById('visitor-date-filter'); if(vd && !vd.value) vd.value = today;
}
function loadAttendanceSheet(){
  const cls = document.getElementById('att-class').value;
  if(!cls){ SDF.toast('Pick class','error'); return; }
  const date = document.getElementById('att-date').value;
  const list = lsGet('students',[]).filter(s => s.class === cls);
  const saved = lsGet('att_'+cls+'_'+date, {});
  const tb = document.getElementById('attendance-tbody');
  tb.innerHTML = list.length ? list.map(s => `<tr><td>${escapeHTML(s.name)}</td><td><select class="form-input att-sel" data-id="${s.id}" style="max-width:140px;"><option value="P" ${saved[s.id]==='P'?'selected':''}>Present</option><option value="A" ${saved[s.id]==='A'?'selected':''}>Absent</option><option value="L" ${saved[s.id]==='L'?'selected':''}>Late</option><option value="" ${!saved[s.id]?'selected':''}>—</option></select></td></tr>`).join('') : '<tr><td colspan="2" class="empty-table">No students in class</td></tr>';
}
function markAllPresent(){ document.querySelectorAll('.att-sel').forEach(s => s.value = 'P'); }
function saveAttendance(){
  const cls = document.getElementById('att-class').value; const date = document.getElementById('att-date').value;
  if(!cls||!date){ SDF.toast('Pick class & date','error'); return; }
  const map = {};
  document.querySelectorAll('.att-sel').forEach(s => map[s.dataset.id] = s.value);
  lsSet('att_'+cls+'_'+date, map);
  const counts = Object.values(map).reduce((a,v)=>{ a[v]=(a[v]||0)+1; return a; },{});
  document.getElementById('attendance-stats').innerHTML = `<strong>Saved.</strong> Present: ${counts.P||0} · Absent: ${counts.A||0} · Late: ${counts.L||0}`;
  audit('save','attendance', cls + ' ' + date);
  SDF.toast('Attendance saved');
}
function exportAttendance(){
  const cls = document.getElementById('att-class').value; const date = document.getElementById('att-date').value;
  if(!cls||!date){ SDF.toast('Pick class & date','error'); return; }
  const map = lsGet('att_'+cls+'_'+date, {});
  const list = lsGet('students',[]).filter(s=>s.class===cls).map(s=>({name:s.name,class:s.class,date,status:map[s.id]||''}));
  saveAs(new Blob([Papa.unparse(list)],{type:'text/csv'}), `attendance-${cls}-${date}.csv`);
}
window.loadAttendanceSheet=loadAttendanceSheet; window.markAllPresent=markAllPresent; window.saveAttendance=saveAttendance; window.exportAttendance=exportAttendance;

/* ── BULK ── */
function downloadCSVTemplate(type){
  const tpls = {
    'id-card': [{name:'Jane Doe',class:'JSS1',id_number:'001'}],
    'certificate': [{name:'Jane Doe',certificate_type:'Merit',award_description:'For academic excellence'}],
    'fee-receipt': [{name:'Jane Doe',class:'JSS1',amount:15000,purpose:'1st Term Fees'}]
  };
  const csv = Papa.unparse(tpls[type] || []);
  saveAs(new Blob([csv],{type:'text/csv'}), 'template-' + type + '.csv');
}
function handleBulkCSV(type, e){
  const f = e.target.files[0]; if(!f) return;
  Papa.parse(f, { header: true, skipEmptyLines: true, complete: res => {
    SDF.state.bulkData[type] = res.data;
    document.getElementById('bulk-' + (type==='id-card'?'id':(type==='certificate'?'cert':'rec')) + '-results').textContent = '✅ ' + res.data.length + ' rows loaded.';
    document.getElementById('bulk-' + (type==='id-card'?'id':(type==='certificate'?'cert':'rec')) + '-zip-btn').style.display = '';
  }});
  e.target.value='';
}
async function downloadBulkZip(type){
  const rows = SDF.state.bulkData[type] || []; if(!rows.length){ SDF.toast('No data','error'); return; }
  showLoading('Building ZIP…');
  const zip = new JSZip();
  for(let i=0;i<rows.length;i++){
    const row = rows[i];
    let fields = {};
    if(type==='id-card') fields = { holderName: row.name, holderClass: row.class, idNumber: row.id_number, qrText: row.id_number };
    if(type==='certificate') fields = { recipientName: row.name, certType: row.certificate_type, awardDesc: row.award_description, date: new Date().toISOString().slice(0,10), signatory:'Principal' };
    if(type==='fee-receipt') fields = { receiptNo:'R-'+(1000+i), studentName: row.name, studentClass: row.class, amount: row.amount, purpose: row.purpose, paymentMethod:'Cash', date: new Date().toISOString().slice(0,10) };
    const html = renderDocument(type, profileFromForm(), fields);
    const div = document.createElement('div'); div.style.cssText='position:absolute;left:-10000px;'; div.innerHTML = html; document.body.appendChild(div);
    try{ const c = await html2canvas(div.firstElementChild||div,{scale:2,backgroundColor:'#fff'}); const blob = await new Promise(r=>c.toBlob(r,'image/png')); zip.file((row.name||'doc')+'_'+i+'.png', blob); }catch(e){}
    document.body.removeChild(div);
    document.getElementById('loading-text').textContent = `Bulk ${i+1}/${rows.length}…`;
  }
  const z = await zip.generateAsync({type:'blob'}); saveAs(z, 'bulk-' + type + '.zip');
  hideLoading(); audit('bulk', type, rows.length); SDF.toast('ZIP ready');
}
window.downloadCSVTemplate=downloadCSVTemplate; window.handleBulkCSV=handleBulkCSV; window.downloadBulkZip=downloadBulkZip;

/* ── STATS ── */
function refreshStats(){
  const set = (id,v)=>{ const el = document.getElementById(id); if(el) el.textContent = v; };
  set('stat-total', lsGet('history',[]).length);
  set('stat-week', lsGet('history',[]).filter(h => h.t > Date.now()-7*86400000).length);
  set('stat-profiles', Object.keys(lsGet('profiles',{})).length);
  set('stat-students', lsGet('students',[]).length);
  set('stat-templates', Object.keys(lsGet('templates',{})).length);
  set('stat-revenue', '₦' + lsGet('students',[]).reduce((a,b)=>a+(b.paid||0),0).toLocaleString());
  set('stat-books', lsGet('books',[]).length);
  set('stat-assets', lsGet('assets',[]).length);
  // breakdown
  const hist = lsGet('history',[]);
  const counts = {};
  hist.forEach(h => counts[h.type] = (counts[h.type]||0)+1);
  const max = Math.max(1, ...Object.values(counts));
  const b = document.getElementById('stats-breakdown');
  if(b){
    b.innerHTML = '<div class="chart-wrap"><div class="chart-title">Documents by Type</div>' + Object.keys(counts).map(k=>`<div class="chart-bar-h"><span class="lbl">${k}</span><div class="bar"><div class="fill" style="width:${counts[k]/max*100}%"></div></div><span class="val">${counts[k]}</span></div>`).join('') + (Object.keys(counts).length===0?'<p style="color:#888;">No data yet.</p>':'') + '</div>';
  }
}
window.refreshStats = refreshStats;

/* ── MODAL ── */
let _modalOk = null;
function openModal(title, bodyHTML, onConfirm){
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').style.display = 'flex';
  _modalOk = onConfirm;
  document.getElementById('modal-confirm').onclick = () => { if(!_modalOk || _modalOk() !== false) closeModal(); };
}
function closeModal(){ document.getElementById('modal-overlay').style.display = 'none'; _modalOk = null; }
window.openModal=openModal; window.closeModal=closeModal;

/* ── LOADING ── */
function showLoading(text){ const ov=document.getElementById('loading-overlay'); if(!ov) return; ov.classList.add('show'); document.getElementById('loading-text').textContent = text||'Loading…'; }
function hideLoading(){ document.getElementById('loading-overlay')?.classList.remove('show'); }
window.showLoading=showLoading; window.hideLoading=hideLoading;

/* ── CONFETTI ── */
function burstConfetti(){
  const c = document.getElementById('confetti-canvas'); if(!c) return;
  c.style.display = 'block'; c.width = innerWidth; c.height = innerHeight;
  const ctx = c.getContext('2d'); const parts = [];
  for(let i=0;i<120;i++) parts.push({ x: innerWidth/2, y: innerHeight/3, vx: (Math.random()-.5)*10, vy: Math.random()*-8-2, c:`hsl(${Math.random()*360},80%,55%)`, s: Math.random()*6+3, l: 60 });
  function frame(){
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p => { p.vy += .3; p.x += p.vx; p.y += p.vy; p.l--; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); });
    if(parts.some(p => p.l > 0)) requestAnimationFrame(frame); else c.style.display = 'none';
  }
  frame();
}
window.burstConfetti = burstConfetti;

/* ── HELPERS ── */
function escapeHTML(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
window.escapeHTML = escapeHTML;
function numberToWords(num){
  num = Math.floor(+num || 0);
  if(num === 0) return 'Zero';
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function f(n){
    if(n < 20) return a[n];
    if(n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
    if(n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' and ' + f(n%100) : '');
    if(n < 1000000) return f(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + f(n%1000) : '');
    if(n < 1000000000) return f(Math.floor(n/1000000)) + ' Million' + (n%1000000 ? ' ' + f(n%1000000) : '');
    return n.toString();
  }
  return f(num);
}
window.numberToWords = numberToWords;

/* ═══════════════════════════════════════════════════════════════
   v7 DOC FIELD EXTENSIONS — appended without removing originals
═══════════════════════════════════════════════════════════════ */
Object.assign(DOC_FIELDS, {
  'soap-note': [
    ['studentName','Patient Name'], ['date','Date','date'],
    ['temp','Temperature (°C)','number'], ['bp','Blood Pressure'],
    ['subjective','S — Subjective (complaint)','textarea'],
    ['objective','O — Objective (findings)','textarea'],
    ['assessment','A — Assessment (diagnosis)','textarea'],
    ['plan','P — Plan / Treatment','textarea'],
    ['nurse','Nurse / Officer']
  ],
  'transport-pass': [
    ['plate','Bus Plate'], ['route','Route'], ['driver','Driver'],
    ['validUntil','Valid Until','date']
  ],
  'transport-roster': [
    ['plate','Bus Plate'], ['route','Route'], ['driver','Driver'],
    ['date','Date','date'],
    ['students','Students (Name,Class,GuardianPhone per line)','textarea']
  ],
  'cafe-menu': [
    ['week','Week Label'],
    ['meals','Meals (Monday::B: bread | L: rice | S: fruit per line)','textarea']
  ],
  'meal-ticket': [
    ['studentName','Student'], ['classLevel','Class'],
    ['date','Date','date'],
    ['mealType','Meal','select',['Breakfast','Lunch','Snack','Dinner']]
  ],
  'homework-sheet': [
    ['title','Title'], ['subject','Subject'], ['classLevel','Class'],
    ['teacher','Teacher'],
    ['assigned','Assigned','date'], ['due','Due','date'],
    ['description','Description','textarea']
  ],
});
