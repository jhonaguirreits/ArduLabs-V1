/**
 * Módulo para gestionar el estado global de la aplicación.
 * Centraliza los datos del usuario y el estado de la UI para evitar variables globales
 * y facilitar un flujo de datos predecible.
 */

// Estado reactivo simple.
const state = {
    currentUser: null,
    userData: {
        nombres: "", email: "", grado: "",
        volts: 0, monedas: 0, streak: 0, lastLogin: "",
        progress: {}, records: {}, savedCodes: {}, drafts: {}, teoria: {},
        avatar: "user", theme: "blue", themeMode: "dark", inventory: { avatars: ["user"], themes: ["blue"] },
        achievements: [],
        collectiveRewardClaimed: false,
        items: { shields: 0 },
        language: "es",           // es, en
        nivelDificultad: "estandar", // estandar, profundizacion, piar
        piarProfile: "ninguno",     // ninguno, cognitivo, visual, motriz
        teacherFeedback: null,      // { message: string, timestamp: any }
        classData: null             // Datos de la clase (semanas activas, etc)
    },
    esAdmin: false,
    esDocenteSecundario: false,
    currentRetoId: '1',
    currentPeriod: 1,
    collectiveProgress: 0,
};

// Listeners para reaccionar a cambios de estado.
const listeners = [];

/**
 * Actualiza el estado y notifica a los listeners.
 * @param {Partial<state>} newState - Un objeto con las claves del estado a actualizar.
 */
export function updateState(newState) {
    Object.assign(state, newState);
    // Notifica a los listeners que el estado ha cambiado.
    listeners.forEach(listener => listener(state));
}

/**
 * Obtiene una copia del estado actual para evitar mutaciones directas.
 * @returns {state} El estado actual de la aplicación.
 */
export function getState() {
    return { ...state };
}

/**
 * Resetea el estado a sus valores iniciales, útil al cerrar sesión.
 */
export function resetState() {
    updateState({
        currentUser: null,
        userData: {
            nombres: "", email: "", grado: "",
            volts: 0, monedas: 0, streak: 0, lastLogin: "",
            progress: {}, records: {}, savedCodes: {}, drafts: {}, teoria: {},
            avatar: "user", theme: "blue", themeMode: "dark", inventory: { avatars: ["user"], themes: ["blue"] },
            achievements: [],
            collectiveRewardClaimed: false,
            items: { shields: 0 }
        },
        esAdmin: false,
        esDocenteSecundario: false,
        currentPeriod: 1,
        collectiveProgress: 0,
    });
}

/**
 * Registra una función que se ejecutará cada vez que el estado cambie.
 * @param {Function} listener - La función a ejecutar.
 */
export function subscribe(listener) {
    listeners.push(listener);
}