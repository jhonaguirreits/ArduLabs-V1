import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDoc, doc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { ADMIN_EMAIL } from './constants.js';
import { updateState, resetState } from './state.js';

let authInstance;
let googleProvider;

/**
 * Inicializa la instancia de Firebase Auth.
 * @param {object} app - La instancia de Firebase App.
 * @returns {object} La instancia de Firebase Auth.
 */
export const initializeAuth = (app) => {
    authInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    return authInstance;
};

/**
 * Configura el listener para cambios en el estado de autenticación.
 * @param {object} auth - La instancia de Firebase Auth.
 * @param {object} db - La instancia de Firebase Firestore.
 * @param {object} appCallbacks - Callbacks para controlar la UI de la aplicación principal.
 */
export const setupAuthListener = (auth, db, appCallbacks) => {
    const { iniciarAppEstudiante, iniciarAppDocente, saveToFirebase, showLoginError, hideLoginError, showLoginLoading, hideLoginLoading } = appCallbacks;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const isDomainValid = user.email.endsWith('@itspereira.edu.co');
            if (!isDomainValid) {
                showLoginError('Acceso denegado. Usa tu cuenta @itspereira.edu.co');
                await signOut(auth);
                return;
            }

            showLoginLoading();
            hideLoginError(); // Clear any previous errors
            updateState({ currentUser: user });

            try {
                const isAdmin = user.email === ADMIN_EMAIL;
                const rolesDoc = await getDoc(doc(db, "config", "roles"));
                const isSecondaryTeacher = rolesDoc.exists() && rolesDoc.data().docentes?.includes(user.email);
                
                let detectedGrado = null;

                // VALIDACIÓN DE MATRÍCULA PARA ESTUDIANTES
                if (!isAdmin && !isSecondaryTeacher) {
                    const classesRef = collection(db, "classes");
                    const q = query(classesRef, where("allowedEmails", "array-contains", user.email));
                    const classSnap = await getDocs(q);
                    
                    if (classSnap.empty) {
                        showLoginError('Tu correo no está matriculado en ninguna clase. Contacta a tu docente.');
                        await signOut(auth);
                        return;
                    }
                    // Tomamos el primer grado donde esté matriculado
                    detectedGrado = classSnap.docs[0].id;
                }

                updateState({ 
                    esAdmin: isAdmin, 
                    esDocenteSecundario: isSecondaryTeacher 
                });

                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                let currentData;

                if (docSnap.exists()) {
                    currentData = docSnap.data(); 
                    
                    // Verificar si el usuario está bloqueado
                    if (currentData.blocked === true) {
                        showLoginError('Tu acceso ha sido restringido por un administrador.');
                        await signOut(auth);
                        return;
                    }
                } else {
                    let finalGrado = isAdmin ? "ADMIN" : (isSecondaryTeacher ? "DOCENTE" : detectedGrado);
                    currentData = {
                        nombres: user.displayName, email: user.email, grado: finalGrado,
                        volts: 0, monedas: 0, streak: 0, lastLogin: new Date().toISOString(),
                        progress: {}, records: {}, savedCodes: {}, drafts: {}, teoria: {},
                        avatar: "user", theme: "blue", themeMode: "dark", inventory: { avatars: ["user"], themes: ["blue"] },
                        collectiveRewardClaimed: false,
                        blocked: false
                    };
                    await saveToFirebase(user.uid, currentData);
                }

                // Asegurar campos por defecto
                currentData.savedCodes = currentData.savedCodes || {};
                currentData.drafts = currentData.drafts || {};
                currentData.teoria = currentData.teoria || {};
                currentData.inventory = currentData.inventory || { avatars: ["user"], themes: ["blue"] };
                currentData.collectiveRewardClaimed = currentData.collectiveRewardClaimed || false;
                currentData.blocked = currentData.blocked || false;

                hideLoginLoading();
                updateState({ userData: currentData });

                // Lógica de redirección inicial
                if (isSecondaryTeacher && !isAdmin) {
                    iniciarAppDocente();
                } else {
                    iniciarAppEstudiante(); // El Admin entra como estudiante por defecto
                }

            } catch (error) {
                console.error("Error al cargar perfil:", error);
                showLoginError('Error al cargar datos de usuario.');
            }
        } else {
            resetState();
            hideLoginLoading();
            document.getElementById('screen-login').classList.add('active');
            document.getElementById('screen-app').classList.remove('active');
            document.getElementById('screen-teacher').classList.remove('active');
            if (window.lucide) lucide.createIcons();
        }
    });
};

/**
 * Inicia el proceso de login con Google.
 * @param {object} auth - La instancia de Firebase Auth.
 * @returns {Promise<object>} Objeto con { success: boolean, error?: string, user?: object }.
 */
export const loginWithGoogle = async (auth) => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user.email.endsWith('@itspereira.edu.co')) {
            await signOut(auth);
            return { success: false, error: 'Acceso denegado. Usa tu cuenta @itspereira.edu.co' };
        }
        return { success: true, user };
    } catch (error) {
        console.error("Error en Login:", error);
        return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
};

/**
 * Cierra la sesión del usuario.
 * @param {object} auth - La instancia de Firebase Auth.
 */
export const logoutUser = async (auth) => {
    if (confirm("¿Deseas cerrar sesión? Tus datos están guardados en la Nube ☁️.")) {
        await signOut(auth);
        window.location.reload();
    }
};