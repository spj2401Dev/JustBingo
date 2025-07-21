import { apiService } from '../modules/ApiService.mjs';

class AdminApp {
    constructor() {
        this.isAuthenticated = false;
        this.wordsContainer = null;
        this.saveButton = null;
        this.addWordButton = null;
        this.exportButton = null;
        this.importButton = null;
        this.fileInput = null;
        this.currentTab = 'words';
        this.userManagementSetup = false;
    }

    async initialize() {
        try {
            // Initialize API service
            await apiService.initialize();
            
            // Check if we need authentication (only for PocketBase)
            if (apiService.isUsingPocketBase()) {
                await this.handleAuthentication();
            } else {
                // For backend, show admin interface directly (basic auth handled by server)
                this.showAdminInterface();
                await this.initializeAdminInterface();
            }
        } catch (error) {
            console.error('Failed to initialize admin app:', error);
            this.showError('Failed to initialize application');
        }
    }

    async handleAuthentication() {
        const loginScreen = document.getElementById('login-screen');
        const adminInterface = document.getElementById('admin-interface');
        
        // Check if already authenticated
        if (apiService.isAuthenticated()) {
            this.showAdminInterface();
            await this.initializeAdminInterface();
            return;
        }

        // Show login screen
        loginScreen.style.display = 'flex';
        adminInterface.style.display = 'none';

        // Setup login handlers
        this.setupLoginHandlers();
    }

