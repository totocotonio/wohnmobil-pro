'use strict';

// Startseite: Favoriten
const WMP_FAVS_KEY = 'wmp_favs';
let wmpFavs = JSON.parse(localStorage.getItem(WMP_FAVS_KEY) || '[]');
const START_TOOLS = [
  { id:'nivellieren', icon:'⊙', name:'Nivellieren',       desc:'Wohnmobil mit Gyrosensor perfekt ausrichten',           action:"showSection('nivellieren')" },
  { id:'checkliste',  icon:'☑', name:'Checkliste',        desc:'Abfahrt, Ankunft & Winterlager abhaken',                action:"showSection('checkliste')" },
  { id:'kosten',      icon:'€', name:'Kosten',            desc:'Kraftstoff, Stellplatz & Ausgaben pro Urlaub',          action:"showSection('kosten')" },
  { id:'wetter',      icon:'🌤', name:'Wetter',            desc:'Aktuelles Wetter & 7-Tage-Prognose am Stellplatz',     action:"showSection('wetter')" },
  { id:'karte',       icon:'🗺', name:'Reisekarte',        desc:'Alle Urlaube auf der Europakarte',                     action:"showSection('karte');initKarte()" },
  { id:'statistik',   icon:'📊', name:'Statistik',         desc:'Alle Reisen im Überblick',                             action:"showSection('statistik')" },
  { id:'strom',       icon:'⚡', name:'Strom',             desc:'Energiebilanz & Solar planen',                         action:"showSection('strom')" },
  { id:'notfall',     icon:'🆘', name:'Notfall',           desc:'Notruf & Pannenhilfe je Land',                         action:"showSection('notfall')" },
  { id:'tanken',      icon:'⛽', name:'Tankpreise',        desc:'Günstigste Tankstellen in DE, FR & ES',                action:"showSection('tanken')" },
  { id:'fahrzeug',    icon:'🚐', name:'Mein Fahrzeug',     desc:'Fahrzeugdaten, TÜV, Versicherung & Wartungsprotokoll', action:"showSection('fahrzeug')" },
  { id:'vorschriften',icon:'📋', name:'Vorschriften',      desc:'Promille, Vignetten & Pflichtausrüstung je Land',      action:"showSection('vorschriften')" },
  { id:'satfinder',   icon:'📡', name:'Sat-Finder',        desc:'Azimut & Elevation für Satellitenschüssel',            action:"showSection('satfinder')" },
  { id:'sonne',       icon:'🌞', name:'Sonnenausrichtung', desc:'Fahrzeug optimal für Schatten & Solar ausrichten',     action:"showSection('sonne')" },
  { id:'gas',         icon:'🔥', name:'Gasvorrat',         desc:'Füllstand, Verbrauch & Reichweite in Tagen',           action:"showSection('gas');gasRender()" },
  { id:'stellplatz',  icon:'⛺', name:'Stellplatz-Logbuch',desc:'Besuchte Plätze, Bewertungen & Notizen',                action:"showSection('stellplatz');spRender()" },
];

// ══════════════════════════════════
// THEME
// ══════════════════════════════════
function syncThemeKnobs(isLight) {
  document.querySelectorAll('.theme-toggle-knob').forEach(k => {
    k.textContent = isLight ? '☀️' : '🌙';
  });
}
function loadTheme() {
  const saved = localStorage.getItem('wmp_theme');
  const preferLight = saved ? saved === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
  if (preferLight) document.documentElement.classList.add('light');
  syncThemeKnobs(preferLight);
  applyColorTheme(localStorage.getItem('wmp_color') || 'green', true);
}

const COLOR_THEMES = {
  green:  { label:'Grün',    dark:'#22c55e', darkDim:'rgba(34,197,94,0.15)',   light:'#16a34a', lightDim:'rgba(22,163,74,0.1)' },
  blue:   { label:'Blau',    dark:'#38bdf8', darkDim:'rgba(56,189,248,0.15)',  light:'#0284c7', lightDim:'rgba(2,132,199,0.1)' },
  orange: { label:'Orange',  dark:'#f97316', darkDim:'rgba(249,115,22,0.15)',  light:'#ea580c', lightDim:'rgba(234,88,12,0.1)' },
  purple: { label:'Lila',    dark:'#a78bfa', darkDim:'rgba(167,139,250,0.15)', light:'#7c3aed', lightDim:'rgba(124,58,237,0.1)' },
  teal:   { label:'Türkis',  dark:'#2dd4bf', darkDim:'rgba(45,212,191,0.15)',  light:'#0d9488', lightDim:'rgba(13,148,136,0.1)' },
  pink:   { label:'Pink',    dark:'#ec4899', darkDim:'rgba(236,72,153,0.15)',  light:'#be185d', lightDim:'rgba(190,24,93,0.1)' },
  gold:   { label:'Gold',    dark:'#eab308', darkDim:'rgba(234,179,8,0.15)',   light:'#a16207', lightDim:'rgba(161,98,7,0.1)' },
};

function applyColorTheme(name, silent) {
  const t = COLOR_THEMES[name] || COLOR_THEMES.green;
  const isLight = document.documentElement.classList.contains('light');
  document.documentElement.style.setProperty('--accent', isLight ? t.light : t.dark);
  document.documentElement.style.setProperty('--accent-dim', isLight ? t.lightDim : t.darkDim);
  if (!silent) localStorage.setItem('wmp_color', name);
  renderColorPicker();
}

function renderColorPicker() {
  const el = document.getElementById('color-picker');
  if (!el) return;
  const current = localStorage.getItem('wmp_color') || 'green';
  el.innerHTML = Object.entries(COLOR_THEMES).map(([key, t]) => {
    const active = key === current;
    return `<button onclick="applyColorTheme('${key}')" title="${t.label}" style="width:34px;height:34px;border-radius:50%;background:${t.dark};border:${active ? '3px solid var(--text)' : '3px solid transparent'};outline:${active ? '2px solid ' + t.dark : 'none'};outline-offset:2px;cursor:pointer;transition:transform 0.15s;flex-shrink:0" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></button>`;
  }).join('');
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('wmp_theme', isLight ? 'light' : 'dark');
  syncThemeKnobs(isLight);
  applyColorTheme(localStorage.getItem('wmp_color') || 'green', true);
}

// ══════════════════════════════════
// NAVIGATION
// ══════════════════════════════════
function showSection(name) {
  document.querySelectorAll('.wmp-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');
  const backBtn = document.getElementById('back-btn');
  backBtn.style.display = name === 'start' ? 'none' : 'block';
  window.scrollTo(0, 0);
  if (name === 'statistik') renderStatistik();
  if (name === 'notfall') renderNotfall();
  if (name === 'fahrzeug') { loadFahrzeug(); renderWartung(); }
  if (name === 'tanken') tpInit();
  if (name === 'vorschriften') renderVorschriften();
  if (name === 'satfinder' && SAT.lat) satCalc();
  if (name === 'sonne' && SO.lat) soCalc();
  if (name !== 'sonne' && SO._timer) { clearInterval(SO._timer); SO._timer = null; }
}

function openMenu() {
  document.getElementById('nav-drawer').classList.add('open');
  document.getElementById('nav-overlay').style.display = 'block';
}

function closeMenu() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('nav-overlay').style.display = 'none';
}

// ══════════════════════════════════
// NIVELLIEREN – STATE
// ══════════════════════════════════
let calib = { beta: 0, gamma: 0 };
let smoothB = 0, smoothG = 0;
let sensorRunning = false;
const SMOOTH = 0.18;

function loadSettings() {
  const s = JSON.parse(localStorage.getItem('wmp_settings') || '{}');
  if (s.track)     document.getElementById('cfgTrack').value     = s.track;
  if (s.wheelbase) document.getElementById('cfgWheelbase').value = s.wheelbase;
  if (s.tol)       document.getElementById('cfgTol').value       = s.tol;
  const c = JSON.parse(localStorage.getItem('wmp_calib') || 'null');
  if (c) calib = c;
}
function saveSettings() {
  localStorage.setItem('wmp_settings', JSON.stringify({
    track:     +document.getElementById('cfgTrack').value,
    wheelbase: +document.getElementById('cfgWheelbase').value,
    tol:       +document.getElementById('cfgTol').value,
  }));
}
function toggleSettings(btn) {
  const body = document.getElementById('settingsBody');
  body.classList.toggle('open');
  btn.querySelector('.s-arrow').textContent = body.classList.contains('open') ? '▲' : '▼';
}
function calibrate() {
  calib = { beta: smoothB, gamma: smoothG };
  localStorage.setItem('wmp_calib', JSON.stringify(calib));
  toast('Kalibriert');
}
function resetCalibration() {
  calib = { beta: 0, gamma: 0 };
  localStorage.removeItem('wmp_calib');
  toast('Kalibrierung zurückgesetzt');
}

// ══════════════════════════════════
// NIVELLIEREN – SENSOR
// ══════════════════════════════════
function onOrientation(e) {
  if (!sensorRunning) {
    sensorRunning = true;
    document.getElementById('ios-perm').style.display = 'none';
    document.getElementById('sensorInfo').innerHTML =
      '<strong>Gyroskop:</strong> aktiv<br><span style="margin-top:4px;display:block">DeviceOrientationEvent vorhanden</span>';
  }
  smoothB = smoothB + ((e.beta  || 0) - smoothB) * SMOOTH;
  smoothG = smoothG + ((e.gamma || 0) - smoothG) * SMOOTH;
  const beta  = smoothB - calib.beta;
  const gamma = smoothG - calib.gamma;
  renderLevel(beta, gamma);
}

function renderLevel(beta, gamma) {
  const track     = +document.getElementById('cfgTrack').value     || 190;
  const wheelbase = +document.getElementById('cfgWheelbase').value || 380;
  const tol       = +document.getElementById('cfgTol').value       || 0.5;
  const R = 88;
  const bx = Math.max(-R, Math.min(R, (gamma / 10) * R));
  const by = Math.max(-R, Math.min(R, (beta  / 10) * R));
  const el = document.getElementById('bubble');
  el.style.left = `calc(50% + ${bx}px)`;
  el.style.top  = `calc(50% + ${by}px)`;
  const dev = Math.sqrt(beta*beta + gamma*gamma);
  const isOk   = dev < tol;
  const isWarn = dev < tol * 4;
  el.className = 'bubble ' + (isOk ? 's-ok' : isWarn ? 's-warn' : '');
  const st = document.getElementById('lvlStatus');
  const tx = document.getElementById('lvlStatusTxt');
  st.className = 'level-status ' + (isOk ? 's-ok' : isWarn ? 's-warn' : 's-off');
  tx.textContent = isOk ? 'Nivelliert' : isWarn ? 'Fast nivelliert' : 'Nicht nivelliert';
  document.getElementById('vGamma').textContent = Math.abs(gamma).toFixed(1);
  document.getElementById('vBeta').textContent  = Math.abs(beta).toFixed(1);
  const cmG = Math.abs(Math.sin(gamma * Math.PI/180) * track);
  const cmB = Math.abs(Math.sin(beta  * Math.PI/180) * wheelbase);
  document.getElementById('vGammaCm').textContent = cmG < 0.4 ? 'eben' : cmG.toFixed(1) + ' cm anheben';
  document.getElementById('vBetaCm').textContent  = cmB < 0.4 ? 'eben' : cmB.toFixed(1) + ' cm anheben';
  document.getElementById('vGammaDir').textContent = Math.abs(gamma) < 0.3 ? '' : gamma > 0 ? 'rechts tiefer' : 'links tiefer';
  document.getElementById('vBetaDir').textContent  = Math.abs(beta)  < 0.3 ? '' : beta  > 0 ? 'hinten tiefer' : 'vorne tiefer';
  renderWomoSvg(beta, gamma, tol);
}

function renderWomoSvg(beta, gamma, tol) {
  const ids = ['whl-vl','whl-vr','whl-hl','whl-hr'];
  const els = ids.map(i => document.getElementById(i));
  const ok = Math.abs(beta) < tol && Math.abs(gamma) < tol;
  if (ok) {
    els.forEach(w => { w.setAttribute('fill','#14532d'); w.setAttribute('stroke','#22c55e'); w.setAttribute('stroke-width','1.5'); });
    return;
  }
  els.forEach(w => { w.setAttribute('fill','var(--border)'); w.removeAttribute('stroke'); });
  const leftLow  = gamma < -tol;
  const rightLow = gamma >  tol;
  const frontLow = beta  >  tol;
  const backLow  = beta  < -tol;
  function mark(w) { w.setAttribute('fill','#7c2d12'); w.setAttribute('stroke','#f59e0b'); w.setAttribute('stroke-width','1.5'); }
  if (leftLow)  { mark(els[0]); mark(els[2]); }
  if (rightLow) { mark(els[1]); mark(els[3]); }
  if (frontLow) { mark(els[0]); mark(els[1]); }
  if (backLow)  { mark(els[2]); mark(els[3]); }
}

function startSensor() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.getElementById('ios-perm').style.display = 'block';
    document.getElementById('lvlStatusTxt').textContent = 'Sensor-Freigabe erforderlich';
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', onOrientation, true);
    document.getElementById('lvlStatusTxt').textContent = 'Sensor aktiv…';
    document.getElementById('sensorInfo').innerHTML = '<strong>Gyroskop:</strong> initialisiert';
  } else {
    document.getElementById('lvlStatusTxt').textContent = 'Kein Lagesensor gefunden';
    document.getElementById('sensorInfo').innerHTML = '<strong>Gyroskop:</strong> nicht verfügbar auf diesem Gerät';
  }
}

function requestIOSPermission() {
  DeviceOrientationEvent.requestPermission().then(state => {
    if (state === 'granted') {
      window.addEventListener('deviceorientation', onOrientation, true);
    } else {
      document.getElementById('lvlStatusTxt').textContent = 'Zugriff verweigert';
    }
  }).catch(console.error);
}

// ══════════════════════════════════
// CHECKLISTEN
// ══════════════════════════════════
const CL_DATA = {
  abfahrt: [
    { cat: 'Außen', items: ['Trittstufe eingefahren','Markise eingerollt','Sat-Schüssel verstaut','Außenspiegel ausgeklappt','Alle Klappen geschlossen','Strom-/Wasserkabel getrennt','Stützen eingefahren'] },
    { cat: 'Innen',  items: ['Herd aus','Kühlschrank auf Fahrbetrieb','Fenster und Dachfenster zu','Schränke und Schubladen gesichert','Tisch gesichert oder verstaut','Gasflaschen geschlossen'] },
    { cat: 'Fahrzeug', items: ['Reifendruck geprüft','Frischwasser aufgefüllt','Kraftstoff geprüft','Kfz-Papiere und Führerschein dabei','Navi / Handy geladen'] },
  ],
  ankunft: [
    { cat: 'Aufstellen', items: ['Nivelliert','Stützen ausgefahren','Trittstufe ausgefahren','Getriebe in Leerlauf / Parkposition'] },
    { cat: 'Anschließen', items: ['Landstrom angeschlossen','Wasseranschluss verbunden','Abwasserschlauch gelegt'] },
    { cat: 'Einrichten', items: ['Kühlschrank auf Strom umgestellt','Markise ausgerollt','Außenspiegel eingeklappt','Sat-Schüssel ausgerichtet'] },
  ],
  winter: [
    { cat: 'Wasser', items: ['Frischwassertank geleert','Leitungen mit Druckluft ausgeblasen','Warmwasserboiler entleert','WC-Kassette geleert und gereinigt','Frostschutz in Leitungen gegeben'] },
    { cat: 'Batterie & Strom', items: ['Aufbaubatterie ausgebaut oder Erhaltungsladung','Starterbatterie Hauptschalter aus','Solarregler deaktiviert','Alle 12V-Verbraucher ausgeschaltet'] },
    { cat: 'Gas & Heizung', items: ['Gasflaschen schließen','Dieselheizung entlüften','Gasanlage auf Dichtheit prüfen'] },
    { cat: 'Sonstiges', items: ['Kühlschrank Tür anlehnen (Belüftung)','Wertgegenstände entnehmen','Versicherung informieren','KFZ abgemeldet?','Nächste HU / TÜV notiert'] },
  ],
  dokumente: [
    { cat: 'Fahrzeugdokumente', items: ['Fahrzeugschein (Zulassungsbescheinigung Teil I)','Führerschein','Grüne Versicherungskarte','TÜV / HU Bescheinigung','COC-Papiere (bei Auslandsreisen hilfreich)'] },
    { cat: 'Persönliche Dokumente', items: ['Personalausweis / Reisepass','Europäische Krankenversicherungskarte (EHIC)','Impfausweis','Organspendeausweis','Notfallkontakte (ausgedruckt)'] },
    { cat: 'Versicherung & Pannenhilfe', items: ['Auslandskrankenversicherung (Police/Karte)','ADAC / Pannenhilfe-Mitgliedskarte','Schutzbrief-Dokument','Camping-Haftpflicht-Nachweis'] },
    { cat: 'Zahlungsmittel', items: ['EC-Karte','Kreditkarte','Bargeld (evtl. Fremdwährung)','Notgeldreserve'] },
    { cat: 'Reisedokumente', items: ['Campingplatz-Buchungsbestätigungen','Vignetten (A, CH, SLO, CZ …)','Fährbuchungen ausgedruckt','Stellplatz-App / Führerausdruck','Länderspezifische Pflichtausrüstung geprüft'] },
  ],
};

let clState = {};
function loadCL() { clState = JSON.parse(localStorage.getItem('wmp_cl') || '{}'); }
function saveCL()  { localStorage.setItem('wmp_cl', JSON.stringify(clState)); }

function renderCL() {
  for (const name of ['abfahrt','ankunft','winter','dokumente']) {
    const data = CL_DATA[name];
    let html = '', total = 0, done = 0;
    for (const sec of data) {
      html += `<div class="check-category"><div class="section-label">${sec.cat}</div>`;
      for (const item of sec.items) {
        const key = name + '|' + item;
        const checked = !!clState[key];
        total++; if (checked) done++;
        html += `<div class="check-item${checked?' checked':''}" onclick="toggleCI('${key.replace(/'/g,"\\'")}',this)">
          <div class="check-box">
            <svg class="check-tick" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.2"><polyline points="1.5 6 4.5 9.5 10.5 2.5"/></svg>
          </div>
          <span class="check-lbl">${item}</span>
        </div>`;
      }
      html += '</div>';
    }
    document.getElementById('cl-items-' + name).innerHTML = html;
    document.getElementById('cl-prog-' + name).textContent = done + '/' + total;
  }
}

function toggleCI(key, el) {
  clState[key] = !clState[key];
  saveCL();
  el.classList.toggle('checked', clState[key]);
  const name = key.split('|')[0];
  const data = CL_DATA[name];
  let t = 0, d = 0;
  for (const sec of data) for (const item of sec.items) { t++; if (clState[name+'|'+item]) d++; }
  document.getElementById('cl-prog-' + name).textContent = d + '/' + t;
}

function resetCL(name) {
  const data = CL_DATA[name];
  for (const sec of data) for (const item of sec.items) delete clState[name+'|'+item];
  saveCL(); renderCL();
}

function switchCL(name, btn) {
  document.querySelectorAll('#sec-checkliste .seg-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.cl-panel').forEach(p => p.style.display = 'none');
  btn.classList.add('active');
  document.getElementById('cl-' + name).style.display = 'block';
  if (name === 'eigen') renderClEigen();
}

// ── Eigene Checkliste ──
function loadClEigen()   { return JSON.parse(localStorage.getItem('wmp_cl_eigen') || '[]'); }
function saveClEigen(items) { localStorage.setItem('wmp_cl_eigen', JSON.stringify(items)); }

function renderClEigen() {
  const items = loadClEigen();
  const el = document.getElementById('cl-items-eigen');
  const footer = document.getElementById('cl-footer-eigen');
  if (!items.length) {
    el.innerHTML = '<div class="no-entries" style="padding:24px 0">Noch keine eigenen Punkte – füge oben einen hinzu.</div>';
    footer.style.display = 'none';
    return;
  }
  const done = items.filter(i => i.checked).length;
  document.getElementById('cl-prog-eigen').textContent = done + '/' + items.length;
  footer.style.display = 'flex';
  el.innerHTML = items.map(item => `
    <div class="check-item${item.checked?' checked':''}" style="display:flex;align-items:center;gap:0" onclick="toggleClEigen(${item.id},this)">
      <div class="check-box" style="flex-shrink:0">
        <svg class="check-tick" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.2"><polyline points="1.5 6 4.5 9.5 10.5 2.5"/></svg>
      </div>
      <span class="check-lbl" style="flex:1">${item.text}</span>
      <button class="ei-del" onclick="event.stopPropagation();deleteClEigen(${item.id})" style="margin-left:6px;flex-shrink:0">✕</button>
    </div>`).join('');
}

function addClEigen() {
  const inp = document.getElementById('cl-eigen-inp');
  const text = inp.value.trim();
  if (!text) { toast('Bezeichnung eingeben'); return; }
  const items = loadClEigen();
  items.push({ id: Date.now(), text, checked: false });
  saveClEigen(items);
  inp.value = '';
  renderClEigen();
}

function toggleClEigen(id, el) {
  const items = loadClEigen();
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.checked = !item.checked;
  saveClEigen(items);
  el.classList.toggle('checked', item.checked);
  const done = items.filter(i => i.checked).length;
  document.getElementById('cl-prog-eigen').textContent = done + '/' + items.length;
}

function deleteClEigen(id) {
  const items = loadClEigen().filter(i => i.id !== id);
  saveClEigen(items);
  renderClEigen();
}

function resetClEigen() {
  const items = loadClEigen().map(i => ({ ...i, checked: false }));
  saveClEigen(items);
  renderClEigen();
}

// ══════════════════════════════════
// TRIPS / KOSTEN
// ══════════════════════════════════
let trips = [];
let activeTripId = null;

function loadTrips() {
  trips = JSON.parse(localStorage.getItem('wmp_trips') || '[]');
  activeTripId = localStorage.getItem('wmp_active_trip') || null;
  const old = localStorage.getItem('wmp_kosten');
  if (old && !trips.length) {
    const k = JSON.parse(old);
    if (k.kraftstoff.length || k.stellplatz.length || k.sonstiges.length) {
      const t = { id: Date.now(), name: 'Ältere Einträge', erstellt: new Date().toISOString().split('T')[0], archiviert: false, kraftstoff: k.kraftstoff, stellplatz: k.stellplatz, sonstiges: k.sonstiges };
      trips.push(t);
      activeTripId = String(t.id);
      localStorage.removeItem('wmp_kosten');
      saveTrips();
    }
  }
  if (activeTripId && !trips.find(t => String(t.id) === activeTripId)) activeTripId = null;
}

function saveTrips() {
  localStorage.setItem('wmp_trips', JSON.stringify(trips));
  activeTripId ? localStorage.setItem('wmp_active_trip', activeTripId) : localStorage.removeItem('wmp_active_trip');
}

function getActiveTrip() {
  return trips.find(t => String(t.id) === activeTripId) || null;
}

function tripTotal(t) {
  return t.kraftstoff.reduce((s,e) => s+e.l*e.p, 0)
       + t.stellplatz.reduce((s,e) => s+e.p, 0)
       + t.sonstiges.reduce((s,e) => s+e.b, 0);
}

function showNewTrip() {
  const f = document.getElementById('newTripForm');
  const open = f.style.display === 'block';
  f.style.display = open ? 'none' : 'block';
  if (!open) { closeTripDropdown(); document.getElementById('newTripName').focus(); }
}

async function geocodeTripOrt(trip) {
  const q = trip.ort || trip.name;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { 'Accept-Language': 'de' } });
    const data = await res.json();
    if (data[0]) { trip.lat = parseFloat(data[0].lat); trip.lng = parseFloat(data[0].lon); saveTrips(); if (_karteMap) renderKartePins(); }
  } catch {}
}

function createTrip() {
  const name = document.getElementById('newTripName').value.trim();
  if (!name) { toast('Name eingeben'); return; }
  const land = document.getElementById('newTripLand').value || '';
  const ort  = document.getElementById('newTripOrt').value.trim();
  const von  = document.getElementById('newTripVon').value || '';
  const bis  = document.getElementById('newTripBis').value || '';
  const t = { id: Date.now(), name, land, ort, von, bis, erstellt: new Date().toISOString().split('T')[0], archiviert: false, kraftstoff: [], stellplatz: [], sonstiges: [], etappen: [], tagebuch: [] };
  trips.unshift(t);
  activeTripId = String(t.id);
  document.getElementById('newTripName').value = '';
  document.getElementById('newTripLand').value = '';
  document.getElementById('newTripOrt').value = '';
  document.getElementById('newTripVon').value = '';
  document.getElementById('newTripBis').value = '';
  document.getElementById('newTripForm').style.display = 'none';
  saveTrips(); renderKosten();
  toast('Urlaub erstellt');
  geocodeTripOrt(t);
}

function switchTrip(id) {
  activeTripId = String(id);
  saveTrips(); renderKosten(); closeTripDropdown();
}

function toggleTripDropdown() {
  const dd = document.getElementById('tripDropdown');
  if (dd.style.display !== 'none') { closeTripDropdown(); return; }
  renderTripDropdown();
  dd.style.display = 'block';
  document.getElementById('tripContent').style.display = 'none';
  document.getElementById('noTripMsg').style.display = 'none';
}

function closeTripDropdown() {
  document.getElementById('tripDropdown').style.display = 'none';
  const trip = getActiveTrip();
  document.getElementById('tripContent').style.display = trip ? 'block' : 'none';
  document.getElementById('noTripMsg').style.display = trip ? 'none' : 'block';
}

function toggleArchivSection(btn) {
  const body = document.getElementById('archivBody');
  body.classList.toggle('open');
  btn.querySelector('.s-arrow').textContent = body.classList.contains('open') ? '▲' : '▼';
}

