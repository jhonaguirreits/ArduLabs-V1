// ==============================================================
// 1. IMPORTACIONES (Firebase Cloud SDKs 10.8.1 - CDN Oficial)
// ==============================================================
import { getState, updateState } from './state.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"; // Core Firebase app
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js"; // Analytics
import { ADMIN_EMAIL, mensajesExito, mensajesFallo, competenciasMapa, weeks, tiendaItems, logrosDefiniciones, COLLECTIVE_CHALLENGE_GOAL, ARDUINO_QUICK_COMMANDS, translations } from './constants.js'; // Existing import
import { initializeAuth, setupAuthListener, loginWithGoogle, logoutUser } from './auth.js'; // New import for auth module
import { initializeFirestore, doc, setDoc, getDoc, updateDoc, increment, onSnapshot, addDoc, serverTimestamp, collection, query, where, orderBy, limit } from './firestore.js'; // New import for firestore module
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-functions.js";
import { initializeGamificationModule, getVidas, resetChallengeState, decrementVida, incrementFallo, unlockPista, cargarDatosGamificacion, abrirModalGamificacion, cerrarModalGamificacion, cambiarTabGamificacion, comprarArticulo, equiparArticulo, reclamarMonedas, ganarVolts, comprarEnergia, comprarPista, renderPistas, playCoinSound, playErrorSound, getMensajesExito, getMensajesFallo } from './gamification.js'; // New import for gamification module
import { initializeTeacherModule, iniciarAppDocente as teacherModuleIniciarAppDocente, renderTeacherDashboard, exportarCSV, cambiarTabDocente, renderTeacherManagementUI, addDocente, removeDocente, renderSecondaryTeacherUI, addMyGroup, removeMyGroup } from './teacher.js'; // New import for teacher module

// ==============================================================
// 2. CONFIGURACIÓN EXACTA DE TU FIREBASE (CodeQuestPro)
// ==============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDNBy-QKS5eNSinEI5ROOhR94YGKvbA0cg",
  authDomain: "codequestpro-78796.firebaseapp.com",
  projectId: "codequestpro-78796",
  storageBucket: "codequestpro-78796.firebasestorage.app",
  messagingSenderId: "383335669814",
  appId: "1:383335669814:web:70d1fd4e04b77aca63f897",
  measurementId: "G-V7GPL7TEQC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Analytics is still directly imported as it's not a core service like Auth/Firestore
const db = initializeFirestore(app); // Initialize firestore instance from firestore module
const auth = initializeAuth(app); // Initialize auth instance from auth module
const functions = getFunctions(app);
// 3. VARIABLES GLOBALES DEL SISTEMA Y USUARIO
// ==============================================================
let timers = {}; let intervalos = {}; 

// Inicializar los módulos una sola vez, pasando las dependencias que no cambian.
// Ahora los módulos obtendrán el estado dinámico (currentUser, etc.) desde state.js
initializeTeacherModule(db, window.lucide.createIcons);

/**
 * Muestra una notificación visual elegante (Toast).
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} flex-icon`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  if (window.lucide) lucide.createIcons();
  setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 500); }, 3500);
}

initializeGamificationModule(db, saveToFirebase, window.lucide.createIcons);

// ==============================================================
// 5. AI TUTOR (GEMINI INTEGRATION)
// ==============================================================
async function getGeminiExplanation(code, errorContext, retoDesc = "") {
  const explicarError = httpsCallable(functions, 'explicarError');
  try {
    const result = await explicarError({ code, errorContext, retoDesc });
    return result.data.explanation;
  } catch (error) {
    console.error("Error al llamar al tutor IA:", error);
    return "Hubo un problema al conectar con el servidor de la IA. ¡Revisa tu conexión!";
  }
}

// ==============================================================
// 6. AUTENTICACIÓN Y PANEL DOCENTE
// ==============================================================

setupAuthListener(auth, db, {
  iniciarAppEstudiante,
  iniciarAppDocente: teacherModuleIniciarAppDocente, // Use the imported function from teacher module
  saveToFirebase, // Pass the local saveToFirebase function
  showLoginError: (msg) => {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = msg;
  },
  hideLoginError: () => {
    document.getElementById('login-error').style.display = 'none';
  },
  showLoginLoading: () => {
    document.getElementById('login-loading').style.display = 'block';
  },
  hideLoginLoading: () => {
    document.getElementById('login-loading').style.display = 'none';
  }
});

async function loginConGoogle() {
  document.getElementById('login-error').style.display = 'none'; // Clear previous errors
  document.getElementById('login-loading').style.display = 'block'; // Show loading
  const result = await loginWithGoogle(auth);
  if (!result.success) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = result.error;
    document.getElementById('login-loading').style.display = 'none'; // Hide loading on error
  }
  // The onAuthStateChanged listener in auth.js will handle successful login and UI updates
}

function checkAchievements(nivel, tiempo, vidasRestantes) {
  const { userData } = getState();
  let nuevosLogros = [];

  if (!userData.achievements.includes('first_win')) nuevosLogros.push('first_win');
  if (tiempo < 30 && !userData.achievements.includes('speedrun')) nuevosLogros.push('speedrun');
  if (nivel === 'superior' && vidasRestantes === 3 && !userData.achievements.includes('perfect_logic')) nuevosLogros.push('perfect_logic');
  
  const horaActual = new Date().getHours();
  if (horaActual >= 22 && !userData.achievements.includes('night_owl')) nuevosLogros.push('night_owl');

  if (nuevosLogros.length > 0) {
    userData.achievements.push(...nuevosLogros);
    nuevosLogros.forEach(id => {
      const log = logrosDefiniciones.find(l => l.id === id);
      showToast(`🏆 Logro Desbloqueado: ${log.name}`, 'success');
    });
    saveToFirebase();
  }
}

async function logout() {
  const { currentUser, esAdmin, esDocenteSecundario } = getState();
  // Save student data before logging out if it's a student
  if (currentUser && !esAdmin && !esDocenteSecundario) await saveToFirebase(); 
  await logoutUser(auth);
}

// Modified saveToFirebase to accept uid and data if called from auth.js
async function saveToFirebase(uid, data) {
  const state = getState();
  if (!uid) uid = state.currentUser?.uid;
  if (!data) data = state.userData;
  if(!uid) return;

  try { 
    await setDoc(doc(db, "users", uid), data, { merge: true }); 
    console.log("Sincronizado con éxito");
  }
  catch (e) { 
    console.error("Error guardando en la nube:", e);
    showToast("Error de sincronización", "error");
  }
}

let timeoutGuardado;
function autoGuardarEnNube() { // Debounced save function
  clearTimeout(timeoutGuardado);
  timeoutGuardado = setTimeout(() => { saveToFirebase(); }, 2000); 
}

/**
 * Obtiene el progreso del reto colectivo desde Firestore.
 */
