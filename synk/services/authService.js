// TODO: Create Firebase Auth Functions
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, where, doc, setDoc } from "firebase/firestore";

export const handlelogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log("logged in user: " + user.email);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
        });
}

export const handleregister = async (item) => {
    try {
        const { name, surname, email, password, userType } = item;

        if (!name || !surname || !email || !password || !userType) {
            throw new Error("All fields (name, surname, email, password, userType) are required");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            surname: surname,
            email: email,
            userType: userType
        });

        console.log("Signed up user: " + user.email);
        return true;
    } catch (e) {
        console.error("Error adding user: ", e.message);
        return false;
    }
};

export const handleSignOut = () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out successfully');
        })
        .catch((error) => {
            console.log('Error signing out:', error);
        });
}