    setupLoginHandlers() {
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        // Email/Password login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEmailLogin();
        });

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    async handleEmailLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            errorDiv.style.display = 'none';
            await apiService.login(email, password);
            this.showAdminInterface();
            await this.initializeAdminInterface();
        } catch (error) {
            console.error('Login failed:', error);
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        apiService.logout();
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-interface').style.display = 'none';
    }

    showAdminInterface() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-interface').style.display = 'block';
        
        // Update user display
        const userDisplay = document.getElementById('user-display');
        const currentUser = apiService.getCurrentUser();
        if (currentUser) {
            userDisplay.textContent = currentUser.email || currentUser.username || 'Admin User';
        } else {
            userDisplay.textContent = 'Admin User';
        }
        
        this.isAuthenticated = true;
    }

    async initializeAdminInterface() {
        // Get DOM elements
        this.wordsContainer = document.getElementById('words-container');
        this.saveButton = document.getElementById('save-button');
        this.addWordButton = document.getElementById('add-word-button');
        this.exportButton = document.getElementById('export-button');
        this.importButton = document.getElementById('import-button');
        this.fileInput = document.getElementById('file-input');

        // Setup event listeners
        this.setupAdminEventListeners();
        
        // Setup tabs
        this.setupTabs();

        // Load existing words
        try {
            const words = await apiService.getAdminWords();
            if (words.length === 0) {
                this.displayNoWordsMessage();
            } else {
                words.forEach(wordObj => this.addWordField(wordObj.word, wordObj.type, wordObj.time));
            }
        } catch (error) {
            this.handleFetchError(error);
        }
    }

    setupAdminEventListeners() {
        // Add word button
        this.addWordButton.addEventListener('click', () => this.addWordField());

        // Save button
        this.saveButton.addEventListener('click', async () => {
            await this.saveWords();
        });

        // Export button
        this.exportButton.addEventListener('click', () => {
            this.exportWords();
        });

        // Import button
        this.importButton.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input
        this.fileInput.addEventListener('change', async () => {
            await this.importWords();
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    displayNoWordsMessage() {
        this.wordsContainer.innerHTML = '<p>No words found.</p>';
    }

    handleFetchError(error) {
        console.error('Error fetching words:', error);
        this.wordsContainer.innerHTML = '<p>Error loading words. Please try again later.</p>';
    }

    addWordField(value = '', type = 'Field', time = '') {
        const container = document.createElement('div');
        container.className = 'word-field-container';

        const timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.placeholder = 'Sec';
        timeInput.className = 'time-field';
        timeInput.value = time;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = value;
        inputField.className = 'word-field';

        const typeDropdown = document.createElement('select');
        const options = ['Field', 'Free', 'Timer'];
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (option === type) opt.selected = true;
            typeDropdown.appendChild(opt);
        });

        typeDropdown.className = 'word-type';

        typeDropdown.addEventListener('change', () => {
            if (typeDropdown.value === 'Timer') {
                timeInput.style.display = 'block';
            } else {
                timeInput.style.display = 'none';
            }
        });

        // Set initial visibility based on type
        timeInput.style.display = type === 'Timer' ? 'block' : 'none';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.addEventListener('click', () => {
            container.remove();
        });

        container.appendChild(timeInput);
        container.appendChild(inputField);
        container.appendChild(typeDropdown);
        container.appendChild(removeButton);
        this.wordsContainer.appendChild(container);
    }

    async saveWords() {
        const updatedWords = Array.from(document.querySelectorAll('.word-field-container')).map(container => {
            return {
                word: container.querySelector('.word-field').value,
                type: container.querySelector('.word-type').value,
                time: container.querySelector('.time-field').style.display === 'block' ? container.querySelector('.time-field').value : null
            };
        });

        try {
            await apiService.saveWords(updatedWords);
            this.displaySaveSuccess();
        } catch (error) {
            this.handleSaveError(error);
        }
    }

    displaySaveSuccess() {
        this.saveButton.textContent = 'Saved...';
        setTimeout(() => {
            this.saveButton.textContent = 'Save Words';
        }, 3000);
    }

    handleSaveError(error) {
        console.error('Error saving words:', error);
        alert('Failed to save words. Please try again.');
    }

    exportWords() {
        const words = Array.from(document.querySelectorAll('.word-field-container')).map(container => {
            return {
                word: container.querySelector('.word-field').value,
                type: container.querySelector('.word-type').value,
                time: container.querySelector('.time-field').style.display === 'block' ? container.querySelector('.time-field').value : null
            };
        });

        const blob = new Blob([JSON.stringify({ words }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'words.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async importWords() {
        const file = this.fileInput.files[0];
        if (file) {
            try {
                const content = await file.text();
                const json = JSON.parse(content);

                if (this.isValidWordData(json)) {
                    this.wordsContainer.innerHTML = '';
                    json.words.forEach(wordObj => this.addWordField(wordObj.word, wordObj.type, wordObj.time));
                } else {
                    alert('Invalid JSON format. Please provide a valid words file.');
                }
            } catch (error) {
                console.error('Error importing JSON:', error);
                alert('Failed to import JSON. Please check the file and try again.');
            }
        }
    }

    isValidWordData(data) {
        return Array.isArray(data.words) && data.words.every(word => 
            typeof word === 'object' && 
            typeof word.word === 'string' && 
            typeof word.type === 'string' && 
            (typeof word.time === 'string' || word.time === null)
        );
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }

    setupTabs() {
        const wordsTab = document.getElementById('words-tab');
        const usersTab = document.getElementById('users-tab');
        const wordsSection = document.getElementById('words-section');
        const usersSection = document.getElementById('users-section');

        // Show users tab only for PocketBase
        if (apiService.isUsingPocketBase()) {
            usersTab.style.display = 'block';
        }

        wordsTab.addEventListener('click', () => {
            this.switchTab('words');
        });

        usersTab.addEventListener('click', () => {
            this.switchTab('users');
        });
    }

    switchTab(tab) {
        const wordsTab = document.getElementById('words-tab');
        const usersTab = document.getElementById('users-tab');
        const wordsSection = document.getElementById('words-section');
        const usersSection = document.getElementById('users-section');

        // Update active tab
        wordsTab.classList.toggle('active', tab === 'words');
        usersTab.classList.toggle('active', tab === 'users');

        // Update visible section
        wordsSection.classList.toggle('active', tab === 'words');
        usersSection.classList.toggle('active', tab === 'users');

        this.currentTab = tab;

        // Load users if switching to users tab
        if (tab === 'users' && apiService.isUsingPocketBase()) {
            // Set up user management event listeners first
            if (!this.userManagementSetup) {
                this.setupUserManagement();
                this.userManagementSetup = true;
            }
            // Then load the users
            this.loadUsers();
        }
    }

    setupUserManagement() {
        const addUserButton = document.getElementById('add-user-button');
        const refreshUsersButton = document.getElementById('refresh-users-button');
        const createUserButton = document.getElementById('create-user-button');
        const cancelUserButton = document.getElementById('cancel-user-button');

        if (!addUserButton) return; // Elements might not exist yet

        addUserButton.addEventListener('click', () => {
            this.showAddUserForm();
        });

        refreshUsersButton.addEventListener('click', () => {
            this.loadUsers();
        });

        createUserButton.addEventListener('click', () => {
            this.createUser();
        });

        cancelUserButton.addEventListener('click', () => {
            this.hideAddUserForm();
        });
    }

    async loadUsers() {
        if (!apiService.isUsingPocketBase()) return;

        try {
            const users = await apiService.getUsers();
            this.displayUsers(users);
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError('Failed to load users: ' + error.message);
        }
    }

    displayUsers(users) {
        const usersContainer = document.getElementById('users-container');
        usersContainer.innerHTML = '';

        if (users.length === 0) {
            usersContainer.innerHTML = '<p>No users found.</p>';
            return;
        }

        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            const verifiedBadge = user.verified ? 
                '<span style="color: #28a745; font-size: 12px;">✓ Verified</span>' : 
                '<span style="color: #dc3545; font-size: 12px;">⚠ Unverified</span>';
            
            const createdDate = new Date(user.created).toLocaleDateString();
            
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-email">${user.email} ${verifiedBadge}</div>
                    <div class="user-name">${user.name || 'No name set'} • Created: ${createdDate}</div>
                </div>
                <div class="user-actions">
                    <button class="user-delete-btn" onclick="window.adminApp.deleteUser('${user.id}', '${user.email}')">Delete</button>
                </div>
            `;
            usersContainer.appendChild(userItem);
        });
    }

    showAddUserForm() {
        const form = document.getElementById('add-user-form');
        form.style.display = 'block';
        
        // Clear form fields
        document.getElementById('new-user-email').value = '';
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-password').value = '';
        document.getElementById('new-user-password-confirm').value = '';
    }

    hideAddUserForm() {
        const form = document.getElementById('add-user-form');
        form.style.display = 'none';
    }

    async createUser() {
        const email = document.getElementById('new-user-email').value;
        const name = document.getElementById('new-user-name').value;
        const password = document.getElementById('new-user-password').value;
        const passwordConfirm = document.getElementById('new-user-password-confirm').value;

        if (!email || !password) {
            this.showError('Email and password are required');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        try {
            // Create user with clean data structure
            const userData = {
                email,
                password,
                passwordConfirm,
                emailVisibility: true
            };

            // Add name only if provided
            if (name && name.trim()) {
                userData.name = name.trim();
            }

            console.log('Creating user:', email);
            const newUser = await apiService.createUser(userData);
            console.log('User created successfully:', newUser.id);

            // Try to verify user if we're a superuser
            if (apiService.isSuperuser()) {
                try {
                    await apiService.updateUser(newUser.id, { verified: true });
                    console.log('User verified successfully');
                } catch (verifyError) {
                    console.warn('Could not verify user:', verifyError.message);
                }
            }

            this.hideAddUserForm();
            await this.loadUsers();
            this.showSuccess('User created successfully');
        } catch (error) {
            console.error('Failed to create user:', error);
            
            let errorMessage = 'Failed to create user';
            if (error.data?.email) {
                errorMessage = 'Email error: ' + error.data.email.message;
            } else if (error.data?.password) {
                errorMessage = 'Password error: ' + error.data.password.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        }
    }

    async deleteUser(userId, userEmail) {
        if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
            return;
        }

        try {
            await apiService.deleteUser(userId);
            this.loadUsers();
            this.showSuccess('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            this.showError('Failed to delete user: ' + error.message);
        }
    }

    showSuccess(message) {
        console.log(message);
        // Could show a toast here
        alert(message);
    }
}

// Initialize the admin app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.adminApp = new AdminApp();
    await window.adminApp.initialize();
});
