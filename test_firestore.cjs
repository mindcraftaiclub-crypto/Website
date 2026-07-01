const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, deleteDoc } = require("firebase/firestore");

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

async function testFirestore() {
  console.log("Testing Firestore CoreMembers collection write/delete permissions...");
  const docId = "test_doc_" + Date.now();
  const testDocRef = doc(firestore, "CoreMembers", docId);
  try {
    // Attempt write
    await setDoc(testDocRef, { name: "Test User", role: "Test Role" });
    console.log("Write successful!");

    // Attempt delete
    await deleteDoc(testDocRef);
    console.log("Delete successful!");
  } catch (error) {
    console.error("Firestore operation failed:", error.message);
  }
}

testFirestore();
