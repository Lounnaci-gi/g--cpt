import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function analyzeMovements() {
  console.log('🔍 Analyse des mouvements dans Firestore...\n');

  const movementsSnap = await getDocs(
    query(collection(db, 'movements'), orderBy('date', 'desc'), limit(100))
  );
  const movements = movementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(`📊 Total des mouvements: ${movements.length}\n`);

  // Par type
  const typeCount: Record<string, number> = {};
  let totalQuantity = 0;

  movements.forEach(m => {
    const type = (m as any).typeId || 'INCONNU';
    const qty = (m as any).meterSerialNumbers?.length || 0;
    typeCount[type] = (typeCount[type] || 0) + qty;
    totalQuantity += qty;
  });

  console.log('📋 Répartition par type (quantité totale):');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} compteurs`);
  });

  console.log(`\n📦 Quantité totale tous mouvements: ${totalQuantity}`);

  // Afficher les 5 derniers mouvements
  if (movements.length > 0) {
    console.log('\n📝 5 derniers mouvements:');
    movements.slice(0, 5).forEach(m => {
      const date = (m as any).date?.toDate().toLocaleDateString('fr-FR');
      const qty = (m as any).meterSerialNumbers?.length || 0;
      console.log(`  - ${date} | ${(m as any).typeId} | ${qty} compteurs`);
    });
  }

  console.log('\n✅ Analyse terminée');
}

analyzeMovements().catch(console.error);
