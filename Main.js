// Global variables
let currentUser = null;
let timerInterval = null;
let timeRemaining = 24 * 60 * 60; // 24 hours in seconds
let userData = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app'); // Debug log
    
    loadUserData();
    
    // Check if user is already logged in
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('Found saved user, showing dashboard'); // Debug log
            showDashboard();
        }
    } catch (e) {
        console.error('Error loading saved user:', e);
    }

    // Add Enter key support for login
    const inputs = ['username', 'userid', 'password'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
    });
});

// Load user data from localStorage
function loadUserData() {
    try {
        const saved = localStorage.getItem('bountyHunterData');
        if (saved) {
            userData = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading user data:', e);
        userData = {};
    }
}

// Save user data to localStorage
function saveUserData() {
    try {
        localStorage.setItem('bountyHunterData', JSON.stringify(userData));
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}

// Handle login
function handleLogin() {
    try {
        const username = document.getElementById('username').value.trim();
        const userid = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value;

        console.log('Login attempt:', { username, userid, password }); // Debug log

        // Validate credentials
        if (userid === 'TheNewgen2.0.1' && password === 'TheNewgen' && username) {
            currentUser = {
                username: username,
                userid: userid,
                loginTime: Date.now()
            };
            
            // Initialize user data if not exists
            if (!userData[username]) {
                userData[username] = {
                    displayName: username,
                    completedBounties: 0,
                    totalPoints: 0,
                    lifetimePoints: 0,
                    pointsThisMonth: 0,
                    avatar: null,
                    timerStartTime: Date.now(),
                    keySubmitted: false,
                    rewardUnlocked: false
                };
                saveUserData();
            }
            
            try {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } catch (e) {
                console.error('LocalStorage error:', e);
            }
            
            console.log('Login successful, showing dashboard'); // Debug log
            showDashboard();
            hideLoginError();
        } else {
            console.log('Invalid credentials'); // Debug log
            showLoginError();
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError();
    }
}

// Show/hide login error
function showLoginError() {
    document.getElementById('loginError').style.display = 'block';
}

function hideLoginError() {
    document.getElementById('loginError').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    try {
        console.log('Attempting to show dashboard'); // Debug log
        
        const loginPage = document.getElementById('loginPage');
        const dashboard = document.getElementById('dashboard');
        
        if (loginPage && dashboard) {
            loginPage.style.display = 'none';
            dashboard.style.display = 'block';
            
            console.log('Dashboard elements found and display changed'); // Debug log
            
            updateUserInterface();
            startTimer();
            
            // Show instructions page by default
            setTimeout(() => {
                const instructionsPage = document.getElementById('instructionsPage');
                if (instructionsPage) {
                    instructionsPage.style.display = 'block';
                    console.log('Instructions page shown'); // Debug log
                }
            }, 100);
        } else {
            console.error('Dashboard elements not found:', { loginPage, dashboard });
        }
    } catch (error) {
        console.error('Error showing dashboard:', error);
    }
}

// Update user interface with current user data
function updateUserInterface() {
    const userInfo = userData[currentUser.username];
    
    document.getElementById('topUsername').textContent = userInfo.displayName;
    document.getElementById('displayName').textContent = userInfo.displayName;
    document.getElementById('completedBounties').textContent = userInfo.completedBounties;
    document.getElementById('totalPoints').textContent = userInfo.totalPoints;
    document.getElementById('currentPoints').textContent = userInfo.totalPoints;
    document.getElementById('lifetimePoints').textContent = userInfo.lifetimePoints;
    document.getElementById('pointsThisMonth').textContent = userInfo.pointsThisMonth;
    
    // Calculate average points per bounty
    const avgPoints = userInfo.completedBounties > 0 ? 
        Math.round(userInfo.lifetimePoints / userInfo.completedBounties) : 0;
    document.getElementById('averagePerBounty').textContent = avgPoints;
    
    // Update user level based on points
    const level = Math.floor(userInfo.totalPoints / 100) + 1;
    document.getElementById('userLevel').textContent = `Level ${level}`;
    
    // Update avatar if exists
    if (userInfo.avatar) {
        document.getElementById('userAvatar').innerHTML = `<img src="${userInfo.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }
}

// Start 24-hour timer
function startTimer() {
    const userInfo = userData[currentUser.username];
    const elapsed = Math.floor((Date.now() - userInfo.timerStartTime) / 1000);
    timeRemaining = Math.max(0, (24 * 60 * 60) - elapsed);
    
    if (timeRemaining > 0) {
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
    } else {
        document.getElementById('timerDisplay').textContent = "TIME EXPIRED";
        document.getElementById('timerDisplay').style.color = "#ff4757";
    }
}

// Update timer display
function updateTimer() {
    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timerDisplay').textContent = "TIME EXPIRED";
        document.getElementById('timerDisplay').style.color = "#ff4757";
        return;
    }
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    document.getElementById('timerDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timeRemaining--;
}

// Submit bounty key
function submitKey() {
    const key = document.getElementById('bountyKey').value.trim();
    const userInfo = userData[currentUser.username];
    
    if (timeRemaining <= 0) {
        document.getElementById('keyError').textContent = "Time has expired! Key submission no longer available.";
        document.getElementById('keyError').style.display = 'block';
        document.getElementById('keySuccess').style.display = 'none';
        return;
    }
    
    if (key && key.length >= 5) { // Simple key validation
        userInfo.keySubmitted = true;
        userInfo.rewardUnlocked = true;
        userInfo.completedBounties += 1;
        userInfo.totalPoints += 100;
        userInfo.lifetimePoints += 100;
        userInfo.pointsThisMonth += 100;
        
        saveUserData();
        updateUserInterface();
        
        document.getElementById('keySuccess').textContent = 
            `Key accepted! You've earned 100 points. Reward link: https://reward-portal.com/claim/${key}`;
        document.getElementById('keySuccess').style.display = 'block';
        document.getElementById('keyError').style.display = 'none';
        
        // Hide key input after successful submission
        document.querySelector('.key-input-section').style.opacity = '0.5';
        document.getElementById('bountyKey').disabled = true;
        document.querySelector('.submit-key-btn').disabled = true;
    } else {
        document.getElementById('keyError').textContent = "Please enter a valid key (minimum 5 characters).";
        document.getElementById('keyError').style.display = 'block';
        document.getElementById('keySuccess').style.display = 'none';
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Show different pages
function showPage(page) {
    // Hide all pages
    document.getElementById('instructionsPage').style.display = 'none';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    document.getElementById('pointsPage').style.display = 'none';
    
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    
    // Show selected page
    if (page === 'home') {
        document.getElementById('homePage').style.display = 'block';
        document.getElementById('pageTitle').textContent = 'Dashboard Overview';
    } else if (page === 'settings') {
        document.getElementById('settingsPage').style.display = 'block';
        document.getElementById('pageTitle').textContent = 'Account Settings';
        // Pre-fill current display name
        const userInfo = userData[currentUser.username];
        document.getElementById('newDisplayName').value = userInfo.displayName;
    } else if (page === 'points') {
        document.getElementById('pointsPage').style.display = 'block';
        document.getElementById('pageTitle').textContent = 'Bounty Points';
    }
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Save settings
function saveSettings() {
    const newDisplayName = document.getElementById('newDisplayName').value.trim();
    const userInfo = userData[currentUser.username];
    
    if (newDisplayName) {
        userInfo.displayName = newDisplayName;
        saveUserData();
        updateUserInterface();
        
        document.getElementById('settingsSuccess').style.display = 'block';
        setTimeout(() => {
            document.getElementById('settingsSuccess').style.display = 'none';
        }, 3000);
    }
}

// Upload avatar
function uploadAvatar() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const userInfo = userData[currentUser.username];
            userInfo.avatar = e.target.result;
            saveUserData();
            updateUserInterface();
        };
        reader.readAsDataURL(file);
    }
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
});

// Logout function (can be called from console or added as button)
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('userid').value = '';
    document.getElementById('password').value = '';
}

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        } else {
            card.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(0deg) translateZ(0px)';
        }
    });
});