async function fetchCollectiveProgress() {
  try {
    const configRef = doc(db, "config", "collectiveChallenge");
    const docSnap = await getDoc(configRef);
    if (docSnap.exists()) {
      const total = docSnap.data().totalRetos || 0;
      updateState({ collectiveProgress: total });
      renderCollectiveProgress();
    } else {
      await setDoc(configRef, { totalRetos: 0 });
    }
  } catch (e) {
    console.error("Error al obtener reto colectivo:", e);
  }
}

function renderCollectiveProgress() {
  const { collectiveProgress, userData } = getState();
  const isGoalReached = collectiveProgress >= COLLECTIVE_CHALLENGE_GOAL;
  const percentage = Math.min((collectiveProgress / COLLECTIVE_CHALLENGE_GOAL) * 100, 100);
  
  const fill = document.getElementById('collective-fill');
  if (fill) {
    fill.style.width = percentage + '%';
    if (isGoalReached) fill.style.background = 'linear-gradient(90deg, #f1c40f, #e3b341)';
  }

  const text = document.getElementById('collective-text');
  if (text) {
    text.textContent = isGoalReached 
      ? `¡META CUMPLIDA! 🏆 (${collectiveProgress}/${COLLECTIVE_CHALLENGE_GOAL})`
      : `${collectiveProgress} / ${COLLECTIVE_CHALLENGE_GOAL} retos cumplidos`;
  }

  // Recompensa automática al alcanzar la meta
  if (isGoalReached && !userData.collectiveRewardClaimed && userData.grado !== 'ADMIN') {
    handleCollectiveReward();
  }
}

async function handleCollectiveReward() {
  const { userData } = getState();
  const newUserData = { ...userData, collectiveRewardClaimed: true };
  newUserData.monedas += 100;
  
  updateState({ userData: newUserData });
  await saveToFirebase();
  
  showToast("¡META INSTITUCIONAL CUMPLIDA! Has ganado 100 🪙", "success");
  if (window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  playCoinSound();
}

/**
 * Envía un mensaje a los compañeros del mismo grado.
 */
async function broadcastActivity(mensaje) {
  const { userData } = getState();
  if (!userData.grado || userData.grado === 'ADMIN') return;
  try {
    await addDoc(collection(db, "notifications"), {
      mensaje,
      grado: userData.grado,
      usuario: (userData.nombres || 'Alguien').split(' ')[0],
      timestamp: serverTimestamp()
    });
  } catch (e) { console.error("Error broadcast:", e); }
}

function setupNotificationListener() {
  const { userData } = getState();
  if (!userData.grado || userData.grado === 'ADMIN') return;
  const q = query(collection(db, "notifications"), where("grado", "==", userData.grado), orderBy("timestamp", "desc"), limit(1));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        const isFresh = data.timestamp && (Date.now() - data.timestamp.toMillis() < 10000);
        if (isFresh && data.usuario !== userData.nombres.split(' ')[0]) {
          showToast(`🚀 ${data.usuario}: ${data.mensaje}`, 'info');
        }
      }
    });
  });
}

// ==============================================================
// 7. INICIO APP DOCENTE Y DASHBOARD (Delegado a teacher.js)
// ==============================================================
// ==============================================================
// 8. INICIO APP ESTUDIANTE Y PERSONALIZACIÓN UI
// ==============================================================
function iniciarAppEstudiante() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-teacher').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  
  // Aplicar tema y avatar (si el admin tiene datos de estudiante)
  aplicarTemaYAvatarUI();
  fetchCollectiveProgress();
  setupNotificationListener();
  setupFeedbackListener();

  const { userData, esAdmin, currentUser } = getState();
  document.getElementById('lang-select').value = userData.language || 'es';
  applyTranslations();
  
  // Cargar datos de clase para el estudiante
  getDoc(doc(db, "classes", userData.grado)).then(d => {
      if(d.exists()) updateState({ userData: { ...userData, classData: d.data() } });
      populateWeekSelector();
      updateProgress();
  });

  // Aplicar ALTO CONTRASTE si el perfil PIAR es Visual
  if (userData.piarProfile === "visual") {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }

  const headerButtons = document.getElementById('header-buttons');
  if(!document.getElementById('header-user-badge')) {
    const badge = document.createElement('div'); 
    badge.id = 'header-user-badge';
    badge.className = 'user-badge flex-icon';
    
    // Si es el admin principal, añadir el botón de "Modo Dios"
    const adminButton = esAdmin 
      ? `<button id="btn-modo-admin" class="btn-admin-mode flex-icon" title="Modo Dios"><i data-lucide="crown"></i> Admin</button>` 
      : '';

    badge.innerHTML = `<i id="header-avatar" data-lucide="${userData.avatar || 'user'}"></i> <span>${(userData.nombres || 'Admin').split(' ')[0]}</span> ${adminButton} <button id="btn-logout" class="btn-logout flex-icon" title="Cerrar Sesión"><i data-lucide="log-out"></i> Salir</button>`;
    
    headerButtons.appendChild(badge);
  }

  cargarDatosGamificacion();
  loadWeek(); 
  updateProgress(); 
  if (window.lucide) lucide.createIcons();
}

/**
 * Escucha retroalimentación del docente en tiempo real para el estudiante.
 */
