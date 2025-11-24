Firebase setup and troubleshooting (step-by-step)

This file explains how to configure Firebase for this project and how to diagnose common problems when Firestore functions "cannot" operate.

1) Create a Firebase project
- Visit https://console.firebase.google.com and create a new project.
- Enable Firestore in the project (choose Native mode) and create the following collections used by the app:
  - `members` (documents for each member)
  - `schemes` (optional metadata used by members)
  - `lists` (used by the dashboard Add List feature)

2) Create a Web App and copy its config
- In the Firebase console open Project Settings -> "Your apps" and add a new Web App.
- Copy the firebase config object (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

3) Add config to `firebase.js`
- Open `firebase.js` in the project root and replace the placeholder values with your real config values.
- Example `firebase.js` content (replace values):

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

4) Run the site locally from the project folder
- Start a simple static server (PowerShell):

```powershell
py -m http.server 8000
```
- Browse to: `http://localhost:8000/index.html`
- Login as admin (demo login in `index.js` is: username `admin`, password `password`, role `admin`).

5) Test Firestore reads/writes
- Go to `admin.html` and try to add a Member or a List.
- Open the browser console (F12) to watch for errors.

Common problems and fixes

A) "Firestore not initialized" or `db is undefined`
- Cause: `firebase.js` not loaded, or the SDK script tags are missing/blocked.
- Fix: Ensure your `index.html` and `admin.html` include the SDK scripts and then `firebase.js` before `db.js` and your app scripts. Confirm the files are accessible (open them in the browser address bar):
  - `http://localhost:8000/firebase.js`
  - `http://localhost:8000/db.js`
- If the SDK scripts are blocked by a content policy or network, allow them or download and serve them locally.

B) Permission / Permission-denied errors on reads or writes
- Cause: Firestore security rules prevent access. By default, new projects may block reads/writes.
- Fix (for testing): In the Firestore rules tab set rules to allow reads/writes temporarily:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

  - IMPORTANT: Do not leave this open in production. Instead implement Firebase Authentication and rules that check `request.auth.uid` or a custom admin flag.

C) Typed field errors (e.g., createdAt appears as object)
- Firestore may store timestamps as Firestore Timestamp objects. The UI converts them to Date in code. If you see errors, inspect `console.log` traces.

D) Collection not found or writes succeed but no documents visible in console
- Ensure you're looking at the correct project in the Firebase Console (projectId must match).
- Refresh the Firestore console and check that you're in the right region and database.

E) CORS or mixed content
- If you host the page over `https` and try to load scripts over `http`, browsers will block resources. Use matching protocols.

How to debug step-by-step when "it cannot function"
1. Open Developer Tools (F12) → Console and Network tabs.
2. Reload the page and look for 404s (missing files) or JS errors (red stack traces).
3. If you see `firebase is not defined` or similar, ensure the SDK script tags are present and loaded before `firebase.js`.
4. If you see `permission-denied`, open Firebase Console → Firestore → Rules and temporarily allow access to verify behavior.
5. Add `console.log` statements in `firebase.js` and `db.js` to confirm initialization and to inspect returned data.
6. If reads succeed but writes fail, check Firestore rules and check browser network request payloads for errors.

Production checklist (after testing)
- Replace open Firestore rules with secure rules.
- Use Firebase Authentication for user sign-in and enforce admin-only routes server-side or via rules.
- Consider migrating to the modular v9 Firebase SDK for tree-shaking and smaller bundles.

If you want, I can also:
- Create a sample Firestore seed script to create sample `members`, `schemes`, and `lists` documents.
- Migrate `firebase.js` + `db.js` to v9 modular SDK.
- Add UI indicators for loading and error messages for DB operations.

---
If you'd like I will now:
- 1) Patch UI so the module cards animate on hover and on entrance (done),
- 2) Replace inline Firebase initialization in `admin.html` with `firebase.js` (done) and ensure `firebase.js` contains instructions, or
- 3) Create a minimal seed script for Firestore so you can test immediately.

Tell me which next step you want me to take.