function renderTripDropdown() {
  const active = trips.filter(t => !t.archiviert);
  const arch   = trips.filter(t =>  t.archiviert);
  document.getElementById('tripDropdownItems').innerHTML = active.length
    ? active.map(t => `
      <div class="trip-item${String(t.id)===activeTripId?' is-active':''}">
        <div style="flex:1;min-width:0">
          <div class="trip-item-name">${t.land ? t.land + ' ' : ''}${t.name}</div>
          <div class="trip-item-sub">${t.erstellt} &middot; ${tripTotal(t).toFixed(0)} €</div>
        </div>
        <div class="trip-item-actions">
          ${String(t.id)===activeTripId
            ? '<span class="trip-active-badge">AKTIV</span>'
            : `<button class="btn" style="padding:5px 10px;font-size:0.72rem" onclick="switchTrip(${t.id})">Wählen</button>`}
          <button class="ei-del" title="Bearbeiten" onclick="editTripById(${t.id})">✎</button>
          <button class="ei-del" title="Löschen" onclick="deleteTripById(${t.id})">✕</button>
          <button class="ei-del" title="Archivieren" onclick="archiveTripById(${t.id})">▾</button>
        </div>
      </div>`).join('')
    : '<div class="no-entries" style="padding:12px">Keine aktiven Urlaube</div>';
  document.getElementById('archivItems').innerHTML = arch.length
    ? arch.map(t => `
      <div class="trip-item">
        <div style="flex:1;min-width:0">
          <div class="trip-item-name" style="color:var(--muted)">${t.name}</div>
          <div class="trip-item-sub">${t.erstellt} &middot; ${tripTotal(t).toFixed(0)} €</div>
        </div>
        <div class="trip-item-actions">
          <button class="btn" style="padding:5px 10px;font-size:0.72rem" onclick="viewArchivedTrip(${t.id})">Ansehen</button>
          <button class="ei-del" title="Bearbeiten" onclick="editTripById(${t.id})">✎</button>
          <button class="ei-del" title="Löschen" onclick="deleteTripById(${t.id})">✕</button>
        </div>
      </div>`).join('')
    : '<div class="no-entries" style="padding:8px 0;font-size:0.8rem">Leer</div>';
}

function archiveActiveTrip() {
  const trip = getActiveTrip();
  if (!trip) return;
  archiveTripById(trip.id);
}

function archiveTripById(id) {
  const trip = trips.find(t => String(t.id) === String(id));
  if (!trip) return;
  trip.archiviert = true;
  if (activeTripId === String(id)) {
    const next = trips.find(t => !t.archiviert);
    activeTripId = next ? String(next.id) : null;
  }
  saveTrips(); renderKosten();
  toast(`"${trip.name}" archiviert`);
}

function viewArchivedTrip(id) {
  activeTripId = String(id);
  saveTrips(); renderKosten(); closeTripDropdown();
}

function unarchiveTrip(id) {
  const trip = trips.find(t => String(t.id) === String(id));
  if (!trip) return;
  trip.archiviert = false;
  activeTripId = String(id);
  saveTrips(); renderKosten(); closeTripDropdown();
  toast(`"${trip.name}" reaktiviert`);
}

function editTripById(id) {
  const trip = trips.find(t => String(t.id) === String(id));
  if (!trip) return;
  const LAENDER = [
    ['','🌍 Kein Land'],['🇩🇪','🇩🇪 Deutschland'],['🇦🇹','🇦🇹 Österreich'],['🇨🇭','🇨🇭 Schweiz'],
    ['🇮🇹','🇮🇹 Italien'],['🇫🇷','🇫🇷 Frankreich'],['🇪🇸','🇪🇸 Spanien'],['🇵🇹','🇵🇹 Portugal'],
    ['🇳🇱','🇳🇱 Niederlande'],['🇧🇪','🇧🇪 Belgien'],['🇱🇺','🇱🇺 Luxemburg'],['🇩🇰','🇩🇰 Dänemark'],
    ['🇸🇪','🇸🇪 Schweden'],['🇳🇴','🇳🇴 Norwegen'],['🇫🇮','🇫🇮 Finnland'],['🇮🇸','🇮🇸 Island'],
    ['🇬🇧','🇬🇧 Großbritannien'],['🇮🇪','🇮🇪 Irland'],['🇵🇱','🇵🇱 Polen'],['🇨🇿','🇨🇿 Tschechien'],
    ['🇸🇰','🇸🇰 Slowakei'],['🇭🇺','🇭🇺 Ungarn'],['🇷🇴','🇷🇴 Rumänien'],['🇧🇬','🇧🇬 Bulgarien'],
    ['🇬🇷','🇬🇷 Griechenland'],['🇭🇷','🇭🇷 Kroatien'],['🇸🇮','🇸🇮 Slowenien'],['🇷🇸','🇷🇸 Serbien'],
    ['🇧🇦','🇧🇦 Bosnien'],['🇲🇪','🇲🇪 Montenegro'],['🇦🇱','🇦🇱 Albanien'],['🇲🇰','🇲🇰 Nordmazedonien'],
    ['🇱🇹','🇱🇹 Litauen'],['🇱🇻','🇱🇻 Lettland'],['🇪🇪','🇪🇪 Estland'],['🇺🇦','🇺🇦 Ukraine'],
    ['🇲🇹','🇲🇹 Malta'],['🇨🇾','🇨🇾 Zypern'],['🇱🇮','🇱🇮 Liechtenstein'],['🇦🇩','🇦🇩 Andorra'],
    ['🇲🇨','🇲🇨 Monaco'],['🇸🇲','🇸🇲 San Marino'],['🇹🇷','🇹🇷 Türkei'],['🇲🇦','🇲🇦 Marokko'],['🇹🇳','🇹🇳 Tunesien'],
  ];
  const overlay = document.createElement('div');
  overlay.id = 'editTripOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:var(--panel);border:1px solid var(--border);border-radius:14px;width:100%;max-width:420px;padding:20px">
      <div style="font-size:0.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:12px">Urlaub bearbeiten</div>
      <label class="form-lbl">Name</label>
      <input class="form-inp" id="_editName" value="${trip.name}" style="width:100%;margin-bottom:10px">
      <label class="form-lbl">Land</label>
      <select class="form-inp" id="_editLand" style="width:100%;margin-bottom:10px">
        ${LAENDER.map(([v,l]) => `<option value="${v}"${trip.land===v?' selected':''}>${l}</option>`).join('')}
      </select>
      <label class="form-lbl">Ort / Region (für Karte)</label>
      <input class="form-inp" id="_editOrt" value="${trip.ort||''}" placeholder="z.B. Toskana, Gardasee" style="width:100%;margin-bottom:10px">
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div style="flex:1"><label class="form-lbl">Von</label><input class="form-inp" type="date" id="_editVon" value="${trip.von||''}" style="width:100%"></div>
        <div style="flex:1"><label class="form-lbl">Bis</label><input class="form-inp" type="date" id="_editBis" value="${trip.bis||''}" style="width:100%"></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--border)" onclick="document.getElementById('editTripOverlay').remove()">Abbrechen</button>
        <button class="btn btn-primary" style="flex:1" onclick="saveEditTrip('${id}')">Speichern</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function saveEditTrip(id) {
  const trip = trips.find(t => String(t.id) === String(id));
  if (!trip) return;
  const name = document.getElementById('_editName').value.trim();
  if (!name) { toast('Name eingeben'); return; }
  const newOrt = document.getElementById('_editOrt').value.trim();
  trip.name = name;
  trip.land = document.getElementById('_editLand').value;
  trip.von  = document.getElementById('_editVon').value || '';
  trip.bis  = document.getElementById('_editBis').value || '';
  if (newOrt !== (trip.ort||'')) { trip.ort = newOrt; trip.lat = null; trip.lng = null; geocodeTripOrt(trip); }
  document.getElementById('editTripOverlay')?.remove();
  saveTrips(); renderTripDropdown(); renderKosten();
  toast('Gespeichert');
}

function deleteTripById(id) {
  const trip = trips.find(t => String(t.id) === String(id));
  if (!confirm(`"${trip?.name}" wirklich löschen? Alle Einträge gehen verloren.`)) return;
  trips = trips.filter(t => String(t.id) !== String(id));
  if (activeTripId === String(id)) {
    const next = trips.find(t => !t.archiviert);
    activeTripId = next ? String(next.id) : null;
  }
  saveTrips(); renderTripDropdown(); renderKosten();
  toast('Urlaub gelöscht');
}

function renderKosten() {
  const trip = getActiveTrip();
  const btn = document.getElementById('tripNameBtn');
  const isArchived = trip && trip.archiviert === true;
  document.getElementById('tripNameText').textContent = trip
    ? ((trip.land ? trip.land + ' ' : '') + trip.name + (isArchived ? ' · Archiviert' : ''))
    : 'Urlaub wählen…';
  btn.classList.toggle('has-trip', !!trip);
  const dd = document.getElementById('tripDropdown');
  if (!trip) {
    document.getElementById('tripContent').style.display = 'none';
    if (dd.style.display === 'none') document.getElementById('noTripMsg').style.display = 'block';
    ['sk-gesamt','sk-kf','sk-sp','sk-so'].forEach(id => document.getElementById(id).textContent = '0 €');
    return;
  }
  document.getElementById('noTripMsg').style.display = 'none';
  if (dd.style.display === 'none') document.getElementById('tripContent').style.display = 'block';
  document.querySelectorAll('#tripContent .entry-form').forEach(f => { f.style.display = isArchived ? 'none' : ''; });
  const archBtn = document.getElementById('archiveBtn');
  if (isArchived) {
    archBtn.textContent = 'Urlaub reaktivieren';
    archBtn.onclick = () => unarchiveTrip(trip.id);
    archBtn.style.color = 'var(--accent)';
    archBtn.style.borderColor = 'rgba(34,197,94,0.35)';
  } else {
    archBtn.textContent = 'Urlaub archivieren';
    archBtn.onclick = archiveActiveTrip;
    archBtn.style.color = '';
    archBtn.style.borderColor = '';
  }
  const kf = trip.kraftstoff.reduce((s,e) => s+e.l*e.p, 0);
  const sp = trip.stellplatz.reduce((s,e) => s+e.p, 0);
  const so = trip.sonstiges.reduce((s,e) => s+e.b, 0);
  document.getElementById('sk-gesamt').textContent = (kf+sp+so).toFixed(0) + ' €';
  document.getElementById('sk-kf').textContent = kf.toFixed(0) + ' €';
  document.getElementById('sk-sp').textContent = sp.toFixed(0) + ' €';
  document.getElementById('sk-so').textContent = so.toFixed(0) + ' €';
  // Trip info bar (von-bis Zeitraum)
  const infoBar = document.getElementById('tripInfoBar');
  if (trip.von || trip.bis) {
    const fmt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '?';
    const tage = (trip.von && trip.bis) ? Math.round((new Date(trip.bis)-new Date(trip.von))/(1000*60*60*24))+1 : null;
    infoBar.style.cssText = 'display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.03));border:1px solid rgba(34,197,94,0.25);border-radius:12px;padding:12px 16px;margin-bottom:14px';
    infoBar.innerHTML = `<span style="font-size:1.6rem">🏖️</span><div><div style="font-weight:700;color:var(--text);font-size:0.9rem">${trip.land||''} ${trip.name}</div><div style="font-size:0.76rem;color:var(--muted);margin-top:2px">📅 ${fmt(trip.von)} – ${fmt(trip.bis)}${tage ? `<span style="margin-left:8px;color:var(--accent);font-weight:600">${tage} Tage</span>` : ''}</div></div>`;
  } else {
    infoBar.style.display = 'none';
  }
  const del = (type, id) => isArchived ? '' : `<button class="ei-del" onclick="delEntry('${type}',${id})">✕</button>`;
  document.getElementById('list-kraftstoff').innerHTML = trip.kraftstoff.length ? trip.kraftstoff.map(e =>
    `<div class="entry-item" data-cat="kraftstoff"><div class="ei-info"><div class="ei-main">⛽ ${e.l.toFixed(1)} L &times; ${e.p.toFixed(3)} €/L${e.verbrauch ? ' &middot; <span style="color:var(--accent)">' + e.verbrauch.toFixed(1) + ' L/100km</span>' : ''}</div><div class="ei-sub">${e.dat||'–'}${e.km?' &middot; '+e.km.toLocaleString('de-DE')+' km':''}</div></div><div class="ei-cost">${(e.l*e.p).toFixed(2)} €</div>${del('kraftstoff',e.id)}</div>`).join('') : '<div class="no-entries">⛽ Noch keine Tankungen</div>';
  document.getElementById('list-stellplatz').innerHTML = trip.stellplatz.length ? trip.stellplatz.map(e =>
    `<div class="entry-item" data-cat="stellplatz"><div class="ei-info"><div class="ei-main">🏕️ ${e.name}</div><div class="ei-sub">${e.dat||'–'} &middot; ${e.n} Nacht/Nächte${e.bem ? ' &middot; ' + e.bem : ''}</div></div><div class="ei-cost">${e.p.toFixed(2)} €</div>${del('stellplatz',e.id)}</div>`).join('') : '<div class="no-entries">🏕️ Noch keine Stellplätze</div>';
  document.getElementById('list-sonstiges').innerHTML = trip.sonstiges.length ? trip.sonstiges.map(e =>
    `<div class="entry-item" data-cat="sonstiges"><div class="ei-info"><div class="ei-main">🎯 ${e.desc}</div><div class="ei-sub">${e.dat||'–'}</div></div><div class="ei-cost">${e.b.toFixed(2)} €</div>${del('sonstiges',e.id)}</div>`).join('') : '<div class="no-entries">🎯 Noch keine Ausgaben</div>';
  renderEtappen(trip, isArchived);
  renderTagebuch(trip, isArchived);
}

function addKraftstoff() {
  const trip = getActiveTrip(); if (!trip) { toast('Zuerst Urlaub wählen'); return; }
  const l = parseFloat(document.getElementById('kf-l').value);
  const p = parseFloat(document.getElementById('kf-p').value);
  if (!l || !p) { toast('Liter und Preis eingeben'); return; }
  const km = +document.getElementById('kf-km').value || 0;
  // Verbrauch berechnen: vorherige Tankung mit km-Stand suchen
  const prev = trip.kraftstoff.find(e => e.km > 0);
  const verbrauch = (km && prev && prev.km && km > prev.km)
    ? (l / (km - prev.km) * 100) : 0;
  trip.kraftstoff.unshift({ id: Date.now(), dat: document.getElementById('kf-dat').value, km, l, p, verbrauch });
  document.getElementById('kf-l').value = ''; document.getElementById('kf-p').value = '';
  saveTrips(); renderKosten();
}
function addStellplatz() {
  const trip = getActiveTrip(); if (!trip) { toast('Zuerst Urlaub wählen'); return; }
  const p = parseFloat(document.getElementById('sp-p').value);
  if (!p) { toast('Preis eingeben'); return; }
  const bem = document.getElementById('sp-bem').value.trim();
  trip.stellplatz.unshift({ id: Date.now(), dat: document.getElementById('sp-dat').value, name: document.getElementById('sp-name').value||'–', n: +document.getElementById('sp-n').value||1, p, bem });
  document.getElementById('sp-name').value = ''; document.getElementById('sp-p').value = ''; document.getElementById('sp-bem').value = '';
  saveTrips(); renderKosten();
}
function addSonstiges() {
  const trip = getActiveTrip(); if (!trip) { toast('Zuerst Urlaub wählen'); return; }
  const b = parseFloat(document.getElementById('so-b').value);
  if (!b) { toast('Betrag eingeben'); return; }
  trip.sonstiges.unshift({ id: Date.now(), dat: document.getElementById('so-dat').value, desc: document.getElementById('so-desc').value||'–', b });
  document.getElementById('so-desc').value = ''; document.getElementById('so-b').value = '';
  saveTrips(); renderKosten();
}
function delEntry(type, id) {
  const trip = getActiveTrip(); if (!trip) return;
  trip[type] = trip[type].filter(e => e.id !== id);
  saveTrips(); renderKosten();
}
function switchKosten(name, btn) {
  document.querySelectorAll('#tab-kosten .seg-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.kosten-panel').forEach(p => p.style.display = 'none');
  btn.classList.add('active');
  document.getElementById('kp-' + name).style.display = 'block';
}

// ══════════════════════════════════
// ETAPPEN
// ══════════════════════════════════
function addEtappe() {
  const trip = getActiveTrip(); if (!trip) { toast('Zuerst Urlaub wählen'); return; }
  const ort = document.getElementById('et-ort').value.trim();
  if (!ort) { toast('Ort eingeben'); return; }
  if (!trip.etappen) trip.etappen = [];
  const e = { id: Date.now(), ort, von: document.getElementById('et-von').value||'', bis: document.getElementById('et-bis').value||'', lat: null, lng: null };
  trip.etappen.push(e);
  document.getElementById('et-ort').value = '';
  document.getElementById('et-von').value = '';
  document.getElementById('et-bis').value = '';
  saveTrips(); renderKosten();
  geocodeEtappe(trip, e);
  toast('Etappe hinzugefügt');
}

function renderEtappen(trip, isArchived) {
  if (!trip.etappen) trip.etappen = [];
  const list = document.getElementById('list-etappen');
  if (!list) return;
  if (!trip.etappen.length) { list.innerHTML = '<div class="no-entries">🗺️ Noch keine Etappen — füge Stationen hinzu</div>'; return; }
  const fmt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '';
  const total = trip.etappen.length;
  list.innerHTML = trip.etappen.map((e, i) => {
    const tage = (e.von && e.bis) ? Math.round((new Date(e.bis)-new Date(e.von))/(1000*60*60*24))+1 : null;
    const datum = e.von ? (fmt(e.von) + (e.bis ? ' – ' + fmt(e.bis) : '') + (tage ? `<span style="color:var(--accent);font-weight:600;margin-left:4px">${tage}T</span>` : '')) : '';
    const connector = i < total-1 ? `<div style="width:2px;height:10px;background:linear-gradient(to bottom,rgba(34,197,94,0.4),rgba(34,197,94,0.1));margin:2px auto;border-radius:1px"></div>` : '';
    return `<div>
      <div class="entry-item" data-cat="etappe" style="align-items:flex-start">
        <div class="${e.lat ? 'etappe-num geocoded' : 'etappe-num'}">${i+1}</div>
        <div class="ei-info">
          <div class="ei-main">${e.ort}</div>
          ${datum ? `<div class="ei-sub">${datum}</div>` : '<div class="ei-sub" style="color:rgba(100,116,139,0.5)">Koordinaten werden geladen…</div>'}
        </div>
        ${isArchived ? '' : `<div style="display:flex;gap:4px;flex-shrink:0"><button class="ei-del" title="Bearbeiten" onclick="editEtappe(${trip.id},${e.id})">✎</button><button class="ei-del" onclick="deleteEtappe(${trip.id},${e.id})">✕</button></div>`}
      </div>
      ${connector}
    </div>`;
  }).join('');
}

function deleteEtappe(tripId, etappeId) {
  const trip = trips.find(t => String(t.id) === String(tripId));
  if (!trip || !trip.etappen) return;
  trip.etappen = trip.etappen.filter(e => e.id !== etappeId);
  saveTrips(); renderKosten(); if (_karteMap) renderKartePins();
}

function editEtappe(tripId, etappeId) {
  const trip = trips.find(t => String(t.id) === String(tripId));
  if (!trip) return;
  const e = trip.etappen.find(x => x.id === etappeId);
  if (!e) return;
  const overlay = document.createElement('div');
  overlay.id = 'editEtappeOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:var(--panel);border:1px solid var(--border);border-radius:14px;width:100%;max-width:420px;padding:20px">
      <div style="font-size:0.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:12px">Etappe bearbeiten</div>
      <label class="form-lbl">Ort / Stellplatz</label>
      <input class="form-inp" id="_eetOrt" value="${e.ort}" style="width:100%;margin-bottom:10px">
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div style="flex:1"><label class="form-lbl">Von</label><input class="form-inp" type="date" id="_eetVon" value="${e.von||''}" style="width:100%"></div>
        <div style="flex:1"><label class="form-lbl">Bis</label><input class="form-inp" type="date" id="_eetBis" value="${e.bis||''}" style="width:100%"></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--border)" onclick="document.getElementById('editEtappeOverlay').remove()">Abbrechen</button>
        <button class="btn btn-primary" style="flex:1" onclick="saveEditEtappe(${tripId},${etappeId})">Speichern</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function saveEditEtappe(tripId, etappeId) {
  const trip = trips.find(t => String(t.id) === String(tripId));
  if (!trip) return;
  const e = trip.etappen.find(x => x.id === etappeId);
  if (!e) return;
  const newOrt = document.getElementById('_eetOrt').value.trim();
  if (!newOrt) { toast('Ort eingeben'); return; }
  const ortChanged = newOrt !== e.ort;
  e.ort = newOrt;
  e.von = document.getElementById('_eetVon').value || '';
  e.bis = document.getElementById('_eetBis').value || '';
  if (ortChanged) { e.lat = null; e.lng = null; geocodeEtappe(trip, e); }
  document.getElementById('editEtappeOverlay')?.remove();
  saveTrips(); renderKosten();
  toast('Etappe gespeichert');
}

async function geocodeEtappe(trip, etappe) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(etappe.ort)}&format=json&limit=1`);
    const data = await res.json();
    if (data[0]) {
      etappe.lat = parseFloat(data[0].lat);
      etappe.lng = parseFloat(data[0].lon);
      saveTrips();
      renderEtappen(trip, false);
      if (_karteMap) renderKartePins();
    }
  } catch(e) {}
}

// ══════════════════════════════════
// WETTER
// ══════════════════════════════════

// WMO Wettercodes → Emoji + Beschreibung
function wmoInfo(code, isDay) {
  const d = isDay !== false;
  const map = {
    0:  { icon: d ? '☀️' : '🌙', desc: 'Klar' },
    1:  { icon: d ? '🌤️' : '🌤️', desc: 'Überwiegend klar' },
    2:  { icon: '⛅', desc: 'Teilweise bewölkt' },
    3:  { icon: '☁️', desc: 'Bedeckt' },
    45: { icon: '🌫️', desc: 'Nebel' },
    48: { icon: '🌫️', desc: 'Gefrierender Nebel' },
    51: { icon: '🌦️', desc: 'Leichter Nieselregen' },
    53: { icon: '🌦️', desc: 'Nieselregen' },
    55: { icon: '🌧️', desc: 'Starker Nieselregen' },
    61: { icon: '🌧️', desc: 'Leichter Regen' },
    63: { icon: '🌧️', desc: 'Regen' },
    65: { icon: '🌧️', desc: 'Starker Regen' },
    71: { icon: '🌨️', desc: 'Leichter Schneefall' },
    73: { icon: '❄️', desc: 'Schneefall' },
    75: { icon: '❄️', desc: 'Starker Schneefall' },
    77: { icon: '🌨️', desc: 'Schneegriesel' },
    80: { icon: '🌦️', desc: 'Leichte Schauer' },
    81: { icon: '🌧️', desc: 'Schauer' },
    82: { icon: '⛈️', desc: 'Starke Schauer' },
    85: { icon: '🌨️', desc: 'Schneeschauer' },
    86: { icon: '🌨️', desc: 'Starke Schneeschauer' },
    95: { icon: '⛈️', desc: 'Gewitter' },
    96: { icon: '⛈️', desc: 'Gewitter mit Hagel' },
    99: { icon: '⛈️', desc: 'Schweres Gewitter' },
  };
  return map[code] || { icon: '🌡️', desc: 'Unbekannt' };
}

function windDir(deg) {
  const dirs = ['N','NO','O','SO','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function beaufort(kmh) {
  if (kmh < 2) return 0;
  if (kmh < 6) return 1;
  if (kmh < 12) return 2;
  if (kmh < 20) return 3;
  if (kmh < 29) return 4;
  if (kmh < 39) return 5;
  if (kmh < 50) return 6;
  if (kmh < 62) return 7;
  return 8;
}

function camperTips(data) {
  const tips = [];
  const cur = data.current;
  const wmo = cur.weather_code;
  const wind = cur.wind_speed_10m;
  const temp = cur.temperature_2m;
  const precip = cur.precipitation;

  if (wmo >= 95) tips.push({ icon: '⚡', text: '<strong>Gewitter:</strong> Markise einrollen, Sat-Schüssel sichern.' });
  else if (wmo >= 80) tips.push({ icon: '🌧️', text: '<strong>Schauer:</strong> Markise reinnehmen, Dachfenster schließen.' });
  else if (wmo >= 61) tips.push({ icon: '🌧️', text: '<strong>Regen:</strong> Zelt/Vorzelt sichern, Ablaufrinne prüfen.' });
  else if (wmo <= 1 && temp > 22) tips.push({ icon: '☀️', text: '<strong>Sonnig und warm:</strong> Sonnenschutz aufbauen, Dachfenster leicht öffnen.' });

  if (wind > 50) tips.push({ icon: '💨', text: '<strong>Starker Wind (Bft ' + beaufort(wind) + '):</strong> Markise unbedingt einrollen!' });
  else if (wind > 30) tips.push({ icon: '💨', text: '<strong>Mäßiger Wind (Bft ' + beaufort(wind) + '):</strong> Markise im Auge behalten.' });

  if (temp < 5) tips.push({ icon: '🥶', text: '<strong>Frost-Gefahr:</strong> Heizung laufen lassen, Wasserleitungen schützen.' });
  else if (temp > 30) tips.push({ icon: '🌡️', text: '<strong>Hitze:</strong> Fenster abdunkeln, Vorzelt für Schatten aufbauen.' });

  if (tips.length === 0) tips.push({ icon: '✅', text: '<strong>Gute Bedingungen</strong> – perfektes Camping-Wetter!' });
  return tips;
}

let wetterSearchTimer = null;
let wetterLocation = null;

function onWetterInput() {
  clearTimeout(wetterSearchTimer);
  const val = document.getElementById('wetterSearchInp').value.trim();
  if (val.length < 2) { hideSuggestions(); return; }
  wetterSearchTimer = setTimeout(() => fetchGeoSearch(val), 400);
}

function wetterSearchSubmit() {
  const val = document.getElementById('wetterSearchInp').value.trim();
  if (val.length < 2) return;
  fetchGeoSearch(val);
}

async function fetchGeoSearch(query) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de&format=json`);
    const data = await res.json();
    if (!data.results || !data.results.length) { hideSuggestions(); return; }
    showSuggestions(data.results);
  } catch(e) {
    hideSuggestions();
  }
}

function showSuggestions(results) {
  const el = document.getElementById('wetterSuggestions');
  el.innerHTML = results.map(r => `
    <div class="wetter-sug-item" onclick="selectLocation(${r.latitude},${r.longitude},'${escHtml(r.name)}','${escHtml((r.admin1||'') + (r.country_code ? ', '+r.country_code : ''))}')">
      <div>${escHtml(r.name)}</div>
      <div class="wetter-sug-sub">${escHtml((r.admin1||'')+', '+r.country_code)}</div>
    </div>`).join('');
  el.style.display = 'block';
}