// Add particle effect to background
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '2px';
    particle.style.height = '2px';
    particle.style.background = 'rgba(78, 205, 196, 0.6)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = '100vh';
    particle.style.zIndex = '-1';
    
    document.body.appendChild(particle);
    
    const animation = particle.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-100vh)', opacity: 0 }
    ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'linear'
    });
    
    animation.onfinish = () => particle.remove();
}

// Create particles periodically
setInterval(createParticle, 500);

// Easter egg: Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konami.join(',')) {
        // Easter egg: bonus points
        if (currentUser && userData[currentUser.username]) {
            userData[currentUser.username].totalPoints += 500;
            userData[currentUser.username].lifetimePoints += 500;
            saveUserData();
            updateUserInterface();
            
            // Show special message
            const bonus = document.createElement('div');
            bonus.innerHTML = '🎉 KONAMI CODE BONUS! +500 Points!';
            bonus.style.position = 'fixed';
            bonus.style.top = '50%';
            bonus.style.left = '50%';
            bonus.style.transform = 'translate(-50%, -50%)';
            bonus.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
            bonus.style.padding = '20px 40px';
            bonus.style.borderRadius = '20px';
            bonus.style.fontSize = '24px';
            bonus.style.fontWeight = 'bold';
            bonus.style.zIndex = '10000';
            bonus.style.animation = 'bounceIn 1s ease-out';
            
            document.body.appendChild(bonus);
            
            setTimeout(() => bonus.remove(), 3000);
        }
        konamiCode = [];
    }
});
