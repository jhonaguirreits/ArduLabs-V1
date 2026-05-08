import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit, where, onSnapshot, addDoc, serverTimestamp, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let dbInstance;

/**
 * Inicializa la instancia de Firebase Firestore.
 * @param {object} app - La instancia de Firebase App.
 * @returns {object} La instancia de Firebase Firestore.
 */
export const initializeFirestore = (app) => {
    dbInstance = getFirestore(app);
    return dbInstance;
};

// Exporta las funciones de Firestore que se utilizan en la aplicación
// Esto permite que otros módulos las importen desde aquí en lugar de directamente desde el CDN de Firebase.
export {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    addDoc,
    serverTimestamp,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where
};