function hideSuggestions() {
  document.getElementById('wetterSuggestions').style.display = 'none';
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function selectLocation(lat, lon, name, sub) {
  wetterLocation = { lat, lon, name, sub };
  document.getElementById('wetterSearchInp').value = name;
  hideSuggestions();
  loadWetter(lat, lon, name, sub);
}

function wetterGPS() {
  if (!navigator.geolocation) { toast('GPS nicht verfügbar'); return; }
  setWetterLoading('GPS wird ermittelt…');
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    reverseGeocode(lat, lon);
  }, () => {
    setWetterError('GPS-Zugriff verweigert oder nicht verfügbar.');
  }, { timeout: 10000 });
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat},${lon}&count=1&language=de&format=json`);
    // Fallback: just use coords directly
    loadWetter(lat, lon, 'Aktueller Standort', `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°O`);
  } catch {
    loadWetter(lat, lon, 'Aktueller Standort', `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°O`);
  }
}

function setWetterLoading(msg) {
  document.getElementById('wetterContent').innerHTML = `<div class="wetter-loading">⏳ ${msg||'Wetterdaten werden geladen…'}</div>`;
}

function setWetterError(msg) {
  document.getElementById('wetterContent').innerHTML = `<div class="wetter-error">⚠️ ${msg}</div>`;
}

async function loadWetter(lat, lon, name, sub, forceRefresh) {
  // Frischen Cache nutzen wenn vorhanden und gleicher Ort (< 30 Min)
  if (!forceRefresh) {
    try {
      const cache = JSON.parse(localStorage.getItem('wmp_wetter_cache') || 'null');
      if (cache && cache.data?.daily && cache.lat === lat && cache.lon === lon
          && (Date.now() - cache.ts) < 30 * 60 * 1000) {
        renderWetter(cache.data, name || cache.name, sub || cache.sub || '');
        return;
      }
    } catch(e) {}
  }
  setWetterLoading();
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day`
      + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`
      + `&timezone=auto&forecast_days=8`;
    const res = await fetch(url);
    const data = await res.json();
    renderWetter(data, name, sub);
    localStorage.setItem('wmp_wetter_cache', JSON.stringify({ lat, lon, name, sub: sub||'', ts: Date.now(), data }));
    // Startseiten-Widget aktualisieren
    renderStartWeather(data, name);
  } catch(e) {
    setWetterError('Wetterdaten konnten nicht geladen werden. Bitte Internetverbindung prüfen.');
  }
}

const WOCHENTAGE = ['So','Mo','Di','Mi','Do','Fr','Sa'];

function renderWetter(data, name, sub) {
  const cur = data.current;
  const daily = data.daily;
  const isDay = cur.is_day === 1;
  const wmo = wmoInfo(cur.weather_code, isDay);
  const now = new Date();
  const updated = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  // Vorschau: Tage 1–7 (heute = 0)
  _forecastCards = [1, 2, 3, 4, 5, 6, 7].filter(i => daily.time[i]).map(i => {
    const d = new Date(daily.time[i]);
    const dayName = i === 1 ? 'Morgen' : WOCHENTAGE[d.getDay()];
    const info = wmoInfo(daily.weather_code[i], true);
    return `<div class="wetter-day-card">
      <div class="wetter-day-name">${dayName}</div>
      <div class="wetter-day-icon">${info.icon}</div>
      <div class="wetter-day-desc">${info.desc}</div>
      <div class="wetter-day-temps">
        <span class="wetter-day-max">${Math.round(daily.temperature_2m_max[i])}°</span>
        <span class="wetter-day-min">${Math.round(daily.temperature_2m_min[i])}°</span>
      </div>
    </div>`;
  });
  const forecastDays = _forecastCards.slice(0, _forecastDayCount).join('');

  // Camper-Tipps
  const tips = camperTips(data);
  const tipsHtml = tips.map(t =>
    `<div class="wetter-tip-item"><div class="wetter-tip-icon">${t.icon}</div><div class="wetter-tip-text">${t.text}</div></div>`
  ).join('');

  document.getElementById('wetterContent').innerHTML = `
    <div class="wetter-location-card">
      <div class="wetter-loc-icon">📍</div>
      <div>
        <div class="wetter-loc-name">${escHtml(name)}</div>
        <div class="wetter-loc-sub">${escHtml(sub||'')}</div>
        <div class="wetter-updated">Aktualisiert: ${updated} · Open-Meteo</div>
      </div>
    </div>

    <div class="section-label" style="margin-top:4px">Aktuell</div>
    <div class="wetter-current">
      <div class="wetter-cur-top">
        <div class="wetter-cur-icon">${wmo.icon}</div>
        <div>
          <div class="wetter-cur-temp">${Math.round(cur.temperature_2m)}°</div>
          <div class="wetter-cur-desc">${wmo.desc}</div>
        </div>
      </div>
      <div class="wetter-cur-grid">
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Gefühlt</div>
          <div class="wetter-cur-cell-val">${Math.round(cur.apparent_temperature)}°C</div>
        </div>
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Luftfeuchte</div>
          <div class="wetter-cur-cell-val">${cur.relative_humidity_2m}%</div>
        </div>
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Niederschlag</div>
          <div class="wetter-cur-cell-val">${cur.precipitation} mm</div>
        </div>
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Wind</div>
          <div class="wetter-cur-cell-val">${Math.round(cur.wind_speed_10m)} km/h</div>
        </div>
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Windrichtung</div>
          <div class="wetter-cur-cell-val">${windDir(cur.wind_direction_10m)}</div>
        </div>
        <div class="wetter-cur-cell">
          <div class="wetter-cur-cell-lbl">Beaufort</div>
          <div class="wetter-cur-cell-val">Bft ${beaufort(cur.wind_speed_10m)}</div>
        </div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;margin-bottom:4px">
      <div class="section-label" style="margin:0">Vorschau</div>
      <div style="display:flex;gap:4px">
        <button id="btn-3d" onclick="setForecastDays(3)" style="padding:4px 12px;border-radius:20px;border:1px solid var(--border);background:var(--accent);color:#fff;font-family:inherit;font-size:0.75rem;font-weight:700;cursor:pointer">3 Tage</button>
        <button id="btn-7d" onclick="setForecastDays(7)" style="padding:4px 12px;border-radius:20px;border:1px solid var(--border);background:var(--panel2);color:var(--muted);font-family:inherit;font-size:0.75rem;font-weight:700;cursor:pointer">7 Tage</button>
      </div>
    </div>
    <div id="wetter-forecast-container" class="wetter-forecast">${forecastDays}</div>

    <div class="section-label" style="margin-top:4px">Camping-Tipps</div>
    <div class="wetter-tips">
      <div class="wetter-tips-title">Empfehlungen für deinen Stellplatz</div>
      ${tipsHtml}
    </div>

    <button class="btn" style="width:100%;margin-top:4px" onclick="refreshWetter()">🔄 Aktualisieren</button>
  `;
}

let _forecastCards = [];
let _forecastDayCount = 3;

function setForecastDays(n) {
  _forecastDayCount = n;
  const container = document.getElementById('wetter-forecast-container');
  if (container) container.innerHTML = _forecastCards.slice(0, n).join('');
  const btn3 = document.getElementById('btn-3d');
  const btn7 = document.getElementById('btn-7d');
  if (btn3 && btn7) {
    btn3.style.background = n === 3 ? 'var(--accent)' : 'var(--panel2)';
    btn3.style.color = n === 3 ? '#fff' : 'var(--muted)';
    btn7.style.background = n === 7 ? 'var(--accent)' : 'var(--panel2)';
    btn7.style.color = n === 7 ? '#fff' : 'var(--muted)';
  }
}

function refreshWetter() {
  const cache = JSON.parse(localStorage.getItem('wmp_wetter_cache') || 'null');
  if (cache) {
    loadWetter(cache.lat, cache.lon, cache.name, cache.sub, true);
  } else {
    toast('Kein Ort gespeichert');
  }
}

function restoreWetterCache() {
  const cache = JSON.parse(localStorage.getItem('wmp_wetter_cache') || 'null');
  if (!cache) return;
  const hasEnoughDays = cache.data?.daily?.time?.length >= 8;
  if (Date.now() - cache.ts < 30 * 60 * 1000 && hasEnoughDays) {
    document.getElementById('wetterSearchInp').value = cache.name;
    renderWetter(cache.data, cache.name, cache.sub);
  } else if (cache.lat) {
    document.getElementById('wetterSearchInp').value = cache.name;
    loadWetter(cache.lat, cache.lon, cache.name, cache.sub);
  }
}

// ══════════════════════════════════
// EXPORT / IMPORT
// ══════════════════════════════════
function buildSnapshot() {
  return {
    version: '1.1.0', exported: new Date().toISOString(),
    fahrzeug:       JSON.parse(localStorage.getItem('wmp_fahrzeug')||'{}'),
    service:        JSON.parse(localStorage.getItem('wmp_service')||'{}'),
    service_custom: JSON.parse(localStorage.getItem('wmp_service_custom')||'[]'),
    cl:             JSON.parse(localStorage.getItem('wmp_cl')||'null'),
    favs:           JSON.parse(localStorage.getItem('wmp_favs')||'[]'),
    settings:       JSON.parse(localStorage.getItem('wmp_settings')||'{}'),
    calib:          JSON.parse(localStorage.getItem('wmp_calib')||'null'),
    checks: clState, trips, activeTripId,
  };
}

function autoBackup() {
  const snap = buildSnapshot();
  const list = JSON.parse(localStorage.getItem('wmp_auto_backups') || '[]');
  list.unshift(snap);
  localStorage.setItem('wmp_auto_backups', JSON.stringify(list.slice(0, 3)));
}

function exportData() {
  const snap = buildSnapshot();
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `wohnmobil-pro-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function restoreAutoBackup(index) {
  const list = JSON.parse(localStorage.getItem('wmp_auto_backups') || '[]');
  const d = list[index];
  if (!d) return;
  if (!confirm(`Backup vom ${new Date(d.exported).toLocaleString('de-DE')} wiederherstellen?`)) return;
  if (d.checks) { clState = d.checks; saveCL(); renderCL(); }
  if (d.trips)  { trips = d.trips; activeTripId = d.activeTripId || null; saveTrips(); renderKosten(); }
  if (d.settings) localStorage.setItem('wmp_settings', JSON.stringify(d.settings));
  if (d.calib)    localStorage.setItem('wmp_calib', JSON.stringify(d.calib));
  loadSettings();
  renderAutoBackupList();
  toast('Backup wiederhergestellt');
}

function renderAutoBackupList() {
  const el = document.getElementById('auto-backup-list');
  if (!el) return;
  const list = JSON.parse(localStorage.getItem('wmp_auto_backups') || '[]');
  if (!list.length) { el.innerHTML = '<div style="font-size:0.78rem;color:var(--muted)">Noch kein automatisches Backup vorhanden.</div>'; return; }
  el.innerHTML = list.map((b, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:0.8rem;color:var(--text)">${new Date(b.exported).toLocaleString('de-DE')}</div>
        <div style="font-size:0.72rem;color:var(--muted)">${(b.trips||[]).length} Urlaube · ${Object.keys(b.checks||{}).length} Checklisten-Einträge</div>
      </div>
      <button onclick="restoreAutoBackup(${i})" style="padding:5px 12px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:0.75rem;font-weight:700;cursor:pointer">Laden</button>
    </div>`).join('');
}

function restoreSnapshot(d) {
  if (d.fahrzeug)       localStorage.setItem('wmp_fahrzeug',       JSON.stringify(d.fahrzeug));
  if (d.service)        localStorage.setItem('wmp_service',        JSON.stringify(d.service));
  if (d.service_custom) localStorage.setItem('wmp_service_custom', JSON.stringify(d.service_custom));
  if (d.cl)             localStorage.setItem('wmp_cl',             JSON.stringify(d.cl));
  if (d.favs)           { localStorage.setItem('wmp_favs', JSON.stringify(d.favs)); wmpFavs = d.favs; }
  if (d.checks)         { clState = d.checks; saveCL(); renderCL(); }
  if (d.trips)          { trips = d.trips; activeTripId = d.activeTripId || null; saveTrips(); renderKosten(); }
  if (d.settings)       localStorage.setItem('wmp_settings', JSON.stringify(d.settings));
  if (d.calib)          localStorage.setItem('wmp_calib',    JSON.stringify(d.calib));
  loadSettings();
}

function importData() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const fr = new FileReader();
    fr.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        restoreSnapshot(d);
        toast('Import erfolgreich');
      } catch { toast('Fehler beim Import'); }
    };
    fr.readAsText(e.target.files[0]);
  };
  inp.click();
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function toast(msg) {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    Object.assign(el.style, {
      position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)',
      background:'#1e2d45', border:'1px solid #22c55e', color:'#e2e8f0',
      padding:'9px 20px', borderRadius:'20px', fontFamily:'inherit',
      fontSize:'0.83rem', fontWeight:'600', zIndex:'999',
      opacity:'0', transition:'opacity 0.25s', pointerEvents:'none', whiteSpace:'nowrap',
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.opacity = '0', 2200);
}

// ══════════════════════════════════
// REISEKARTE
// ══════════════════════════════════
const LAND_COORDS = {
  '🇩🇪':[51.2,10.4],'🇦🇹':[47.5,14.5],'🇨🇭':[46.8,8.2],'🇮🇹':[42.5,12.5],
  '🇫🇷':[46.2,2.2],'🇪🇸':[40.4,-3.7],'🇵🇹':[39.4,-8.2],'🇳🇱':[52.3,5.3],
  '🇧🇪':[50.5,4.5],'🇱🇺':[49.8,6.1],'🇩🇰':[56.3,9.5],'🇸🇪':[59.3,18.1],
  '🇳🇴':[60.5,8.5],'🇫🇮':[61.9,25.7],'🇮🇸':[64.9,-18.0],'🇬🇧':[51.5,-0.1],
  '🇮🇪':[53.4,-8.2],'🇵🇱':[52.1,19.4],'🇨🇿':[49.8,15.5],'🇸🇰':[48.7,19.7],
  '🇭🇺':[47.2,19.5],'🇷🇴':[45.9,24.9],'🇧🇬':[42.7,25.5],'🇬🇷':[39.1,21.8],
  '🇭🇷':[45.1,15.2],'🇸🇮':[46.1,14.8],'🇷🇸':[44.0,21.0],'🇧🇦':[44.2,17.9],
  '🇲🇪':[42.7,19.4],'🇦🇱':[41.2,20.2],'🇲🇰':[41.6,21.7],'🇱🇹':[55.9,23.9],
  '🇱🇻':[56.9,24.6],'🇪🇪':[58.6,25.0],'🇺🇦':[48.4,31.2],'🇲🇹':[35.9,14.4],
  '🇨🇾':[35.1,33.4],'🇱🇮':[47.1,9.5],'🇦🇩':[42.5,1.5],'🇲🇨':[43.7,7.4],
  '🇸🇲':[43.9,12.5],'🇹🇷':[39.9,32.9],'🇲🇦':[31.8,-7.1],'🇹🇳':[34.0,9.0],
};

let _karteMap = null;

function initKarte() {
  const el = document.getElementById('karte-map');
  if (!el) return;
  if (!window.L) {
    el.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--muted);font-size:0.85rem"><span style="font-size:2rem">🗺</span>Karte benötigt Internet.<br><button class="btn btn-primary" style="margin-top:8px" onclick="initKarte()">Neu laden</button></div>';
    return;
  }
  if (_karteMap) { _karteMap.invalidateSize(); renderKartePins(); return; }
  _karteMap = L.map('karte-map', { zoomControl: true }).setView([48.5, 13.0], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(_karteMap);
  setTimeout(() => { _karteMap.invalidateSize(); renderKartePins(); }, 300);
}

let _kartePins = [];
let _kartePolylines = [];

function renderKartePins() {
  if (!_karteMap) return;
  _kartePins.forEach(l => _karteMap.removeLayer(l));
  _kartePolylines.forEach(l => _karteMap.removeLayer(l));
  _kartePins = []; _kartePolylines = [];

  const makeIcon = (color) => L.divIcon({
    html: `<div style="width:18px;height:28px;position:relative"><div style="position:absolute;bottom:0;left:50%;width:12px;height:12px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:translateX(-50%) rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div></div>`,
    className: '', iconSize: [18, 28], iconAnchor: [9, 28], popupAnchor: [0, -28]
  });
  const redIcon  = makeIcon('#e11d48');
  const blueIcon = makeIcon('#2563eb');

  let count = 0;
  const fmt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '?';

  trips.forEach(t => {
    // Etappen-Pins + Route
    if (t.etappen && t.etappen.length) {
      const coords = [];
      t.etappen.forEach((e, i) => {
        if (!e.lat || !e.lng) return;
        coords.push([e.lat, e.lng]);
        const m = L.marker([e.lat, e.lng], { icon: blueIcon }).addTo(_karteMap);
        const datum = e.von ? fmt(e.von) + (e.bis ? ' – ' + fmt(e.bis) : '') : '';
        m.bindPopup(`<strong>${t.land||''} ${t.name}</strong><br>Etappe ${i+1}: ${e.ort}${datum ? '<br>' + datum : ''}`);
        _kartePins.push(m);
        count++;
      });
      if (coords.length > 1) {
        const poly = L.polyline(coords, { color: '#2563eb', weight: 2, opacity: 0.6, dashArray: '6,6' }).addTo(_karteMap);
        _kartePolylines.push(poly);
      }
    }
    // Haupt-Trip-Pin
    let lat, lng;
    if (t.lat && t.lng) { lat = t.lat; lng = t.lng; }
    else if (t.land && LAND_COORDS[t.land]) { [lat, lng] = LAND_COORDS[t.land]; }
    else return;
    count++;
    const total = tripTotal(t).toFixed(2);
    const datum = (t.von || t.bis) ? fmt(t.von) + ' – ' + fmt(t.bis) + '<br>' : '';
    const m = L.marker([lat, lng], { icon: redIcon }).addTo(_karteMap);
    m.bindPopup(`<strong>${t.land||''} ${t.name}</strong><br>${datum}${t.ort ? t.ort + '<br>' : ''}${t.erstellt} · ${total} €`);
    _kartePins.push(m);
  });

  const legend = document.getElementById('karte-legend');
  if (legend) legend.textContent = count ? `${count} Ort${count > 1 ? 'e' : ''} gepinnt` : 'Noch keine Urlaube mit Ort oder Land vorhanden.';
  // Geocode Trips die noch keine Koordinaten haben
  trips.filter(t => !t.lat && (t.ort || t.name)).forEach(t => geocodeTripOrt(t));
}

