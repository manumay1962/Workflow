// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6bpfQXM6riw-CYGxevrMXrx2F31p92F8",
  authDomain: "workflow-18357.firebaseapp.com",
  projectId: "workflow-18357",
  storageBucket: "workflow-18357.firebasestorage.app",
  messagingSenderId: "282368445454",
  appId: "1:282368445454:web:e02cee840ff4e671bf405f",
  measurementId: "G-C5W5FKXF9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



// Initialize Auth
const auth = getAuth(app);

// Initialize Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Export everything explicitly
export { auth, googleProvider, githubProvider };