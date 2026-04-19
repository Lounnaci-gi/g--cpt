import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import * as readline from 'readline';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanupMovements() {
  console.log('🧹 Nettoyage des mouvements dans Firestore...\n');

  // Récupérer tous les mouvements
  const movementsSnap = await getDocs(
    query(collection(db, 'movements'), orderBy('date', 'desc'), limit(100))
  );
  const movements = movementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (movements.length === 0) {
    console.log('✅ Aucun mouvement à supprimer.');
    rl.close();
    return;
  }

  console.log(`📊 Mouvements trouvés: ${movements.length}\n`);

  // Afficher tous les mouvements
  console.log('📋 Liste des mouvements:');
  movements.forEach((m, index) => {
    const date = (m as any).date?.toDate().toLocaleDateString('fr-FR');
    const qty = (m as any).meterSerialNumbers?.length || 0;
    const type = (m as any).typeId;
    console.log(`  ${index + 1}. ${date} | ${type} | ${qty} compteurs | ID: ${m.id}`);
  });

  console.log('');

  // Demander confirmation
  const answer = await askQuestion(`⚠️  Voulez-vous vraiment supprimer ces ${movements.length} mouvement(s)? (oui/non): `);
  
  if (!['oui', 'o', 'yes', 'y'].includes(answer.toLowerCase())) {
    console.log('❌ Opération annulée.');
    rl.close();
    return;
  }

  console.log('\n🗑️  Suppression en cours...\n');

  // Supprimer les mouvements et leurs lignes (subcollections)
  const batch = writeBatch(db);
  let deletedCount = 0;

  for (const movement of movements) {
    const movementId = movement.id;
    
    // Supprimer le document principal du mouvement
    batch.delete(doc(db, 'movements', movementId));
    
    // Supprimer la sous-collection 'lines' si elle existe
    const linesSnap = await getDocs(collection(db, 'movements', movementId, 'lines'));
    linesSnap.forEach(lineDoc => {
      batch.delete(doc(db, 'movements', movementId, 'lines', lineDoc.id));
    });
    
    deletedCount++;
    console.log(`  ✓ Mouvement ${movementId} supprimé (${linesSnap.size} lignes)`);
  }

  // Commit du batch
  await batch.commit();

  console.log(`\n✅ ${deletedCount} mouvement(s) supprimé(s) avec succès!`);
  console.log('📊 Bilans & Rapports affichera maintenant 0 compteur.');
  
  rl.close();
}

cleanupMovements().catch(err => {
  console.error('❌ Erreur:', err);
  rl.close();
});