// ══════════════════════════════════
// STATISTIK
// ══════════════════════════════════
function renderStatistik() {
  const el = document.getElementById('statistik-content');
  if (!el) return;
  const allTrips = trips || [];
  if (!allTrips.length) {
    el.innerHTML = '<div class="no-entries" style="padding:40px 0;text-align:center">📊 Noch keine Reisedaten vorhanden</div>';
    return;
  }
  const aktiv  = allTrips.filter(t => !t.archiviert).length;
  const archiv = allTrips.filter(t =>  t.archiviert).length;
  // Länder
  const laender = [...new Set(allTrips.map(t => t.land).filter(Boolean))];
  // Reisetage
  let gesamtTage = 0;
  allTrips.forEach(t => {
    if (t.von && t.bis) gesamtTage += Math.max(0, Math.round((new Date(t.bis) - new Date(t.von)) / 86400000) + 1);
  });
  // Kosten
  let gesamtKosten = 0, kraftstoffKosten = 0;
  allTrips.forEach(t => { gesamtKosten += tripTotal(t); kraftstoffKosten += (t.kraftstoff||[]).reduce((s,e) => s+e.l*e.p, 0); });
  // Tankungen & Verbrauch
  let tankungen = 0, verbrauchSum = 0, verbrauchN = 0;
  allTrips.forEach(t => {
    (t.kraftstoff||[]).forEach(e => { tankungen++; if (e.verbrauch) { verbrauchSum += e.verbrauch; verbrauchN++; } });
  });
  const avgVerbrauch = verbrauchN ? (verbrauchSum / verbrauchN) : 0;
  // Stellplätze & Etappen
  const stellplaetze = allTrips.reduce((s,t) => s + (t.stellplatz||[]).length, 0);
  const etappen      = allTrips.reduce((s,t) => s + (t.etappen||[]).length, 0);

  const landBadges = laender.length
    ? `<div class="land-badges">${laender.map(l => `<span class="land-badge">${l}</span>`).join('')}</div>`
    : '<div style="color:var(--muted);font-size:0.8rem;margin-top:6px">Noch keine Länder erfasst</div>';

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card-icon">🚐</div>
        <div class="stat-card-val">${aktiv + archiv}</div>
        <div class="stat-card-lbl">Urlaubsreisen<br><span style="font-size:0.65rem;color:var(--muted)">${aktiv} aktiv · ${archiv} archiviert</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📅</div>
        <div class="stat-card-val">${gesamtTage}</div>
        <div class="stat-card-lbl">Reisetage gesamt</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">💰</div>
        <div class="stat-card-val">${gesamtKosten.toFixed(0)} €</div>
        <div class="stat-card-lbl">Gesamtkosten</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">⛽</div>
        <div class="stat-card-val">${kraftstoffKosten.toFixed(0)} €</div>
        <div class="stat-card-lbl">Kraftstoffkosten</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🔁</div>
        <div class="stat-card-val">${tankungen}</div>
        <div class="stat-card-lbl">Tankungen gesamt${avgVerbrauch ? `<br><span style="color:var(--accent);font-size:0.75rem">Ø ${avgVerbrauch.toFixed(1)} L/100km</span>` : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🏕️</div>
        <div class="stat-card-val">${stellplaetze}</div>
        <div class="stat-card-lbl">Stellplätze</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🗺️</div>
        <div class="stat-card-val">${etappen}</div>
        <div class="stat-card-lbl">Etappen</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🌍</div>
        <div class="stat-card-val">${laender.length}</div>
        <div class="stat-card-lbl">Länder bereist</div>
      </div>
      <div class="stat-card is-wide">
        <div class="stat-card-icon">🏳️</div>
        <div class="stat-card-lbl" style="margin-bottom:4px">Bereiste Länder</div>
        ${landBadges}
      </div>
    </div>`;
}

// ══════════════════════════════════
// TAGEBUCH
// ══════════════════════════════════
let _tbFotoBase64 = null;

function onTbFotoSelect(input) {
  const file = input.files[0];
  if (!file) return;
  resizeImage(file, 800).then(b64 => {
    _tbFotoBase64 = b64;
    const img = document.getElementById('tb-foto-img');
    img.src = b64;
    document.getElementById('tb-foto-preview').style.display = 'block';
  });
}

function clearTbFoto() {
  _tbFotoBase64 = null;
  document.getElementById('tb-foto').value = '';
  document.getElementById('tb-foto-img').src = '';
  document.getElementById('tb-foto-preview').style.display = 'none';
}

function resizeImage(file, maxWidth) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function addTagebuch() {
  const trip = getActiveTrip(); if (!trip) { toast('Zuerst Urlaub wählen'); return; }
  const text = document.getElementById('tb-text').value.trim();
  if (!text) { toast('Text eingeben'); return; }
  if (!trip.tagebuch) trip.tagebuch = [];
  const entry = { id: Date.now(), dat: document.getElementById('tb-dat').value || new Date().toISOString().split('T')[0], text, foto: _tbFotoBase64 || null };
  trip.tagebuch.unshift(entry);
  document.getElementById('tb-text').value = '';
  clearTbFoto();
  saveTrips(); renderKosten();
  toast('Eintrag gespeichert');
}

function renderTagebuch(trip, isArchived) {
  if (!trip.tagebuch) trip.tagebuch = [];
  const list = document.getElementById('list-tagebuch');
  if (!list) return;
  // Tagebuch-Formular zeigen/verbergen
  const form = document.getElementById('tagebuch-form');
  if (form) form.style.display = isArchived ? 'none' : '';
  if (!trip.tagebuch.length) {
    list.innerHTML = '<div class="no-entries">📔 Noch keine Einträge — schreib dein erstes Erlebnis</div>';
    return;
  }
  const fmt = d => d ? new Date(d+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '';
  list.innerHTML = trip.tagebuch.map(e => {
    const fotoHtml = e.foto ? `<img class="tb-thumb" src="${e.foto}" alt="Foto" onclick="showTbFotoFull('${e.id}')">` : '';
    const delBtn   = isArchived ? '' : `<button class="ei-del" style="flex-shrink:0" onclick="delTagebuch(${trip.id},${e.id})">✕</button>`;
    return `<div class="tb-entry" id="tb-entry-${e.id}">
      ${fotoHtml}
      <div class="tb-body">
        <div class="tb-date">📅 ${fmt(e.dat)}</div>
        <div class="tb-text collapsed" id="tb-txt-${e.id}">${e.text.replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
        ${e.text.length > 120 ? `<span class="tb-mehr" onclick="toggleTbText(${e.id})">mehr anzeigen</span>` : ''}
      </div>
      ${delBtn}
    </div>`;
  }).join('');
}

function toggleTbText(id) {
  const el = document.getElementById('tb-txt-' + id);
  const btn = el.nextElementSibling;
  if (!el) return;
  const collapsed = el.classList.toggle('collapsed');
  if (btn && btn.classList.contains('tb-mehr')) btn.textContent = collapsed ? 'mehr anzeigen' : 'weniger';
}

function showTbFotoFull(id) {
  const trip = getActiveTrip(); if (!trip || !trip.tagebuch) return;
  const entry = trip.tagebuch.find(e => String(e.id) === String(id));
  if (!entry || !entry.foto) return;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;cursor:pointer';
  ov.onclick = () => ov.remove();
  ov.innerHTML = `<img src="${entry.foto}" style="max-width:100%;max-height:90vh;border-radius:10px;object-fit:contain">`;
  document.body.appendChild(ov);
}

function delTagebuch(tripId, entryId) {
  const trip = trips.find(t => String(t.id) === String(tripId));
  if (!trip || !trip.tagebuch) return;
  trip.tagebuch = trip.tagebuch.filter(e => e.id !== entryId);
  saveTrips(); renderKosten();
}

// ══════════════════════════════════
// ENERGIEBILANZ
// ══════════════════════════════════
let ebConsumers = [];
let ebVolt = 12;
let _ebIdCounter = 1;

function setEbVolt(v) {
  ebVolt = v;
  document.getElementById('eb-volt-12').className = v === 12 ? 'btn btn-primary eb-volt-btn' : 'btn eb-volt-btn';
  document.getElementById('eb-volt-24').className = v === 24 ? 'btn btn-primary eb-volt-btn' : 'btn eb-volt-btn';
  calcEnergiebilanz();
}

function ebAddPreset(name, watt, stunden) {
  ebConsumers.push({ id: _ebIdCounter++, name, watt, stunden });
  renderEbConsumers();
  calcEnergiebilanz();
}

function ebAddConsumer() {
  ebConsumers.push({ id: _ebIdCounter++, name: '', watt: '', stunden: '' });
  renderEbConsumers();
}

function ebRemove(id) {
  ebConsumers = ebConsumers.filter(c => c.id !== id);
  renderEbConsumers();
  calcEnergiebilanz();
}

function ebRowUpdate(id, field, val) {
  const c = ebConsumers.find(x => x.id === id);
  if (!c) return;
  c[field] = field === 'name' ? val : (parseFloat(val) || 0);
  calcEnergiebilanz();
}

function renderEbConsumers() {
  const el = document.getElementById('eb-consumers');
  if (!el) return;
  if (!ebConsumers.length) {
    el.innerHTML = '<div class="no-entries" style="padding:16px 0">Noch keine Verbraucher – füge welche hinzu oder nutze die Schnell-Presets</div>';
    return;
  }
  el.innerHTML = ebConsumers.map(c => `
    <div class="eb-row">
      <div>
        <div class="eb-row-lbl">Gerät</div>
        <input value="${c.name}" placeholder="Kühlbox…" oninput="ebRowUpdate(${c.id},'name',this.value)" style="text-align:left">
      </div>
      <div>
        <div class="eb-row-lbl">Watt</div>
        <input type="number" value="${c.watt}" placeholder="45" oninput="ebRowUpdate(${c.id},'watt',this.value)">
      </div>
      <div>
        <div class="eb-row-lbl">h/Tag</div>
        <input type="number" value="${c.stunden}" placeholder="24" step="0.5" oninput="ebRowUpdate(${c.id},'stunden',this.value)">
      </div>
      <div>
        <div class="eb-row-lbl">Wh/Tag</div>
        <input type="number" value="${c.watt && c.stunden ? (c.watt*c.stunden).toFixed(0) : ''}" readonly style="color:var(--muted)">
      </div>
      <button class="eb-del" onclick="ebRemove(${c.id})">✕</button>
    </div>`).join('');
}

function calcEnergiebilanz() {
  const gesamtWh = ebConsumers.reduce((s,c) => s + (c.watt||0)*(c.stunden||0), 0);
  const gesamtAh = ebVolt > 0 ? gesamtWh / ebVolt : 0;

  const solarWp   = parseFloat(document.getElementById('eb-solar-wp')?.value) || 0;
  const solarH    = parseFloat(document.getElementById('eb-solar-h')?.value)  || 0;
  const solarEff  = parseFloat(document.getElementById('eb-solar-eff')?.value) || 85;
  const batAh     = parseFloat(document.getElementById('eb-bat-ah')?.value)  || 0;

  const solarWh   = solarWp * solarH * (solarEff / 100);
  const solarAh   = ebVolt > 0 ? solarWh / ebVolt : 0;
  const batWh     = batAh * ebVolt;
  const diffWh    = solarWh - gesamtWh;

  const resultEl = document.getElementById('eb-result');
  if (!gesamtWh && !solarWp) { if (resultEl) resultEl.style.display = 'none'; return; }
  if (resultEl) resultEl.style.display = 'block';

  // Balken
  const bar = document.getElementById('eb-bar');
  const barLbl = document.getElementById('eb-bar-lbl');
  if (bar && barLbl) {
    const pct = solarWh > 0 ? Math.min(100, (gesamtWh / solarWh) * 100) : 100;
    bar.style.width = pct + '%';
    bar.style.background = pct > 100 ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--accent)';
    barLbl.textContent = gesamtWh.toFixed(0) + ' Wh / ' + (solarWh ? solarWh.toFixed(0) + ' Wh Solar' : 'kein Solar');
  }

  // Kacheln
  const cards = document.getElementById('eb-cards');
  if (cards) {
    cards.innerHTML = `
      <div class="sum-card is-total"><div class="sum-icon">⚡</div><div class="sum-lbl">Verbrauch/Tag</div><div class="sum-val">${gesamtWh.toFixed(0)} Wh</div></div>
      <div class="sum-card"><div class="sum-icon">🔋</div><div class="sum-lbl">In Ampere</div><div class="sum-val">${gesamtAh.toFixed(1)} Ah</div></div>
      <div class="sum-card"><div class="sum-icon">☀️</div><div class="sum-lbl">Solar/Tag</div><div class="sum-val">${solarWh.toFixed(0)} Wh</div></div>
      ${batWh ? `<div class="sum-card"><div class="sum-icon">🔌</div><div class="sum-lbl">Batterieautonomie</div><div class="sum-val">${gesamtWh>0?(batWh/gesamtWh).toFixed(1)+' Tage':'–'}</div></div>` : ''}`;
  }

  // Hinweise
  const hints = document.getElementById('eb-hints');
  if (hints) {
    const msgs = [];
    if (solarWh > 0 && diffWh >= 0) msgs.push(`<div class="eb-hint-ok">✅ Solar deckt den Bedarf — Überschuss: ${diffWh.toFixed(0)} Wh/Tag (${(diffWh/ebVolt).toFixed(1)} Ah)</div>`);
    if (solarWh > 0 && diffWh < 0)  msgs.push(`<div class="eb-hint-err">⚠️ Solar-Defizit: ${Math.abs(diffWh).toFixed(0)} Wh/Tag fehlen — mehr Panels oder weniger Verbrauch</div>`);
    if (!solarWp && gesamtWh > 0)   msgs.push(`<div class="eb-hint-warn">💡 Gib Solar-Leistung ein um die Deckung zu berechnen</div>`);
    if (batAh > 0 && gesamtWh > 0) {
      const autonomieTage = (batAh * ebVolt * 0.5) / gesamtWh;
      msgs.push(`<div class="eb-hint-ok">🔋 Batterie (50% Entladetiefe): ${autonomieTage.toFixed(1)} Tage Autonomie ohne Solar</div>`);
    }
    hints.innerHTML = msgs.join('');
  }
}

// ══════════════════════════════════
// SHARE
// ══════════════════════════════════
function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: 'Wohnmobil Pro',
      text: 'Camping-Werkzeug: Nivellieren, Checkliste, Kosten & Wetter – kostenlos & offline.',
      url: 'https://wohnmobil-pro.michaely.de/'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText('https://wohnmobil-pro.michaely.de/').then(() => toast('Link kopiert!'));
  }
}

// ══════════════════════════════════
// SEARCH
// ══════════════════════════════════
function openSearch() {
  const term = prompt('Suchen:');
  if (!term || !term.trim()) return;
  const q = term.trim().toLowerCase();
  const map = [
    { keys: ['nivellier','level','ausricht','neigung','gyro'], sec: 'nivellieren' },
    { keys: ['checkliste','checklist','abfahrt','ankunft','winter','aufgabe'], sec: 'checkliste' },
    { keys: ['kosten','kraftstoff','diesel','benzin','stellplatz','ausgabe','urlaub','sonstiges'], sec: 'kosten' },
    { keys: ['wetter','regen','temperatur','wind','prognose','forecast'], sec: 'wetter' },
    { keys: ['mehr','impressum','datenschutz','info','version'], sec: 'mehr' },
  ];
  const match = map.find(m => m.keys.some(k => k.includes(q) || q.includes(k)));
  if (match) {
    showSection(match.sec);
    toast('Zu „' + match.sec.charAt(0).toUpperCase() + match.sec.slice(1) + '" gesprungen');
  } else {
    toast('Kein Treffer für „' + term + '"');
  }
}

// ══════════════════════════════════
// DISCLAIMER
// ══════════════════════════════════
function showDisclaimer() {
  const overlay = document.getElementById('disclaimer-overlay');
  overlay.style.display = 'flex';
}
function closeDisclaimer() {
  document.getElementById('disclaimer-overlay').style.display = 'none';
  localStorage.setItem('wmp_disclaimer', '1');
}

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
(function init() {
  loadTheme();
  if (!localStorage.getItem('wmp_disclaimer')) showDisclaimer();
  const fy = document.getElementById('footer-year');
  if (fy) fy.textContent = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  ['kf-dat','sp-dat','so-dat','tb-dat','wt-dat'].forEach(id => { const el = document.getElementById(id); if (el) el.value = today; });
  renderEbConsumers();
  loadSettings();
  loadCL();
  loadTrips();
  renderCL();
  renderKosten();
  autoBackup();
  renderAutoBackupList();
  startSensor();
  restoreWetterCache();
  renderServiceStartBanner();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();

// ══════════════════════════════════
// NOTFALLNUMMERN
// ══════════════════════════════════
const NOTFALL_DATA = [
  { land:'🇩🇪 Deutschland', notruf:'112', polizei:'110', feuerwehr:'112', pannenhilfe:'0800 5 10 11 12', pannentipp:'ADAC', ambulanz:'112' },
  { land:'🇦🇹 Österreich',  notruf:'112', polizei:'133', feuerwehr:'122', pannenhilfe:'120',             pannentipp:'ÖAMTC', ambulanz:'144' },
  { land:'🇨🇭 Schweiz',     notruf:'112', polizei:'117', feuerwehr:'118', pannenhilfe:'140',             pannentipp:'TCS', ambulanz:'144' },
  { land:'🇮🇹 Italien',     notruf:'112', polizei:'113', feuerwehr:'115', pannenhilfe:'803 116',         pannentipp:'ACI', ambulanz:'118' },
  { land:'🇫🇷 Frankreich',  notruf:'112', polizei:'17',  feuerwehr:'18',  pannenhilfe:'0800 008 008',    pannentipp:'AXA Assistance', ambulanz:'15' },
  { land:'🇪🇸 Spanien',     notruf:'112', polizei:'091', feuerwehr:'080', pannenhilfe:'900 365 505',     pannentipp:'RACE', ambulanz:'112' },
  { land:'🇵🇹 Portugal',    notruf:'112', polizei:'112', feuerwehr:'112', pannenhilfe:'707 509 510',     pannentipp:'ACP', ambulanz:'112' },
  { land:'🇳🇱 Niederlande', notruf:'112', polizei:'0900 8844', feuerwehr:'112', pannenhilfe:'0800 0503', pannentipp:'ANWB', ambulanz:'112' },
  { land:'🇧🇪 Belgien',     notruf:'112', polizei:'101', feuerwehr:'100', pannenhilfe:'070 344 777',     pannentipp:'Touring', ambulanz:'100' },
  { land:'🇩🇰 Dänemark',    notruf:'112', polizei:'114', feuerwehr:'112', pannenhilfe:'70 10 80 90',     pannentipp:'Falck', ambulanz:'112' },
  { land:'🇸🇪 Schweden',    notruf:'112', polizei:'114 14', feuerwehr:'112', pannenhilfe:'020 912 912',  pannentipp:'Assistancekåren', ambulanz:'112' },
  { land:'🇳🇴 Norwegen',    notruf:'112', polizei:'02800', feuerwehr:'110', pannenhilfe:'08505',         pannentipp:'NAF', ambulanz:'113' },
  { land:'🇫🇮 Finnland',    notruf:'112', polizei:'0295 419 800', feuerwehr:'112', pannenhilfe:'0200 8080', pannentipp:'Autoliitto', ambulanz:'112' },
  { land:'🇭🇷 Kroatien',    notruf:'112', polizei:'192', feuerwehr:'193', pannenhilfe:'1987',            pannentipp:'HAK', ambulanz:'194' },
  { land:'🇸🇮 Slowenien',   notruf:'112', polizei:'113', feuerwehr:'112', pannenhilfe:'1987',            pannentipp:'AMZS', ambulanz:'112' },
  { land:'🇬🇷 Griechenland',notruf:'112', polizei:'100', feuerwehr:'199', pannenhilfe:'10400',           pannentipp:'ELPA', ambulanz:'166' },
  { land:'🇵🇱 Polen',       notruf:'112', polizei:'997', feuerwehr:'998', pannenhilfe:'196 37',          pannentipp:'PZM', ambulanz:'999' },
  { land:'🇨🇿 Tschechien',  notruf:'112', polizei:'158', feuerwehr:'150', pannenhilfe:'1230',            pannentipp:'ÚAMK', ambulanz:'155' },
  { land:'🇸🇰 Slowakei',    notruf:'112', polizei:'158', feuerwehr:'150', pannenhilfe:'18124',           pannentipp:'SATC', ambulanz:'155' },
  { land:'🇭🇺 Ungarn',      notruf:'112', polizei:'107', feuerwehr:'105', pannenhilfe:'188',             pannentipp:'Magyar Autóklub', ambulanz:'104' },
  { land:'🇷🇴 Rumänien',    notruf:'112', polizei:'112', feuerwehr:'112', pannenhilfe:'9271',            pannentipp:'ACR', ambulanz:'112' },
  { land:'🇧🇬 Bulgarien',   notruf:'112', polizei:'166', feuerwehr:'160', pannenhilfe:'1286',            pannentipp:'SBA', ambulanz:'150' },
  { land:'🇷🇸 Serbien',     notruf:'112', polizei:'192', feuerwehr:'193', pannenhilfe:'1987',            pannentipp:'AMSS', ambulanz:'194' },
  { land:'🇲🇪 Montenegro',  notruf:'112', polizei:'122', feuerwehr:'123', pannenhilfe:'19807',           pannentipp:'AMSCG', ambulanz:'124' },
  { land:'🇦🇱 Albanien',    notruf:'112', polizei:'129', feuerwehr:'128', pannenhilfe:'04 2223 467',     pannentipp:'ACA', ambulanz:'127' },
  { land:'🇲🇰 Nordmazedonien', notruf:'112', polizei:'192', feuerwehr:'193', pannenhilfe:'196',          pannentipp:'AMKSM', ambulanz:'194' },
  { land:'🇬🇧 Großbritannien', notruf:'999', polizei:'999', feuerwehr:'999', pannenhilfe:'0800 887 766', pannentipp:'AA / RAC', ambulanz:'999' },
  { land:'🇮🇪 Irland',      notruf:'999', polizei:'999', feuerwehr:'999', pannenhilfe:'1800 667 788',    pannentipp:'AA Ireland', ambulanz:'999' },
  { land:'🇹🇷 Türkei',      notruf:'112', polizei:'155', feuerwehr:'110', pannenhilfe:'444 1 444',       pannentipp:'TTOK', ambulanz:'112' },
  { land:'🇲🇦 Marokko',     notruf:'15',  polizei:'19',  feuerwehr:'15',  pannenhilfe:'0522 400 400',    pannentipp:'MACM', ambulanz:'15' },
];

// ══════════════════════════════════
// FAHRZEUGDATEN
// ══════════════════════════════════
const FZ_FIELDS = ['typ','kz','hersteller','modell','spitzname','fin','ez','bj','tuev','gas-pruef','inspektion','insp-km','vers-name','vers-nr','vers-tel','reifen','druck','oel','tank','zgg','leer','notiz'];

function switchFahrzeugTab(name, btn) {
  document.querySelectorAll('#sec-fahrzeug .seg-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.fz-panel').forEach(p => p.style.display = 'none');
  btn.classList.add('active');
  document.getElementById('fz-panel-' + name).style.display = 'block';
  if (name === 'zuladung') initZuladung();
  if (name === 'service') initService();
}

function initZuladung() {
  const fz = JSON.parse(localStorage.getItem('wmp_fahrzeug') || '{}');
  if (fz.zgg)  { const el = document.getElementById('zul-zgg');  if (el && !el.dataset.manual) el.value = fz.zgg; }
  if (fz.leer) { const el = document.getElementById('zul-leer'); if (el && !el.dataset.manual) el.value = fz.leer; }
  calcZuladung();
}

function calcZuladung() {
  const zgg  = parseFloat(document.getElementById('zul-zgg')?.value)  || 0;
  const leer = parseFloat(document.getElementById('zul-leer')?.value) || 0;
  const pers = (parseFloat(document.getElementById('zul-pers-anz')?.value) || 0)
             * (parseFloat(document.getElementById('zul-pers-kg')?.value)  || 85);
  const gepaeck    = parseFloat(document.getElementById('zul-gepaeck')?.value)    || 0;
  const lebensm    = parseFloat(document.getElementById('zul-lebensm')?.value)    || 0;
  const wasserL    = parseFloat(document.getElementById('zul-wasser')?.value)     || 0;
  const kraftstL   = parseFloat(document.getElementById('zul-kraftstoff')?.value) || 0;
  const gas        = parseFloat(document.getElementById('zul-gas')?.value)        || 0;
  const sonstiges  = parseFloat(document.getElementById('zul-sonstiges')?.value)  || 0;

  const wasser    = wasserL   * 1.0;
  const kraftstoff = kraftstL * 0.84;

  const beladen = pers + gepaeck + lebensm + wasser + kraftstoff + gas + sonstiges;
  const wertEl  = document.getElementById('zul-wert');
  const statusEl = document.getElementById('zul-status');
  const barWrap = document.getElementById('zul-bar-wrap');
  const bar     = document.getElementById('zul-bar');
  const breakdown = document.getElementById('zul-breakdown');
  const bList   = document.getElementById('zul-breakdown-list');

  if (!zgg || !leer) {
    wertEl.textContent = '–';
    wertEl.style.color = 'var(--muted)';
    statusEl.textContent = 'ZGG und Leergewicht eingeben';
    barWrap.style.display = 'none';
    breakdown.style.display = 'none';
    return;
  }

  const maxNutzlast = zgg - leer;
  const frei = maxNutzlast - beladen;
  const gesamtKg = leer + beladen;

  wertEl.textContent = Math.round(frei) + ' kg';
  barWrap.style.display = 'block';
  breakdown.style.display = 'block';

  const pct = Math.min(100, Math.max(0, (beladen / maxNutzlast) * 100));
  bar.style.width = pct + '%';

  if (frei < 0) {
    wertEl.style.color = '#c0392b';
    bar.style.background = '#c0392b';
    statusEl.textContent = '⚠️ Überladen! ' + Math.abs(Math.round(frei)) + ' kg zu viel';
    statusEl.style.color = '#c0392b';
  } else if (frei < 50) {
    wertEl.style.color = '#e74c3c';
    bar.style.background = '#e74c3c';
    statusEl.textContent = '⚠️ Kritisch – fast überladen';
    statusEl.style.color = '#e74c3c';
  } else if (frei < 200) {
    wertEl.style.color = '#f39c12';
    bar.style.background = '#f39c12';
    statusEl.textContent = '⚡ Knapp – Beladung prüfen';
    statusEl.style.color = '#f39c12';
  } else {
    wertEl.style.color = '#27ae60';
    bar.style.background = '#27ae60';
    statusEl.textContent = '✅ Reserven vorhanden';
    statusEl.style.color = '#27ae60';
  }

  const rows = [
    { label: 'Leergewicht', kg: leer },
    { label: `Personen (${document.getElementById('zul-pers-anz')?.value || 0} × ${document.getElementById('zul-pers-kg')?.value || 85} kg)`, kg: pers },
    gepaeck   ? { label: 'Gepäck',        kg: gepaeck }   : null,
    lebensm   ? { label: 'Lebensmittel',  kg: lebensm }   : null,
    wasserL   ? { label: `Wasser (${wasserL} L)`,        kg: wasser }    : null,
    kraftstL  ? { label: `Kraftstoff (${kraftstL} L)`,   kg: Math.round(kraftstoff * 10) / 10 } : null,
    gas       ? { label: 'Gas',           kg: gas }       : null,
    sonstiges ? { label: 'Sonstiges',     kg: sonstiges } : null,
  ].filter(Boolean);

  bList.innerHTML = rows.map(r =>
    `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:0.88rem">
      <span style="color:var(--muted)">${r.label}</span>
      <span style="font-weight:600;color:var(--text)">${r.kg} kg</span>
    </div>`
  ).join('') + `<div style="display:flex;justify-content:space-between;padding:8px 0 4px;font-size:0.9rem;font-weight:700">
    <span>Gesamtgewicht</span><span>${Math.round(gesamtKg)} / ${zgg} kg</span>
  </div>`;
}

// ══════════════════════════════════
// SERVICE-ALARM
// ══════════════════════════════════
function loadSvCustom()       { return JSON.parse(localStorage.getItem('wmp_service_custom') || '[]'); }
function saveSvCustom(list)   { localStorage.setItem('wmp_service_custom', JSON.stringify(list)); }

function svToggleTyp() {
  const typ = document.getElementById('sv-typ')?.value;
  document.getElementById('sv-field-km').style.display   = typ === 'km'   ? 'block' : 'none';
  document.getElementById('sv-field-date').style.display = typ === 'date' ? 'block' : 'none';
}

function initService() {
  const sv = JSON.parse(localStorage.getItem('wmp_service') || '{}');
  const el = document.getElementById('sv-aktkm');
  if (el && sv.aktkm) el.value = sv.aktkm;
  renderService();
}

function calcServiceItems(aktkmOverride) {
  const fz     = JSON.parse(localStorage.getItem('wmp_fahrzeug') || '{}');
  const sv     = JSON.parse(localStorage.getItem('wmp_service')  || '{}');
  const custom = loadSvCustom();
  const aktkm  = aktkmOverride !== undefined ? aktkmOverride
                 : (parseFloat(document.getElementById('sv-aktkm')?.value) || parseFloat(sv.aktkm) || 0);
  const today  = new Date(); today.setHours(0,0,0,0);

  function toIso(dateObj) {
    return dateObj.toISOString().split('T')[0];
  }
  function daysDiff(dateStr) {
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    return { days: Math.round((d - today) / 86400000), dateIso: dateStr };
  }
  function monthEnd(ym) {
    const [y,m] = ym.split('-').map(Number);
    const d = new Date(y, m, 0);
    return { days: Math.round((d - today) / 86400000), dateIso: toIso(d) };
  }

  const items = [];
  if (fz.tuev)        { const r=monthEnd(fz.tuev);        items.push({ label:'TÜV / HU',               typ:'date', ...r }); }
  if (fz['gas-pruef']){ const r=monthEnd(fz['gas-pruef']); items.push({ label:'Gasuntersuchung (DVGW)', typ:'date', ...r }); }
  if (fz.inspektion)  { const r=daysDiff(fz.inspektion);  items.push({ label:'Inspektion (Datum)',      typ:'date', ...r }); }
  if (fz['insp-km'] && aktkm)
    items.push({ label: 'Inspektion (km)', typ:'km', kmLeft: parseFloat(fz['insp-km']) - aktkm });

  for (const r of custom) {
    if (r.typ === 'date' && r.faellig) {
      const dd = daysDiff(r.faellig);
      items.push({ label: r.label, typ:'date', ...dd, id: r.id });
    } else if (r.typ === 'km' && r.faellig_km)
      items.push({ label: r.label, typ:'km', kmLeft: aktkm ? r.faellig_km - aktkm : null, id: r.id, noKm: !aktkm });
  }

  items.sort((a, b) => {
    const sa = a.typ==='date' ? a.days : (a.kmLeft ?? 99999);
    const sb = b.typ==='date' ? b.days : (b.kmLeft ?? 99999);
    return sa - sb;
  });
  return items;
}

function svItemStyle(item) {
  let color, icon, sub;
  if (item.noKm) {
    color='var(--muted)'; icon='📅'; sub='Kilometerstand eingeben';
  } else if (item.typ === 'date') {
    const d = item.days;
    if      (d < 0)   { color='#ef4444'; icon='⚠️'; sub=`${Math.abs(d)} Tage überfällig`; }
    else if (d <= 14) { color='#ef4444'; icon='🔔'; sub=`in ${d} Tagen fällig`; }
    else if (d <= 60) { color='#f59e0b'; icon='📅'; sub=`in ${d} Tagen fällig`; }
    else              { color='#27ae60'; icon='✅'; sub=`in ${d} Tagen fällig`; }
  } else {
    const km = Math.round(item.kmLeft);
    if      (km < 0)    { color='#ef4444'; icon='⚠️'; sub=`${Math.abs(km).toLocaleString('de')} km überfällig`; }
    else if (km <= 500) { color='#ef4444'; icon='🔔'; sub=`in ${km.toLocaleString('de')} km fällig`; }
    else if (km <= 2000){ color='#f59e0b'; icon='📅'; sub=`in ${km.toLocaleString('de')} km fällig`; }
    else                { color='#27ae60'; icon='✅'; sub=`in ${km.toLocaleString('de')} km fällig`; }
  }
  return { color, icon, sub };
}

function renderService() {
  const sv = JSON.parse(localStorage.getItem('wmp_service') || '{}');
  const aktkm = parseFloat(document.getElementById('sv-aktkm')?.value) || 0;
  sv.aktkm = aktkm;
  localStorage.setItem('wmp_service', JSON.stringify(sv));

  const items = calcServiceItems(aktkm);
  const el = document.getElementById('sv-list');
  if (!el) return;

  if (!items.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--muted);padding:24px 0;font-size:0.9rem">Keine Daten. Fahrzeugdaten ausfüllen oder Erinnerungen hinzufügen.</div>';
    renderServiceStartBanner();
    return;
  }

  el.innerHTML = items.map(item => {
    const { color, icon, sub } = svItemStyle(item);
    const del = item.id !== undefined
      ? `<button onclick="deleteSvCustom(${item.id})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem;padding:0;flex-shrink:0">🗑</button>`
      : '';
    const calBtn = item.typ === 'date' && item.dateIso
      ? `<button onclick="addToCalendar('${item.label.replace(/'/g,"\\'")}','${item.dateIso}')"
           title="In Kalender eintragen"
           style="background:none;border:1px solid var(--border);border-radius:6px;color:var(--muted);cursor:pointer;font-size:0.72rem;padding:3px 7px;flex-shrink:0;line-height:1.4">📅</button>`
      : '';
    return `<div style="background:var(--card);border-radius:10px;padding:13px 14px;margin-bottom:8px;border-left:4px solid ${color};display:flex;align-items:center;gap:8px">
      <div style="font-size:1.35rem;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:var(--text);font-size:0.93rem">${item.label}</div>
        <div style="font-size:0.8rem;color:${color};margin-top:2px">${sub}</div>
      </div>${calBtn}${del}
    </div>`;
  }).join('');

  renderServiceStartBanner();
}

// ══════════════════════════════════
// STARTSEITE – Begrüßung & Favoriten
// ══════════════════════════════════
function toggleStartFav(id, e) {
  e.stopPropagation();
  const idx = wmpFavs.indexOf(id);
  if (idx > -1) wmpFavs.splice(idx, 1); else wmpFavs.push(id);
  localStorage.setItem(WMP_FAVS_KEY, JSON.stringify(wmpFavs));
  renderStart();
}

function makeStartCard(tool) {
  const isFav = wmpFavs.includes(tool.id);
  return `<div class="start-card${isFav?' is-fav':''}" onclick="${tool.action}">
    <button class="start-fav-btn${isFav?' active':''}" onclick="toggleStartFav('${tool.id}',event)" title="${isFav?'Favorit entfernen':'Als Favorit merken'}">${isFav?'⭐':'☆'}</button>
    <div class="start-card-icon-wrap">
      <div class="start-card-icon">${tool.icon}</div>
    </div>
    <div class="start-card-name">${tool.name}</div>
    <div class="start-card-desc">${tool.desc}</div>
  </div>`;
}

function renderStart() {
  // Begrüßung + Datum
  const now = new Date();
  const h = now.getHours();
  const greet = h < 11 ? '☀️ Guten Morgen' : h < 18 ? '🌤 Guten Tag' : '🌙 Guten Abend';
  const gEl = document.getElementById('start-greeting');
  if (gEl) gEl.textContent = greet;
  const dEl = document.getElementById('start-date');
  if (dEl) dEl.textContent = now.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  // Wetter auf Startseite laden
  startWeatherLoad();

  // Fahrzeugname
  const fzEl = document.getElementById('start-fahrzeug');
  if (fzEl) {
    try {
      const fz = JSON.parse(localStorage.getItem('wmp_fahrzeug') || '{}');
      const name = fz.spitzname || ((fz.hersteller && fz.modell) ? `${fz.hersteller} ${fz.modell}` : fz.typ || null);
      fzEl.textContent = name ? `🚐 ${name}` : '15 Werkzeuge · Camping · Offline';
    } catch(e) { fzEl.textContent = '15 Werkzeuge · Camping · Offline'; }
  }

  // Schnellzugriff: Favoriten wenn gesetzt, sonst 4 Defaults
  const QUICK_DEFAULT = ['nivellieren', 'wetter', 'checkliste', 'fahrzeug'];
  const favGrid  = document.getElementById('start-fav-grid');
  const favLabel = document.getElementById('start-quick-label');
  if (favGrid) {
    const showIds = wmpFavs.length > 0 ? wmpFavs : QUICK_DEFAULT;
    if (favLabel) {
      favLabel.textContent = wmpFavs.length > 0 ? '⭐ Meine Favoriten' : '🔧 Schnellzugriff';
      favLabel.style.color = wmpFavs.length > 0 ? 'var(--accent)' : 'var(--muted)';
    }
    favGrid.innerHTML = showIds.map(id => {
      const t = START_TOOLS.find(x => x.id === id);
      return t ? makeStartCard(t) : '';
    }).join('');
  }

  // Alle Werkzeuge (Grid immer aktuell halten, Sichtbarkeit über toggleAllTools)
  const allGrid = document.getElementById('start-all-grid');
  if (allGrid) allGrid.innerHTML = START_TOOLS.map(t => makeStartCard(t)).join('');
}

async function startWeatherLoad() {
  const el = document.getElementById('start-weather');
  if (!el) return;

  // Aus Wetter-Cache laden (max 30 Min alt)
  try {
    const cache = JSON.parse(localStorage.getItem('wmp_wetter_cache') || 'null');
    if (cache && cache.data && (Date.now() - cache.ts) < 30 * 60 * 1000) {
      renderStartWeather(cache.data, cache.name);
      return;
    }
  } catch(e) {}

  // Standort holen (still, ohne Fehlermeldung bei Ablehnung)
  if (!navigator.geolocation) return;
  el.innerHTML = `<div style="font-size:0.72rem;color:var(--muted)">📍 Wetter wird geladen…</div>`;
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      // Ortsname via Nominatim
      let name = '';
      try {
        const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
        const gd = await geo.json();
        name = gd.address?.city || gd.address?.town || gd.address?.village || gd.address?.county || '';
      } catch(e) {}
      // Wetter laden – gleiche URL wie Wetter-Tab, damit Cache kompatibel
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`
        + `&timezone=auto&forecast_days=8`;
      const res = await fetch(url);
      const data = await res.json();
      localStorage.setItem('wmp_wetter_cache', JSON.stringify({ lat, lon, name, sub: '', ts: Date.now(), data }));
      renderStartWeather(data, name);
    } catch(e) { el.innerHTML = ''; }
  }, () => { el.innerHTML = ''; }, { timeout: 8000 });
}

