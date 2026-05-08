import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from '../modules/firestore.js';
import { ADMIN_EMAIL, weeks, tiendaItems, mensajesExito, mensajesFallo, logrosDefiniciones } from '../modules/constants.js';
import { getState, updateState } from './state.js';

let _db;
let _saveToFirebaseCallback;
let _lucideCreateIcons;

let _fallos = { basico: 0, alto: 0, superior: 0 };
let _pistasDesbloqueadas = { basico: 0, alto: 0, superior: 0 };
let _vidas = { basico: 3, alto: 3, superior: 3 };

let audioCtx; // Audio context for sounds

/**
 * Inicializa el módulo de gamificación con las dependencias necesarias.
 * @param {object} db - Instancia de Firestore.
 * @param {function} saveToFirebaseCallback - Callback para guardar datos en Firebase.
 * @param {function} lucideCreateIcons - Función para renderizar iconos de Lucide.
 */
export const initializeGamificationModule = (db, saveToFirebaseCallback, lucideCreateIcons) => {
    _db = db;
    _saveToFirebaseCallback = saveToFirebaseCallback;
    _lucideCreateIcons = lucideCreateIcons;
};

// --- Getters for internal state ---
export const getFallos = () => _fallos;
export const getPistasDesbloqueadas = () => _pistasDesbloqueadas;
export const getVidas = () => _vidas;

// --- Setters/Modifiers for internal state ---
export const resetChallengeState = (nivel) => {
    _fallos[nivel] = 0;
    _pistasDesbloqueadas[nivel] = 0;
    _vidas[nivel] = 3;
};

export const decrementVida = (nivel) => {
    _vidas[nivel]--;
};

export const incrementFallo = (nivel) => {
    _fallos[nivel]++;
};

export const unlockPista = (nivel) => {
    _pistasDesbloqueadas[nivel]++;
};

// ==============================================================
// Funciones de Audio
// ==============================================================
const initAudio = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
};

export const playCoinSound = () => {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
};

export const playErrorSound = () => {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
};

export const playLifeSound = () => {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
};

// ==============================================================
// Funciones de Gamificación
// ==============================================================
export const cargarDatosGamificacion = () => {
    const { userData } = getState();

    document.getElementById('stats-panel').style.display = 'flex';
    document.getElementById('volts-count').innerText = userData.volts || 0;
    document.getElementById('user-monedas').innerText = userData.monedas || 0;

    const hoy = new Date().toDateString();
    if (userData.lastLogin !== hoy) {
        let newStreak = 1;
        if (userData.lastLogin) {
            const diffDias = Math.ceil(Math.abs(new Date(hoy) - new Date(userData.lastLogin)) / (1000 * 60 * 60 * 24));
            if (diffDias === 1) newStreak = (userData.streak || 0) + 1;
        }
        updateState({ userData: { ...userData, lastLogin: hoy, streak: newStreak } });
        _saveToFirebaseCallback();
    }
    document.getElementById('streak-count').innerText = userData.streak || 0;
};

export const abrirModalGamificacion = () => {
    document.getElementById('modal-gamificacion').style.display = 'flex';
    cambiarTabGamificacion('ranking');
};

export const cerrarModalGamificacion = () => {
    document.getElementById('modal-gamificacion').style.display = 'none';
};

export const cambiarTabGamificacion = (tab) => {
    document.getElementById('btn-tab-ranking').classList.remove('active');
    document.getElementById('btn-tab-tienda').classList.remove('active');
    document.getElementById('btn-tab-logros').classList.remove('active');
    document.getElementById('btn-tab-stats').classList.remove('active');
    document.getElementById('tab-ranking').style.display = 'none';
    document.getElementById('tab-tienda').style.display = 'none';
    document.getElementById('tab-logros').style.display = 'none';
    document.getElementById('tab-stats').style.display = 'none';
    document.getElementById(`btn-tab-${tab}`).classList.add('active');
    document.getElementById(`tab-${tab}`).style.display = 'block';

    if (tab === 'ranking') cargarRankingNube();
    if (tab === 'tienda') renderTiendaUI();
    if (tab === 'logros') renderLogrosUI();
};

