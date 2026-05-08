import { doc, setDoc, getDoc, deleteDoc, updateDoc, collection, getDocs, query, orderBy, limit, where, arrayUnion, arrayRemove } from '../modules/firestore.js';
import { ADMIN_EMAIL, weeks, PERFILES_PIAR } from '../modules/constants.js';
import { getState } from './state.js';
import { showToast } from './app.js';

let _db;
let _allStudentsData = [];
let _lucideCreateIcons;

/**
 * Inicializa el módulo del docente con las dependencias necesarias.
 * @param {object} db - Instancia de Firestore.
 * @param {function} lucideCreateIcons - Función para renderizar iconos de Lucide.
 */
export const initializeTeacherModule = (db, lucideCreateIcons) => {
    _db = db;
    _lucideCreateIcons = lucideCreateIcons;
};

export const iniciarAppDocente = async () => {
    const { esAdmin, esDocenteSecundario } = getState();

    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-app').classList.remove('active');
    document.getElementById('screen-teacher').classList.add('active');

    if (esAdmin) {
        document.getElementById('teacher-tabs').style.display = 'flex';
        await renderTeacherManagementUI();
    } else if (esDocenteSecundario) {
        document.getElementById('teacher-tabs').style.display = 'none';
        document.getElementById('filtro-grupo').style.display = 'none';
        document.getElementById('teacher-secondary-controls').style.display = 'block';
        await renderSecondaryTeacherUI();
    }
    await renderTeacherDashboard();
};

export const renderTeacherDashboard = async () => {
    const { esAdmin, esDocenteSecundario, currentUser } = getState();
    if (!_db) return; // Evita ejecución si no está inicializado

    const tbody = document.getElementById('teacher-tbody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;"><i data-lucide="loader-2" class="lucide-spin"></i> Cargando estudiantes desde Firebase...</td></tr>`;
    if (_lucideCreateIcons) _lucideCreateIcons();

    let filtroGrupos = [];
    if (esAdmin) {
        const filtroSeleccionado = document.getElementById('filtro-grupo').value;
        if (filtroSeleccionado !== "TODOS") {
            filtroGrupos.push(filtroSeleccionado);
        }
    } else if (esDocenteSecundario && currentUser) {
        const rolesDoc = await getDoc(doc(_db, "config", "roles"));
        if (rolesDoc.exists()) {
            const docenteData = rolesDoc.data().gruposPorDocente?.[currentUser.email];
            // Si el docente tiene grupos, usamos esos como filtro. Si no, no mostrará nada.
            if (docenteData && docenteData.length > 0) filtroGrupos = docenteData;
        }
    }

    try {
        const q = filtroGrupos.length > 0
            ? query(collection(_db, "users"), where("grado", "in", filtroGrupos))
            : query(collection(_db, "users"));

        const querySnapshot = await getDocs(q);
        _allStudentsData = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.email !== ADMIN_EMAIL) _allStudentsData.push(data);
        });

        tbody.innerHTML = '';
        const totalRetos = Object.keys(weeks).length * 3;

        _allStudentsData.forEach(est => {
            let completados = 0;
            if (est.progress) { Object.values(est.progress).forEach(val => { if (val === true) completados++; }); }

            const porcentaje = (completados / totalRetos) * 100;
            const notaFinal = ((porcentaje / 100) * 4.0) + 1.0;

            tbody.innerHTML += `
                <tr id="row-${est.email.replace(/[@.]/g, '-')}">
                <td><strong>${est.nombres || 'Sin nombre'}</strong><br><small style="color:var(--text-muted)">${est.email}</small></td>
                <td>${est.grado || 'N/A'}</td>
                <td>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>${Math.round(porcentaje)}%</span> 
                        <div style="display:flex; gap:4px;">
                          <button class="btn-view-code" data-action="enviarFeedback" data-uid="${est.uid}" data-nombre="${est.nombres}" title="Enviar Feedback"><i data-lucide="message-square"></i></button>
                          <button class="btn-view-code" data-action="verCodigo" data-email="${est.email}" title="Ver Códigos"><i data-lucide="code"></i></button>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${porcentaje}%"></div>
                    </div>
                </td>
                <td>
                    <select class="select-piar" data-action="setPerfilPiar" data-uid="${est.uid}">
                        ${Object.entries(PERFILES_PIAR).map(([key, val]) => `
                            <option value="${key}" ${est.piarProfile === key ? 'selected' : ''}>${val.nombre}</option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color: ${notaFinal >= 3.0 ? 'var(--accent)' : 'var(--error-color)'}; font-size: 1.1em;">${notaFinal.toFixed(1)}</strong>
                        <div style="display:flex; gap:5px;">
                            <button class="btn-view-code" data-action="toggleBlock" data-uid="${est.uid || ''}" data-blocked="${est.blocked || false}" title="${est.blocked ? 'Desbloquear' : 'Bloquear'}" style="color: ${est.blocked ? 'var(--error-color)' : 'var(--text-muted)'}">
                                <i data-lucide="${est.blocked ? 'lock' : 'unlock'}"></i>
                            </button>
                            <button class="btn-delete-docente" data-action="eliminarEstudiante" data-uid="${est.uid || ''}" data-nombre="${est.nombres}" title="Eliminar Estudiante"><i data-lucide="user-minus"></i></button>
                        </div>
                    </div>
                </td>
                </tr>
            `;
        });

        if (_allStudentsData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay estudiantes para los grupos seleccionados.</td></tr>`;
        }
        if (_lucideCreateIcons) _lucideCreateIcons();
    } catch (e) {
        console.error("Error al cargar dashboard", e);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error-color);">Error cargando datos de Firebase.</td></tr>`;
    }
};

