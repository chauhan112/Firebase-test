// src/main.ts

import "./style.css";
import { db } from "./firebaseConfig";
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// --- TypeScript Interface ---
// Defines the structure of our Info object
interface Info {
    id: string;
    text: string;
    createdAt: Date;
}

// --- DOM Element References ---
const infoForm = document.querySelector<HTMLFormElement>("#info-form")!;
const infoInput = document.querySelector<HTMLInputElement>("#info-input")!;
const infoList = document.querySelector<HTMLDivElement>("#info-list")!;

// --- Firestore Collection Reference ---
const infosCollectionRef = collection(db, "infos");

// --- Render Function ---
// Renders the list of infos to the DOM
const renderInfos = (infos: Info[]) => {
    infoList.innerHTML = ""; // Clear the list first

    if (infos.length === 0) {
        infoList.innerHTML =
            '<p class="text-gray-500">No information yet. Add one!</p>';
        return;
    }

    infos.forEach((info) => {
        const infoElement = document.createElement("div");
        infoElement.className =
            "flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm";

        const textElement = document.createElement("span");
        textElement.textContent = info.text;
        textElement.className = "text-gray-800";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className =
            "bg-red-500 text-white text-sm py-1 px-3 rounded-md hover:bg-red-600 transition-colors";
        deleteButton.dataset.id = info.id; // Store the ID on the button

        infoElement.appendChild(textElement);
        infoElement.appendChild(deleteButton);
        infoList.appendChild(infoElement);
    });
};

// --- Real-time Data Listener (onSnapshot) ---
// This is the magic! It listens for any changes in the 'infos' collection.
const q = query(infosCollectionRef, orderBy("createdAt", "desc")); // Order by newest first

onSnapshot(q, (snapshot) => {
    const infos: Info[] = [];
    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        infos.push({
            id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate(), // Convert Firestore Timestamp to JS Date
        });
    });
    renderInfos(infos);
});

// --- Event Listener for Adding New Info ---
infoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newInfoText = infoInput.value.trim();

    if (newInfoText) {
        try {
            await addDoc(infosCollectionRef, {
                text: newInfoText,
                createdAt: serverTimestamp(), // Use server time for consistency
            });
            infoInput.value = ""; // Clear the input
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to add info. Please try again.");
        }
    }
});

// --- Event Listener for Deleting Info (Event Delegation) ---
infoList.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    if (target.tagName === "BUTTON" && target.dataset.id) {
        const docId = target.dataset.id;
        const docRef = doc(db, "infos", docId);

        try {
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete info. Please try again.");
        }
    }
});
