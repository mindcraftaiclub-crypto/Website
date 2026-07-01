const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyC69hQb92bkySfsd_2NfHcg7YgYLVj8DRs",
  authDomain: "website-b84d2.firebaseapp.com",
  projectId: "website-b84d2",
  storageBucket: "website-b84d2.firebasestorage.app",
  messagingSenderId: "183506006508",
  appId: "1:183506006508:web:fd3e07251811a4282550c9"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function testRead() {
  console.log("Fetching CoreMembers from Firestore...");
  try {
    const colRef = collection(firestore, "CoreMembers");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("Documents in Firestore CoreMembers:", data);
  } catch (error) {
    console.error("Firestore read failed:", error.message);
  }
}

testRead();
