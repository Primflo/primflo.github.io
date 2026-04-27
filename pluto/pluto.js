// ========= LOGIN LOGIC =========
const VALID_USER = "admin";
const VALID_PASS = "admin123";

// Check existing session
if (localStorage.getItem('isPlutoLoggedIn') === 'true') {
    window.location.href = '../pluto.html';
}

const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('errorMessage');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (username === VALID_USER && password === VALID_PASS) {
            localStorage.setItem('isPlutoLoggedIn', 'true');
            window.location.href = '../pluto.html';
        } else {
            errorDiv.textContent = '❌ Access Denied';
            errorDiv.style.display = 'block';
            document.getElementById('password').value = '';
            const wrapper = document.querySelector('.wrapper');
            wrapper.style.transform = 'translate(-50%, -50%) translateX(4px)';
            setTimeout(() => { wrapper.style.transform = 'translate(-50%, -50%)'; }, 100);
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 2500);
        }
    });
}