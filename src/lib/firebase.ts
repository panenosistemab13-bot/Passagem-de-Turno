import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  get, 
  update, 
  remove,
  DatabaseReference
} from "firebase/database";
import { 
  Leader, 
  Occurrence, 
  Employee, 
  EmployeeLog, 
  Reminder, 
  ChatMessage, 
  Notification 
} from "../types";
import { INITIAL_LEADERS } from "../initialData";

export const firebaseConfig = {
  apiKey: "AIzaSyAznTSG6GCX9CPsrT6_eDsRtY86pdyykA4",
  authDomain: "passagem-de-turno-1d855.firebaseapp.com",
  databaseURL: "https://passagem-de-turno-1d855-default-rtdb.firebaseio.com",
  projectId: "passagem-de-turno-1d855",
  storageBucket: "passagem-de-turno-1d855.firebasestorage.app",
  messagingSenderId: "1037482488405",
  appId: "1:1037482488405:web:9a9eb7f301ea6f2932dadc",
  measurementId: "G-5SGX5YV5DM"
};

// Safe initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app);

// Safe lazy initialization for Firebase Auth
let authInstance: ReturnType<typeof getAuth> | null = null;
export const getFirebaseAuth = () => {
  if (!authInstance) {
    try {
      authInstance = getAuth(app);
    } catch (err) {
      console.warn("Firebase Auth component initialization warning:", err);
      return null;
    }
  }
  return authInstance;
};

export const auth = getFirebaseAuth();

// Anonymous Auth helper with graceful error handling
export const ensureAnonymousAuth = async (): Promise<User | null> => {
  try {
    const currentAuth = getFirebaseAuth();
    if (!currentAuth) return null;
    
    if (currentAuth.currentUser) {
      return currentAuth.currentUser;
    }
    const credential = await signInAnonymously(currentAuth);
    console.log("Firebase Anonymous Auth successful, UID:", credential.user.uid);
    return credential.user;
  } catch (error: any) {
    if (error?.code === 'auth/configuration-not-found' || error?.code === 'auth/operation-not-allowed') {
      console.info(
        "Aviso Firebase Auth: O provedor Anônimo precisa ser ativado no Firebase Console (Authentication > Sign-in method > Anonymous). Operando normalmente com o banco de dados."
      );
    } else {
      console.warn("Firebase Anonymous Auth warning:", error?.message || error);
    }
    return null;
  }
};

// Helper to convert Firebase Object/Array snapshots cleanly
export const snapshotToArray = <T>(val: any): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.values(val);
  }
  return [];
};

// Database references matching the existing Realtime Database schema
export const dbRefs = {
  globalData: ref(rtdb, 'dados-globais'),
  occurrences: ref(rtdb, 'dados-globais/ocorrencias'),
  legacyOccurrences: ref(rtdb, 'occurrences'),
  leaders: ref(rtdb, 'leaders'),
  employees: ref(rtdb, 'employees'),
  employeeLogs: ref(rtdb, 'employeeLogs'),
  reminders: ref(rtdb, 'reminders'),
  chatMessages: ref(rtdb, 'chatMessages'),
  notifications: ref(rtdb, 'notifications'),
  connected: ref(rtdb, '.info/connected')
};

// Sync functions to write directly to Firebase Realtime Database
export const syncGlobalDataToFirebase = async (data: Record<string, any>) => {
  try {
    await ensureAnonymousAuth();
    await update(ref(rtdb, 'dados-globais'), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Firebase sync error (dados-globais):", error);
  }
};

export const syncLeadersToFirebase = async (leaders: Leader[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'leaders'), leaders);
    await update(ref(rtdb, 'dados-globais'), { leaders, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (leaders):", error);
  }
};

export const syncOccurrencesToFirebase = async (occurrences: Occurrence[]) => {
  try {
    await ensureAnonymousAuth();
    // Save to primary path 'dados-globais/ocorrencias'
    await set(ref(rtdb, 'dados-globais/ocorrencias'), occurrences);
    // Maintain mirror at 'occurrences' and 'dados-globais' for backwards compatibility
    await set(ref(rtdb, 'occurrences'), occurrences);
    await update(ref(rtdb, 'dados-globais'), { 
      ocorrencias: occurrences,
      occurrences, 
      lastUpdated: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Firebase sync error (occurrences):", error);
  }
};

export const syncEmployeesToFirebase = async (employees: Employee[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'employees'), employees);
    await update(ref(rtdb, 'dados-globais'), { employees, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (employees):", error);
  }
};

export const syncEmployeeLogsToFirebase = async (logs: EmployeeLog[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'employeeLogs'), logs);
    await update(ref(rtdb, 'dados-globais'), { employeeLogs: logs, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (employeeLogs):", error);
  }
};

export const syncRemindersToFirebase = async (reminders: Reminder[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'reminders'), reminders);
    await update(ref(rtdb, 'dados-globais'), { reminders, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (reminders):", error);
  }
};

export const syncChatMessagesToFirebase = async (messages: ChatMessage[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'chatMessages'), messages);
    await update(ref(rtdb, 'dados-globais'), { chatMessages: messages, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (chatMessages):", error);
  }
};

export const syncNotificationsToFirebase = async (notifications: Notification[]) => {
  try {
    await ensureAnonymousAuth();
    await set(ref(rtdb, 'notifications'), notifications);
    await update(ref(rtdb, 'dados-globais'), { notifications, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (notifications):", error);
  }
};

// Initialize database with default leaders if newly created/empty
export const initializeFirebaseDataIfEmpty = async () => {
  try {
    await ensureAnonymousAuth();
    const leadersSnap = await get(ref(rtdb, 'leaders'));
    if (!leadersSnap.exists() || !leadersSnap.val() || leadersSnap.val().length === 0) {
      await set(ref(rtdb, 'leaders'), INITIAL_LEADERS);
    }
  } catch (error) {
    console.warn("Firebase initialization check warning:", error);
  }
};
