import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
export const firebaseConfig = {
    apiKey: "AIzaSyCHzKeTsZ43c86z4y6cvbZDOtNxnl0CM7U",
    authDomain: "tgbot-cc51a.firebaseapp.com",
    projectId: "tgbot-cc51a",
    storageBucket: "tgbot-cc51a.appspot.com",
    messagingSenderId: "42637878178",
    appId: "1:42637878178:web:129d927716a8ee291288fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };