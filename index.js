// Data model simulation for login credentials (M.Sc. Note: use localStorage/API in production)
const CREDENTIALS = {
    'admin': { username: 'admin', password: 'password', role: 'admin' },
    'user1': { username: 'user1', password: 'user1', role: 'user' }
};

// Get required DOM elements
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');
const loginButton = document.querySelector('.btn-login');

// Create the freeze overlay element dynamically
const freezeOverlay = document.createElement('div');
freezeOverlay.classList.add('freeze-overlay');
document.body.appendChild(freezeOverlay);

// Password show/hide toggle
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.textContent = 'Hide';
            togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.textContent = 'Show';
            togglePasswordBtn.setAttribute('aria-label', 'Show password');
        }
    });
}

// --- HELPER FUNCTION: AUTHENTICATION ---
function authenticate(username, password, role) {
    // Determine which key to check in the CREDENTIALS object
    // Note: This is a highly simplified check for the project demo.
    const userKey = Object.keys(CREDENTIALS).find(key => 
        CREDENTIALS[key].username === username && CREDENTIALS[key].role === role
    );
    
    if (userKey && CREDENTIALS[userKey].password === password) {
        return { success: true, role: role };
    }
    return { success: false };
}

// --- MAIN EVENT LISTENER (The missing part that completes the logic) ---
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Stop default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const result = authenticate(username, password, role);

    if (result.success) {
        // --- 1. LOGIN SUCCESS: START FREEZE & PROCESS EFFECT ---
        
        messageElement.textContent = "";
        loginButton.textContent = "Processing...";
        loginButton.disabled = true;
        
        // Show the 'Freeze' overlay
        freezeOverlay.classList.add('active');

        // Simulate a heavy process taking up to 10 seconds
        const processTime = Math.random() * 5000 + 500; // Random time between 5s and 10s
        
        console.log(`Login successful. Simulating ${processTime/1000}s process...`);

        setTimeout(() => {
            // --- 2. BREAK THE EFFECT & REDIRECT ---
            
            // Hide the 'Freeze' effect
            freezeOverlay.classList.remove('active');
            
            // Store session info (for demonstration)
            localStorage.setItem('userRole', result.role);
            
            // Redirect based on role
            if (result.role === 'admin') {
                window.location.href = 'admin.html'; // Admin Dashboard
            } else {
                window.location.href = 'member.html'; // Member Dashboard
            }
            
        }, processTime);

    } else {
        // --- 3. LOGIN FAIL: SHAKE ANIMATION (User Attention) ---
        
        messageElement.textContent = "Invalid credentials or role selected. Try again.";
        
        // Add the shake class (requires the CSS added previously)
        loginButton.classList.add('shake-error');
        
        // Remove the shake class after the animation ends (600ms)
        setTimeout(() => {
            loginButton.classList.remove('shake-error');
        }, 600);
    }
});
