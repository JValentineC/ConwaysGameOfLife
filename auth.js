// Authentication system using Local Storage
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  // Initialize authentication system
  init() {
    this.loadCurrentUser();
    this.createAuthUI();
    this.setupEventListeners();
    this.updateUI();

    // Skip tutorial if user is already logged in
    if (this.isAuthenticated()) {
      this.skipTutorial();
    }
  }

  // Load current user from localStorage
  loadCurrentUser() {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  // Save current user to localStorage
  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }

  // Get all users from localStorage
  getAllUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : {};
  }

  // Save all users to localStorage
  saveAllUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Register a new user
  register(username, password, email = "") {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const users = this.getAllUsers();

    if (users[username]) {
      throw new Error("Username already exists");
    }

    // Create new user
    const newUser = {
      username,
      password: this.hashPassword(password), // Simple hash for demo
      email,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      gameStats: {
        gamesPlayed: 0,
        totalTicks: 0,
        favoritePatterns: [],
      },
    };

    users[username] = newUser;
    this.saveAllUsers(users);

    return { success: true, message: "User registered successfully" };
  }

  // Login user
  login(username, password) {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const users = this.getAllUsers();
    const user = users[username];

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error("Invalid password");
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[username] = user;
    this.saveAllUsers(users);

    // Set current user
    this.currentUser = { ...user };
    this.saveCurrentUser();

    return {
      success: true,
      message: "Login successful",
      user: this.currentUser,
    };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
    this.updateUI();
    return { success: true, message: "Logged out successfully" };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Update user profile
  updateProfile(updates) {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const users = this.getAllUsers();
    const username = this.currentUser.username;

    if (!users[username]) {
      throw new Error("User not found");
    }

    // Update allowed fields
    const allowedFields = ["email"];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        users[username][field] = updates[field];
        this.currentUser[field] = updates[field];
      }
    });

    this.saveAllUsers(users);
    this.saveCurrentUser();

    return { success: true, message: "Profile updated successfully" };
  }

  // Change password
  changePassword(currentPassword, newPassword) {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    const users = this.getAllUsers();
    const username = this.currentUser.username;
    const user = users[username];

    if (user.password !== this.hashPassword(currentPassword)) {
      throw new Error("Current password is incorrect");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    user.password = this.hashPassword(newPassword);
    users[username] = user;
    this.saveAllUsers(users);

    return { success: true, message: "Password changed successfully" };
  }

  // Update game statistics
  updateGameStats(stats) {
    if (!this.isAuthenticated()) {
      return;
    }

    const users = this.getAllUsers();
    const username = this.currentUser.username;

    if (users[username]) {
      Object.assign(users[username].gameStats, stats);
      this.currentUser.gameStats = users[username].gameStats;
      this.saveAllUsers(users);
      this.saveCurrentUser();
    }
  }

  // Simple password hashing (for demo purposes - use proper hashing in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Create authentication UI
  createAuthUI() {
    // Create auth container
    const authContainer = document.createElement("div");
    authContainer.id = "auth-container";
    authContainer.innerHTML = `
      <div id="auth-panel" class="auth-panel">
        <div id="user-info" class="user-info" style="display: none;">
          <div class="user-header">
            <span id="username-display"></span>
            <button id="minimize-auth" class="minimize-btn" title="Minimize">−</button>
          </div>
          <div id="user-actions" class="user-actions">
            <button id="logout-btn" class="auth-btn">Logout</button>
            <button id="profile-btn" class="auth-btn">Profile</button>
          </div>
        </div>
        
        <div id="auth-forms" class="auth-forms">
          <div class="auth-toggle">
            <button id="login-tab" class="auth-tab active">Login</button>
            <button id="register-tab" class="auth-tab">Register</button>
          </div>
          
          <form id="login-form" class="auth-form">
            <h3>Login</h3>
            <input type="text" id="login-username" placeholder="Username" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit" class="auth-btn">Login</button>
          </form>
          
          <form id="register-form" class="auth-form" style="display: none;">
            <h3>Register</h3>
            <input type="text" id="register-username" placeholder="Username" required>
            <input type="email" id="register-email" placeholder="Email (optional)">
            <input type="password" id="register-password" placeholder="Password" required>
            <input type="password" id="register-confirm" placeholder="Confirm Password" required>
            <button type="submit" class="auth-btn">Register</button>
          </form>
        </div>
      </div>

      <!-- Profile Modal -->
      <dialog id="profile-modal" class="modal">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="text-lg font-bold">User Profile</h3>
          <div class="profile-content">
            <div class="profile-info">
              <p><strong>Username:</strong> <span id="profile-username"></span></p>
              <p><strong>Email:</strong> <span id="profile-email"></span></p>
              <p><strong>Member since:</strong> <span id="profile-created"></span></p>
              <p><strong>Last login:</strong> <span id="profile-lastlogin"></span></p>
            </div>
            
            <div class="game-stats">
              <h4>Game Statistics</h4>
              <p><strong>Games played:</strong> <span id="stats-games"></span></p>
              <p><strong>Total ticks:</strong> <span id="stats-ticks"></span></p>
            </div>
            
            <div class="profile-actions">
              <button id="change-password-btn" class="btn">Change Password</button>
              <button id="update-email-btn" class="btn">Update Email</button>
            </div>
          </div>
        </div>
      </dialog>

      <!-- Change Password Modal -->
      <dialog id="change-password-modal" class="modal">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="text-lg font-bold">Change Password</h3>
          <form id="change-password-form">
            <input type="password" id="current-password" placeholder="Current Password" required>
            <input type="password" id="new-password" placeholder="New Password" required>
            <input type="password" id="confirm-new-password" placeholder="Confirm New Password" required>
            <button type="submit" class="btn">Change Password</button>
          </form>
        </div>
      </dialog>

      <!-- Update Email Modal -->
      <dialog id="update-email-modal" class="modal">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 class="text-lg font-bold">Update Email</h3>
          <form id="update-email-form">
            <input type="email" id="new-email" placeholder="New Email" required>
            <button type="submit" class="btn">Update Email</button>
          </form>
        </div>
      </dialog>
    `;

    // Insert at the beginning of body
    document.body.insertBefore(authContainer, document.body.firstChild);
  }

  // Setup event listeners
  setupEventListeners() {
    // Tab switching
    document
      .getElementById("login-tab")
      .addEventListener("click", () => this.showLoginForm());
    document
      .getElementById("register-tab")
      .addEventListener("click", () => this.showRegisterForm());

    // Form submissions
    document
      .getElementById("login-form")
      .addEventListener("submit", (e) => this.handleLogin(e));
    document
      .getElementById("register-form")
      .addEventListener("submit", (e) => this.handleRegister(e));

    // User actions
    document
      .getElementById("logout-btn")
      .addEventListener("click", () => this.handleLogout());
    document
      .getElementById("profile-btn")
      .addEventListener("click", () => this.showProfile());

    // Minimize/expand auth panel
    document
      .getElementById("minimize-auth")
      .addEventListener("click", () => this.toggleAuthPanel());

    // Profile actions
    document
      .getElementById("change-password-btn")
      .addEventListener("click", () => this.showChangePassword());
    document
      .getElementById("update-email-btn")
      .addEventListener("click", () => this.showUpdateEmail());
    document
      .getElementById("change-password-form")
      .addEventListener("submit", (e) => this.handleChangePassword(e));
    document
      .getElementById("update-email-form")
      .addEventListener("submit", (e) => this.handleUpdateEmail(e));
  }

  // Show login form
  showLoginForm() {
    document.getElementById("login-tab").classList.add("active");
    document.getElementById("register-tab").classList.remove("active");
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
  }

  // Show register form
  showRegisterForm() {
    document.getElementById("register-tab").classList.add("active");
    document.getElementById("login-tab").classList.remove("active");
    document.getElementById("register-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
  }

  // Handle login form submission
  handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
      const result = this.login(username, password);
      this.showMessage(result.message, "success");
      this.updateUI();
      document.getElementById("login-form").reset();

      // Skip tutorial for newly logged in users
      this.skipTutorial();
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Handle register form submission
  handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm").value;

    if (password !== confirmPassword) {
      this.showMessage("Passwords do not match", "error");
      return;
    }

    try {
      const result = this.register(username, password, email);
      this.showMessage(result.message, "success");
      this.showLoginForm();
      document.getElementById("register-form").reset();
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Handle logout
  handleLogout() {
    const result = this.logout();
    this.showMessage(result.message, "success");
  }

  // Show profile modal
  showProfile() {
    if (!this.isAuthenticated()) return;

    const user = this.currentUser;
    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-email").textContent =
      user.email || "Not provided";
    document.getElementById("profile-created").textContent = new Date(
      user.createdAt
    ).toLocaleDateString();
    document.getElementById("profile-lastlogin").textContent = user.lastLogin
      ? new Date(user.lastLogin).toLocaleString()
      : "Never";
    document.getElementById("stats-games").textContent =
      user.gameStats.gamesPlayed;
    document.getElementById("stats-ticks").textContent =
      user.gameStats.totalTicks;

    document.getElementById("profile-modal").showModal();
  }

  // Show change password modal
  showChangePassword() {
    document.getElementById("change-password-modal").showModal();
  }

  // Show update email modal
  showUpdateEmail() {
    document.getElementById("update-email-modal").showModal();
  }

  // Handle change password
  handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById(
      "confirm-new-password"
    ).value;

    if (newPassword !== confirmPassword) {
      this.showMessage("New passwords do not match", "error");
      return;
    }

    try {
      const result = this.changePassword(currentPassword, newPassword);
      this.showMessage(result.message, "success");
      document.getElementById("change-password-modal").close();
      document.getElementById("change-password-form").reset();
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Handle update email
  handleUpdateEmail(e) {
    e.preventDefault();
    const newEmail = document.getElementById("new-email").value;

    try {
      const result = this.updateProfile({ email: newEmail });
      this.showMessage(result.message, "success");
      document.getElementById("update-email-modal").close();
      document.getElementById("update-email-form").reset();
      this.showProfile(); // Refresh profile display
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Update UI based on authentication state
  updateUI() {
    const userInfo = document.getElementById("user-info");
    const authForms = document.getElementById("auth-forms");
    const usernameDisplay = document.getElementById("username-display");
    const authContainer = document.getElementById("auth-container");

    if (this.isAuthenticated()) {
      userInfo.style.display = "block";
      authForms.style.display = "none";
      usernameDisplay.textContent = `Welcome, ${this.currentUser.username}!`;

      // Check if auth panel was minimized
      if (!authContainer.classList.contains("minimized")) {
        // Auto-minimize on login for better UX
        setTimeout(() => {
          this.toggleAuthPanel();
        }, 2000); // Auto minimize after 2 seconds
      }
    } else {
      userInfo.style.display = "none";
      authForms.style.display = "block";
      // Remove minimized state when not authenticated
      authContainer.classList.remove("minimized");
    }
  }

  // Toggle auth panel between minimized and expanded states
  toggleAuthPanel() {
    const authContainer = document.getElementById("auth-container");
    const userActions = document.getElementById("user-actions");
    const minimizeBtn = document.getElementById("minimize-auth");

    if (authContainer.classList.contains("minimized")) {
      // Expand
      authContainer.classList.remove("minimized");
      userActions.style.display = "block";
      minimizeBtn.textContent = "−";
      minimizeBtn.title = "Minimize";
    } else {
      // Minimize
      authContainer.classList.add("minimized");
      userActions.style.display = "none";
      minimizeBtn.textContent = "+";
      minimizeBtn.title = "Expand";
    }
  }

  // Skip tutorial for logged-in users
  skipTutorial() {
    // Check if game variables exist (game.js loaded)
    if (typeof isInTutorialMode !== "undefined") {
      isInTutorialMode = false;

      // Enable controls if they exist
      if (typeof enableControls === "function") {
        enableControls();
      }

      // Close welcome modal if it exists
      const welcomeModal = document.getElementById("welcome_modal");
      if (welcomeModal && welcomeModal.hasAttribute("open")) {
        welcomeModal.close();
      }
    } else {
      // Game not loaded yet, wait for it
      setTimeout(() => this.skipTutorial(), 100);
    }
  }

  // Show message to user
  showMessage(message, type = "info") {
    // Create or get message container
    let messageContainer = document.getElementById("message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      messageContainer.className = "message-container";
      document.body.appendChild(messageContainer);
    }

    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }

  // Increment game played counter
  incrementGamesPlayed() {
    if (this.isAuthenticated()) {
      this.updateGameStats({
        gamesPlayed: this.currentUser.gameStats.gamesPlayed + 1,
      });
    }
  }

  // Update total ticks
  addTicks(ticks) {
    if (this.isAuthenticated()) {
      this.updateGameStats({
        totalTicks: this.currentUser.gameStats.totalTicks + ticks,
      });
    }
  }
}

// Initialize authentication system when the page loads
let authSystem;
document.addEventListener("DOMContentLoaded", () => {
  authSystem = new AuthSystem();
});
