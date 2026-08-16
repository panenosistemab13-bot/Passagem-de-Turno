import { rtdb } from './lib/firebase';
import { ref, update } from 'firebase/database';
import seed from './vehiclesSeed.json';

export const runVehicleMigration = async (existingCount: number) => {
  try {
    if (existingCount > 400) return; // Already seeded
    if (!seed || Object.keys(seed).length === 0) return;
    console.log("Starting vehicle migration...");
    await update(ref(rtdb, 'dados-globais/veiculos'), seed);
    console.log("Migration finished successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};
