import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC69hQb92bkySfsd_2NfHcg7YgYLVj8DRs",
  authDomain: "website-b84d2.firebaseapp.com",
  projectId: "website-b84d2",
  storageBucket: "website-b84d2.firebasestorage.app",
  messagingSenderId: "183506006508",
  appId: "1:183506006508:web:fd3e07251811a4282550c9",
  measurementId: "G-SK9TEMW5Y1"
};
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

async function listMembers() {
  console.log("Fetching Users...");
  const usersSnapshot = await getDocs(collection(firestore, 'Users'));
  const users = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Users:", JSON.stringify(users, null, 2));

  console.log("Fetching CoreMembers...");
  const coreSnapshot = await getDocs(collection(firestore, 'CoreMembers'));
  const core = coreSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("CoreMembers:", JSON.stringify(core, null, 2));

  process.exit(0);
}

listMembers().catch(e => {
  console.error(e);
  process.exit(1);
});