function renderStartWeather(data, name) {
  const el = document.getElementById('start-weather');
  if (!el || !data?.current) return;
  const cur = data.current;
  const wmo = wmoInfo(cur.weather_code, cur.is_day === 1);
  const temp = Math.round(cur.temperature_2m);
  const feel = Math.round(cur.apparent_temperature);
  const loc = name ? `📍 ${name}` : '';
  el.innerHTML = `<div onclick="showSection('wetter')" style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:20px;padding:7px 16px;cursor:pointer;transition:border-color 0.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
    <span style="font-size:1.4rem">${wmo.icon}</span>
    <div style="text-align:left">
      <div style="font-size:0.95rem;font-weight:700;color:var(--text)">${temp}°C <span style="font-size:0.72rem;font-weight:400;color:var(--muted)">/ gefühlt ${feel}°C</span></div>
      <div style="font-size:0.7rem;color:var(--muted)">${wmo.desc}${loc ? ' · ' + loc : ''}</div>
    </div>
  </div>`;
}

function toggleAllTools() {
  const grid  = document.getElementById('start-all-grid');
  const arrow = document.getElementById('start-all-arrow');
  if (!grid) return;
  const open = grid.style.display !== 'none';
  grid.style.display  = open ? 'none' : 'grid';
  if (arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

function renderServiceStartBanner() {
  const banner = document.getElementById('sv-start-banner');
  if (!banner) return;

  const items = calcServiceItems();
  const urgent = items.filter(i => {
    if (i.noKm) return false;
    if (i.typ === 'date') return i.days <= 60;
    return i.kmLeft !== null && i.kmLeft <= 2000;
  });

  // Gas-Alarm prüfen
  let gasAlarmHtml = '';
  try {
    const gd = JSON.parse(localStorage.getItem('wmp_gas') || 'null');
    if (gd && gd.bottles) {
      const totalG = gd.bottles.reduce((s, b) => s + (b.size * Math.max(0, Math.min(100, b.fill)) / 100 * 1000), 0);
      const totalKg = gd.bottles.reduce((s, b) => s + b.size, 0);
      const pct = totalKg > 0 ? totalG / (totalKg * 1000) * 100 : 100;
      if (pct < 20) {
        gasAlarmHtml = `<div onclick="showSection('gas');gasRender()"
          style="background:var(--card);border-radius:12px;padding:13px 16px;margin-bottom:8px;
                 border-left:4px solid #ef4444;cursor:pointer;display:flex;align-items:center;gap:12px">
          <div style="font-size:1.5rem;flex-shrink:0">🔴</div>
          <div style="flex:1">
            <div style="font-weight:700;color:var(--text);font-size:0.9rem">Gas-Alarm</div>
            <div style="font-size:0.78rem;color:#ef4444;margin-top:2px">🔥 Nur noch ${pct.toFixed(0)}% – bitte nachfüllen</div>
          </div>
          <div style="color:var(--muted);font-size:1rem;flex-shrink:0">›</div>
        </div>`;
      } else if (pct < 40) {
        gasAlarmHtml = `<div onclick="showSection('gas');gasRender()"
          style="background:var(--card);border-radius:12px;padding:13px 16px;margin-bottom:8px;
                 border-left:4px solid #f59e0b;cursor:pointer;display:flex;align-items:center;gap:12px">
          <div style="font-size:1.5rem;flex-shrink:0">🟡</div>
          <div style="flex:1">
            <div style="font-weight:700;color:var(--text);font-size:0.9rem">Gas wird knapp</div>
            <div style="font-size:0.78rem;color:#f59e0b;margin-top:2px">🔥 Noch ${pct.toFixed(0)}% – nächste Möglichkeit einplanen</div>
          </div>
          <div style="color:var(--muted);font-size:1rem;flex-shrink:0">›</div>
        </div>`;
      }
    }
  } catch(e) {}

  if (!urgent.length && !gasAlarmHtml) { banner.style.display = 'none'; return; }
  if (!urgent.length && gasAlarmHtml) {
    banner.style.display = 'block';
    banner.innerHTML = gasAlarmHtml;
    return;
  }

  const worst = urgent[0];
  const { color, icon, sub } = svItemStyle(worst);
  const isRed = color === '#ef4444';

  banner.style.display = 'block';
  banner.innerHTML = `
    <div onclick="showSection('fahrzeug');switchFahrzeugTab('service',document.getElementById('fz-tab-service'))"
      style="background:var(--card);border-radius:12px;padding:13px 16px;margin-bottom:12px;
             border-left:4px solid ${color};cursor:pointer;display:flex;align-items:center;gap:12px">
      <div style="font-size:1.5rem;flex-shrink:0">${isRed ? '🔴' : '🟡'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:var(--text);font-size:0.9rem">
          Service-Alarm
          ${urgent.length > 1 ? `<span style="background:${color};color:#fff;border-radius:10px;font-size:0.7rem;padding:1px 7px;margin-left:6px;font-weight:600">${urgent.length}</span>` : ''}
        </div>
        <div style="font-size:0.78rem;color:${color};margin-top:2px">${icon} ${worst.label} – ${sub}</div>
      </div>
      <div style="color:var(--muted);font-size:1rem;flex-shrink:0">›</div>
    </div>${gasAlarmHtml}`;

  checkServiceNotification(urgent);
}

function checkServiceNotification(urgentItems) {
  if (!urgentItems || !urgentItems.length) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];
  if (localStorage.getItem('wmp_sv_notif_date') === today) return;

  const worst = urgentItems[0];
  const { sub } = svItemStyle(worst);
  localStorage.setItem('wmp_sv_notif_date', today);
  new Notification('🔔 Wohnmobil Pro – Service-Alarm', {
    body: `${worst.label}: ${sub}${urgentItems.length > 1 ? ` (+${urgentItems.length - 1} weitere)` : ''}`,
    icon: './favicon.ico',
    tag: 'wmp-service-alarm'
  });
}

function renderNotifStatus() {
  const txt  = document.getElementById('notif-status-text');
  const icon = document.getElementById('notif-status-icon');
  const btn  = document.getElementById('notif-btn');
  if (!txt) return;
  if (!('Notification' in window)) {
    txt.textContent = 'Nicht unterstützt von diesem Browser';
    if (icon) icon.textContent = '❌';
    return;
  }
  const p = Notification.permission;
  if (p === 'granted') {
    txt.textContent = 'Benachrichtigungen aktiv';
    if (icon) icon.textContent = '✅';
    if (btn) btn.style.display = 'none';
  } else if (p === 'denied') {
    txt.textContent = 'Blockiert – in Browser-Einstellungen erlauben';
    if (icon) icon.textContent = '🚫';
    if (btn) btn.style.display = 'none';
  } else {
    txt.textContent = 'Noch nicht erlaubt';
    if (icon) icon.textContent = '🔕';
    if (btn) btn.style.display = 'block';
  }
}

function requestNotifPermission() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => {
    renderNotifStatus();
    if (p === 'granted') {
      toast('✅ Benachrichtigungen aktiviert');
      renderServiceStartBanner();
    } else {
      toast('Benachrichtigungen nicht erlaubt');
    }
  });
}

function addSvCustom() {
  const label = document.getElementById('sv-label')?.value.trim();
  const typ   = document.getElementById('sv-typ')?.value;
  if (!label) { toast('Bezeichnung fehlt'); return; }
  const list = loadSvCustom();
  const id   = Date.now();
  if (typ === 'km') {
    const faellig_km = parseFloat(document.getElementById('sv-faellig-km')?.value);
    if (!faellig_km) { toast('km-Wert fehlt'); return; }
    list.push({ id, label, typ, faellig_km });
  } else {
    const faellig = document.getElementById('sv-faellig-dat')?.value;
    if (!faellig) { toast('Datum fehlt'); return; }
    list.push({ id, label, typ, faellig });
  }
  saveSvCustom(list);
  document.getElementById('sv-label').value = '';
  document.getElementById('sv-faellig-km').value = '';
  document.getElementById('sv-faellig-dat').value = '';
  renderService();
}

function deleteSvCustom(id) {
  saveSvCustom(loadSvCustom().filter(r => r.id !== id));
  renderService();
}

function addToCalendar(label, dateIso) {
  // dateIso = "YYYY-MM-DD"
  const [y, m, d] = dateIso.split('-');
  const pad = n => String(n).padStart(2,'0');

  // Folgetag für DTEND (ganztägig)
  const end = new Date(Number(y), Number(m)-1, Number(d)+1);
  const dtStart = `${y}${pad(m)}${pad(d)}`;
  const dtEnd   = `${end.getFullYear()}${pad(end.getMonth()+1)}${pad(end.getDate())}`;
  const now     = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wohnmobil Pro//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wmp-${Date.now()}@wohnmobil-pro`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${label} – Wohnmobil`,
    'DESCRIPTION:Erinnerung erstellt mit Wohnmobil Pro',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',         // 7 Tage vorher
    'ACTION:DISPLAY',
    `DESCRIPTION:${label} in 7 Tagen fällig`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',         // 1 Tag vorher
    'ACTION:DISPLAY',
    `DESCRIPTION:${label} morgen fällig`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${label.replace(/[^a-z0-9äöü]/gi,'_')}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
}

function loadFahrzeug() {
  const d = JSON.parse(localStorage.getItem('wmp_fahrzeug') || '{}');
  FZ_FIELDS.forEach(f => {
    const el = document.getElementById('fz-' + f);
    if (el && d[f] !== undefined) el.value = d[f];
  });
  if (d.zulassung_foto) renderFzFoto(d.zulassung_foto);
  renderTuevBanner();
  renderVersTelLink();
}

function saveFahrzeugSilent() {
  const d = JSON.parse(localStorage.getItem('wmp_fahrzeug') || '{}');
  FZ_FIELDS.forEach(f => { const el = document.getElementById('fz-' + f); if (el) d[f] = el.value; });
  if (_fzFotoBase64 !== null) d.zulassung_foto = _fzFotoBase64;
  if (_fzFotoBase64 === null) delete d.zulassung_foto;
  localStorage.setItem('wmp_fahrzeug', JSON.stringify(d));
  renderVersTelLink();
}

function saveFahrzeug() {
  saveFahrzeugSilent();
  renderTuevBanner();
  renderServiceStartBanner();
  toast('Fahrzeugdaten gespeichert');
}

function renderTuevBanner() {
  const tuev = document.getElementById('fz-tuev')?.value;
  const banner = document.getElementById('tuev-banner');
  if (!banner) return;
  if (!tuev) { banner.innerHTML = ''; return; }
  const parts = tuev.split('-');
  const tuevEnd = new Date(parseInt(parts[0]), parseInt(parts[1]), 0);
  const now = new Date();
  const diff = Math.floor((tuevEnd - now) / (1000 * 60 * 60 * 24));
  let bg, border, icon, msg;
  if (diff < 0) {
    bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; icon = '🚨';
    msg = `TÜV / HU abgelaufen vor ${Math.abs(diff)} Tagen!`;
  } else if (diff <= 30) {
    bg = 'rgba(245,158,11,0.12)'; border = 'rgba(245,158,11,0.45)'; icon = '⚠️';
    msg = `TÜV / HU läuft in ${diff} Tagen ab!`;
  } else if (diff <= 90) {
    bg = 'rgba(245,158,11,0.07)'; border = 'rgba(245,158,11,0.25)'; icon = '📅';
    msg = `TÜV / HU in ${diff} Tagen fällig`;
  } else {
    banner.innerHTML = ''; return;
  }
  banner.innerHTML = `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:13px 16px;display:flex;align-items:center;gap:12px">
    <span style="font-size:1.6rem;flex-shrink:0">${icon}</span>
    <div>
      <div style="font-weight:700;color:var(--text);font-size:0.92rem">${msg}</div>
      <div style="font-size:0.7rem;color:var(--muted);margin-top:2px">Fällig: ${parts[1]}/${parts[0]}</div>
    </div>
  </div>`;
}

function renderVersTelLink() {
  const tel = document.getElementById('fz-vers-tel')?.value?.trim();
  const link = document.getElementById('fz-vers-tel-link');
  if (!link) return;
  if (tel) {
    link.style.display = 'block';
    link.href = 'tel:' + tel.replace(/\s/g,'');
    link.textContent = '📞 ' + tel + ' anrufen';
  } else {
    link.style.display = 'none';
  }
}

let _fzFotoBase64 = null;

function renderFzFoto(src) {
  const wrap = document.getElementById('fz-foto-img-wrap');
  const placeholder = document.getElementById('fz-foto-placeholder');
  if (src) {
    document.getElementById('fz-foto-img').src = src;
    wrap.style.display = 'block';
    placeholder.style.display = 'none';
    _fzFotoBase64 = src;
  } else {
    wrap.style.display = 'none';
    placeholder.style.display = 'block';
    _fzFotoBase64 = null;
  }
}

async function onFzFotoSelect(input) {
  if (!input.files || !input.files[0]) return;
  const base64 = await resizeImage(input.files[0], 1200);
  renderFzFoto(base64);
}

function removeFzFoto() {
  renderFzFoto(null);
  document.getElementById('fz-foto-inp').value = '';
}

function showFzFotoFull() {
  if (!_fzFotoBase64) return;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out';
  ov.onclick = () => ov.remove();
  ov.innerHTML = `<img src="${_fzFotoBase64}" style="max-width:100%;max-height:90vh;border-radius:10px;object-fit:contain">`;
  document.body.appendChild(ov);
}

// ══════════════════════════════════
// WARTUNGSPROTOKOLL
// ══════════════════════════════════
const WT_KAT = {
  oel:        { icon:'🛢', label:'Ölwechsel',     color:'#f59e0b' },
  inspektion: { icon:'🔍', label:'Inspektion',    color:'#38bdf8' },
  reifen:     { icon:'🔄', label:'Reifenwechsel', color:'#8b5cf6' },
  bremsen:    { icon:'🛑', label:'Bremsen',       color:'#ef4444' },
  filter:     { icon:'🌀', label:'Filter',        color:'#22c55e' },
  zahnriemen: { icon:'⚙️', label:'Zahnriemen',   color:'#f97316' },
  tuev:       { icon:'🔖', label:'TÜV / HU',      color:'#22c55e' },
  reparatur:  { icon:'🔨', label:'Reparatur',     color:'#ef4444' },
  sonstiges:  { icon:'📝', label:'Sonstiges',     color:'#8da0b5' },
};

function loadWartung()        { return JSON.parse(localStorage.getItem('wmp_wartung') || '[]'); }
function saveWartung(list)    { localStorage.setItem('wmp_wartung', JSON.stringify(list)); }

function addWartung() {
  const kat    = document.getElementById('wt-kat').value;
  const dat    = document.getElementById('wt-dat').value;
  const km     = document.getElementById('wt-km').value;
  const kosten = document.getElementById('wt-kosten').value;
  const notiz  = document.getElementById('wt-notiz').value.trim();
  if (!dat) { toast('Datum fehlt'); return; }
  const list = loadWartung();
  list.push({ id: Date.now(), kat, dat, km: km ? parseInt(km) : null, kosten: kosten ? parseFloat(kosten) : null, notiz });
  list.sort((a, b) => b.dat.localeCompare(a.dat));
  saveWartung(list);
  document.getElementById('wt-km').value = '';
  document.getElementById('wt-kosten').value = '';
  document.getElementById('wt-notiz').value = '';
  renderWartung();
  toast('Eintrag gespeichert');
}

function deleteWartung(id) {
  if (!confirm('Eintrag löschen?')) return;
  saveWartung(loadWartung().filter(e => e.id !== id));
  renderWartung();
}

function editWartung(id) {
  const e = loadWartung().find(e => e.id === id);
  if (!e) return;
  const overlay = document.createElement('div');
  overlay.id = 'editWartungOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:20px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto">
      <div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:16px">🔧 Eintrag bearbeiten</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <label class="form-lbl">Kategorie</label>
          <select class="form-inp" id="ewt-kat">
            <option value="oel" ${e.kat==='oel'?'selected':''}>🛢 Ölwechsel</option>
            <option value="inspektion" ${e.kat==='inspektion'?'selected':''}>🔍 Inspektion</option>
            <option value="reifen" ${e.kat==='reifen'?'selected':''}>🔄 Reifenwechsel</option>
            <option value="bremsen" ${e.kat==='bremsen'?'selected':''}>🛑 Bremsen</option>
            <option value="filter" ${e.kat==='filter'?'selected':''}>🌀 Filter</option>
            <option value="zahnriemen" ${e.kat==='zahnriemen'?'selected':''}>⚙️ Zahnriemen</option>
            <option value="tuev" ${e.kat==='tuev'?'selected':''}>🔖 TÜV / HU</option>
            <option value="reparatur" ${e.kat==='reparatur'?'selected':''}>🔨 Reparatur</option>
            <option value="sonstiges" ${e.kat==='sonstiges'?'selected':''}>📝 Sonstiges</option>
          </select>
        </div>
        <div><label class="form-lbl">Datum</label><input class="form-inp" type="date" id="ewt-dat" value="${e.dat}"></div>
        <div><label class="form-lbl">km-Stand</label><input class="form-inp" type="number" id="ewt-km" value="${e.km || ''}"></div>
        <div><label class="form-lbl">Kosten (€)</label><input class="form-inp" type="number" id="ewt-kosten" step="0.01" value="${e.kosten || ''}"></div>
        <div style="grid-column:span 2"><label class="form-lbl">Notiz / Werkstatt</label><input class="form-inp" id="ewt-notiz" value="${(e.notiz || '').replace(/"/g,'&quot;')}"></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" style="flex:1;background:var(--panel2);color:var(--text);border:1px solid var(--border)" onclick="document.getElementById('editWartungOverlay').remove()">Abbrechen</button>
        <button class="btn btn-primary" style="flex:1" onclick="saveEditWartung(${id})">Speichern</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function saveEditWartung(id) {
  const list = loadWartung();
  const idx  = list.findIndex(e => e.id === id);
  if (idx === -1) return;
  list[idx] = {
    id,
    kat:    document.getElementById('ewt-kat').value,
    dat:    document.getElementById('ewt-dat').value,
    km:     document.getElementById('ewt-km').value     ? parseInt(document.getElementById('ewt-km').value)       : null,
    kosten: document.getElementById('ewt-kosten').value ? parseFloat(document.getElementById('ewt-kosten').value) : null,
    notiz:  document.getElementById('ewt-notiz').value.trim(),
  };
  list.sort((a, b) => b.dat.localeCompare(a.dat));
  saveWartung(list);
  document.getElementById('editWartungOverlay')?.remove();
  renderWartung();
  toast('Eintrag gespeichert');
}

