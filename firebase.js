// Firebase initializer: replace placeholders with your project config
(function () {
    // Add your Firebase config values here
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    };

    if (!window.firebase) {
        console.error('Firebase SDK not loaded. Make sure you included firebase-app and firestore scripts.');
        return;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        window.db = firebase.firestore();
    } catch (err) {
        console.error('Firebase initialization error', err);
    }
})();