export const enviarFeedback = async (uid, nombre) => {
    const msg = prompt(`Escribe una retroalimentación para ${nombre}:`);
    if (msg && msg.trim()) {
        try {
            await updateDoc(doc(_db, "users", uid), {
                teacherFeedback: {
                    message: msg,
                    timestamp: new Date().toISOString()
                }
            });
            showToast("Feedback enviado con éxito", "success");
        } catch (e) {
            showToast("Error al enviar feedback", "error");
        }
    }
};

export const exportPiarPDF = () => {
    const element = document.getElementById('piar-report-container');
    const btn = document.getElementById('btn-export-piar');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Generando...`;
    if (_lucideCreateIcons) _lucideCreateIcons();

    html2canvas(element, { scale: 2, backgroundColor: "#0d1117" }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Reporte_PIAR_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = originalHTML;
        if (_lucideCreateIcons) _lucideCreateIcons();
        showToast("Reporte descargado correctamente", "success");
    });
};

export const exportarCSV = () => {
    let csvContent = "\uFEFFNombre,Correo,Grupo,Retos Completados,Porcentaje,Monedas,Nota Final (1.0 - 5.0)\n";
    const filtro = document.getElementById('filtro-grupo').value;
    const totalRetos = Object.keys(weeks).length * 3;

    const estudiantesFiltrados = _allStudentsData.filter(est => {
        if (est.email === ADMIN_EMAIL) return false;
        return filtro === "TODOS" || est.grado === filtro;
    });

    if (estudiantesFiltrados.length === 0) return showToast("No hay datos para exportar", "warning");

    estudiantesFiltrados.forEach(est => {
        let completados = 0;
        if (est.progress) { Object.values(est.progress).forEach(val => { if (val === true) completados++; }); }

        const porcentaje = (completados / totalRetos) * 100;
        const notaFinal = ((porcentaje / 100) * 4.0) + 1.0;

        const fila = `"${est.nombres || ''}","${est.email}","${est.grado || ''}","${completados}/${totalRetos}","${porcentaje.toFixed(1)}%","${est.monedas || 0}","${notaFinal.toFixed(1)}"`;
        csvContent += fila + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Planilla_Notas_Wokwi_${filtro}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const cambiarTabDocente = (tab) => {
    document.getElementById('tab-estudiantes').style.display = 'none';
    document.getElementById('tab-gestion-docentes').style.display = 'none';
    document.getElementById('tab-matricula').style.display = 'none';
    document.getElementById('tab-piar-report').style.display = 'none';
    if (document.getElementById('tab-admin-tools')) document.getElementById('tab-admin-tools').style.display = 'none';

    document.getElementById('btn-tab-estudiantes').classList.remove('active');
    document.getElementById('btn-tab-gestion').classList.remove('active');
    document.getElementById('btn-tab-matricula').classList.remove('active');
    document.getElementById('btn-tab-piar').classList.remove('active');
    if (document.getElementById('btn-tab-admin-tools')) document.getElementById('btn-tab-admin-tools').classList.remove('active');

    document.getElementById(`tab-${tab}`).style.display = 'block';
    if (tab === 'estudiantes') document.getElementById('btn-tab-estudiantes').classList.add('active');
    else if (tab === 'gestion-docentes') document.getElementById('btn-tab-gestion').classList.add('active');
    else if (tab === 'admin-tools') {
        document.getElementById('btn-tab-admin-tools').classList.add('active');
        renderAdminToolsUI();
    } else if (tab === 'piar-report') {
        document.getElementById('btn-tab-piar').classList.add('active');
        renderPiarReportUI();
    } else if (tab === 'matricula') {
        document.getElementById('btn-tab-matricula').classList.add('active');
        renderMatriculaUI();
    }
    if (_lucideCreateIcons) _lucideCreateIcons();
};

const getRoles = async () => {
    const rolesDoc = await getDoc(doc(_db, "config", "roles"));
    if (rolesDoc.exists()) {
        return rolesDoc.data();
    }
    const defaultRoles = { docentes: [], gruposPorDocente: {} };
    await setDoc(doc(_db, "config", "roles"), defaultRoles);
    return defaultRoles;
};

export const renderTeacherManagementUI = async () => {
    const roles = await getRoles();
    const container = document.getElementById('docentes-list');
    container.innerHTML = roles.docentes.map(email => `
        <div class="docente-item">
            <span>${email}</span>
            <button class="btn-delete-docente" data-action="removeDocente" data-email="${email}"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const renderMatriculaUI = async () => {
    const { currentUser } = getState();
    const roles = await getRoles();
    const misGrupos = roles.gruposPorDocente?.[currentUser.email] || [];
    const container = document.getElementById('tab-matricula');
    
    let options = misGrupos.map(g => `<option value="${g}">${g}</option>`).join('');
    
    container.innerHTML = `
        <div class="card">
            <h2><i data-lucide="book-user"></i> Gestión de Matrícula</h2>
            <p style="color: var(--text-muted); margin-bottom:15px;">Solo los correos aquí listados podrán entrar al grado correspondiente.</p>
            <div class="management-container">
                <select id="select-grupo-matricula" style="padding:10px; border-radius:6px; background:var(--code-bg); color:var(--text-light); border:1px solid var(--border-color);">
                    ${options || '<option value="">Sin grupos asignados</option>'}
                </select>
                <input type="email" id="new-student-email" placeholder="estudiante@itspereira.edu.co">
                <button data-action="addStudentToClass"><i data-lucide="plus"></i> Matricular</button>
            </div>
            <div id="students-allowed-list" class="docentes-list" style="margin-top:20px;"></div>
        </div>
    `;
    
    const selector = document.getElementById('select-grupo-matricula');
    if (selector) {
        selector.addEventListener('change', () => updateAllowedListUI(selector.value));
        if (misGrupos.length > 0) updateAllowedListUI(misGrupos[0]);
    }
    
    if (_lucideCreateIcons) _lucideCreateIcons();
};

const updateAllowedListUI = async (grupo) => {
    const container = document.getElementById('students-allowed-list');
    if (!grupo) return container.innerHTML = '';
    
    const classDoc = await getDoc(doc(_db, "classes", grupo));
    const allowedEmails = classDoc.exists() ? (classDoc.data().allowedEmails || []) : [];
    
    container.innerHTML = allowedEmails.map(email => `
        <div class="docente-item">
            <span>${email}</span>
            <button class="btn-delete-docente" data-action="removeStudentFromClass" data-email="${email}" data-grupo="${grupo}"><i data-lucide="user-minus"></i></button>
        </div>
    `).join('') || '<p style="text-align:center; color:var(--text-muted);">No hay estudiantes matriculados en este grupo.</p>';
    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const addStudentToClass = async () => {
    const grupo = document.getElementById('select-grupo-matricula').value;
    const input = document.getElementById('new-student-email');
    const email = input.value.trim().toLowerCase();
    
    if (email && email.endsWith('@itspereira.edu.co') && grupo) {
        await setDoc(doc(_db, "classes", grupo), {
            allowedEmails: arrayUnion(email),
            lastUpdatedBy: getState().currentUser.email
        }, { merge: true });
        input.value = '';
        showToast(`Estudiante matriculado en ${grupo}`, "success");
        updateAllowedListUI(grupo);
    } else {
        showToast("Correo inválido o institucional requerido", "warning");
    }
};

export const removeStudentFromClass = async (email, grupo) => {
    if (confirm(`¿Eliminar a ${email} del grupo ${grupo}?`)) {
        await updateDoc(doc(_db, "classes", grupo), { allowedEmails: arrayRemove(email) });
        updateAllowedListUI(grupo);
    }
};

export const addDocente = async () => {
    const input = document.getElementById('new-docente-email');
    const email = input.value.trim().toLowerCase();
    if (email && email.endsWith('@itspereira.edu.co')) {
        const roles = await getRoles();
        if (!roles.docentes.includes(email)) {
            roles.docentes.push(email);
            await setDoc(doc(_db, "config", "roles"), roles, { merge: true });
            input.value = '';
            await renderTeacherManagementUI();
        } else {
            showToast('Este docente ya está registrado', 'info');
        }
    } else {
        showToast('Usa un correo @itspereira.edu.co', 'warning');
    }
};

export const renderPiarReportUI = () => {
    const container = document.getElementById('piar-report-container');
    const piarStudents = _allStudentsData.filter(s => s.piarProfile && s.piarProfile !== 'ninguno');

    if (piarStudents.length === 0) {
        container.innerHTML = '<div class="instruction-box">No hay estudiantes caracterizados como PIAR actualmente.</div>';
        return;
    }

    container.innerHTML = piarStudents.map(est => {
        const perfil = PERFILES_PIAR[est.piarProfile];
        return `
            <div class="card" style="border-left: 5px solid var(--wokwi-blue); margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>${est.nombres}</strong> (${est.grado})<br>
                        <span class="tag" style="background:rgba(47,129,247,0.1); margin-top:5px;">Tipo: ${perfil.nombre}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.8rem; color:var(--text-muted);">Ajustes Aplicados:</div>
                        <div style="font-size:0.85rem; max-width:300px;">${perfil.ajustes}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    if (_lucideCreateIcons) _lucideCreateIcons();
};

export const removeDocente = async (email) => {
    if (confirm(`¿Seguro que deseas eliminar al docente ${email}? También se eliminarán sus grupos asignados.`)) {
        const roles = await getRoles();
        roles.docentes = roles.docentes.filter(d => d !== email);
        delete roles.gruposPorDocente[email];
        await setDoc(doc(_db, "config", "roles"), roles);
        await renderTeacherManagementUI();
    }
};

export const renderSecondaryTeacherUI = async () => {
    const { currentUser } = getState();
    const roles = await getRoles();
    const misGrupos = roles.gruposPorDocente?.[currentUser.email] || [];
    const container = document.getElementById('my-groups-list');

    document.getElementById('docente-name').textContent = currentUser.displayName || currentUser.email;

    container.innerHTML = misGrupos.map(grupo => `
        <div class="docente-item">
            <span>${grupo}</span>
            <button class="btn-delete-docente" data-action="removeMyGroup" data-grupo="${grupo}"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
    if (_lucideCreateIcons) _lucideCreateIcons();
    await renderTeacherDashboard();
};

export const addMyGroup = async () => {
    const { currentUser } = getState();
    const input = document.getElementById('new-group-name');
    const grupo = input.value.trim().toUpperCase();
    if (grupo) {
        const roles = await getRoles();
        if (!roles.gruposPorDocente[currentUser.email]) {
            roles.gruposPorDocente[currentUser.email] = [];
        }
        if (!roles.gruposPorDocente[currentUser.email].includes(grupo)) {
            roles.gruposPorDocente[currentUser.email].push(grupo);
            await setDoc(doc(_db, "config", "roles"), roles, { merge: true });
            input.value = '';
            await renderSecondaryTeacherUI();
        } else {
            showToast('Ya tienes este grupo asignado', 'info');
        }
    }
};

export const toggleBlockEstudiante = async (uid, currentStatus) => {
    if (!uid) return showToast("ID de usuario no encontrado", "error");
    try {
        await updateDoc(doc(_db, "users", uid), { blocked: !currentStatus });
        showToast(`Estudiante ${!currentStatus ? 'bloqueado' : 'desbloqueado'}`, "info");
        await renderTeacherDashboard();
    } catch (e) {
        showToast("Error al cambiar estado de acceso", "error");
    }
};

export const renderAdminToolsUI = async () => {
    const { collectiveProgress } = getState();
    const progEl = document.getElementById('admin-collective-prog');
    if (progEl) progEl.textContent = collectiveProgress;

    const activityLog = document.getElementById('admin-activity-log');
    if (!activityLog) return;

    try {
        const q = query(collection(_db, "notifications"), orderBy("timestamp", "desc"), limit(20));
        const snap = await getDocs(q);
        let html = '';
        snap.forEach(d => {
            const data = d.data();
            const date = data.timestamp ? new Date(data.timestamp.toMillis()).toLocaleString() : 'Reciente';
            html += `<div style="border-bottom:1px solid var(--border-color); padding:10px 0; display:flex; gap:10px;">
                <span style="color:var(--wokwi-blue); font-family:monospace; font-size:0.8rem;">[${date}]</span> 
                <span><strong>${data.usuario} (${data.grado}):</strong> ${data.mensaje}</span>
            </div>`;
        });
        activityLog.innerHTML = html || '<p style="text-align:center; padding:20px;">No hay actividad reciente.</p>';
        if (_lucideCreateIcons) _lucideCreateIcons();
    } catch (e) {
        activityLog.innerHTML = '<p style="color:var(--error-color);">Error cargando log de actividad.</p>';
    }
};

export const resetCollectiveGoal = async () => {
    if (confirm("¿Estás seguro de reiniciar la meta institucional? Esto afectará a todos los estudiantes.")) {
        try {
            await setDoc(doc(_db, "config", "collectiveChallenge"), { totalRetos: 0 });
            showToast("Contador institucional reiniciado", "success");
            window.location.reload();
        } catch (e) {
            showToast("Error al reiniciar meta", "error");
        }
    }
};

export const removeMyGroup = async (grupo) => {
    const { currentUser } = getState();
    const roles = await getRoles();
    roles.gruposPorDocente[currentUser.email] = roles.gruposPorDocente[currentUser.email].filter(g => g !== grupo);
    await setDoc(doc(_db, "config", "roles"), roles, { merge: true });
    await renderSecondaryTeacherUI();
};

window.verCodigoEstudiante = (email) => {
    const est = _allStudentsData.find(e => e.email === email);
    if (!est) return;
    
    let htmlCodes = `<h3>Códigos de ${est.nombres}</h3>`;
    Object.keys(weeks).forEach(sem => {
        let semHtml = '';
        ['basico', 'alto', 'superior'].forEach(nivel => {
            const code = est.savedCodes?.[`code_${sem}_${nivel}`] || est.drafts?.[`draft_${sem}_${nivel}`];
            if (code) {
                semHtml += `<div class="code-viewer-item"><strong>Semana ${sem} - ${nivel.toUpperCase()}:</strong><pre><code>${code.replace(/</g, "&lt;")}</code></pre></div>`;
            }
        });
        if (semHtml) htmlCodes += `<div class="code-viewer-week"><h4>Módulo ${sem}</h4>${semHtml}</div>`;
    });

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `<div class="modal-box card" style="max-width:800px; max-height:80vh; overflow-y:auto;">
        <div class="modal-header"><h2>Inspección de Código</h2><button onclick="this.closest('.modal-overlay').remove()" class="close-btn">X</button></div>
        <div style="padding:20px;">${htmlCodes || '<p>El estudiante no ha escrito código aún.</p>'}</div>
    </div>`;
    document.body.appendChild(modal);
};

export const eliminarEstudiante = async (uid, nombre) => {
    if (!uid) {
        showToast("No se puede eliminar: UID no encontrado", "error");
        return;
    }
    if (confirm(`¿Estás completamente seguro de eliminar a ${nombre}?\nEsta acción borrará todo su progreso de forma permanente.`)) {
        try {
            await deleteDoc(doc(_db, "users", uid));
            showToast("Estudiante eliminado correctamente", "success");
            await renderTeacherDashboard();
        } catch (e) {
            console.error(e);
            showToast("Error al eliminar estudiante", "error");
        }
    }
};