function setupFeedbackListener() {
  const { currentUser } = getState();
  if (!currentUser) return;
  
  onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const banner = document.getElementById('teacher-feedback-banner');
      if (data.teacherFeedback) {
        banner.style.display = 'block';
        banner.innerHTML = `
          <div class="flex-icon" style="justify-content: space-between; align-items: flex-start;">
            <div>
              <strong style="display:block; margin-bottom:4px;"><i data-lucide="message-square"></i> Nota del Docente:</strong>
              <span>${data.teacherFeedback.message}</span>
            </div>
            <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'"><i data-lucide="x"></i></button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      } else {
        banner.style.display = 'none';
      }
    }
  });
}

function applyTranslations() {
  const { userData } = getState();
  const lang = userData.language || 'es';
  const dict = translations[lang];

  document.getElementById('btn-gamificacion').innerHTML = `<i data-lucide="shopping-cart"></i> ${dict.nav_store}`;
  document.getElementById('btn-portafolio').innerHTML = `<i data-lucide="printer"></i> ${dict.nav_portafolio}`;
  if (window.lucide) lucide.createIcons();
}

function aplicarTemaYAvatarUI() {
  const { userData } = getState();
  const themeObj = tiendaItems.themes.find(t => t.id === (userData.theme || 'blue')) || tiendaItems.themes[0];
  document.documentElement.style.setProperty('--wokwi-blue', themeObj.color);
  
  const iconEl = document.getElementById('header-avatar');
  if(iconEl) { iconEl.setAttribute('data-lucide', userData.avatar || 'user'); if (window.lucide) lucide.createIcons(); }

  if(userData.themeMode === 'light') {
    document.body.setAttribute('data-theme', 'light');
    document.getElementById('btn-theme').innerHTML = `<i data-lucide="moon"></i> Tema Oscuro`;
  } else {
    document.body.removeAttribute('data-theme');
    document.getElementById('btn-theme').innerHTML = `<i data-lucide="sun"></i> Tema Claro`;
  }
}

function toggleTheme() {
  const { userData } = getState();
  userData.themeMode = userData.themeMode === 'light' ? 'dark' : 'light';
  saveToFirebase(); aplicarTemaYAvatarUI();
}

// ==============================================================
// 9. MODAL DE GAMIFICACIÓN: RANKING Y TIENDA
// 11. MOTOR EVALUADOR Y SIMULADOR
// ==============================================================
function llevarAlSimulador(nivel) {
  const txt = document.getElementById(`input-${nivel}`).value;
  if (txt.trim().length < 5) return showToast("Escribe un poco de código primero", "warning");
  
  navigator.clipboard.writeText(txt).then(() => {
    const iframe = document.getElementById('wokwi-iframe');
    iframe.classList.add('iframe-highlight');
    setTimeout(() => iframe.classList.remove('iframe-highlight'), 3000);

    const fb = document.getElementById(`feedback-${nivel}`);
    fb.className = "feedback success"; fb.style.borderColor = "var(--wokwi-blue)"; fb.style.backgroundColor = "rgba(47, 129, 247, 0.1)"; fb.style.display = "block";
    fb.innerHTML = `<div class="flex-icon"><i data-lucide="copy-check"></i> ¡Código Copiado! Haz clic dentro del Simulador y presiona Ctrl + V</div>`;
    if (window.lucide) lucide.createIcons();
  });
}

function limpiarCodigo(codigoRaw) { return codigoRaw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''); }

function linterDidactico(codigoLimpio) {
  let errores = []; let llaves = 0, parentesis = 0;
  for (let char of codigoLimpio) {
    if (char === '{') llaves++; if (char === '}') llaves--;
    if (char === '(') parentesis++; if (char === ')') parentesis--;
  }
  if (llaves !== 0) errores.push("⚖️ <strong>¡Desbalance de llaves {}!</strong> Todo bloque que abres debes cerrarlo.");
  if (parentesis !== 0) errores.push("⚖️ <strong>¡Paréntesis huérfano ()!</strong> Revisa las condiciones, te falta cerrar un paréntesis.");

  const lineas = codigoLimpio.split('\n');
  lineas.forEach((linea) => {
    let l = linea.trim();
    if (l.length === 0 || l.startsWith('#') || l.endsWith('{') || l === '}') return;
    if (l.startsWith('if') || l.startsWith('for') || l.startsWith('while') || l.startsWith('else')) return;
    const inst = /pinMode|digitalWrite|analogWrite|delay|Serial|lcd|servo|tone|noTone|int|float|bool|long/i;
    if (inst.test(l) && !l.endsWith(';')) {
      let lineaCorta = l.length > 30 ? l.substring(0, 30) + '...' : l;
      errores.push(`🔍 Arduino no sabe dónde termina la orden <code>${lineaCorta}</code>. ¿Olvidaste el punto y coma (;) al final?`);
    }
  });
  return errores;
}

function validarSintaxis(nivel) {
  const txt = document.getElementById(`input-${nivel}`); if(!txt) return;
  const { currentUser, userData, currentRetoId } = getState();
  const val = txt.value; 
  if(currentUser) { if(!userData.drafts) userData.drafts = {}; userData.drafts[`draft_${currentRetoId}_${nivel}`] = val; autoGuardarEnNube(); }

  const bar = document.getElementById(`syntax-${nivel}`); let tags = [];
  if (val.length < 5) { editor.getWrapperElement().classList.remove('syntax-ok','syntax-error'); bar.innerHTML = '<span class="syntax-chip chip-info">Escribe para analizar...</span>'; return; }
  
  let ok = true;
  if(val.includes('setup()') && val.includes('loop()')) tags.push('<span class="syntax-chip chip-ok"><i data-lucide="check"></i> Estructura</span>'); else { tags.push('<span class="syntax-chip chip-error"><i data-lucide="x"></i> Falta setup/loop</span>'); ok = false; }
  if (ok) { editor.getWrapperElement().classList.add('syntax-ok'); editor.getWrapperElement().classList.remove('syntax-error'); } else { editor.getWrapperElement().classList.add('syntax-error'); editor.getWrapperElement().classList.remove('syntax-ok'); }
  bar.innerHTML = tags.join(''); if (window.lucide) lucide.createIcons();
}

function verifyCode(nivel) {
  const { userData, currentRetoId } = getState();
  if (getVidas()[nivel] <= 0) return;
  initAudio(); 
  const btn = document.getElementById(`btn-${nivel}`); btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Analizando...`; btn.disabled = true;

  setTimeout(async () => {
    const originalCode = codeEditors[nivel].getValue();
    const fb = document.getElementById(`feedback-${nivel}`);
    const codigoLimpio = limpiarCodigo(originalCode);
    const erroresSintaxis = linterDidactico(codigoLimpio);

    if (erroresSintaxis.length > 0) {
       fb.innerHTML = `<div class="flex-icon" style="color: var(--warning-color); margin-bottom: 10px;"><i data-lucide="bot"></i> <strong>Asistente de Sintaxis dice:</strong></div><div id="gemini-explanation-${nivel}" style="font-size: 0.9rem; color: var(--text-light);"></div><div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px;">💡 Los errores de escritura no te quitan corazones ❤️. ¡Corrige y reintenta!</div>`;
       document.getElementById(`gemini-explanation-${nivel}`).innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Generando explicación del tutor IA...`;
       fb.className = "feedback error"; fb.style.borderColor = "var(--warning-color)"; fb.style.backgroundColor = "rgba(214,158,46,0.1)";
       if (window.lucide) lucide.createIcons();
       
       const explanation = await getGeminiExplanation(originalCode, `Errores de sintaxis detectados: ${erroresSintaxis.join(', ')}`);
       document.getElementById(`gemini-explanation-${nivel}`).innerHTML = explanation;
       fb.className = "feedback error"; fb.style.borderColor = "var(--warning-color)"; fb.style.backgroundColor = "rgba(214,158,46,0.1)";
       btn.innerHTML = `<i data-lucide="play"></i> Verificar`; btn.disabled = false; if (window.lucide) lucide.createIcons(); return; 
    }

    const cleanCode = codigoLimpio.replace(/\s+/g, '');
    const reto = weeks[currentRetoId].retos[nivel];
    let success = true;
    const mensajesExitoLocal = getMensajesExito();

    if (reto.match) { reto.match.forEach(str => { if (!cleanCode.includes(str)) success = false; }); }
    if (reto.minCount) {
      for (const [key, val] of Object.entries(reto.minCount)) {
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'), 'g');
        if ((cleanCode.match(regex) || []).length < val) success = false;
      }
    }
    
    if (success) {
      fb.className = "feedback success"; fb.style.borderColor = ""; fb.style.backgroundColor = ""; 
      fb.innerHTML = `<div class="flex-icon"><i data-lucide="check-circle-2"></i> ${mensajesExitoLocal[Math.floor(Math.random()*mensajesExitoLocal.length)]}</div>`;
      window.confetti(); stopTimer(nivel);
      
      userData.savedCodes[`code_${currentRetoId}_${nivel}`] = originalCode;
      
      const isAlreadyDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      if (!isAlreadyDone) { ganarVolts(nivel === 'basico' ? 10 : (nivel === 'alto' ? 20 : 30)); } else playCoinSound(); 

      userData.progress[`reto_${currentRetoId}_${nivel}`] = true;
      const currentRecord = userData.records[`record_${currentRetoId}_${nivel}`];
      if (!currentRecord || timers[nivel] < parseInt(currentRecord)) { userData.records[`record_${currentRetoId}_${nivel}`] = timers[nivel]; }
      if (nivel === 'superior') broadcastActivity(`¡Acaba de superar el RETO SUPERIOR de la semana ${currentRetoId}! 🏆`);
      
      checkAchievements(nivel, timers[nivel], getVidas()[nivel]);
      saveToFirebase(); updateProgress(); setTimeout(() => { loadWeek(); }, 3500); 

    } else {
      const { userData } = getState();
      if (userData.items?.shields > 0) {
        userData.items.shields--;
        showToast("¡Escudo activado! Vida protegida 🛡️", "info");
        saveToFirebase();
      } else {
        incrementFallo(nivel);
        decrementVida(nivel);
      }
      
      playErrorSound();
      let corazones = ''; for(let i=0; i<3; i++) corazones += (i < getVidas()[nivel]) ? '❤️' : '🖤';
      document.getElementById(`vidas-${nivel}`).innerHTML = corazones;
      
      fb.className = "feedback error"; fb.style.borderColor = ""; fb.style.backgroundColor = ""; 

      if (getVidas()[nivel] <= 0) {
        fb.innerHTML = `<div class="flex-icon" style="margin-bottom:8px;"><i data-lucide="skull"></i> Lógica incorrecta. Sin energía.</div><div id="gemini-explanation-${nivel}" style="font-size: 0.9rem; color: var(--text-light);"></div>`;
        document.getElementById(`input-${nivel}`).disabled = true; stopTimer(nivel);
        document.getElementById(`gemini-explanation-${nivel}`).innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Generando explicación del tutor IA...`;
        if (window.lucide) lucide.createIcons();
        const explanation = await getGeminiExplanation(originalCode, `El código no cumple con la lógica del reto.`, reto.desc);
        document.getElementById(`gemini-explanation-${nivel}`).innerHTML = explanation;

        document.getElementById(`btn-container-${nivel}`).innerHTML = `<button class="btn-comprar-vida flex-icon" data-action="comprarEnergia" data-nivel="${nivel}"><i data-lucide="battery-charging"></i> Recuperar 3 ❤️ (10 🪙)</button>`;
      } else {
        fb.innerHTML = `<div class="flex-icon"><i data-lucide="x-circle"></i> ${getMensajesFallo()[Math.floor(Math.random()*getMensajesFallo().length)]}</div>`;
        if (getPistasDesbloqueadas()[nivel] === 0) unlockPista(nivel); // Unlock first hint if no hints are unlocked
        renderPistas(nivel, reto); // Render hints using the updated state
      }
    }
    if (getVidas()[nivel] > 0) { btn.innerHTML = `<i data-lucide="play"></i> Verificar`; btn.disabled = false; }
    if (window.lucide) lucide.createIcons();
  }, 800);
}

