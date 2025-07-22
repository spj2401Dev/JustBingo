import { apiService } from '../modules/ApiService.js';
import { WordFieldManager } from './modules/fields/index.js';

class FeatureManager {
    constructor(apiService) {
        this.apiService = apiService;
    }

    hasAuthentication() {
        return this.apiService.isUsingPocketBase();
    }

    hasUserManagement() {
        return this.apiService.isUsingPocketBase();
    }

    requiresLogin() {
        return this.apiService.isUsingPocketBase();
    }

    hasLogout() {
        return this.apiService.isUsingPocketBase();
    }
}

class AdminApp {
    constructor() {
        this.isAuthenticated = false;
        this.wordsContainer = null;
        this.wordFieldManager = null;
        this.saveButton = null;
        this.addWordButton = null;
        this.exportButton = null;
        this.importButton = null;
        this.fileInput = null;
        this.currentTab = 'words';
        this.userManagementSetup = false;
        this.featureManager = null;
    }

    async initialize() {
        try {
            await apiService.initialize();
            this.featureManager = new FeatureManager(apiService);
            
            this.setupUIBasedOnFeatures();
            
            if (this.featureManager.requiresLogin()) {
                await this.handleAuthentication();
            } else {
                this.showAdminInterface();
                await this.initializeAdminInterface();
            }
        } catch (error) {
            console.error('Failed to initialize admin app:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupUIBasedOnFeatures() {
        const loginScreen = document.getElementById('login-screen');
        const adminInterface = document.getElementById('admin-interface');
        
        if (!this.featureManager.hasAuthentication()) {
            loginScreen.style.display = 'none';
        }

        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.querySelector('.user-info');
        if (!this.featureManager.hasLogout()) {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) {
                // Keep dropdown structure but hide logout button
                userInfo.innerHTML = `
                    <div class="user-dropdown">
                        <span id="user-display" class="user-display-name">Admin User</span>
                    </div>
                `;
            }
        }

        // Hide/show user management tab
        const usersTab = document.getElementById('users-tab');
        if (this.featureManager.hasUserManagement()) {
            usersTab.style.display = 'block';
        } else {
            usersTab.style.display = 'none';
        }
    }

    async handleAuthentication() {
        if (!this.featureManager.hasAuthentication()) {
            this.showAdminInterface();
            await this.initializeAdminInterface();
            return;
        }

        const loginScreen = document.getElementById('login-screen');
        const adminInterface = document.getElementById('admin-interface');
        
        if (apiService.isAuthenticated()) {
            this.showAdminInterface();
            await this.initializeAdminInterface();
            return;
        }

        loginScreen.style.display = 'flex';
        adminInterface.style.display = 'none';

        this.setupLoginHandlers();
    }

    setupLoginHandlers() {
        if (!this.featureManager.hasAuthentication()) {
            return;
        }

        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginForm) {
            // Add event listener for form submit
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this.handleEmailLogin();
            });

