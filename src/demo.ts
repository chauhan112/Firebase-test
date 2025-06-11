// src/main.ts (or any other logic file)

import "./style.css";
import { FirebaseModel } from "./FirebaseModel";

// --- Create an instance of our model ---
const dbModel = new FirebaseModel();

// --- EXAMPLE USAGE ---
async function runDemo() {
    console.log("--- Starting FirebaseModel Demo ---");

    // 1. ADD a user document
    const newUser = {
        name: "Alice",
        email: "alice@example.com",
        joined: new Date(),
    };
    const userId = await dbModel.addEntry(["users"], newUser);
    console.log(`Created user with ID: ${userId}`);

    // 2. CHECK if the user exists
    const userExists = await dbModel.exists(["users", userId]);
    console.log(`Does user ${userId} exist?`, userExists); // true

    // 3. READ the user's data
    const userData = await dbModel.readEntry(["users", userId]);
    console.log("User data:", userData);

    // 4. UPDATE the user's data
    console.log("Updating user's name...");
    await dbModel.updateEntry(["users", userId], { name: "Alice Smith" });
    const updatedUserData = await dbModel.readEntry(["users", userId]);
    console.log("Updated user data:", updatedUserData);

    // 5. ADD a document to a SUBCOLLECTION (a post by Alice)
    const post1Id = await dbModel.addEntry(
        ["users", userId, "posts"], // Path to the subcollection
        { title: "My first post!", content: "Hello, Firestore!" }
    );
    console.log(`Added post with ID: ${post1Id}`);

    const post2Id = await dbModel.addEntry(["users", userId, "posts"], {
        title: "Subcollections are cool",
        content: "This is powerful.",
    });
    console.log(`Added another post with ID: ${post2Id}`);

    // 6. GET KEYS from the subcollection
    const postKeys = await dbModel.get_keys(["users", userId, "posts"]);
    console.log("All post IDs for this user:", postKeys); // [post1Id, post2Id]

    // 7. READ a single post from the subcollection
    const firstPostData = await dbModel.readEntry([
        "users",
        userId,
        "posts",
        post1Id,
    ]);
    console.log("First post data:", firstPostData);

    // 8. DELETE the second post
    console.log(`Deleting post ${post2Id}...`);
    await dbModel.deleteEntry(["users", userId, "posts", post2Id]);

    // Verify deletion by getting keys again
    const remainingPostKeys = await dbModel.get_keys([
        "users",
        userId,
        "posts",
    ]);
    console.log("Remaining post IDs:", remainingPostKeys); // [post1Id]

    // 9. CLEANUP: Delete the user document (this will NOT delete the subcollection)
    // NOTE: In a real app, you would need a Cloud Function to delete subcollections recursively.
    console.log(`Cleaning up user ${userId}...`);
    await dbModel.deleteEntry(["users", userId]);
    const userExistsAfterDelete = await dbModel.exists(["users", userId]);
    console.log(`Does user ${userId} exist now?`, userExistsAfterDelete); // false

    console.log("--- Demo Finished ---");
}

// Run the demo when the app loads
runDemo().catch(console.error);