function renderWartung() {
  const list  = loadWartung();
  const listEl = document.getElementById('wt-list');
  const summEl = document.getElementById('wt-summary');
  if (!listEl) return;
  if (!list.length) {
    listEl.innerHTML = '<div class="no-entries">Noch keine Einträge</div>';
    if (summEl) summEl.style.display = 'none';
    return;
  }
  if (summEl) {
    const total  = list.reduce((s, e) => s + (e.kosten || 0), 0);
    const maxKm  = list.filter(e => e.km).sort((a,b) => b.km - a.km)[0];
    summEl.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';
    summEl.innerHTML = `
      <div style="background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Einträge</div>
        <div style="font-size:1.5rem;font-weight:800;color:var(--text)">${list.length}</div>
      </div>
      <div style="background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Gesamtkosten</div>
        <div style="font-size:1.5rem;font-weight:800;color:var(--warn)">${total.toFixed(0)} €</div>
      </div>
      ${maxKm ? `<div style="background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;grid-column:span 2">
        <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Letzter erfasster km-Stand</div>
        <div style="font-size:1.5rem;font-weight:800;color:var(--text)">${maxKm.km.toLocaleString('de-DE')} km</div>
      </div>` : ''}`;
  }
  listEl.innerHTML = list.map(e => {
    const k = WT_KAT[e.kat] || WT_KAT.sonstiges;
    return `<div class="entry-item" style="border-left:3px solid ${k.color};margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <span style="font-size:1.5rem;flex-shrink:0;line-height:1.2">${k.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-weight:700;color:var(--text);font-size:0.95rem;flex:1">${k.label}</span>
            <button onclick="editWartung(${e.id})" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:1.2rem;padding:0;line-height:1;opacity:0.8">✎</button>
            <button onclick="deleteWartung(${e.id})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem;padding:0;line-height:1;opacity:0.8">🗑</button>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px">
            <span style="font-size:0.75rem;color:var(--muted)">📅 ${e.dat.split('-').reverse().join('.')}</span>
            ${e.km ? `<span style="font-size:0.75rem;color:var(--muted)">🚗 ${e.km.toLocaleString('de-DE')} km</span>` : ''}
            ${e.kosten ? `<span style="font-size:0.75rem;color:var(--warn)">💶 ${e.kosten.toFixed(2)} €</span>` : ''}
          </div>
          ${e.notiz ? `<div style="font-size:0.78rem;color:var(--muted);margin-top:5px">${e.notiz}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════
// LÄNDERVORSCHRIFTEN
// ══════════════════════════════════
const VORS_DATA = [
  { land:'🇩🇪 Deutschland',    promille:'0,5‰', info:'0,0‰ unter 21 J. / Fahranfänger', vignette:'Keine',              maut:'Keine PKW-Maut',              winter:'Situationsabhängig (M+S)',          ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:100, bahn:'∞', note:'Richtgeschw. 130 · WoMo > 3,5t: 80/100' } },
  { land:'🇦🇹 Österreich',     promille:'0,5‰', info:'',                                 vignette:'Pflicht',             maut:'~10–93 € je Zeitraum',         winter:'Pflicht Nov–Apr (oder situationsbedgt.)', ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher (WoMo)'],     tempo:{ ort:50, land:100, bahn:130, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇨🇭 Schweiz',        promille:'0,5‰', info:'',                                 vignette:'Pflicht (Jahresvig.)',maut:'CHF 40/Jahr',                   winter:'Situationsabhängig',               ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:120, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇮🇹 Italien',        promille:'0,5‰', info:'0,0‰ < 3 J. Führerschein',         vignette:'Keine',              maut:'Streckenmaut (Autostrada)',      winter:'Nov–Apr in Berggebieten',          ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:90,  bahn:130, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇫🇷 Frankreich',     promille:'0,5‰', info:'0,2‰ < 3 J. Führerschein',         vignette:'Keine',              maut:'Streckenmaut (Autoroute)',       winter:'Nov–Mar Berggebiete (seit 2024)',   ausruestung:['Warndreieck','Warnweste (2×)'],                                        tempo:{ ort:50, land:80,  bahn:130, note:'Bei Regen: 110 · WoMo > 3,5t: 80/90' } },
  { land:'🇪🇸 Spanien',        promille:'0,5‰', info:'0,3‰ < 2 J. Führerschein',         vignette:'Keine',              maut:'Streckenmaut (Autopista)',       winter:'Nur bei Schnee/Eis',               ausruestung:['Warndreieck (2×)','Warnweste'],                                        tempo:{ ort:50, land:90,  bahn:120, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇵🇹 Portugal',       promille:'0,5‰', info:'0,2‰ < 3 J. Führerschein',         vignette:'Keine',              maut:'Elektronisch (Via Verde)',       winter:'Nur bei Schnee/Eis',               ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:90,  bahn:120, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇳🇱 Niederlande',    promille:'0,5‰', info:'0,2‰ < 5 J. Führerschein',         vignette:'Keine',              maut:'Keine',                         winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:100, note:'Tags 100, nachts 130 auf Autobahnen' } },
  { land:'🇧🇪 Belgien',        promille:'0,5‰', info:'0,2‰ < 2 J. Führerschein',         vignette:'Keine',              maut:'Lkw-Maut (MyToll)',              winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:90,  bahn:120, note:'Flandern Autobahn: 100' } },
  { land:'🇩🇰 Dänemark',       promille:'0,5‰', info:'',                                 vignette:'Keine',              maut:'Storebælt / Øresund',           winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:130, note:'' } },
  { land:'🇸🇪 Schweden',       promille:'0,2‰', info:'',                                 vignette:'Keine',              maut:'Stadtgebühr Stockholm/Göteborg', winter:'Pflicht 1. Dez – 31. Mär',         ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:90,  bahn:120, note:'70–120 je nach Strecke' } },
  { land:'🇳🇴 Norwegen',       promille:'0,2‰', info:'',                                 vignette:'Keine',              maut:'AutoPASS Streckengebühr',        winter:'Pflicht bei Schnee/Eis',           ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:110, note:'WoMo > 3,5t: 80/90' } },
  { land:'🇫🇮 Finnland',       promille:'0,5‰', info:'',                                 vignette:'Keine',              maut:'Keine',                         winter:'Pflicht 1. Dez – 28. Feb',         ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:100, bahn:120, note:'Winter: 80 km/h außerorts' } },
  { land:'🇭🇷 Kroatien',       promille:'0,5‰', info:'0,0‰ < 24 Jahre',                  vignette:'Keine',              maut:'Streckenmaut',                  winter:'Nov–Apr empfohlen / bei Bedarf',   ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher','Ersatzlampen'], tempo:{ ort:50, land:90,  bahn:130, note:'WoMo > 3,5t: 80/90' } },
  { land:'🇸🇮 Slowenien',      promille:'0,5‰', info:'0,0‰ < 2 J. Führerschein',         vignette:'Pflicht (E-Vig.)',   maut:'15–110 €',                      winter:'Nov–Apr oder situationsbedgt.',    ausruestung:['Warndreieck','Warnweste','Verbandskasten'],                            tempo:{ ort:50, land:90,  bahn:130, note:'WoMo > 3,5t: 80/100' } },
  { land:'🇬🇷 Griechenland',   promille:'0,5‰', info:'0,2‰ < 2 J. Führerschein',         vignette:'Keine',              maut:'Streckenmaut',                  winter:'In Bergen empfohlen',              ausruestung:['Warndreieck','Warnweste','Feuerlöscher','Verbandskasten'],             tempo:{ ort:50, land:90,  bahn:130, note:'' } },
  { land:'🇵🇱 Polen',          promille:'0,2‰', info:'',                                 vignette:'Keine',              maut:'Elektronisch (e-TOLL)',          winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:140, note:'Schnellstraße 120 · WoMo > 3,5t: 80/80' } },
  { land:'🇨🇿 Tschechien',     promille:'0,0‰', info:'Absolutes Alkoholverbot',           vignette:'Pflicht (E-Vig.)',   maut:'310 CZK (10T) / 1500 CZK (1M)', winter:'Nov–Mär situationsabhängig',       ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:130, note:'WoMo > 3,5t: 80/110' } },
  { land:'🇸🇰 Slowakei',       promille:'0,0‰', info:'Absolutes Alkoholverbot',           vignette:'Pflicht (E-Vig.)',   maut:'~6–15 €',                       winter:'Nov–Mär situationsabhängig',       ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:130, note:'' } },
  { land:'🇭🇺 Ungarn',         promille:'0,0‰', info:'Absolutes Alkoholverbot',           vignette:'Pflicht (E-Vig.)',   maut:'~6–17 €',                       winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:130, note:'WoMo > 3,5t: 80/80' } },
  { land:'🇷🇴 Rumänien',       promille:'0,0‰', info:'Absolutes Alkoholverbot',           vignette:'Pflicht (Rovinieta)',maut:'~3–30 € je Zeitraum',           winter:'Nov–Mär empfohlen',                ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:130, note:'' } },
  { land:'🇧🇬 Bulgarien',      promille:'0,5‰', info:'',                                 vignette:'Pflicht (E-Vig.)',   maut:'5–97 € je Zeitraum',            winter:'Situationsabhängig',               ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:140, note:'WoMo > 3,5t: 70/100' } },
  { land:'🇷🇸 Serbien',        promille:'0,3‰', info:'0,0‰ < 24 Jahre',                  vignette:'Keine',              maut:'Streckenmaut',                  winter:'Nov–Apr empfohlen',                ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:80,  bahn:120, note:'' } },
  { land:'🇲🇪 Montenegro',     promille:'0,3‰', info:'',                                 vignette:'Keine',              maut:'Streckenmaut',                  winter:'Situationsabhängig',               ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:120, note:'' } },
  { land:'🇦🇱 Albanien',       promille:'0,1‰', info:'',                                 vignette:'Keine',              maut:'Streckenmaut',                  winter:'Situationsabhängig',               ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:40, land:90,  bahn:110, note:'' } },
  { land:'🇲🇰 Nordmazedonien', promille:'0,5‰', info:'0,0‰ < 24 Jahre',                  vignette:'Keine',              maut:'Streckenmaut',                  winter:'Situationsabhängig',               ausruestung:['Warndreieck','Warnweste'],                                             tempo:{ ort:50, land:80,  bahn:120, note:'' } },
  { land:'🇬🇧 Großbritannien', promille:'0,8‰', info:'0,5‰ in Schottland',               vignette:'Keine',              maut:'London Congestion Charge',       winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck (empfohlen)','Warnweste (empfohlen)'],                     tempo:{ ort:48, land:96,  bahn:113, note:'30/60/70 mph (Linksverkehr!)' } },
  { land:'🇮🇪 Irland',         promille:'0,5‰', info:'0,2‰ < 2 J. Führerschein',         vignette:'Keine',              maut:'Streckenmaut',                  winter:'Empfohlen, keine Pflicht',         ausruestung:['Warndreieck (empfohlen)'],                                             tempo:{ ort:50, land:80,  bahn:120, note:'Linksverkehr!' } },
  { land:'🇹🇷 Türkei',         promille:'0,5‰', info:'0,0‰ LKW/Bus-Fahrer',              vignette:'Keine',              maut:'Elektronisch (HGS/OGS)',         winter:'Situationsabhängig in Bergen',     ausruestung:['Warndreieck','Warnweste','Verbandskasten','Feuerlöscher'],             tempo:{ ort:50, land:90,  bahn:120, note:'WoMo > 3,5t: 80/80' } },
  { land:'🇲🇦 Marokko',        promille:'0,4‰', info:'',                                 vignette:'Keine',              maut:'Streckenmaut',                  winter:'In Bergen empfohlen',              ausruestung:['Warndreieck','Warnweste','Feuerlöscher'],                              tempo:{ ort:40, land:100, bahn:120, note:'' } },
];

let _vorsRendered = false;

function renderVorschriften() {
  if (_vorsRendered) return;
  _vorsRendered = true;
  filterVorschriften('');
}

function filterVorschriften(q) {
  const term = q.toLowerCase().trim();
  const list = VORS_DATA.filter(d => !term || d.land.toLowerCase().includes(term));
  const container = document.getElementById('vors-list');
  if (!container) return;
  if (!list.length) { container.innerHTML = '<div class="no-entries">Kein Land gefunden</div>'; return; }
  container.innerHTML = list.map(d => {
    const pc = d.promille === '0,0‰' ? 'var(--danger)' : (d.promille === '0,2‰' || d.promille === '0,1‰' || d.promille === '0,3‰') ? 'var(--warn)' : 'var(--accent)';
    const tags = d.ausruestung.map(a => `<span style="display:inline-block;background:var(--panel2);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:0.72rem;color:var(--text);margin:2px 2px 0 0">${a}</span>`).join('');
    const vigBg = d.vignette.startsWith('Pflicht') ? 'rgba(245,158,11,0.08)' : 'var(--panel2)';
    const vigBorder = d.vignette.startsWith('Pflicht') ? 'rgba(245,158,11,0.3)' : 'var(--border)';
    return `<div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:12px">${d.land}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="background:var(--panel2);border-radius:8px;padding:10px;border-left:3px solid ${pc}">
          <div style="font-size:0.57rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🍺 Promillegrenze</div>
          <div style="font-size:1.15rem;font-weight:800;color:${pc}">${d.promille}</div>
          ${d.info ? `<div style="font-size:0.66rem;color:var(--muted);margin-top:2px;line-height:1.4">${d.info}</div>` : ''}
        </div>
        <div style="background:${vigBg};border:1px solid ${vigBorder};border-radius:8px;padding:10px">
          <div style="font-size:0.57rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🛣 Vignette / Maut</div>
          <div style="font-size:0.82rem;font-weight:700;color:var(--text)">${d.vignette}</div>
          <div style="font-size:0.68rem;color:var(--muted);margin-top:2px">${d.maut}</div>
        </div>
      </div>
      <div style="margin-bottom:8px">
        <div style="font-size:0.57rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">🚦 Geschwindigkeit (km/h)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div style="background:var(--panel2);border-radius:8px;padding:8px 6px;text-align:center">
            <div style="font-size:0.56rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">🏙 Ort</div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--text)">${d.tempo.ort}</div>
          </div>
          <div style="background:var(--panel2);border-radius:8px;padding:8px 6px;text-align:center">
            <div style="font-size:0.56rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">🛤 Land</div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--text)">${d.tempo.land}</div>
          </div>
          <div style="background:var(--panel2);border-radius:8px;padding:8px 6px;text-align:center">
            <div style="font-size:0.56rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">🛣 Autobahn</div>
            <div style="font-size:1.25rem;font-weight:800;color:${d.tempo.bahn === '∞' ? 'var(--accent)' : 'var(--text)'}">${d.tempo.bahn}</div>
          </div>
        </div>
        ${d.tempo.note ? `<div style="font-size:0.66rem;color:var(--muted);margin-top:5px;line-height:1.4">ℹ️ ${d.tempo.note}</div>` : ''}
      </div>
      <div style="background:var(--panel2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="font-size:0.57rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">❄️ Winterreifen</div>
        <div style="font-size:0.82rem;color:var(--text)">${d.winter}</div>
      </div>
      <div>
        <div style="font-size:0.57rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">🎒 Pflichtausrüstung</div>
        <div style="display:flex;flex-wrap:wrap">${tags}</div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════
// SONNENAUSRICHTUNG
// ══════════════════════════════════
const SO = { lat: null, lon: null, _timer: null, _noonSun: null, _arcPts: null, _sun: null, _heading: 0, _compassActive: false, _compassHandler: null, _recHeading: null };

function soGetGPS() {
  const status = document.getElementById('so-gps-status');
  status.textContent = '⏳ GPS wird ermittelt…';
  if (!navigator.geolocation) { status.textContent = '❌ GPS nicht verfügbar'; return; }
  navigator.geolocation.getCurrentPosition(pos => {
    SO.lat = pos.coords.latitude;
    SO.lon = pos.coords.longitude;
    status.textContent = '✅ GPS-Position ermittelt';
    const c = document.getElementById('so-gps-coords');
    if (c) c.textContent = `${SO.lat.toFixed(4)}° N  ${SO.lon.toFixed(4)}° E`;
    soCalc();
    if (SO._timer) clearInterval(SO._timer);
    SO._timer = setInterval(soCalc, 60000);
  }, () => { status.textContent = '❌ GPS-Zugriff verweigert'; },
  { enableHighAccuracy: true, timeout: 10000 });
}

function _sunPos(date, lat, lon) {
  const R = Math.PI / 180, D = 180 / Math.PI;
  const JD = date.getTime() / 86400000 + 2440587.5;
  const JC = (JD - 2451545) / 36525;
  const L0 = (280.46646 + JC * (36000.76983 + JC * 0.0003032)) % 360;
  const M  = (357.52911 + JC * (35999.05029 - 0.0001537 * JC)) % 360;
  const Mr = M * R;
  const C  = Math.sin(Mr)*(1.914602-JC*(0.004817+0.000014*JC))
           + Math.sin(2*Mr)*(0.019993-0.000101*JC)
           + Math.sin(3*Mr)*0.000289;
  const sl = (L0 + C) * R;
  const ep = (23.439 - 0.0000004*(JD-2451545)) * R;
  const decl = Math.asin(Math.sin(ep)*Math.sin(sl));
  const y = Math.tan(ep/2)**2, ecc = 0.016708634-JC*(0.000042037+0.0000001267*JC);
  const EoT = 4*D*(y*Math.sin(2*L0*R)-2*ecc*Math.sin(Mr)+4*ecc*y*Math.sin(Mr)*Math.cos(2*L0*R)
              -0.5*y*y*Math.sin(4*L0*R)-1.25*ecc*ecc*Math.sin(2*Mr));
  const utcMin = date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60;
  const tst = ((utcMin+EoT+lon*4)%1440+1440)%1440;
  const HA  = (tst/4-180)*R;
  const lr  = lat*R;
  const sinEl = Math.sin(lr)*Math.sin(decl)+Math.cos(lr)*Math.cos(decl)*Math.cos(HA);
  const el  = Math.asin(Math.max(-1,Math.min(1,sinEl)))*D;
  const cosEl = Math.cos(el*R);
  let az = 0;
  if (cosEl > 1e-4) {
    const caz = (Math.sin(decl)-Math.sin(lr)*sinEl)/(Math.cos(lr)*cosEl);
    az = Math.acos(Math.max(-1,Math.min(1,caz)))*D;
    if (HA > 0) az = 360-az;
  }
  return { elevation: el, azimuth: az };
}

function soCalc() {
  if (!SO.lat) return;
  const now = new Date();
  const today = new Date(now); today.setHours(0,0,0,0);
  const sun = _sunPos(now, SO.lat, SO.lon);
  const arcPts = [];
  let maxEl = -90, noonSun = null, sunrise = null, sunset = null;
  let prevEl = _sunPos(today, SO.lat, SO.lon).elevation;
  for (let m = 0; m <= 1440; m += 10) {
    const t = new Date(today.getTime() + m*60000);
    const s = _sunPos(t, SO.lat, SO.lon);
    if (s.elevation > 0) {
      arcPts.push({...s, time: t});
      if (!sunrise) sunrise = t;
      if (s.elevation > maxEl) { maxEl = s.elevation; noonSun = {...s, time: t}; }
    }
    if (prevEl > 0 && s.elevation <= 0 && sunrise) sunset = t;
    prevEl = s.elevation;
  }
  SO._noonSun = noonSun;
  SO._arcPts = arcPts;
  SO._sun = sun;
  const fmt = t => t ? `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}` : '–';
  document.getElementById('so-el').textContent = sun.elevation > 0 ? sun.elevation.toFixed(1)+'°' : '–';
  document.getElementById('so-az').textContent = sun.elevation > 0 ? sun.azimuth.toFixed(1)+'°' : '–';
  document.getElementById('so-sunrise').textContent = fmt(sunrise);
  document.getElementById('so-sunset').textContent  = fmt(sunset);
  document.getElementById('so-noon-time').textContent = noonSun ? fmt(noonSun.time) : '–';
  document.getElementById('so-noon-el').textContent   = noonSun ? noonSun.elevation.toFixed(1)+'° max' : '';
  soDrawCompass(sun, arcPts);
  soDrawChart(arcPts, now, arcPts.length ? Math.max(...arcPts.map(p=>p.elevation)) : 90);
  soUpdateRecommendation();
  document.getElementById('so-result').style.display = 'block';
}

function soRedrawCompass() {
  if (SO._sun !== null && SO._arcPts !== null) soDrawCompass(SO._sun, SO._arcPts);
}

function soStartCompass() {
  if (SO._compassActive) { soStopCompass(); return; }
  const handler = e => {
    let h = null;
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      h = e.webkitCompassHeading; // iOS: absolutes Heading in Grad
    } else if (e.alpha !== null && e.alpha !== undefined) {
      h = (360 - e.alpha) % 360; // Android: alpha = Drehung weg von Nord
    }
    if (h !== null) { SO._heading = h; soRedrawCompass(); }
  };
  SO._compassHandler = handler;
  const startListening = () => {
    SO._compassActive = true;
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    const btn = document.getElementById('so-compass-btn');
    if (btn) {
      btn.textContent = '🧭 Kompass aktiv';
      btn.style.background = 'rgba(34,197,94,0.15)';
      btn.style.borderColor = 'rgba(34,197,94,0.5)';
      btn.style.color = '#22c55e';
    }
  };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') startListening();
      else { alert('Kompass-Zugriff verweigert. Bitte in den iOS-Einstellungen erlauben.'); }
    }).catch(() => startListening());
  } else {
    startListening();
  }
}

function soStopCompass() {
  if (SO._compassHandler) {
    window.removeEventListener('deviceorientationabsolute', SO._compassHandler, true);
    window.removeEventListener('deviceorientation', SO._compassHandler, true);
    SO._compassHandler = null;
  }
  SO._compassActive = false;
  SO._heading = 0;
  const btn = document.getElementById('so-compass-btn');
  if (btn) { btn.textContent = '🧭 Kompass'; btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
  soRedrawCompass();
}

function soDrawCompass(sun, arcPts) {
  const canvas = document.getElementById('so-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2, r=W/2-8;
  const dark = !document.documentElement.classList.contains('light');
  const cBg=dark?'#1e293b':'#f1f5f9', cBd=dark?'#334155':'#cbd5e1', cTx=dark?'#94a3b8':'#64748b';
  ctx.clearRect(0,0,W,H);

  // Kompassrose rotieren: -heading dreht N zu echtem Norden
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-SO._heading * Math.PI / 180);
  ctx.translate(-cx, -cy);

  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=cBg; ctx.fill();
  ctx.strokeStyle=cBd; ctx.lineWidth=2; ctx.stroke();
  for (let i=0;i<72;i++) {
    const a=(i*5-90)*Math.PI/180, len=i%18===0?14:i%9===0?9:5;
    ctx.strokeStyle=cBd; ctx.lineWidth=i%18===0?2:1;
    ctx.beginPath(); ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
    ctx.lineTo(cx+(r-len)*Math.cos(a),cy+(r-len)*Math.sin(a)); ctx.stroke();
  }
  // Haupthimmelsrichtungen (N/O/S/W)
  ctx.font=`bold ${Math.round(W*0.062)}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  [['N',0],['O',90],['S',180],['W',270]].forEach(([l,d])=>{
    const a=(d-90)*Math.PI/180;
    ctx.fillStyle=l==='N'?(SO._compassActive?'#ef4444':cTx):l==='S'?'#f59e0b':cTx;
    ctx.fillText(l,cx+(r-22)*Math.cos(a),cy+(r-22)*Math.sin(a));
  });
  // Interkardinalrichtungen (NO/SO/SW/NW) – kleiner
  ctx.font=`${Math.round(W*0.038)}px sans-serif`;
  [['NO',45],['SO',135],['SW',225],['NW',315]].forEach(([l,d])=>{
    const a=(d-90)*Math.PI/180;
    ctx.fillStyle=cTx;
    ctx.fillText(l,cx+(r-20)*Math.cos(a),cy+(r-20)*Math.sin(a));
  });
  const arcR = r*0.6;
  if (arcPts.length>1) {
    ctx.beginPath();
    arcPts.forEach((p,i)=>{
      const a=(p.azimuth-90)*Math.PI/180;
      const x=cx+arcR*Math.cos(a), y=cy+arcR*Math.sin(a);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle='rgba(251,191,36,0.45)'; ctx.lineWidth=4; ctx.stroke();
    [[arcPts[0],'🌅'],[arcPts[arcPts.length-1],'🌇']].forEach(([p,emoji])=>{
      const a=(p.azimuth-90)*Math.PI/180;
      const x=cx+arcR*Math.cos(a), y=cy+arcR*Math.sin(a);
      ctx.font='14px serif'; ctx.fillText(emoji,x,y);
    });
  }
  if (sun.elevation>0) {
    const a=(sun.azimuth-90)*Math.PI/180;
    const sx=cx+arcR*Math.cos(a), sy=cy+arcR*Math.sin(a);
    const g=ctx.createRadialGradient(sx,sy,0,sx,sy,20);
    g.addColorStop(0,'rgba(251,191,36,0.5)'); g.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(sx,sy,20,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.beginPath(); ctx.arc(sx,sy,10,0,Math.PI*2);
    ctx.fillStyle='#fbbf24'; ctx.fill();
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.stroke();
    ctx.strokeStyle='rgba(251,191,36,0.25)'; ctx.lineWidth=1;
    ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(sx,sy); ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.font=`${Math.round(W*0.14)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🌙',cx,cy);
  }
  ctx.restore();

  // Empfohlener Fahrzeugkurs – grüner Pfeil, mit Rotation mitdrehend
  if (SO._recHeading !== null) {
    const recAngle = (SO._recHeading - SO._heading - 90) * Math.PI / 180;
    const rr = r * 0.82;
    const rx = cx + rr * Math.cos(recAngle);
    const ry = cy + rr * Math.sin(recAngle);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(recAngle + Math.PI/2);
    // Pfeil
    ctx.beginPath();
    ctx.moveTo(0, -(rr-8));
    ctx.lineTo(7, -(rr-22));
    ctx.lineTo(3, -(rr-22));
    ctx.lineTo(3, -(r*0.18));
    ctx.lineTo(-3, -(r*0.18));
    ctx.lineTo(-3, -(rr-22));
    ctx.lineTo(-7, -(rr-22));
    ctx.closePath();
    ctx.fillStyle = 'rgba(34,197,94,0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
  }

  // Kompassnadel – zeigt immer nach oben (= Geräterichtung), außerhalb der Rotation
  if (SO._compassActive) {
    const nl = r * 0.40;
    ctx.save();
    ctx.translate(cx, cy);
    // Rote Spitze nach oben (Geräte-Fahrtrichtung)
    ctx.beginPath();
    ctx.moveTo(0, -nl); ctx.lineTo(7, 4); ctx.lineTo(0, nl*0.28); ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8; ctx.stroke();
    // Blauer Schaft nach unten
    ctx.beginPath();
    ctx.moveTo(0, nl*0.28); ctx.lineTo(6, 4); ctx.lineTo(0, nl); ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    // Mittelpunkt-Kreis
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2);
    ctx.fillStyle = dark?'#1e293b':'#fff'; ctx.fill();
    ctx.strokeStyle = dark?'#94a3b8':'#64748b'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  } else {
    // Normaler Mittelpunkt ohne Kompass
    ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2);
    ctx.fillStyle=dark?'#475569':'#94a3b8'; ctx.fill();
  }
}

function soDrawChart(arcPts, now, maxEl) {
  const canvas = document.getElementById('so-chart'); if (!canvas) return;
  canvas.width = canvas.offsetWidth || 280;
  const ctx=canvas.getContext('2d'), W=canvas.width, H=canvas.height;
  const dark=!document.documentElement.classList.contains('light');
  ctx.clearRect(0,0,W,H);
  const sh=4, eh=22, th=eh-sh, bH=H-18;
  ctx.strokeStyle=dark?'rgba(51,65,85,0.5)':'rgba(203,213,225,0.6)'; ctx.lineWidth=1;
  for (let h=sh;h<=eh;h+=2) {
    const x=((h-sh)/th)*W;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,bH); ctx.stroke();
  }
  ctx.font=`${Math.round(W*0.032)}px sans-serif`; ctx.fillStyle=dark?'#475569':'#94a3b8'; ctx.textAlign='center';
  for (let h=sh;h<=eh;h+=2) ctx.fillText(h+'h',((h-sh)/th)*W,H-3);
  if (arcPts.length>1 && maxEl>0) {
    const grad=ctx.createLinearGradient(0,0,0,bH);
    grad.addColorStop(0,'rgba(251,191,36,0.7)'); grad.addColorStop(1,'rgba(251,191,36,0.05)');
    ctx.beginPath(); ctx.moveTo(0,bH);
    arcPts.forEach(p=>{
      const h=p.time.getHours()+p.time.getMinutes()/60;
      if(h<sh||h>eh) return;
      ctx.lineTo(((h-sh)/th)*W, bH-(p.elevation/maxEl)*bH*0.88);
    });
    ctx.lineTo(W,bH); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath(); let first=true;
    arcPts.forEach(p=>{
      const h=p.time.getHours()+p.time.getMinutes()/60;
      if(h<sh||h>eh) return;
      const x=((h-sh)/th)*W, y=bH-(p.elevation/maxEl)*bH*0.88;
      if(first){ctx.moveTo(x,y);first=false;}else ctx.lineTo(x,y);
    });
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.stroke();
  }
  const nh=now.getHours()+now.getMinutes()/60;
  if(nh>=sh&&nh<=eh){
    const x=((nh-sh)/th)*W;
    ctx.strokeStyle='#ef4444'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,bH); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function soUpdateRecommendation() {
  const ns = SO._noonSun; if (!ns) return;
  const ziel = document.getElementById('so-ziel')?.value||'links';
  let heading;
  if (ziel==='links')  heading=(ns.azimuth-90+360)%360;
  if (ziel==='rechts') heading=(ns.azimuth+90)%360;
  if (ziel==='front')  heading=(ns.azimuth+180)%360;
  if (ziel==='heck')   heading=ns.azimuth%360;
  SO._recHeading = heading;
  const dirs=['N','NNO','NO','ONO','O','OSO','SO','SSO','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const dir=dirs[Math.round(heading/22.5)%16];
  const el=document.getElementById('so-rec');
  if(el) el.innerHTML=`Fahrzeug-Front nach <strong style="color:var(--accent);font-size:1.1rem">${Math.round(heading)}° (${dir})</strong>`;
  soRedrawCompass();
}

// ══════════════════════════════════
// SAT-FINDER
// ══════════════════════════════════
const SAT = { lat: null, lon: null };

function satGetGPS() {
  const status = document.getElementById('sat-gps-status');
  const coords = document.getElementById('sat-gps-coords');
  status.textContent = '⏳ GPS wird ermittelt…';
  if (!navigator.geolocation) { status.textContent = '❌ GPS nicht verfügbar'; return; }
  navigator.geolocation.getCurrentPosition(pos => {
    SAT.lat = pos.coords.latitude;
    SAT.lon = pos.coords.longitude;
    status.textContent = '✅ GPS-Position ermittelt';
    coords.textContent = `${SAT.lat.toFixed(4)}° N  ${SAT.lon.toFixed(4)}° E`;
    satCalc();
  }, () => {
    status.textContent = '❌ GPS-Zugriff verweigert';
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function satCalc() {
  if (!SAT.lat || !SAT.lon) return;
  const satLon = parseFloat(document.getElementById('sat-sel')?.value || '19.2');

  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const φ  = toRad(SAT.lat);
  const dL = toRad(satLon - SAT.lon);

  // Central angle
  const cosC = Math.cos(φ) * Math.cos(dL);

  // Elevation
  const el = toDeg(Math.atan((cosC - 0.15127) / Math.sqrt(1 - cosC * cosC)));

  // Azimuth (bearing from North, 0–360°)
  const azRaw = toDeg(Math.atan2(Math.tan(dL), Math.sin(φ)));
  const az = ((180 - azRaw) + 360) % 360;

  // LNB Skew (positive = clockwise when looking at dish)
  const skew = toDeg(Math.atan2(-Math.cos(φ) * Math.sin(dL),
                                 Math.sin(φ) * Math.sqrt(1 - cosC * cosC)));

  // Himmelsrichtung
  const dirs = ['N','NNO','NO','ONO','O','OSO','SO','SSO','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const dir  = dirs[Math.round(az / 22.5) % 16];

  document.getElementById('sat-el').textContent   = el.toFixed(1) + '°';
  document.getElementById('sat-az').textContent   = az.toFixed(1) + '°';
  document.getElementById('sat-skew').textContent = (skew >= 0 ? '+' : '') + skew.toFixed(1) + '°';
  document.getElementById('sat-direction').textContent =
    `Schüssel Richtung: ${dir} (${az.toFixed(1)}°) · Elevation: ${el.toFixed(1)}°`;

  document.getElementById('sat-result').style.display = 'block';
  satDrawCompass(az);
}

function satDrawCompass(az) {
  const canvas = document.getElementById('sat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, r = W/2 - 8;

  const isDark = !document.documentElement.classList.contains('light');
  const colBg      = isDark ? '#1e293b' : '#f1f5f9';
  const colBorder  = isDark ? '#334155' : '#cbd5e1';
  const colText    = isDark ? '#94a3b8' : '#64748b';
  const colSouth   = '#22c55e';
  const colArrow   = '#22c55e';
  const colCenter  = isDark ? '#475569' : '#94a3b8';

  ctx.clearRect(0, 0, W, H);

  // Background circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = colBg;
  ctx.fill();
  ctx.strokeStyle = colBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Degree ticks
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 - 90) * Math.PI / 180;
    const len = i % 18 === 0 ? 14 : (i % 9 === 0 ? 9 : 5);
    ctx.strokeStyle = colBorder;
    ctx.lineWidth = i % 18 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.lineTo(cx + (r-len) * Math.cos(a), cy + (r-len) * Math.sin(a));
    ctx.stroke();
  }

  // Cardinal labels
  ctx.font = `bold ${Math.round(W*0.07)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [['N',0],['O',90],['S',180],['W',270]].forEach(([lbl, deg]) => {
    const a = (deg - 90) * Math.PI / 180;
    const x = cx + (r - 22) * Math.cos(a);
    const y = cy + (r - 22) * Math.sin(a);
    ctx.fillStyle = lbl === 'S' ? colSouth : colText;
    ctx.fillText(lbl, x, y);
  });

  // Direction arrow
  const aRad = (az - 90) * Math.PI / 180;
  const arrowLen = r - 38;

  // Arrow shaft
  ctx.strokeStyle = colArrow;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - (arrowLen * 0.25) * Math.cos(aRad), cy - (arrowLen * 0.25) * Math.sin(aRad));
  ctx.lineTo(cx + arrowLen * Math.cos(aRad), cy + arrowLen * Math.sin(aRad));
  ctx.stroke();

  // Arrow head
  const hLen = 16, hAng = 0.45;
  ctx.fillStyle = colArrow;
  ctx.beginPath();
  const tx = cx + arrowLen * Math.cos(aRad);
  const ty = cy + arrowLen * Math.sin(aRad);
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - hLen*Math.cos(aRad-hAng), ty - hLen*Math.sin(aRad-hAng));
  ctx.lineTo(tx - hLen*Math.cos(aRad+hAng), ty - hLen*Math.sin(aRad+hAng));
  ctx.closePath();
  ctx.fill();

  // Tail (opposite direction, gray)
  ctx.strokeStyle = colCenter;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - (arrowLen * 0.25) * Math.cos(aRad), cy - (arrowLen * 0.25) * Math.sin(aRad));
  ctx.stroke();

  // Center dot
  ctx.fillStyle = colArrow;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI*2);
  ctx.fill();
}

// ══════════════════════════════════
// TANKPREISE
// ══════════════════════════════════
const TP = { lat: null, lng: null, land: 'de' };

function tpInit() {
  TP.land = document.getElementById('tp-land')?.value || 'de';
  onTpLandChange();
}

function onTpLandChange() {
  TP.land = document.getElementById('tp-land').value;
  const deOnly  = TP.land === 'de';
  const atOnly  = TP.land === 'at';
  const extLink = ['fr','be','nl','es'].includes(TP.land);
  document.getElementById('tp-de-notice').style.display = deOnly ? 'block' : 'none';
  if (deOnly) tpShowDeNotice(localStorage.getItem('wmp_tk_key'));
  document.getElementById('tp-ext-btn').style.display = extLink ? 'block' : 'none';
  if (extLink) tpUpdateExtLink();
  document.getElementById('tp-results').innerHTML = '';
}

function tpUpdateExtLink() {
  const btn  = document.getElementById('tp-ext-btn');
  if (!btn) return;
  const land = document.getElementById('tp-land')?.value || TP.land;
  const ks   = document.getElementById('tp-kraftstoff')?.value || 'diesel';
  const configs = {
    fr: { url: tpPleinMoinsCherUrl('fr', ks), name: 'Plein Moins Cher', desc: 'Frankreich · Interaktive Karte · Browser-GPS' },
    es: { url: tpPleinMoinsCherUrl('es', ks), name: 'Plein Moins Cher', desc: 'Spanien · Interaktive Karte · Browser-GPS' },
    be: { url: `https://www.carbu.com/belgie/index.cfm${TP.lat ? '?lng='+TP.lng+'&lat='+TP.lat+'&radius=10' : ''}`, name: 'carbu.com', desc: 'Belgien & Luxemburg · Günstigste Tankstellen' },
    nl: { url: 'https://www.anwb.nl/auto/tanken/brandstofprijzen', name: 'ANWB Brandstofprijzen', desc: 'Niederlande · Aktuelle Kraftstoffpreise' },
  };
  const c = configs[land];
  if (!c) return;
  btn.innerHTML = `<a href="${c.url}" target="_blank" style="display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(34,197,94,0.1),rgba(56,189,248,0.06));border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:14px 16px;text-decoration:none;color:var(--text)">
    <span style="font-size:1.8rem;flex-shrink:0">⛽</span>
    <div style="flex:1">
      <div style="font-weight:700;font-size:0.92rem;margin-bottom:2px">${c.name} öffnen</div>
      <div style="font-size:0.72rem;color:var(--muted)">${c.desc}</div>
    </div>
    <span style="color:var(--accent);font-size:1.1rem">↗</span>
  </a>`;
}

function tpPleinMoinsCherUrl(land, kraftstoff) {
  const dimMap  = { diesel: 'c_gazole', e5: 'c_sp95', e10: 'c_e10' };
  const slugMap = { diesel: 'gazole-b7', e5: 'sp95-e5', e10: 'e10-e5' };
  const dim  = dimMap[kraftstoff] || 'c_gazole';
  const slug = slugMap[kraftstoff] || 'gazole-b7';
  const filters = btoa(JSON.stringify([{ dim: 'pays', k: land.toUpperCase() }, { dim, k: '1' }]));
  return `https://plein-moins-cher.fr/de/carte-carburants-prix-stations-${slug}.html?filters=${filters}`;
}

function tpShowDeNotice(key) {
  const el = document.getElementById('tp-de-notice');
  if (!el) return;
  el.style.display = 'block';
  if (key) {
    el.innerHTML = `<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-size:0.8rem;color:var(--muted)">✅ Tankerkönig API-Key gespeichert</span>
      <button onclick="tpRemoveTKKey()" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.78rem;font-weight:700">Entfernen</button>
    </div>`;
  } else {
    el.innerHTML = `<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:14px">
      <div style="font-weight:700;color:var(--text);margin-bottom:6px;font-size:0.9rem">⚠️ Tankerkönig API-Key benötigt</div>
      <div style="font-size:0.75rem;color:var(--muted);margin-bottom:10px;line-height:1.5">Kostenlos registrieren auf <strong style="color:var(--text)">creativecommons.tankerkoenig.de</strong> → API-Key kopieren → hier einfügen.</div>
      <div style="display:flex;gap:8px">
        <input class="form-inp" id="tp-tk-inp" placeholder="API-Key einfügen…" style="flex:1">
        <button class="btn btn-primary" style="flex-shrink:0;padding:0 14px" onclick="tpSaveTKKey()">Speichern</button>
      </div>
    </div>`;
  }
}

function tpSaveTKKey() {
  const val = document.getElementById('tp-tk-inp')?.value?.trim();
  if (!val) return;
  localStorage.setItem('wmp_tk_key', val);
  tpShowDeNotice(val);
  toast('API-Key gespeichert');
}

function tpRemoveTKKey() {
  localStorage.removeItem('wmp_tk_key');
  tpShowDeNotice(null);
}

async function tpGetLocation() {
  const btn = document.getElementById('tp-loc-btn');
  const txt = document.getElementById('tp-loc-txt');
  btn.disabled = true;
  txt.textContent = '⏳ Standort wird ermittelt…';
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000, enableHighAccuracy: true }));
    TP.lat = pos.coords.latitude;
    TP.lng = pos.coords.longitude;
    txt.textContent = `📍 ${TP.lat.toFixed(5)}, ${TP.lng.toFixed(5)}`;
    toast('Standort ermittelt');
  } catch(e) {
    txt.textContent = '📍 Kein Standort – GPS nicht verfügbar';
    toast('GPS-Fehler: ' + (e.message || 'Unbekannt'));
  }
  btn.disabled = false;
}

