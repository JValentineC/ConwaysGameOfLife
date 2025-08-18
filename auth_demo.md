# Authentication System Demo

This document demonstrates how to use the authentication system implemented in your Conway's Game of Life project.

## Features

### 1. User Registration

- Create new user accounts with username and password
- Email field is optional
- Password must be at least 6 characters
- Username must be at least 3 characters
- Validates that usernames are unique

### 2. User Login

- Login with username and password
- Remembers user session using localStorage
- Updates last login timestamp

### 3. User Profile Management

- View user profile information
- Change password with current password verification
- Update email address
- View game statistics (games played, total ticks)

### 4. Session Management

- Automatic session persistence across browser sessions
- Logout functionality
- Authentication state management

### 5. Game Integration

- Tracks number of games played
- Tracks total ticks across all games
- Only tracks stats for authenticated users

## How to Use

### Registration

1. Open the Game of Life application
2. Look for the authentication panel in the top-right corner
3. Click "Register" tab
4. Enter username, email (optional), and password
5. Confirm password
6. Click "Register" button

### Login

1. Click "Login" tab in the authentication panel
2. Enter your username and password
3. Click "Login" button

### Profile Management

1. Once logged in, click "Profile" button
2. View your information and game statistics
3. Use "Change Password" to update your password
4. Use "Update Email" to change your email address

### Logout

1. Click "Logout" button when logged in

## Technical Details

### Local Storage Structure

The authentication system stores data in the browser's localStorage:

```javascript
// Current user session
localStorage.currentUser = {
  username: "string",
  password: "hashed_string",
  email: "string",
  createdAt: "ISO_date_string",
  lastLogin: "ISO_date_string",
  gameStats: {
    gamesPlayed: number,
    totalTicks: number,
    favoritePatterns: [],
  },
};

// All users database
localStorage.users = {
  username1: {
    /* user object */
  },
  username2: {
    /* user object */
  },
  // ...
};
```

### API Methods

The `AuthSystem` class provides these methods:

```javascript
// Registration
authSystem.register(username, password, email);

// Login
authSystem.login(username, password);

// Logout
authSystem.logout();

// Check authentication
authSystem.isAuthenticated();

// Get current user
authSystem.getCurrentUser();

// Update profile
authSystem.updateProfile({ email: "new@email.com" });

// Change password
authSystem.changePassword(currentPassword, newPassword);

// Update game stats
authSystem.updateGameStats({ gamesPlayed: 1, totalTicks: 100 });

// Game tracking methods (called automatically)
authSystem.incrementGamesPlayed();
authSystem.addTicks(tickCount);
```

### Security Notes

- **This is a demo implementation using simple password hashing**
- **For production use, implement proper security measures:**
  - Use proper password hashing (bcrypt, scrypt, etc.)
  - Implement HTTPS
  - Add rate limiting
  - Use secure session management
  - Validate all inputs server-side
  - Implement proper error handling

## Example Usage

```javascript
// Initialize authentication system (done automatically)
const authSystem = new AuthSystem();

// Register a new user
try {
  const result = authSystem.register(
    "testuser",
    "password123",
    "test@example.com"
  );
  console.log(result.message); // "User registered successfully"
} catch (error) {
  console.error(error.message); // Handle registration errors
}

// Login
try {
  const result = authSystem.login("testuser", "password123");
  console.log(`Welcome ${result.user.username}!`);
} catch (error) {
  console.error(error.message); // Handle login errors
}

// Check if user is logged in
if (authSystem.isAuthenticated()) {
  console.log("User is logged in");
  const user = authSystem.getCurrentUser();
  console.log(`Logged in as: ${user.username}`);
}
```

## Customization

You can customize the authentication system by:

1. **Styling**: Modify the CSS classes in `styles.css`
2. **Validation**: Adjust password/username requirements in `auth.js`
3. **UI Elements**: Modify the HTML structure in the `createAuthUI()` method
4. **Game Integration**: Add more game statistics tracking
5. **Storage**: Replace localStorage with a backend API

## Browser Compatibility

The authentication system uses:

- localStorage (supported in all modern browsers)
- ES6+ features (Arrow functions, template literals, etc.)
- Modern CSS features

Ensure your target browsers support these features.
