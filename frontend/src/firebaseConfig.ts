import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6bpfQXM6riw-CYGxevrMXrx2F31p92F8",
  authDomain: "workflow-18357.firebaseapp.com",
  projectId: "workflow-18357",
  storageBucket: "workflow-18357.firebasestorage.app",
  messagingSenderId: "282368445454",
  appId: "1:282368445454:web:e02cee840ff4e671bf405f",
  measurementId: "G-C5W5FKXF9X"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };