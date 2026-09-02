import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyANtxY3x9sY65sEiXxf_foXw1WH96w7h38",
  authDomain: "phonestore-ed0c7.firebaseapp.com",
  projectId: "phonestore-ed0c7",
  storageBucket: "phonestore-ed0c7.firebasestorage.app",
  messagingSenderId: "170228882289",
  appId: "1:170228882289:web:55ddac39850a12475074d0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

//extra
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyANtxY3x9sY65sEiXxf_foXw1WH96w7h38",
//   authDomain: "phonestore-ed0c7.firebaseapp.com",
//   projectId: "phonestore-ed0c7",
//   storageBucket: "phonestore-ed0c7.firebasestorage.app",
//   messagingSenderId: "170228882289",
//   appId: "1:170228882289:web:55ddac39850a12475074d0"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);