async function tpSearch() {
  if (!TP.lat) { toast('Zuerst Standort ermitteln'); return; }
  const kraftstoff = document.getElementById('tp-kraftstoff').value;
  const radius     = parseInt(document.getElementById('tp-radius').value);
  const resultEl   = document.getElementById('tp-results');
  resultEl.innerHTML = '<div style="text-align:center;padding:28px;color:var(--muted);font-size:0.9rem">⏳ Lade Tankstellen…</div>';
  try {
    if      (TP.land === 'de') await tpSearchDE(kraftstoff, radius, resultEl);
    else if (TP.land === 'at') await tpSearchAT(kraftstoff, radius, resultEl);
    else if (TP.land === 'fr') await tpSearchFR(kraftstoff, radius, resultEl);
    else if (TP.land === 'es') await tpSearchES(kraftstoff, radius, resultEl);
    else resultEl.innerHTML = '<div class="no-entries">Bitte den Link oben nutzen</div>';
  } catch(e) {
    resultEl.innerHTML = `<div class="no-entries">Fehler: ${e.message}</div>`;
  }
}

// ── Österreich (E-Control) ──
async function tpSearchAT(kraftstoff, radius, resultEl) {
  const typeMap = { diesel: 'DIE', e5: 'SUP', e10: 'SUP' };
  const type    = typeMap[kraftstoff] || 'DIE';
  const url     = `https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=${TP.lat}&longitude=${TP.lng}&fuelType=${type}&includeClosed=true&maxDistance=${radius}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`E-Control API: ${res.status}`);
  const data = await res.json();
  const list = (Array.isArray(data) ? data : [])
    .filter(s => s.prices?.some(p => p.fuelType === type && p.amount))
    .map(s => {
      const price = s.prices.find(p => p.fuelType === type);
      return {
        name:    s.name || '–',
        adresse: [s.location?.address, s.location?.postalCode, s.location?.city].filter(Boolean).join(', '),
        preis:   price?.amount ?? null,
        dist:    typeof s.distance === 'number' ? s.distance.toFixed(1) : '?',
        lat:     s.location?.latitude,
        lng:     s.location?.longitude,
        offen:   s.open,
      };
    })
    .filter(s => s.preis)
    .sort((a, b) => a.preis - b.preis)
    .slice(0, 15);
  if (!list.length) { resultEl.innerHTML = '<div class="no-entries">Keine Tankstellen gefunden</div>'; return; }
  if (kraftstoff === 'e10') {
    resultEl.innerHTML = '<div style="font-size:0.75rem;color:var(--muted);margin-bottom:10px">ℹ️ E10 kaum verbreitet in AT – zeige Super 95 (E5)</div>';
    resultEl.innerHTML += '<div id="tp-res-inner"></div>';
    tpRenderResults(list, 'e5', document.getElementById('tp-res-inner'));
  } else {
    tpRenderResults(list, kraftstoff, resultEl);
  }
}

// ── Deutschland (Tankerkönig) ──
async function tpSearchDE(kraftstoff, radius, resultEl) {
  const key = localStorage.getItem('wmp_tk_key');
  if (!key) { resultEl.innerHTML = '<div class="no-entries">Bitte zuerst API-Key eingeben</div>'; return; }
  const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${TP.lat}&lng=${TP.lng}&rad=${radius}&sort=price&type=${kraftstoff}&apikey=${key}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.message || 'API-Fehler');
  if (!data.stations?.length) { resultEl.innerHTML = '<div class="no-entries">Keine Tankstellen gefunden</div>'; return; }
  tpRenderResults(data.stations.slice(0,15).map(s => ({
    name: s.brand || s.name,
    adresse: `${s.street} ${s.houseNumber}, ${s.postCode} ${s.place}`,
    preis: s.price,
    dist: s.dist,
    lat: s.lat, lng: s.lng,
    offen: s.isOpen,
  })), kraftstoff, resultEl);
}

// ── Frankreich (data.economie.gouv.fr) ──
async function tpSearchFR(kraftstoff, radius, resultEl) {
  const typeMap = { diesel: 'Gazole', e5: 'SP95', e10: 'E10' };
  const typeFR  = typeMap[kraftstoff];
  const where   = encodeURIComponent(`distance(geom, GEOM'POINT(${TP.lng} ${TP.lat})', ${radius}km)`);
  const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=20&where=${where}&order_by=prix_valeur+asc&refine=prix_nom%3A${encodeURIComponent(typeFR)}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.results?.length) { resultEl.innerHTML = '<div class="no-entries">Keine Tankstellen gefunden</div>'; return; }
  tpRenderResults(data.results.map(s => {
    const slat = s.geom?.lat ?? s.geo_point_2d?.lat;
    const slng = s.geom?.lon ?? s.geo_point_2d?.lon;
    return {
      name: s.ensigne || s.id || '–',
      adresse: `${s.adresse || ''}, ${s.cp || ''} ${s.ville || ''}`.trim().replace(/^,\s*/, ''),
      preis: s.prix_valeur ? parseFloat(s.prix_valeur) : null,
      dist: slat ? tpHaversine(TP.lat, TP.lng, slat, slng).toFixed(1) : '?',
      lat: slat, lng: slng,
      offen: true,
    };
  }), kraftstoff, resultEl);
}

// ── Spanien (MINETUR) ──
async function tpSearchES(kraftstoff, radius, resultEl) {
  const fieldMap = { diesel: 'Precio Gasoleo A', e5: 'Precio Gasolina 95 E5', e10: 'Precio Gasolina 95 E10' };
  const field    = fieldMap[kraftstoff];
  const url      = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  let res;
  try { res = await fetch(url); } catch(e) {
    resultEl.innerHTML = '<div class="no-entries">Direktzugriff gesperrt – bitte den Link oben (Plein Moins Cher) nutzen</div>';
    return;
  }
  const data = await res.json();
  const stations = (data.ListaEESSPrecio || [])
    .map(s => {
      const slat = parseFloat((s['Latitud'] || '').replace(',', '.'));
      const slng = parseFloat((s['Longitud (WGS84)'] || s['Longitud'] || '').replace(',', '.'));
      const preis = parseFloat((s[field] || '').replace(',', '.')) || null;
      const dist  = (!isNaN(slat) && !isNaN(slng)) ? tpHaversine(TP.lat, TP.lng, slat, slng) : 99999;
      return { name: s['Rótulo'] || '–', adresse: `${s['Dirección'] || ''}, ${s['Municipio'] || ''}`, preis, dist: dist.toFixed(1), distNum: dist, lat: slat, lng: slng, offen: s['Horario']?.toLowerCase().includes('24') };
    })
    .filter(s => s.distNum <= radius && s.preis)
    .sort((a, b) => a.preis - b.preis)
    .slice(0, 15);
  if (!stations.length) { resultEl.innerHTML = '<div class="no-entries">Keine Tankstellen gefunden</div>'; return; }
  tpRenderResults(stations, kraftstoff, resultEl);
}

// ── Ergebnisse rendern ──
function tpRenderResults(stations, kraftstoff, resultEl) {
  const typeLabel = { diesel: 'Diesel', e5: 'Super E5', e10: 'Super E10' }[kraftstoff];
  const minPreis  = Math.min(...stations.filter(s => s.preis).map(s => s.preis));
  resultEl.innerHTML = `<div style="font-size:0.7rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">${stations.length} Tankstellen · ${typeLabel} · sortiert nach Preis</div>`
    + stations.map((s, i) => {
    const isCheap = s.preis && s.preis <= minPreis + 0.002;
    const preisColor = isCheap ? 'var(--accent)' : s.preis > minPreis + 0.05 ? 'var(--danger)' : 'var(--text)';
    const mapsUrl = (s.lat && s.lng) ? `https://maps.google.com/maps?q=${s.lat},${s.lng}` : null;
    return `<div style="background:var(--panel);border:1px solid ${isCheap ? 'rgba(34,197,94,0.4)' : 'var(--border)'};border-radius:12px;padding:12px 14px;margin-bottom:8px${isCheap ? ';box-shadow:0 0 0 1px rgba(34,197,94,0.15)' : ''}">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="background:var(--panel2);border-radius:8px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:800;color:var(--muted);flex-shrink:0">${i+1}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div>
              <div style="font-weight:700;color:var(--text);font-size:0.92rem">${s.name}${isCheap ? ' <span style="font-size:0.65rem;background:rgba(34,197,94,0.15);color:var(--accent);border-radius:4px;padding:1px 5px;font-weight:700">GÜNSTIGSTE</span>' : ''}</div>
              <div style="font-size:0.72rem;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">${s.adresse}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:1.45rem;font-weight:800;color:${preisColor};line-height:1">${s.preis ? s.preis.toFixed(3) + ' €' : '–'}</div>
              <div style="font-size:0.68rem;color:var(--muted);margin-top:2px">${s.dist} km entfernt</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            ${s.offen !== undefined ? `<span style="font-size:0.7rem;padding:2px 8px;border-radius:6px;font-weight:700;background:${s.offen ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)'};color:${s.offen ? 'var(--accent)' : 'var(--danger)'}">${s.offen ? '● Geöffnet' : '● Geschlossen'}</span>` : ''}
            ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" style="font-size:0.7rem;padding:2px 8px;border-radius:6px;background:var(--panel2);border:1px solid var(--border);color:var(--text);text-decoration:none;font-weight:700">🗺 Navigation</a>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function tpHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

let _notfallRendered = false;

function renderNotfall() {
  if (_notfallRendered) return;
  _notfallRendered = true;
  filterNotfall('');
}

function filterNotfall(q) {
  const term = q.toLowerCase().trim();
  const list = NOTFALL_DATA.filter(d => !term || d.land.toLowerCase().includes(term));
  const container = document.getElementById('notfall-list');
  if (!container) return;
  if (!list.length) { container.innerHTML = '<div class="no-entries">Kein Land gefunden</div>'; return; }

  container.innerHTML = list.map(d => {
    const tel = n => `<a href="tel:${n.replace(/\s/g,'')}" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;color:var(--text);text-decoration:none;font-weight:700;font-size:0.9rem;font-variant-numeric:tabular-nums;transition:border-color 0.15s" onclick="event.stopPropagation()">${n}</a>`;
    return `<div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:12px">${d.land}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🆘 Notruf</div>
          ${tel(d.notruf)}
        </div>
        <div>
          <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🚑 Rettung</div>
          ${tel(d.ambulanz)}
        </div>
        <div>
          <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">👮 Polizei</div>
          ${tel(d.polizei)}
        </div>
        <div>
          <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🚒 Feuerwehr</div>
          ${tel(d.feuerwehr)}
        </div>
        <div style="grid-column:span 2">
          <div style="font-size:0.58rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">🔧 Pannenhilfe (${d.pannentipp})</div>
          ${tel(d.pannenhilfe)}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════
// FIREBASE CLOUD-SYNC
// ══════════════════════════════════
const SYNC_CODE_KEY = 'wmp_sync_code';
const _fbConfig = {
  apiKey: "AIzaSyB1Wlpaf8dnX0_meSQoO84mSeWP-qIjdgg",
  authDomain: "wohnmobil-pro.firebaseapp.com",
  projectId: "wohnmobil-pro",
  storageBucket: "wohnmobil-pro.firebasestorage.app",
  messagingSenderId: "562019851678",
  appId: "1:562019851678:web:444b74e258a07391d14a8f"
};
let _fbDb = null;
function getFB() {
  if (_fbDb) return _fbDb;
  try {
    if (!firebase.apps.length) firebase.initializeApp(_fbConfig);
    _fbDb = firebase.firestore();
  } catch(e) { console.warn('Firebase init:', e); }
  return _fbDb;
}

function genSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function getSyncCode() {
  let c = localStorage.getItem(SYNC_CODE_KEY);
  if (!c) { c = genSyncCode(); localStorage.setItem(SYNC_CODE_KEY, c); }
  return c;
}

function fbTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout – kein Netz oder Firestore-Regeln prüfen')), ms))
  ]);
}

async function syncUpload() {
  const db = getFB();
  if (!db) { toast('Firebase nicht verfügbar – Seite neu laden'); return; }
  const code = getSyncCode();
  const btn = document.getElementById('sync-upload-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Hochladen…'; }
  try {
    const snap = buildSnapshot();
    await fbTimeout(db.collection('syncs').doc(code).set({ data: JSON.stringify(snap), ts: new Date().toISOString() }));
    toast('✅ Erfolgreich hochgeladen');
    renderSyncUI();
  } catch(e) {
    toast('❌ ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '☁️ Auf Cloud hochladen'; }
  }
}

async function syncDownload() {
  const db = getFB();
  if (!db) { toast('Firebase nicht verfügbar – Seite neu laden'); return; }
  const inputEl = document.getElementById('sync-input-code');
  const code = (inputEl?.value.trim().toUpperCase()) || getSyncCode();
  if (!code || code.length < 4) { toast('Sync-Code eingeben'); return; }
  const btn = document.getElementById('sync-download-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Laden…'; }
  try {
    const doc = await fbTimeout(db.collection('syncs').doc(code).get());
    if (!doc.exists) { toast('Kein Datensatz unter diesem Code'); if (btn) { btn.disabled = false; btn.textContent = '📲 Von Cloud laden'; } return; }
    const d = JSON.parse(doc.data().data);
    if (!confirm('Alle lokalen Daten mit dem Cloud-Stand ersetzen?')) { if (btn) { btn.disabled = false; btn.textContent = '📲 Von Cloud laden'; } return; }
    restoreSnapshot(d);
    toast('✅ Sync erfolgreich');
    renderStart();
  } catch(e) {
    toast('❌ ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '📲 Von Cloud laden'; }
  }
}

function syncNewCode() {
  if (!confirm('Neuen Sync-Code erstellen?\nDer alte Code wird ungültig – Cloud-Daten bleiben aber erhalten.')) return;
  const c = genSyncCode();
  localStorage.setItem(SYNC_CODE_KEY, c);
  renderSyncUI();
}

function renderSyncUI() {
  const el = document.getElementById('sync-ui');
  if (!el) return;
  const code = getSyncCode();
  el.innerHTML = `
    <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:0.78rem;color:var(--muted);line-height:1.6">
      <div style="font-weight:700;color:var(--text);margin-bottom:6px">ℹ️ Nur bei mehreren Geräten nötig</div>
      Nutz du die App nur auf einem Gerät? Dann brauchst du das hier nicht.<br>
      Für zwei Geräte (z.B. iPhone + iPad):
      <ol style="margin:6px 0 0 16px;padding:0">
        <li>Auf <strong style="color:var(--text)">Gerät 1</strong> → „Auf Cloud hochladen"</li>
        <li>Auf <strong style="color:var(--text)">Gerät 2</strong> → Sync-Code von Gerät 1 eingeben → „Von Cloud laden"</li>
      </ol>
      <div style="margin-top:6px">Der Sync passiert nicht automatisch – nur wenn du den Button drückst.</div>
    </div>
    <div style="background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:0.68rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Dein Sync-Code</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="font-size:1.55rem;font-weight:800;letter-spacing:5px;color:var(--accent);font-family:monospace;flex:1">${code}</div>
        <button onclick="syncNewCode()" style="padding:5px 10px;background:var(--panel);border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:0.72rem;cursor:pointer;font-family:inherit;white-space:nowrap">🔄 Neu</button>
      </div>
      <div style="font-size:0.73rem;color:var(--muted);margin-bottom:12px;line-height:1.5">Diesen Code auf einem anderen Gerät unter <strong style="color:var(--text)">Einstellungen → Cloud-Sync</strong> eingeben und <em>Von Cloud laden</em> tippen.</div>
      <button id="sync-upload-btn" onclick="syncUpload()" class="btn" style="width:100%">☁️ Auf Cloud hochladen</button>
    </div>
    <div style="background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:0.68rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Von anderem Gerät laden</div>
      <input id="sync-input-code" type="text" maxlength="8" placeholder="SYNC-CODE" style="width:100%;box-sizing:border-box;padding:10px 12px;background:var(--panel);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:monospace;font-size:1.1rem;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;text-align:center" oninput="this.value=this.value.toUpperCase()">
      <button id="sync-download-btn" onclick="syncDownload()" class="btn" style="width:100%;background:var(--panel2);color:var(--text);border:1px solid var(--accent-dim)">📲 Von Cloud laden</button>
    </div>`;
}

// ══════════════════════════════════
// ONBOARDING - HTML wird beim Laden eingefügt
// ══════════════════════════════════
(function() {
  if (localStorage.getItem('wmp_onboarded')) return;
  const div = document.createElement('div');
  div.id = 'onboarding';
  div.style.cssText = 'position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;flex-direction:column;padding:env(safe-area-inset-top,20px) 20px 32px;overflow-y:auto';
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 20px">
      <div id="ob-dots" style="display:flex;gap:6px;align-items:center"></div>
      <button onclick="finishOnboarding()" style="background:none;border:none;color:var(--muted);font-family:inherit;font-size:0.8rem;cursor:pointer;padding:4px 8px">Überspringen</button>
    </div>
    <div id="ob-content" style="flex:1"></div>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button id="ob-back" onclick="obBack()" style="padding:14px 20px;background:var(--panel2);border:1px solid var(--border);border-radius:14px;color:var(--muted);font-family:inherit;font-size:0.9rem;font-weight:700;cursor:pointer;visibility:hidden">← Zurück</button>
      <button id="ob-next" onclick="obNext()" style="flex:1;padding:14px;background:var(--accent);border:none;border-radius:14px;color:#fff;font-family:inherit;font-size:1rem;font-weight:700;cursor:pointer">Weiter →</button>
    </div>`;
  document.body.appendChild(div);
})();

