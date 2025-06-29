import { db } from '../firebase-config';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const fetchUsers = async () => {
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Could not fetch user data.");
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Could not update user role.");
  }
};

export const deleteUserInFirestore = async (userIdToDelete) => {
  try {
    const userDocRef = doc(db, "users", userIdToDelete);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    // Note: Deleting the user document in Firestore does not delete the user from Firebase Auth.
    // A more complete solution would involve a Cloud Function to handle Auth deletion.
    throw new Error("Could not delete user.");
  }
};import { db } from '../firebase-config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ... your other service functions like submitResidenceLetterRequest ...

// --- ADD THIS NEW FUNCTION ---
// Handles the escalation of a request to an external authority
export const escalateRequest = async (requestId, escalatedTo, notes, adminId) => {
  try {
    const requestDocRef = doc(db, 'letter_requests', requestId);
    await updateDoc(requestDocRef, {
      status: 'escalated', // Update the main status
      escalation: {
        status: `pending_${escalatedTo.toLowerCase()}`, // e.g., 'pending_rita'
        escalatedBy: adminId,
        escalatedAt: serverTimestamp(),
        notes: notes,
      }
    });
  } catch (error) {
    console.error("Error escalating request:", error);
    throw new Error("Could not escalate the request.");
  }
};

// --- You will also need an updated approval/rejection function ---
export const resolveRequest = async (requestId, newStatus, adminNotes = "") => {
    try {
        const requestDocRef = doc(db, 'letter_requests', requestId);
        await updateDoc(requestDocRef, {
            status: newStatus, // 'approved' or 'rejected'
            resolution: {
                resolvedBy: 'ADMIN_ID_HERE', // In a real app, pass the admin's ID
                resolvedAt: serverTimestamp(),
                notes: adminNotes,
            }
        });

        // You would also trigger a notification to the user here
        // createNotification(userId, message);

    } catch (error) {
        console.error("Error resolving request:", error);
        throw new Error("Could not resolve the request.");
    }
};

import { db, storage } from '../firebase-config'; // Make sure storage is exported
import { collection, addDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- ADD THIS NEW FUNCTION ---
// Sends a text or media message to a specific chat
export const sendMessage = async (chatId, messageData) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// --- ADD THIS NEW FUNCTION ---
// Uploads a file and then sends a message with the file's URL
export const sendMediaMessage = async (chatId, file, senderId) => {
  try {
    if (!file) throw new Error("No file provided.");

    // 1. Upload the file to Firebase Storage
    const storageRef = ref(storage, `chat_media/${chatId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    
    // 2. Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);

    // 3. Send a new message document containing the media URL
    await sendMessage(chatId, {
      senderId: senderId,
      text: '', // Text can be empty for media messages
      mediaUrl: downloadURL,
      mediaType: file.type,
    });
  } catch (error) {
    console.error("Error sending media message:", error);
    throw error;
  }
};

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { logoBase64 } from '../assets/logoBase64'; // Import the logo string

// --- ADD THIS NEW FUNCTION ---
export const generateResidenceLetterPDF = (userData) => {
  const doc = new jsPDF();

  // === Header ===
  // Add the logo image
  // doc.addImage(imageData, format, x, y, width, height)
  doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
  
  // Add header text
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Jamhuri ya Muungano wa Tanzania', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Ofisi ya Serikali za Mitaa', 105, 30, { align: 'center' });
  doc.line(15, 45, 195, 45); // Horizontal line

  // === Document Title ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BARUA YA UTAMBULISHO WA MAKAZI', 105, 60, { align: 'center' });

  // === Body Content ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const bodyText = `Hati hii inathibitisha kwamba Bw./Bi. ${userData.name}, mwenye namba ya kitambulisho ${userData.idNumber}, ni mkazi halali wa ${userData.address}.`;
  
  // Use splitTextToSize to handle long text and wrapping
  const splitText = doc.splitTextToSize(bodyText, 180);
  doc.text(splitText, 15, 80);
  
  // Add more details as needed...
  doc.text(`Barua hii imetolewa leo, ${new Date().toLocaleDateString()}.`, 15, 120);

  // === Footer with Signature and Stamp area ===
  doc.line(15, 250, 195, 250); // Footer line
  doc.text('Afisa Mtendaji', 15, 260);
  doc.text('Sahihi na Muhuri:', 140, 260);

  // Save the PDF
  doc.save(`barua_utambulisho_${userData.name}.pdf`);
};