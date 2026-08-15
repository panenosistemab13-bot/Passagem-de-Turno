import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  get, 
  update, 
  push,
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
  Notification,
  VehicleRecord 
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
    return Object.entries(val).map(([key, item]: [string, any]) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || key,
          ...item
        };
      }
      return item;
    });
  }
  return [];
};

// Clean payload to guarantee NO undefined values reach Firebase Realtime Database
export const cleanFirebasePayload = (payload: any): any => {
  if (payload === null || payload === undefined) {
    return '';
  }
  if (Array.isArray(payload)) {
    return payload.map(item => cleanFirebasePayload(item));
  }
  if (typeof payload === 'object') {
    const cleaned: Record<string, any> = { ...payload };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        cleaned[key] = '';
      } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
        cleaned[key] = cleanFirebasePayload(cleaned[key]);
      }
    });
    return cleaned;
  }
  return payload;
};

// Database references matching the exact Realtime Database paths
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
  vehicles: ref(rtdb, 'dados-globais/veiculos'),
  connected: ref(rtdb, '.info/connected')
};

// Push individual occurrence atomically with unique Firebase ID
export const pushOccurrenceToFirebase = async (
  occurrenceData: Omit<Occurrence, 'id'> | Occurrence
): Promise<Occurrence | null> => {
  try {
    await ensureAnonymousAuth();
    const newRef = push(ref(rtdb, 'dados-globais/ocorrencias'));
    const payload: any = {
      ...occurrenceData,
      id: newRef.key || (occurrenceData as any).id || `occ-${Date.now()}`,
      createdAt: (occurrenceData as Occurrence).createdAt || new Date().toISOString()
    };

    // Clean payload: guarantee no undefined properties are sent to Firebase
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        payload[key] = '';
      }
    });

    await set(newRef, payload);
    return payload as Occurrence;
  } catch (error) {
    console.error("Firebase push error (occurrences):", error);
    return null;
  }
};

// Update individual occurrence at its specific path
export const updateOccurrenceInFirebase = async (occurrence: Occurrence) => {
  try {
    await ensureAnonymousAuth();
    if (occurrence.id) {
      const payload: any = { ...occurrence };
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          payload[key] = '';
        }
      });
      await set(ref(rtdb, `dados-globais/ocorrencias/${occurrence.id}`), payload);
    }
  } catch (error) {
    console.error("Firebase update error (occurrence):", error);
  }
};

// Remove individual occurrence from Firebase
export const deleteOccurrenceFromFirebase = async (id: string) => {
  try {
    await ensureAnonymousAuth();
    await remove(ref(rtdb, `dados-globais/ocorrencias/${id}`));
  } catch (error) {
    console.error("Firebase delete error (occurrence):", error);
  }
};

// Push chat message atomically with unique Firebase ID
export const pushChatMessageToFirebase = async (
  msg: Omit<ChatMessage, 'id'>
): Promise<ChatMessage | null> => {
  try {
    await ensureAnonymousAuth();
    const newRef = push(ref(rtdb, 'chatMessages'));
    const messageWithId: ChatMessage = {
      ...msg,
      id: newRef.key || `msg-${Date.now()}`
    };
    const sanitized = cleanFirebasePayload(messageWithId);
    await set(newRef, sanitized);
    return messageWithId;
  } catch (error) {
    console.error("Firebase push error (chatMessages):", error);
    return null;
  }
};

// Push notification atomically with unique Firebase ID
export const pushNotificationToFirebase = async (
  notif: Omit<Notification, 'id'>
): Promise<Notification | null> => {
  try {
    await ensureAnonymousAuth();
    const newRef = push(ref(rtdb, 'notifications'));
    const notifWithId: Notification = {
      ...notif,
      id: newRef.key || `notif-${Date.now()}`
    };
    const sanitized = cleanFirebasePayload(notifWithId);
    await set(newRef, sanitized);
    return notifWithId;
  } catch (error) {
    console.error("Firebase push error (notifications):", error);
    return null;
  }
};

// Sync whole collections when bulk changes happen
export const syncGlobalDataToFirebase = async (data: Record<string, any>) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(data);
    await update(ref(rtdb, 'dados-globais'), {
      ...sanitized,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Firebase sync error (dados-globais):", error);
  }
};

export const syncLeadersToFirebase = async (leaders: Leader[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(leaders);
    await set(ref(rtdb, 'leaders'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { leaders: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (leaders):", error);
  }
};

export const syncOccurrencesToFirebase = async (occurrences: Occurrence[]) => {
  try {
    await ensureAnonymousAuth();
    // Convert array to dictionary keyed by occurrence id so child paths remain consistent
    const occurrencesMap: Record<string, Occurrence> = {};
    occurrences.forEach((occ, idx) => {
      const key = occ.id || `occ-${idx}-${Date.now()}`;
      occurrencesMap[key] = { ...occ, id: key };
    });
    const sanitized = cleanFirebasePayload(occurrencesMap);
    await set(ref(rtdb, 'dados-globais/ocorrencias'), sanitized);
  } catch (error) {
    console.error("Firebase sync error (occurrences):", error);
  }
};

export const syncEmployeesToFirebase = async (employees: Employee[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(employees);
    await set(ref(rtdb, 'employees'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { employees: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (employees):", error);
  }
};

export const syncEmployeeLogsToFirebase = async (logs: EmployeeLog[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(logs);
    await set(ref(rtdb, 'employeeLogs'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { employeeLogs: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (employeeLogs):", error);
  }
};

export const syncRemindersToFirebase = async (reminders: Reminder[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(reminders);
    await set(ref(rtdb, 'reminders'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { reminders: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (reminders):", error);
  }
};

export const syncChatMessagesToFirebase = async (messages: ChatMessage[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(messages);
    await set(ref(rtdb, 'chatMessages'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { chatMessages: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (chatMessages):", error);
  }
};

export const syncNotificationsToFirebase = async (notifications: Notification[]) => {
  try {
    await ensureAnonymousAuth();
    const sanitized = cleanFirebasePayload(notifications);
    await set(ref(rtdb, 'notifications'), sanitized);
    await update(ref(rtdb, 'dados-globais'), { notifications: sanitized, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("Firebase sync error (notifications):", error);
  }
};

export const pushVehicleRecordToFirebase = async (
  recordData: Omit<VehicleRecord, 'id'> | VehicleRecord
): Promise<VehicleRecord | null> => {
  try {
    await ensureAnonymousAuth();
    const newRef = push(ref(rtdb, 'dados-globais/veiculos'));
    const payload: any = {
      ...recordData,
      id: newRef.key || (recordData as any).id || `veh-${Date.now()}`,
      createdAt: (recordData as VehicleRecord).createdAt || new Date().toISOString()
    };
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        payload[key] = '';
      }
    });
    await set(newRef, payload);
    return payload as VehicleRecord;
  } catch (error) {
    console.error("Firebase push error (vehicles):", error);
    return null;
  }
};

export const updateVehicleRecordInFirebase = async (record: VehicleRecord): Promise<void> => {
  try {
    await ensureAnonymousAuth();
    if (record.id) {
      const payload: any = { ...record };
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          payload[key] = '';
        }
      });
      await set(ref(rtdb, `dados-globais/veiculos/${record.id}`), payload);
    }
  } catch (error) {
    console.error("Firebase update error (vehicle):", error);
  }
};

export const deleteVehicleRecordFromFirebase = async (id: string): Promise<void> => {
  try {
    await ensureAnonymousAuth();
    await remove(ref(rtdb, `dados-globais/veiculos/${id}`));
  } catch (error) {
    console.error("Firebase delete error (vehicle):", error);
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