renderSyncUI();
renderColorPicker();
renderNotifStatus();
renderStart();

// ══════════════════════════════════
// GASVORRAT
// ══════════════════════════════════
const GAS_KEY = 'wmp_gas';
let gasData = (() => {
  try { return JSON.parse(localStorage.getItem(GAS_KEY)) || null; } catch(e) { return null; }
})() || {
  bottles: [{ size: 11, fill: 50 }],
  kochen: 60, heizung: 0, wasser: 60, sonstig: 0
};

function gasSave() {
  gasData.kochen  = parseFloat(document.getElementById('gas-kochen')?.value)  || 0;
  gasData.heizung = parseFloat(document.getElementById('gas-heizung')?.value) || 0;
  gasData.wasser  = parseFloat(document.getElementById('gas-wasser')?.value)  || 0;
  gasData.sonstig = parseFloat(document.getElementById('gas-sonstig')?.value) || 0;
  localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
}

function gasRender() {
  // Verbrauchs-Felder
  ['kochen','heizung','wasser','sonstig'].forEach(k => {
    const el = document.getElementById('gas-' + k);
    if (el) el.value = gasData[k] || '';
  });
  gasRenderBottles();
  gasCalc();
}

function gasRenderBottles() {
  const wrap = document.getElementById('gas-bottles-wrap');
  if (!wrap) return;
  const GAS_SIZES = [5, 11, 33];
  wrap.innerHTML = gasData.bottles.map((b, i) => {
    const pct = Math.max(0, Math.min(100, b.fill));
    const color = pct < 20 ? '#ef4444' : pct < 40 ? '#f59e0b' : 'var(--accent)';
    return `<div style="background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent)">🔥 Flasche ${i+1}</div>
        ${gasData.bottles.length > 1 ? `<button onclick="gasRemoveBottle(${i})" style="background:none;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:0 4px">✕</button>` : ''}
      </div>
      <div class="form-grid" style="margin-bottom:12px">
        <div class="form-col">
          <label class="form-lbl">Flaschengröße</label>
          <select class="form-inp" onchange="gasSetSize(${i},this.value)">
            ${GAS_SIZES.map(s => `<option value="${s}" ${b.size==s?'selected':''}>${s} kg</option>`).join('')}
            <option value="custom" ${!GAS_SIZES.includes(b.size)?'selected':''}>Eigene</option>
          </select>
        </div>
        <div class="form-col" id="gas-custom-wrap-${i}" style="${!GAS_SIZES.includes(b.size)?'':'display:none'}">
          <label class="form-lbl">Größe (kg)</label>
          <input class="form-inp" type="number" value="${!GAS_SIZES.includes(b.size)?b.size:''}" placeholder="kg" min="1" oninput="gasSetCustomSize(${i},this.value)">
        </div>
      </div>
      <!-- Visueller Tank -->
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:0.72rem;color:var(--muted)">Füllstand</span>
          <span style="font-size:0.85rem;font-weight:700;color:${color}" id="gas-pct-${i}">${pct}%</span>
        </div>
        <div style="height:18px;background:var(--panel);border:1px solid var(--border);border-radius:9px;overflow:hidden;margin-bottom:6px">
          <div id="gas-bar-${i}" style="height:100%;width:${pct}%;background:${color};border-radius:9px;transition:width 0.3s,background 0.3s"></div>
        </div>
        <input type="range" min="0" max="100" value="${pct}" style="width:100%;accent-color:${color}" oninput="gasSetFill(${i},this.value)">
      </div>
      <div style="font-size:0.78rem;color:var(--muted);text-align:center">
        Inhalt: <strong style="color:var(--text)">${((b.size * pct / 100) * 1000).toFixed(0)} g</strong> von ${(b.size * 1000).toFixed(0)} g
      </div>
    </div>`;
  }).join('');

  const addBtn = document.getElementById('gas-add-btn');
  if (addBtn) addBtn.style.display = gasData.bottles.length >= 2 ? 'none' : '';
}

function gasSetFill(i, val) {
  gasData.bottles[i].fill = parseFloat(val);
  // Update bar + label live
  const pct = Math.max(0, Math.min(100, gasData.bottles[i].fill));
  const color = pct < 20 ? '#ef4444' : pct < 40 ? '#f59e0b' : 'var(--accent)';
  const bar = document.getElementById('gas-bar-' + i);
  const lbl = document.getElementById('gas-pct-' + i);
  if (bar) { bar.style.width = pct + '%'; bar.style.background = color; }
  if (lbl) { lbl.textContent = pct + '%'; lbl.style.color = color; }
  localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
  gasCalc();
}

function gasSetSize(i, val) {
  const wrap = document.getElementById('gas-custom-wrap-' + i);
  if (val === 'custom') {
    if (wrap) wrap.style.display = '';
  } else {
    gasData.bottles[i].size = parseFloat(val);
    if (wrap) wrap.style.display = 'none';
    localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
    gasCalc();
  }
}

function gasSetCustomSize(i, val) {
  const v = parseFloat(val);
  if (v > 0) { gasData.bottles[i].size = v; localStorage.setItem(GAS_KEY, JSON.stringify(gasData)); gasCalc(); }
}

function gasAddBottle() {
  if (gasData.bottles.length >= 2) return;
  gasData.bottles.push({ size: 11, fill: 100 });
  localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
  gasRenderBottles();
  gasCalc();
}

function gasRemoveBottle(i) {
  gasData.bottles.splice(i, 1);
  localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
  gasRenderBottles();
  gasCalc();
}

function gasPreset(typ) {
  const presets = {
    sommer:  { kochen: 60,  heizung: 0,   wasser: 60,  sonstig: 0 },
    winter:  { kochen: 100, heizung: 1500, wasser: 150, sonstig: 50 },
    kochen:  { kochen: 100, heizung: 0,   wasser: 0,   sonstig: 0 },
  };
  const p = presets[typ];
  if (!p) return;
  Object.keys(p).forEach(k => {
    gasData[k] = p[k];
    const el = document.getElementById('gas-' + k);
    if (el) el.value = p[k] || '';
  });
  localStorage.setItem(GAS_KEY, JSON.stringify(gasData));
  gasCalc();
}

function gasCalc() {
  const result = document.getElementById('gas-result');
  if (!result) return;
  const totalG = gasData.bottles.reduce((s, b) => s + (b.size * Math.max(0, Math.min(100, b.fill)) / 100 * 1000), 0);
  const tagesverbrauch = (gasData.kochen || 0) + (gasData.heizung || 0) + (gasData.wasser || 0) + (gasData.sonstig || 0);
  const reichweite = tagesverbrauch > 0 ? totalG / tagesverbrauch : null;
  const totalKg = gasData.bottles.reduce((s, b) => s + b.size, 0);
  const totalPct = totalKg > 0 ? (totalG / (totalKg * 1000) * 100) : 0;
  const resColor = totalPct < 20 ? '#ef4444' : totalPct < 40 ? '#f59e0b' : 'var(--accent)';
  const warn = totalPct < 20 ? `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:0.82rem;color:#ef4444">⚠️ <strong>Gasvorrat kritisch!</strong> Jetzt nachfüllen.</div>` :
               totalPct < 40 ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:0.82rem;color:#f59e0b">⚠️ Gasvorrat wird knapp. Nächste Möglichkeit einplanen.</div>` : '';
  result.innerHTML = `${warn}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Gesamtvorrat</div>
        <div style="font-size:1.6rem;font-weight:800;color:${resColor}">${(totalG/1000).toFixed(2)} kg</div>
        <div style="font-size:0.72rem;color:var(--muted)">${totalPct.toFixed(0)}% voll</div>
      </div>
      <div style="background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Tagesverbrauch</div>
        <div style="font-size:1.6rem;font-weight:800;color:var(--accent)">${tagesverbrauch} g</div>
        <div style="font-size:0.72rem;color:var(--muted)">${(tagesverbrauch/1000).toFixed(2)} kg/Tag</div>
      </div>
      <div style="background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;grid-column:1/-1">
        <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Reichweite</div>
        <div style="font-size:2rem;font-weight:800;color:${tagesverbrauch>0?resColor:'var(--muted)'}">
          ${reichweite !== null ? Math.floor(reichweite) + ' Tage' : '–'}
        </div>
        ${reichweite !== null ? `<div style="font-size:0.72rem;color:var(--muted)">≈ bis ${(() => { const d=new Date(); d.setDate(d.getDate()+Math.floor(reichweite)); return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}); })()}</div>` : '<div style="font-size:0.72rem;color:var(--muted)">Tagesverbrauch eingeben</div>'}
      </div>
    </div>`;
}

// ══════════════════════════════════
// ONBOARDING
// ══════════════════════════════════
const ONBOARD_KEY = 'wmp_onboarded';
let _obStep = 0;
let _obFavs = [];

function showOnboarding() {
  if (localStorage.getItem(ONBOARD_KEY)) return;
  _obStep = 0; _obFavs = [];
  const el = document.getElementById('onboarding');
  if (el) { el.style.display = 'flex'; renderObStep(); }
}

function obNext() {
  if (_obStep === 1) {
    const h = document.getElementById('ob-hersteller')?.value.trim();
    const m = document.getElementById('ob-modell')?.value.trim();
    if (h || m) {
      const fz = JSON.parse(localStorage.getItem('wmp_fahrzeug')||'{}');
      if (h) fz.hersteller = h;
      if (m) fz.modell = m;
      localStorage.setItem('wmp_fahrzeug', JSON.stringify(fz));
    }
  }
  if (_obStep === 2) {
    if (_obFavs.length > 0) {
      wmpFavs = _obFavs;
      localStorage.setItem(WMP_FAVS_KEY, JSON.stringify(wmpFavs));
    }
  }
  if (_obStep >= 3) { finishOnboarding(); return; }
  _obStep++;
  renderObStep();
}

function obBack() {
  if (_obStep > 0) { _obStep--; renderObStep(); }
}

function obToggleFav(id) {
  const i = _obFavs.indexOf(id);
  if (i >= 0) { _obFavs.splice(i, 1); }
  else if (_obFavs.length < 4) { _obFavs.push(id); }
  renderObStep();
}

function finishOnboarding() {
  localStorage.setItem(ONBOARD_KEY, '1');
  const el = document.getElementById('onboarding');
  if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; setTimeout(() => el.style.display = 'none', 400); }
  renderStart();
}

function renderObStep() {
  const wrap = document.getElementById('ob-content');
  const dots = document.getElementById('ob-dots');
  if (!wrap || !dots) return;

  dots.innerHTML = [0,1,2,3].map(i =>
    `<div style="width:${i===_obStep?20:8}px;height:8px;border-radius:4px;background:${i===_obStep?'var(--accent)':'var(--border)'};transition:all 0.3s"></div>`
  ).join('');

  const steps = [
    // Step 0: Willkommen
    `<div style="text-align:center;padding:16px 0">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--accent),var(--accent2,#38bdf8));border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:38px;margin:0 auto 20px;box-shadow:0 0 40px var(--accent-dim)">🚐</div>
      <div style="font-size:1.8rem;font-weight:800;letter-spacing:2px;color:var(--text);margin-bottom:6px">WOHNMOBIL <span style="color:var(--accent)">PRO</span></div>
      <div style="font-size:0.85rem;color:var(--muted);line-height:1.7;margin-bottom:24px">Dein digitaler Begleiter für Camping & Reise.<br>Kostenlos · Offline · Ohne Registrierung</div>
      <div style="display:flex;flex-direction:column;gap:8px;text-align:left;background:var(--panel2);border-radius:14px;padding:14px 16px">
        ${['⊙ Wohnmobil nivellieren','🌤 Wetter am Stellplatz','☑ Checklisten','€ Kosten & Urlaube','⚡ Solar & Energie','📡 Sat-Finder & mehr'].map(t=>`<div style="font-size:0.85rem;color:var(--text)">✓ ${t}</div>`).join('')}
      </div>
    </div>`,

    // Step 1: Fahrzeug
    `<div style="padding:8px 0">
      <div style="font-size:1.4rem;font-weight:800;color:var(--text);margin-bottom:6px">Dein Fahrzeug 🚐</div>
      <div style="font-size:0.82rem;color:var(--muted);margin-bottom:20px">Optional – du kannst das auch später unter „Mein Fahrzeug" ausfüllen.</div>
      <label style="font-size:0.72rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px">Hersteller</label>
      <input id="ob-hersteller" class="form-inp" type="text" placeholder="z.B. Fiat, Mercedes, VW…" style="width:100%;margin-bottom:14px">
      <label style="font-size:0.72rem;color:var(--muted);letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:6px">Modell</label>
      <input id="ob-modell" class="form-inp" type="text" placeholder="z.B. Ducato, Sprinter, Crafter…" style="width:100%">
    </div>`,

    // Step 2: Favoriten
    `<div style="padding:8px 0">
      <div style="font-size:1.4rem;font-weight:800;color:var(--text);margin-bottom:6px">Deine Favoriten ⭐</div>
      <div style="font-size:0.82rem;color:var(--muted);margin-bottom:16px">Wähle bis zu 4 Werkzeuge für die Startseite. <span style="color:var(--accent)">${_obFavs.length}/4 gewählt</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${START_TOOLS.map(t => {
          const sel = _obFavs.includes(t.id);
          return `<button onclick="obToggleFav('${t.id}')" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:${sel?'var(--accent-dim)':'var(--panel2)'};border:1px solid ${sel?'var(--accent)':'var(--border)'};border-radius:12px;cursor:pointer;font-family:inherit;text-align:left;transition:all 0.15s">
            <span style="font-size:1.2rem">${t.icon}</span>
            <span style="font-size:0.8rem;font-weight:700;color:${sel?'var(--accent)':'var(--text)'}">${t.name}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`,

    // Step 3: Fertig
    `<div style="text-align:center;padding:24px 0">
      <div style="font-size:4rem;margin-bottom:16px">🎉</div>
      <div style="font-size:1.6rem;font-weight:800;color:var(--text);margin-bottom:8px">Alles bereit!</div>
      <div style="font-size:0.85rem;color:var(--muted);line-height:1.7;margin-bottom:20px">Du kannst jederzeit in den Einstellungen<br>Favoriten und Fahrzeugdaten anpassen.</div>
      <div style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:12px;padding:12px 16px;font-size:0.82rem;color:var(--text);line-height:1.6">
        💡 Tipp: App zum Homescreen hinzufügen für den besten Vollbild-Erlebnis
      </div>
    </div>`
  ];

  wrap.style.opacity = '0';
  wrap.style.transform = 'translateX(20px)';
  setTimeout(() => {
    wrap.innerHTML = steps[_obStep];
    wrap.style.transition = 'opacity 0.25s, transform 0.25s';
    wrap.style.opacity = '1';
    wrap.style.transform = 'translateX(0)';
  }, 150);

  document.getElementById('ob-back').style.visibility = _obStep > 0 ? 'visible' : 'hidden';
  document.getElementById('ob-next').textContent = _obStep === 3 ? '🚀 Los geht\'s!' : _obStep === 2 && _obFavs.length === 0 ? 'Überspringen' : 'Weiter →';
}

showOnboarding();

// ══════════════════════════════════
// FEEDBACK
// ══════════════════════════════════
function openFeedback(typ) {
  const labels = { bug: '🐛 Bug melden', idee: '💡 Idee vorschlagen', lob: '⭐ Lob / Sonstiges' };
  const placeholders = {
    bug: 'Was ist passiert? Welches Werkzeug, welches Gerät?',
    idee: 'Welche Funktion würdest du dir wünschen?',
    lob: 'Was gefällt dir? Was kann besser werden?'
  };
  const existing = document.getElementById('feedback-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'feedback-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);padding:0 0 env(safe-area-inset-bottom,0)';
  modal.innerHTML = `
    <div style="background:var(--panel);border-radius:20px 20px 0 0;width:100%;max-width:520px;padding:20px 20px 32px;border-top:1px solid var(--border)">
      <div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 18px"></div>
      <div style="font-size:1.05rem;font-weight:700;color:var(--text);margin-bottom:4px">${labels[typ]}</div>
      <div style="font-size:0.75rem;color:var(--muted);margin-bottom:14px">Wohnmobil Pro v${document.querySelector('[id="footer-version"]')?.textContent || ''} · öffnet deine Mail-App</div>
      <textarea id="fb-text" placeholder="${placeholders[typ]}" style="width:100%;box-sizing:border-box;min-height:120px;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px;color:var(--text);font-family:inherit;font-size:0.9rem;resize:vertical;margin-bottom:12px;line-height:1.5" autofocus></textarea>
      <div style="display:flex;gap:8px">
        <button onclick="document.getElementById('feedback-modal').remove()" style="flex:1;padding:12px;background:var(--panel2);border:1px solid var(--border);border-radius:12px;color:var(--muted);font-family:inherit;font-size:0.9rem;font-weight:700;cursor:pointer">Abbrechen</button>
        <button onclick="sendFeedback('${typ}')" style="flex:2;padding:12px;background:var(--accent);border:none;border-radius:12px;color:#fff;font-family:inherit;font-size:0.9rem;font-weight:700;cursor:pointer">✉️ Senden</button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('fb-text')?.focus(), 100);
}

function sendFeedback(typ) {
  const text = document.getElementById('fb-text')?.value.trim();
  if (!text) { toast('Bitte erst etwas schreiben'); return; }
  const subjects = { bug: 'Bug-Meldung Wohnmobil Pro', idee: 'Idee für Wohnmobil Pro', lob: 'Feedback Wohnmobil Pro' };
  const body = encodeURIComponent(text + '\n\n---\nWohnmobil Pro App');
  window.location.href = `mailto:info@michaely.de?subject=${encodeURIComponent(subjects[typ])}&body=${body}`;
  document.getElementById('feedback-modal')?.remove();
}


// ══════════════════════════════════
// STELLPLATZ-LOGBUCH
// ══════════════════════════════════
const SP_KEY = 'wmp_stellplatz';
let spData = [];
let spCurrentStar = 0;

function spLoad() {
  try { spData = JSON.parse(localStorage.getItem(SP_KEY) || '[]'); } catch(e) { spData = []; }
}
function spSave() {
  localStorage.setItem(SP_KEY, JSON.stringify(spData));
}
spLoad();

function spOpenForm(id) {
  const form = document.getElementById('sp-form');
  if (!form) return;
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (id) {
    const e = spData.find(x => x.id === id);
    if (!e) return;
    document.getElementById('sp-edit-id').value  = id;
    document.getElementById('sp-name').value     = e.name    || '';
    document.getElementById('sp-ort').value      = e.ort     || '';
    document.getElementById('sp-land').value     = e.land    || '';
    document.getElementById('sp-datum').value    = e.datum   || '';
    document.getElementById('sp-naechte').value  = e.naechte || '';
    document.getElementById('sp-preis').value    = e.preis !== undefined && e.preis !== null ? e.preis : '';
    document.getElementById('sp-notiz').value    = e.notiz   || '';
    document.getElementById('sp-lat').value      = e.lat     || '';
    document.getElementById('sp-lon').value      = e.lon     || '';
    const gpsEl = document.getElementById('sp-gps-status');
    if (gpsEl) gpsEl.textContent = e.lat ? `📍 ${parseFloat(e.lat).toFixed(5)}, ${parseFloat(e.lon).toFixed(5)}` : 'Kein GPS gespeichert';
    document.getElementById('sp-form-title').textContent = '✏️ Stellplatz bearbeiten';
    spSetStar(e.bewertung || 0);
  } else {
    document.getElementById('sp-edit-id').value  = '';
    document.getElementById('sp-name').value     = '';
    document.getElementById('sp-ort').value      = '';
    document.getElementById('sp-land').value     = '';
    document.getElementById('sp-datum').value    = new Date().toISOString().split('T')[0];
    document.getElementById('sp-naechte').value  = '1';
    document.getElementById('sp-preis').value    = '';
    document.getElementById('sp-notiz').value    = '';
    document.getElementById('sp-lat').value      = '';
    document.getElementById('sp-lon').value      = '';
    const gpsEl = document.getElementById('sp-gps-status');
    if (gpsEl) gpsEl.textContent = 'Kein GPS gespeichert';
    document.getElementById('sp-form-title').textContent = '⛺ Neuer Stellplatz';
    spSetStar(0);
  }
}

function spCloseForm() {
  const form = document.getElementById('sp-form');
  if (form) form.style.display = 'none';
}

function spSetStar(v) {
  spCurrentStar = v;
  document.querySelectorAll('.sp-star').forEach(s => {
    s.style.opacity = parseInt(s.dataset.v) <= v ? '1' : '0.25';
  });
}

function spGetGps() {
  const statusEl = document.getElementById('sp-gps-status');
  if (!navigator.geolocation) { if (statusEl) statusEl.textContent = 'GPS nicht verfügbar'; return; }
  if (statusEl) statusEl.textContent = '⏳ Ermittle Position…';
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('sp-lat').value = pos.coords.latitude;
    document.getElementById('sp-lon').value = pos.coords.longitude;
    if (statusEl) {
      statusEl.textContent = `📍 ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      statusEl.style.color = 'var(--accent)';
    }
  }, () => {
    if (statusEl) { statusEl.textContent = 'Standort konnte nicht ermittelt werden'; statusEl.style.color = '#ef4444'; }
  }, { timeout: 10000 });
}

function spSaveEntry() {
  const name = document.getElementById('sp-name').value.trim();
  if (!name) { toast('Bitte einen Namen eingeben'); return; }
  const editId = document.getElementById('sp-edit-id').value;
  const preisVal = document.getElementById('sp-preis').value;
  const entry = {
    id:        editId ? parseInt(editId) : Date.now(),
    name,
    ort:       document.getElementById('sp-ort').value.trim(),
    land:      document.getElementById('sp-land').value.trim(),
    datum:     document.getElementById('sp-datum').value,
    naechte:   parseFloat(document.getElementById('sp-naechte').value) || 1,
    preis:     preisVal !== '' ? parseFloat(preisVal) : null,
    bewertung: spCurrentStar,
    notiz:     document.getElementById('sp-notiz').value.trim(),
    lat:       document.getElementById('sp-lat').value || null,
    lon:       document.getElementById('sp-lon').value || null,
  };
  if (editId) {
    const idx = spData.findIndex(x => x.id == editId);
    if (idx >= 0) spData[idx] = entry; else spData.unshift(entry);
  } else {
    spData.unshift(entry);
  }
  spSave();
  spCloseForm();
  spRender();
  toast('✅ Stellplatz gespeichert');
}

function spDelete(id) {
  if (!confirm('Eintrag löschen?')) return;
  spData = spData.filter(x => x.id !== id);
  spSave();
  spRender();
}

function spStars(n) {
  if (!n) return '';
  return '⭐'.repeat(n) + '☆'.repeat(5 - n);
}

function spRender() {
  spLoad();
  const statsEl = document.getElementById('sp-stats');
  if (statsEl) {
    const total = spData.length;
    const naechte = spData.reduce((s, e) => s + (e.naechte || 1), 0);
    const preise = spData.filter(e => e.preis !== null && e.preis !== undefined);
    const avgPreis = preise.length ? preise.reduce((s, e) => s + e.preis, 0) / preise.length : null;
    statsEl.innerHTML = [
      { icon: '⛺', label: 'Stellplätze', val: total },
      { icon: '🌙', label: 'Nächte gesamt', val: naechte },
      { icon: '💶', label: 'Ø Preis/Nacht', val: avgPreis !== null ? avgPreis.toFixed(2) + ' €' : '–' },
    ].map(s => `<div style="background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center">
      <div style="font-size:1.3rem">${s.icon}</div>
      <div style="font-size:1.2rem;font-weight:800;color:var(--accent)">${s.val}</div>
      <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">${s.label}</div>
    </div>`).join('');
  }

  const q = (document.getElementById('sp-search')?.value || '').toLowerCase();
  const list = document.getElementById('sp-list');
  if (!list) return;
  const filtered = q ? spData.filter(e =>
    (e.name + ' ' + e.ort + ' ' + e.land + ' ' + e.notiz).toLowerCase().includes(q)
  ) : spData;

  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--muted)">
      <div style="font-size:2.5rem;margin-bottom:10px">⛺</div>
      <div style="font-size:0.9rem">${q ? 'Keine Treffer' : 'Noch kein Stellplatz eingetragen'}</div>
      ${!q ? '<div style="font-size:0.78rem;margin-top:6px">Auf „+ Neuer Stellplatz" tippen</div>' : ''}
    </div>`;
    return;
  }

  list.innerHTML = filtered.map(e => {
    const datumStr = e.datum ? new Date(e.datum + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';
    const preisStr = e.preis !== null && e.preis !== undefined ? parseFloat(e.preis).toFixed(2) + ' €/Nacht' : '';
    const mapsUrl = e.lat && e.lon ? `https://www.google.com/maps?q=${e.lat},${e.lon}` : null;
    const stars = spStars(e.bewertung);
    return `<div style="background:var(--panel2);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:1rem;font-weight:700;color:var(--text)">${e.name}</div>
          ${(e.ort || e.land) ? `<div style="font-size:0.78rem;color:var(--muted);margin-top:2px">${[e.ort, e.land].filter(Boolean).join(' · ')}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button onclick="spOpenForm(${e.id})" style="background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:5px 10px;color:var(--muted);font-size:0.8rem;cursor:pointer">✏️</button>
          <button onclick="spDelete(${e.id})" style="background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:5px 10px;color:#ef4444;font-size:0.8rem;cursor:pointer">🗑</button>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:0.75rem;color:var(--muted)">
        ${stars ? `<span style="color:#f59e0b">${stars}</span>` : ''}
        ${datumStr ? `<span>📅 ${datumStr}</span>` : ''}
        ${e.naechte ? `<span>🌙 ${e.naechte} Nacht${e.naechte !== 1 ? 'e' : ''}</span>` : ''}
        ${preisStr ? `<span>💶 ${preisStr}</span>` : ''}
        ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">📍 Maps</a>` : ''}
      </div>
      ${e.notiz ? `<div style="font-size:0.8rem;color:var(--text);line-height:1.5;border-top:1px solid var(--border);padding-top:8px;margin-top:8px">${e.notiz}</div>` : ''}
    </div>`;
  }).join('');
}