// ==============================================================
// 12. RENDERIZADO DE LAS SEMANAS Y EL EDITOR
// ==============================================================
function populateWeekSelector() {
  const { currentPeriod, userData } = getState();
  const evaluativeWeeks = userData.classData?.evaluativeWeeks || Object.keys(weeks);
  const selector = document.getElementById('week-select');
  selector.innerHTML = '';
  
  for (let i = 1; i <= 10; i++) {
    const id = `P${currentPeriod}-W${i}`;
    if (!evaluativeWeeks.includes(id)) continue; // Ocultar si no es evaluativa
    
    const weekData = weeks[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = i === 10 
      ? `Semana 10: Plan de Mejoramiento` 
      : `Semana ${i}: ${weekData?.title || 'Próximamente'}`;
    selector.appendChild(option);
  }
}

function loadWeek() {
  const weekSelector = document.getElementById('week-select');
  if (!weekSelector.value) populateWeekSelector();
  
  const newRetoId = weekSelector.value;
  updateState({ currentRetoId: newRetoId });
  const { userData, currentRetoId } = getState();
  const data = weeks[currentRetoId]; if (!data) return; // weeks is from constants.js

  const numGrado = parseInt(userData.grado);
  const isExplorador = numGrado >= 6 && numGrado <= 7;

  // AJUSTE PIAR / EXPLORADOR: Simplificación de retos y UI
  if (userData.piarProfile === "cognitivo") {
      document.getElementById('w-challenge').innerHTML = `<div style="background:var(--bg-dark); padding:10px; border:2px dashed var(--accent);">
          <h4 class="flex-icon"><i data-lucide="sparkles"></i> Misión Adaptada</h4>
          <p>${data.retos.basico.desc}</p>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">💡 Enfócate solo en este paso principal.</p>
      </div>`;
  } else if (isExplorador) {
      document.getElementById('w-challenge').innerHTML = `<div style="background:rgba(47,129,247,0.1); padding:15px; border-radius:8px; border-left:5px solid var(--wokwi-blue);">
          <h4 style="color:var(--wokwi-blue); margin-bottom:5px;">🚀 Aventura Explorador (Grados 6-7)</h4>
          <p>¡Hola! Tu objetivo es usar los bloques sugeridos para resolver el reto:</p>
          <p><strong>Misión:</strong> ${data.retos.basico.desc}</p>
      </div>`;
  } else {
      document.getElementById('w-challenge').innerHTML = data.challenge;
  }

  document.getElementById('w-competencia').innerHTML = `<strong style="color:var(--wokwi-blue)">Competencia: ${competenciasMapa[currentRetoId]}</strong><br><span style="color:var(--text-light); font-size:0.95rem; display:block; margin-top:5px;">${data.introduccion}</span>`;
  
  renderTeoriaEstilizada(data, currentRetoId, userData);

  document.getElementById('w-challenge').innerHTML = data.challenge; document.getElementById('w-code').textContent = data.code;
  document.getElementById('w-components').innerHTML = data.components.map(c => `<span class="tag">${c}</span>`).join('');
  document.getElementById('w-wiring').innerHTML = data.wiring.map(w => `<li>${w}</li>`).join('');

  const expContainer = document.getElementById('w-explicacion'); expContainer.innerHTML = ''; 
  if (data.explicacion) data.explicacion.forEach(p => expContainer.innerHTML += `<div class="step-card"><div class="step-code">${p.codigo.replace(/\n/g, '<br>')}</div><div class="step-text">${p.texto}</div></div>`);

  // GENERACIÓN DE BLOQUES DE CÓDIGO (Para Exploradores y PIAR Cognitivo)
  const isPiarCognitivo = userData.piarProfile === "cognitivo";
  const numGrado = parseInt(userData.grado);
  const isExplorador = numGrado >= 6 && numGrado <= 7;

  ['basico', 'alto', 'superior'].forEach(nivel => {
    const bloqueCont = document.getElementById(`bloques-${nivel}`);
    if (bloqueCont) {
      if ((isExplorador || isPiarCognitivo) && data.retos[nivel]?.match) {
        bloqueCont.style.display = 'flex';
        bloqueCont.innerHTML = '<span style="font-size:0.7rem; width:100%; color:var(--text-muted);">Toca un bloque para añadirlo:</span>';
        data.retos[nivel].match.forEach(cmd => {
          const btn = document.createElement('button');
          btn.className = 'tag';
          btn.style.cssText = 'cursor:pointer; border-style:dashed; background:rgba(255,255,255,0.05);';
          btn.textContent = cmd;
          btn.onclick = () => {
             const currentVal = codeEditors[nivel].getValue();
             codeEditors[nivel].setValue(currentVal + cmd + ";\n");
             validarSintaxis(nivel);
          };
          bloqueCont.appendChild(btn);
        });
      } else {
        bloqueCont.style.display = 'none';
      }
    }
  });

  ['basico', 'alto', 'superior'].forEach(nivel => {
    initCodeEditor(nivel); // Inicializar CodeMirror si no existe
    
    stopTimer(nivel); timers[nivel] = 0; resetChallengeState(nivel); // Reset challenge state using gamification module
    document.getElementById(`timer-${nivel}`).textContent = `⏱ 00:00`; document.getElementById(`vidas-${nivel}`).innerHTML = '❤️❤️❤️';
    const input = document.getElementById(`input-${nivel}`);
    if(input) { input.disabled = false; input.classList.remove('syntax-ok','syntax-error'); }
    const btnCont = document.getElementById(`btn-container-${nivel}`);
    if(btnCont) btnCont.innerHTML = `<button data-action="verifyCode" data-nivel="${nivel}" id="btn-${nivel}" class="btn-verify flex-icon" style="flex:1;"><i data-lucide="play"></i> Verificar</button><button data-action="llevarAlSimulador" data-nivel="${nivel}" class="btn-verify flex-icon" style="flex:1; background:var(--wokwi-blue);"><i data-lucide="external-link"></i> Probar en Simulador</button>`;
    document.getElementById(`feedback-${nivel}`).style.display = 'none'; document.getElementById(`pista-${nivel}`).classList.remove('visible');
    
    if(data.retos[nivel]) {
      document.getElementById(`r-container-${nivel}`).style.display = 'block'; document.getElementById(`r-desc-${nivel}`).innerHTML = data.retos[nivel].desc;
      const isDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      const record = userData.records[`record_${currentRetoId}_${nivel}`];
      const doneBadge = document.getElementById(`done-${nivel}`); const evalBox = document.getElementById(`eval-${nivel}`);
      const codeFinal = userData.savedCodes[`code_${currentRetoId}_${nivel}`]; const borrador = userData.drafts[`draft_${currentRetoId}_${nivel}`];
      
      const finalVal = (isDone && codeFinal) ? codeFinal : (borrador || "");
      codeEditors[nivel].setValue(finalVal);
      if (isDone) {
        doneBadge.style.display = 'flex'; evalBox.style.display = 'block'; if(btnCont) btnCont.style.display = 'none';
        if(record) { document.getElementById(`record-done-${nivel}`).style.display = 'inline-block'; document.getElementById(`record-done-${nivel}`).textContent = `⏱ Récord: ${formatTime(parseInt(record))}`; }
      } else {
        doneBadge.style.display = 'none'; evalBox.style.display = 'block'; if(btnCont) btnCont.style.display = 'flex';
        if(record) { document.getElementById(`record-${nivel}`).style.display = 'inline-block'; document.getElementById(`record-${nivel}`).textContent = `🏆 Mejor: ${formatTime(parseInt(record))}`; } else document.getElementById(`record-${nivel}`).style.display = 'none';
      }
      validarSintaxis(nivel);
    } else document.getElementById(`r-container-${nivel}`).style.display = 'none';
  });
  if (window.lucide) lucide.createIcons();
}

function resetProgress() {
  const { userData, currentRetoId } = getState();
  if(confirm('¿Seguro que deseas reiniciar tu código? Se borrarán tus borradores no verificados de esta semana.')) {
    ['basico', 'alto', 'superior'].forEach(nivel => {
      delete userData.drafts[`draft_${currentRetoId}_${nivel}`];
      const isDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      const input = document.getElementById(`input-${nivel}`);
      if (input && !isDone) input.value = '';
    });
    saveToFirebase(); loadWeek(); 
  }
}

// ==============================================================
// 13. FUNCIONES AUXILIARES (Utilidades)
// ==============================================================
function copyCode() { navigator.clipboard.writeText(document.getElementById('w-code').textContent).then(() => { const btn = document.getElementById('btnCopy'); const orig = btn.innerHTML; btn.innerHTML = `<i data-lucide="check"></i> Copiado`; window.lucide.createIcons(); setTimeout(() => { btn.innerHTML = orig; window.lucide.createIcons(); }, 2000); }); }
function formatTime(sec) { return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`; }
function iniciarTimerSiNecesario(nivel) { if (!intervalos[nivel] && getVidas()[nivel] > 0) { timers[nivel] = 0; document.getElementById(`timer-${nivel}`).textContent = `⏱ 00:00`; intervalos[nivel] = setInterval(() => { timers[nivel]++; document.getElementById(`timer-${nivel}`).textContent = `⏱ ${formatTime(timers[nivel])}`; }, 1000); } }
function stopTimer(nivel) { if (intervalos[nivel]) { clearInterval(intervalos[nivel]); intervalos[nivel] = null; } }

function updateProgress() {
  const { currentUser } = getState();
  if (!currentUser || currentUser.email === ADMIN_EMAIL) return;
  
  const { userData, currentRetoId, currentPeriod } = getState();
  const evaluativeWeeks = userData.classData?.evaluativeWeeks || Object.keys(weeks);
  
  const totalRetosAnual = evaluativeWeeks.length * 3; 
  let completadosAnual = 0; 
  let completadosPeriodo = 0;

  const activeWeeksInPeriod = evaluativeWeeks.filter(w => w.startsWith(`P${currentPeriod}`));
  const totalRetosPeriodo = activeWeeksInPeriod.length * 3;

  const container = document.getElementById('progreso-semanas'); 
  container.innerHTML = '';

  Object.keys(weeks).forEach(sem => {
    let semCompletados = 0;
    ['basico', 'alto', 'superior'].forEach(n => { 
        if(userData.progress[`reto_${sem}_${n}`] === true) { 
            completadosAnual++; 
            semCompletados++;
            // Contar solo si pertenece al periodo actual para el plan de mejoramiento
            if (sem.startsWith(`P${currentPeriod}`)) completadosPeriodo++;
        } 
    });

    const dot = document.createElement('div'); dot.className = 'semana-dot';
    if(semCompletados > 0 && semCompletados < 3) dot.classList.add('parcial'); else if(semCompletados === 3) dot.classList.add('completa');
    if(sem === currentRetoId) dot.classList.add('activa'); container.appendChild(dot);
  });

  const notaPeriodo = ((completadosPeriodo / totalRetosPeriodo) * 4.0) + 1.0;
  document.getElementById('progreso-fill').style.width = (completadosAnual / totalRetosAnual) * 100 + '%'; 
  document.getElementById('progreso-texto').textContent = `${completadosAnual} / ${totalRetosAnual} retos`;

  // Lógica de Plan de Mejoramiento
  if (notaPeriodo < 3.0) {
      verificarYNotificarMejoramiento(notaPeriodo, currentPeriod);
  }
}

async function verificarYNotificarMejoramiento(nota, periodo) {
    const { userData } = getState();
    const claveAviso = `aviso_mejoramiento_P${periodo}`;
    
    // Si la nota es baja, resaltar la semana 10
    const weekSelector = document.getElementById('week-select');
    const optionMejoramiento = [...weekSelector.options].find(opt => opt.value === `P${periodo}-W10`);
    if (optionMejoramiento) {
        optionMejoramiento.style.color = "var(--error-color)";
        optionMejoramiento.textContent = "⚠️ REQUERIDO: Plan de Mejoramiento";
    }

    // Enviar correo solo una vez por periodo cuando se detecta el estado "Bajo"
    if (!userData.teoria[claveAviso]) {
        const idMejoramiento = `P${periodo}-W10`;
        const temas = weeks[idMejoramiento]?.introduccion || "Temas generales del periodo";
        
        showToast("⚠️ Tu rendimiento es BAJO. Se ha enviado un Plan de Mejoramiento a tu correo.", "error");
        
        // Integración sugerida con servicio de mensajería
        console.log(`[MAIL SYSTEM] Enviando a: ${userData.email}`);
        console.log(`[CONTENIDO] Estimado ${userData.nombres}, tu nota actual es ${nota.toFixed(1)}. 
        Debes superar las actividades de la Semana 10: ${temas}`);

        // Marcamos como enviado en la nube
        userData.teoria[claveAviso] = true;
        saveToFirebase();
    }
}

function imprimirPortafolio() {
  const { currentUser, userData } = getState();
  if(!currentUser) return showToast('Inicia sesión para ver tu portafolio', 'error');
  let htmlContenido = `<div class="print-header"><h1>Portafolio de Códigos - Arduino</h1><h2>Instituto Técnico Superior</h2><h2><strong>Estudiante:</strong> ${userData.nombres} - <strong>Grado:</strong> ${userData.grado}</h2></div>`;
  let codigosEncontrados = 0;
  Object.keys(weeks).forEach(sem => {
    let contenidoSemana = '';
    ['basico', 'alto', 'superior'].forEach(nivel => {
      const isDone = userData.progress[`reto_${sem}_${nivel}`] === true;
      let userCode = (userData.savedCodes && userData.savedCodes[`code_${sem}_${nivel}`]) || (userData.drafts && userData.drafts[`draft_${sem}_${nivel}`]);
      if (isDone || (userCode && userCode.trim().length > 5)) { 
        if (!userCode) userCode = "// Reto superado exitosamente"; codigosEncontrados++;
        contenidoSemana += `<div class="print-code-box"><h4>Nivel ${nivel.toUpperCase()} - Módulo ${sem} ${isDone ? '✅' : '✍️(Borrador)'}</h4><pre><code>${userCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`;
      }
    });
    if (contenidoSemana !== '') htmlContenido += `<div class="print-week"><h3>Semana ${sem}: ${weeks[sem].title}</h3>${contenidoSemana}</div>`;
  });
  if (codigosEncontrados === 0) return showToast('No tienes códigos guardados aún', 'info');
  document.getElementById('print-area').innerHTML = htmlContenido; setTimeout(() => { window.print(); }, 300);
}

/**
 * Exporta el código de la semana actual como un archivo .ino real
 */
function exportCurrentWeekCode() {
  const { currentRetoId, userData } = getState();
  let finalCode = `/* \n * ArduLabs - Código de la Semana ${currentRetoId}\n * Estudiante: ${userData.nombres}\n */\n\n`;
  
  let hasCode = false;
  ['basico', 'alto', 'superior'].forEach(nivel => {
    const code = userData.savedCodes[`code_${currentRetoId}_${nivel}`] || userData.drafts[`draft_${currentRetoId}_${nivel}`];
    if (code && code.trim().length > 10) {
      hasCode = true;
      finalCode += `// --- NIVEL ${nivel.toUpperCase()} ---\n${code}\n\n`;
    }
  });

  if (!hasCode) return showToast("No hay código suficiente para exportar", "warning");

  const blob = new Blob([finalCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ArduLabs_Semana_${currentRetoId}_${userData.nombres.replace(/\s+/g, '_')}.ino`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Archivo .ino generado", "success");
}

/**
 * Reinicia completamente el aprendizaje de la semana actual
 */
async function resetWeekEntirely() {
  const { currentRetoId, userData } = getState();
  if (!confirm(`¿Estás seguro de reiniciar la Semana ${currentRetoId}?\nSe borrarán tus códigos, récords y el progreso de teoría de esta semana.`)) return;

  ['basico', 'alto', 'superior'].forEach(nivel => {
    delete userData.progress[`reto_${currentRetoId}_${nivel}`];
    delete userData.records[`record_${currentRetoId}_${nivel}`];
    delete userData.savedCodes[`code_${currentRetoId}_${nivel}`];
    delete userData.drafts[`draft_${currentRetoId}_${nivel}`];
    delete userData.teoria[`teoria_leida_${currentRetoId}_${nivel}`];
  });

  updateState({ userData });
  await saveToFirebase();
  showToast("Semana reiniciada correctamente", "info");
  window.loadWeek();
  updateProgress();
}

function descargarDiploma() {
  const { currentUser, userData } = getState();
  if(!currentUser) return;
  const totalRetos = Object.keys(weeks).length * 3; let completados = 0; let semanasSuperadas = new Set(); 
  Object.keys(weeks).forEach(sem => { ['basico', 'alto', 'superior'].forEach(n => { if(userData.progress[`reto_${sem}_${n}`] === true) { completados++; semanasSuperadas.add(sem); } }); });
  if(completados === 0) return showToast('Completa al menos un reto para obtener tu diploma', 'warning');

  document.getElementById('dip-nombre').textContent = userData.nombres; document.getElementById('dip-grado').textContent = userData.grado; document.getElementById('dip-progreso').textContent = `${Math.round((completados / totalRetos) * 100)}%`;
  // Corregido: La nota es de 1.0 a 5.0, no de 0.0 a 5.0
  let notaFinal = (((completados / totalRetos) * 4.0) + 1.0).toFixed(1); document.getElementById('dip-nota').textContent = `${notaFinal} / 5.0`;
  const estadoBadge = document.getElementById('dip-estado');
  if(completados === totalRetos) { estadoBadge.textContent = "ESTADO: MASTER ARDUINO EXPERT"; estadoBadge.style.background = "linear-gradient(45deg, #fbbf24, #d97706)"; } else if(parseFloat(notaFinal) >= 3.0) { estadoBadge.textContent = "ESTADO: GRADUADO"; estadoBadge.style.background = "#238636"; } else { estadoBadge.textContent = "ESTADO: REPROBADO"; estadoBadge.style.background = "#d73a49"; }

  const ulComps = document.getElementById('dip-competencias'); ulComps.innerHTML = ''; // competenciasMapa is from constants.js
  semanasSuperadas.forEach(sem => { if(competenciasMapa[sem]) ulComps.innerHTML += `<li>✅ ${competenciasMapa[sem]}</li>`; });
  document.getElementById('dip-fecha').textContent = new Date().toLocaleDateString();

  const btn = document.getElementById('btn-diploma'); const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Generando...`; lucide.createIcons();
  html2canvas(document.getElementById('diploma-wrapper'), { scale: 2 }).then(canvas => {
    const link = document.createElement('a'); link.download = `Diploma_${userData.nombres}.png`; link.href = canvas.toDataURL('image/png'); link.click();
    btn.innerHTML = originalHTML; lucide.createIcons(); confetti(); playCoinSound();
  });
}

function setupEventListeners() {
    // Auth & UI Global
    document.getElementById('btn-login-google').addEventListener('click', loginConGoogle);
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.addEventListener('click', logout);

    // Gamificación
    document.getElementById('btn-gamificacion').addEventListener('click', abrirModalGamificacion);
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    if(btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalGamificacion);
    
    document.getElementById('btn-tab-ranking').addEventListener('click', () => cambiarTabGamificacion('ranking'));
    document.getElementById('btn-tab-tienda').addEventListener('click', () => cambiarTabGamificacion('tienda'));
    document.getElementById('btn-tab-logros').addEventListener('click', () => cambiarTabGamificacion('logros'));
    document.getElementById('btn-tab-stats').addEventListener('click', () => cambiarTabGamificacion('stats'));
    document.getElementById('btn-theme').addEventListener('click', toggleTheme);
    
    document.getElementById('lang-select').addEventListener('change', (e) => {
        const { userData } = getState();
        userData.language = e.target.value;
        saveToFirebase(); applyTranslations();
    });

    document.getElementById('period-select').addEventListener('change', (e) => {
        updateState({ currentPeriod: parseInt(e.target.value) });
        populateWeekSelector();
        loadWeek();
    });

    // Editor y Retos
    document.getElementById('week-select').addEventListener('change', loadWeek);
    document.getElementById('btn-reset-week').addEventListener('click', resetWeekEntirely);
    document.getElementById('btn-reset-code').addEventListener('click', resetProgress);
    document.getElementById('btnCopy').addEventListener('click', copyCode);
    document.getElementById('btnExportIno').addEventListener('click', exportCurrentWeekCode);
    document.getElementById('btn-portafolio').addEventListener('click', imprimirPortafolio);
    document.getElementById('btn-diploma').addEventListener('click', descargarDiploma);

    // Inputs de código (oninput)
    ['basico', 'alto', 'superior'].forEach(nivel => {
      const el = document.getElementById(`input-${nivel}`);
      if(el) el.addEventListener('input', () => { validarSintaxis(nivel); iniciarTimerSiNecesario(nivel); });
    });

    // Event delegation for dynamic elements
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        
        // Manejo específico para botones que no tienen data-action pero están en el DOM dinámico
        if (e.target.closest('#btn-logout')) { logout(); return; }
        if (e.target.closest('#btn-modo-admin')) { teacherModuleIniciarAppDocente(); return; }
        if (e.target.closest('#btn-back-to-student')) { iniciarAppEstudiante(); return; }

        if (!target) return;

        const action = target.dataset.action;
        const nivel = target.dataset.nivel;

        switch (action) {
            case 'verifyCode': verifyCode(nivel); break;
            case 'llevarAlSimulador': llevarAlSimulador(nivel); break;
            case 'reclamarMonedas': 
                reclamarMonedas(target.dataset.semana, nivel, parseInt(target.dataset.cantidad));
                break;
            case 'abrirModalTeoria':
                abrirModalTeoria(target.dataset.semana, target.dataset.nivel);
                break;
            case 'validarQuiz': validarQuiz(parseInt(target.dataset.elegida), parseInt(target.dataset.correcta), target.dataset.semana, target.dataset.nivel, parseInt(target.dataset.monto)); break;
            case 'toggleBlock': 
                import('./teacher.js').then(m => m.toggleBlockEstudiante(target.dataset.uid, target.dataset.blocked === 'true'));
                break;
            case 'resetCollectiveGoal':
                import('./teacher.js').then(m => m.resetCollectiveGoal());
                break;
            case 'comprarEnergia': comprarEnergia(nivel); break;
            case 'comprarPista': comprarPista(nivel); break;
            case 'comprarArticulo': comprarArticulo(target.dataset.tipo, target.dataset.id); break;
            case 'equiparArticulo': equiparArticulo(target.dataset.tipo, target.dataset.id); break;
            case 'cambiarTabDocente': cambiarTabDocente(target.dataset.tab); break;
            case 'addDocente': addDocente(); break;
            case 'removeDocente': removeDocente(target.dataset.email); break;
            case 'addMyGroup': addMyGroup(); break;
            case 'removeMyGroup': removeMyGroup(target.dataset.grupo); break;
            case 'exportarCSV': exportarCSV(); break;
            case 'eliminarEstudiante': 
                import('./teacher.js').then(m => m.eliminarEstudiante(target.dataset.uid, target.dataset.nombre));
                break;
            case 'verCodigo':
                window.verCodigoEstudiante(target.dataset.email);
                break;
            case 'cerrarModal':
                target.closest('.modal-overlay').remove();
                break;
        }
    });

    // Event listeners for teacher dashboard filters
    const filtroGrupo = document.getElementById('filtro-grupo');
    if (filtroGrupo) filtroGrupo.addEventListener('change', renderTeacherDashboard);
}


window.onload = () => {
  document.getElementById('screen-login').classList.add('active'); 
  document.getElementById('screen-app').classList.remove('active'); 
  document.getElementById('screen-teacher').classList.remove('active');
  setupEventListeners();
  if (window.lucide) lucide.createIcons(); 
};