            // Also add event listener for Enter key on input fields as backup
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            [emailInput, passwordInput].forEach(input => {
                if (input) {
                    input.addEventListener('keydown', async (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            await this.handleEmailLogin();
                        }
                    });
                }
            });
        }

        if (logoutBtn && this.featureManager.hasLogout()) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    async handleEmailLogin() {
        if (!this.featureManager.hasAuthentication()) {
            return false;
        }

        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');

            // Clear any previous errors
            if (errorDiv) errorDiv.style.display = 'none';

            // Validate inputs
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }

            // Attempt login
            await apiService.login(email, password);
            this.showAdminInterface();
            await this.initializeAdminInterface();
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Login failed. Please try again.';
                errorDiv.style.display = 'block';
            }
            return false;
        }
    }

    handleLogout() {
        if (!this.featureManager.hasLogout()) {
            return;
        }

        apiService.logout();
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-interface').style.display = 'none';
    }

    showAdminInterface() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-interface').style.display = 'block';
        
        const userDisplay = document.getElementById('user-display');
        if (this.featureManager.hasAuthentication()) {
            const currentUser = apiService.getCurrentUser();
            if (currentUser && userDisplay) {
                userDisplay.textContent = currentUser.email || currentUser.username || 'Admin User';
            }
        } else {
            if (userDisplay) {
                userDisplay.textContent = 'Admin User';
            }
        }
        
        this.isAuthenticated = true;
    }

    async initializeAdminInterface() {
        this.wordsContainer = document.getElementById('words-container');
        this.wordFieldManager = new WordFieldManager(this.wordsContainer);
        this.saveButton = document.getElementById('save-button');
        this.addWordButton = document.getElementById('add-word-button');
        this.exportButton = document.getElementById('export-button');
        this.importButton = document.getElementById('import-button');
        this.fileInput = document.getElementById('file-input');

        this.setupAdminEventListeners();
        
        this.setupTabs();

        try {
            const words = await apiService.getAdminWords();
            if (words.length === 0) {
                this.wordFieldManager.displayNoWordsMessage();
            } else {
                words.forEach(wordObj => this.wordFieldManager.addField(wordObj.word, wordObj.type, wordObj.time));
            }
        } catch (error) {
            this.handleFetchError(error);
        }
    }

    setupAdminEventListeners() {
        this.addWordButton.addEventListener('click', () => this.wordFieldManager.addField());

        this.saveButton.addEventListener('click', async () => {
            await this.saveWords();
        });

        this.exportButton.addEventListener('click', () => {
            this.exportWords();
        });

        this.importButton.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', async () => {
            await this.importWords();
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && this.featureManager.hasLogout()) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Setup user dropdown functionality
        this.setupUserDropdown();
    }

    setupUserDropdown() {
        const userDisplay = document.getElementById('user-display');
        const userDropdown = document.querySelector('.user-dropdown');

        if (userDisplay && userDropdown) {
            // Toggle dropdown on click
            userDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });

            // Close dropdown when pressing escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }

    displayNoWordsMessage() {
        this.wordsContainer.innerHTML = '<p>No words found.</p>';
    }

    handleFetchError(error) {
        console.error('Error fetching words:', error);
        this.wordFieldManager.displayErrorMessage();
    }

    async saveWords() {
        const updatedWords = this.wordFieldManager.getAllValues();

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
        const words = this.wordFieldManager.getAllValues();

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
                    this.wordFieldManager.clearAllFields();
                    json.words.forEach(wordObj => this.wordFieldManager.addField(wordObj.word, wordObj.type, wordObj.time));
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

        // Show/hide user management tab based on features
        if (this.featureManager.hasUserManagement()) {
            usersTab.style.display = 'block';
        } else {
            usersTab.style.display = 'none';
        }

        wordsTab.addEventListener('click', () => {
            this.switchTab('words');
        });

        if (this.featureManager.hasUserManagement()) {
            usersTab.addEventListener('click', () => {
                this.switchTab('users');
            });
        }
    }

    switchTab(tab) {
        const wordsTab = document.getElementById('words-tab');
        const usersTab = document.getElementById('users-tab');
        const wordsSection = document.getElementById('words-section');
        const usersSection = document.getElementById('users-section');

        wordsTab.classList.toggle('active', tab === 'words');
        usersTab.classList.toggle('active', tab === 'users');

        wordsSection.classList.toggle('active', tab === 'words');
        usersSection.classList.toggle('active', tab === 'users');

        this.currentTab = tab;

        if (tab === 'users' && this.featureManager.hasUserManagement()) {
            if (!this.userManagementSetup) {
                this.setupUserManagement();
                this.userManagementSetup = true;
            }
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
        if (!this.featureManager.hasUserManagement()) return;

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
            const userData = {
                email,
                password,
                passwordConfirm,
                emailVisibility: true
            };

            if (name && name.trim()) {
                userData.name = name.trim();
            }

            console.log('Creating user:', email);
            const newUser = await apiService.createUser(userData);
            console.log('User created successfully:', newUser.id);

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
        alert(message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.adminApp = new AdminApp();
    await window.adminApp.initialize();
});