export const cargarRankingNube = async () => {
    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;"><i data-lucide="loader-2" class="lucide-spin"></i> Conectando a la Nube...</td></tr>`;
    if (_lucideCreateIcons) _lucideCreateIcons();

    try {
        const q = query(collection(_db, "users"), orderBy("monedas", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        let html = '';
        let rank = 1;
        querySnapshot.forEach((docSnap) => {
            let d = docSnap.data();
            if (d.email === ADMIN_EMAIL) return; // Omitir al profesor del ranking

            let iconColor = rank === 1 ? '#fbbf24' : (rank === 2 ? '#94a3b8' : (rank === 3 ? '#b45309' : 'var(--text-light)'));
            let badge = rank === 1 ? '👑' : `#${rank}`;

            html += `<tr>
                <td style="color:${iconColor}; font-size:1.1rem;">${badge}</td>
                <td><div class="flex-icon" style="justify-content:flex-start;"><i data-lucide="${d.avatar || 'user'}"></i> ${d.nombres}</div></td>
                <td>${d.grado || 'N/A'}</td>
                <td style="color:#e3b341; font-weight:bold;">🪙 ${d.monedas || 0}</td>
                <td style="color:#ff5722;">🔥 ${d.streak || 0}</td>
            </tr>`;
            rank++;
        });

        if (html === '') html = `<tr><td colspan="5" style="text-align:center;">No hay datos suficientes aún.</td></tr>`;
        tbody.innerHTML = html;
        if (_lucideCreateIcons) _lucideCreateIcons();
    } catch (error) {
        console.error("Error cargando ranking", error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error-color);">Error de conexión al cargar Ranking.</td></tr>`;
    }
};

export const renderTiendaUI = () => {
    const { userData } = getState();
    document.getElementById('tienda-user-monedas').innerText = userData.monedas;

    const avContainer = document.getElementById('store-avatars');
    avContainer.innerHTML = tiendaItems.avatars.map(item => {
        let isOwned = userData.inventory.avatars.includes(item.id);
        let isActive = userData.avatar === item.id;
        let btnHtml = isActive ? `<button class="btn-equipped">Equipado</button>` :
            (isOwned ? `<button class="btn-equip" onclick="window.equiparArticulo('avatar', '${item.id}')">Equipar</button>` :
                `<button class="btn-buy" onclick="window.comprarArticulo('avatar', '${item.id}')">Comprar 🪙 ${item.price}</button>`);

        return `<div class="store-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}">
            <i data-lucide="${item.icon}" style="width:40px; height:40px; color:${isActive ? 'var(--wokwi-blue)' : 'var(--text-light)'};"></i>
            <div style="font-weight:bold;">${item.name}</div>
            ${btnHtml}
        </div>`;
    }).join('');

    const thContainer = document.getElementById('store-themes');
    thContainer.innerHTML = tiendaItems.themes.map(item => {
        let isOwned = userData.inventory.themes.includes(item.id);
        let isActive = userData.theme === item.id;
        let btnHtml = isActive ? `<button class="btn-equipped" style="background:${item.color};">Equipado</button>` :
            (isOwned ? `<button class="btn-equip" onclick="window.equiparArticulo('theme', '${item.id}')">Equipar</button>` :
                `<button class="btn-buy" onclick="window.comprarArticulo('theme', '${item.id}')">Comprar 🪙 ${item.price}</button>`);

        return `<div class="store-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}">
            <div style="width:40px; height:40px; border-radius:50%; background:${item.color}; border: 2px solid var(--border-color);"></div>
            <div style="font-weight:bold;">${item.name}</div>
            ${btnHtml}
        </div>`;
    }).join('');

    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const renderLogrosUI = () => {
    const { userData } = getState();
    const container = document.getElementById('logros-container');
    
    container.innerHTML = logrosDefiniciones.map(logro => {
        const isUnlocked = userData.achievements && userData.achievements.includes(logro.id);
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" style="--logro-color: ${logro.color}">
                <div class="achievement-icon">
                    <i data-lucide="${logro.icon}"></i>
                </div>
                <div class="achievement-info">
                    <div class="achievement-name">${logro.name}</div>
                    <div class="achievement-desc">${logro.desc}</div>
                </div>
                <div class="achievement-status">
                    ${isUnlocked ? '<span>✨ Obtenido</span>' : '<span>🔒 Bloqueado</span>'}
                </div>
            </div>
        `;
    }).join('');
    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const comprarArticulo = (tipo, id) => {
    const { userData } = getState();
    let list = tipo === 'avatar' ? tiendaItems.avatars : tiendaItems.themes;
    let invList = tipo === 'avatar' ? userData.inventory.avatars : userData.inventory.themes;
    let item = list.find(i => i.id === id);
    if (!item) return;

    if (userData.monedas >= item.price) {
        const newUserData = { ...userData };
        newUserData.monedas -= item.price;
        invList.push(item.id);
        if (tipo === 'avatar') newUserData.avatar = item.id;
        if (tipo === 'theme') newUserData.theme = item.id;

        _saveToFirebaseCallback(null, newUserData);
        updateState({ userData: newUserData });
        playCoinSound();
        renderTiendaUI();
    } else {
        playErrorSound();
        alert(`🪙 Monedas insuficientes (Cuesta ${item.price}).`);
    }
};

export const equiparArticulo = (tipo, id) => {
    const { userData } = getState();
    const newUserData = { ...userData };
    if (tipo === 'avatar') newUserData.avatar = id;
    if (tipo === 'theme') newUserData.theme = id;
    _saveToFirebaseCallback(null, newUserData);
    updateState({ userData: newUserData });
    playLifeSound();
    renderTiendaUI();
};

export const reclamarMonedas = (semanaId, nivel, cantidad) => {
    const { userData } = getState();
    const newUserData = { ...userData };
    const claveReclamada = `teoria_leida_${semanaId}_${nivel}`;
    if (newUserData.teoria[claveReclamada] === true) return;
    newUserData.monedas += cantidad;
    newUserData.teoria[claveReclamada] = true;

    _saveToFirebaseCallback(null, newUserData);
    updateState({ userData: newUserData });
    const btn = document.getElementById(`btn-teoria-${nivel}`);
    btn.classList.add('reclamado');
    btn.innerText = '✔️ Recompensa Reclamada';
    btn.onclick = null;
    playCoinSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
};

export const ganarVolts = (cantidad) => {
    const { userData } = getState();
    const newUserData = { ...userData };
    newUserData.volts += cantidad;
    _saveToFirebaseCallback(null, newUserData);
    updateState({ userData: newUserData });
    playCoinSound();
};

export const comprarEnergia = (nivel) => {
    const { userData } = getState();
    const newUserData = { ...userData };

    if (newUserData.monedas >= 10) {
        newUserData.monedas -= 10;
        
        _saveToFirebaseCallback(null, newUserData);
        updateState({ userData: newUserData });

        _vidas[nivel] = 3;
        document.getElementById(`vidas-${nivel}`).innerHTML = '❤️❤️❤️';
        document.getElementById(`input-${nivel}`).disabled = false;
        document.getElementById(`feedback-${nivel}`).style.display = 'none';
        document.getElementById(`btn-container-${nivel}`).innerHTML = `<button id="btn-${nivel}" class="btn-verify flex-icon" onclick="window.verifyCode('${nivel}')" style="flex:1;"><i data-lucide="play"></i> Verificar</button><button class="btn-verify flex-icon" onclick="window.llevarAlSimulador('${nivel}')" style="flex:1; background:var(--wokwi-blue);"><i data-lucide="external-link"></i> Probar en Simulador</button>`;
        playLifeSound();
        if (_lucideCreateIcons) _lucideCreateIcons();
    } else {
        playErrorSound();
        alert("🪙 Monedas insuficientes (Necesitas 10).");
    }
};

export const comprarPista = (nivel) => {
    const { userData, currentRetoId } = getState();
    const newUserData = { ...userData };
    const reto = weeks[_currentRetoId].retos[nivel];
    if (_pistasDesbloqueadas[nivel] >= reto.pistas.length) return;
    if (newUserData.volts >= 5) {
        newUserData.volts -= 5;
        
        _saveToFirebaseCallback(null, newUserData);
        updateState({ userData: newUserData });
        playCoinSound();

        _pistasDesbloqueadas[nivel]++;
        renderPistas(nivel, reto);
    } else {
        playErrorSound();
        alert("⚡ Volts insuficientes (Necesitas 5).");
    }
};

export const renderPistas = (nivel, reto) => {
    const pistaBox = document.getElementById(`pista-${nivel}`);
    pistaBox.classList.add('visible');
    pistaBox.innerHTML = '';
    for (let i = 0; i < _pistasDesbloqueadas[nivel]; i++) {
        pistaBox.innerHTML += `<div class="pista-item"><strong>Pista ${i + 1}:</strong> ${reto.pistas[i]}</div>`;
    }
    if (_pistasDesbloqueadas[nivel] < reto.pistas.length) {
        pistaBox.innerHTML += `<button class="btn-comprar-pista flex-icon" onclick="window.comprarPista('${nivel}')"><i data-lucide="unlock"></i> Comprar Pista (5 ⚡)</button>`;
    }
    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const getMensajesExito = () => mensajesExito;
export const getMensajesFallo = () => mensajesFallo;