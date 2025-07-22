/**
 * Unified API Service - Handles API calls to either PocketBase or Backend
 */
import { pocketBaseService } from './PocketBaseService.js';

export class ApiService {
    constructor() {
        this.config = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            const response = await fetch('./appsettings.json');
            this.config = await response.json();

            if (this.config.usingPocketBase && this.config.pocketBaseUrl) {
                await pocketBaseService.initialize(this.config.pocketBaseUrl);
                console.log('ApiService initialized with PocketBase');
            } else {
                console.log('ApiService initialized with Backend');
            }
            
            this.isInitialized = true;
            return this;
        } catch (error) {
            console.error('Failed to initialize ApiService:', error);
            throw error;
        }
    }

    isUsingPocketBase() {
        return this.config?.usingPocketBase === true;
    }

    isUsingBackend() {
        return this.config?.usingBackend === true;
    }

    hasAuthentication() {
        return this.isUsingPocketBase();
    }

    hasUserManagement() {
        return this.isUsingPocketBase();
    }

    requiresAuthentication() {
        return this.isUsingPocketBase();
    }

    getBaseUrl() {
        if (this.isUsingPocketBase()) {
            return this.config.pocketBaseUrl;
        } else if (this.isUsingBackend()) {
            return this.config.backendUrl;
        }
        return '';
    }

    get pb() {
        return pocketBaseService.pb;
    }

    async login(email, password) {
        if (!this.isInitialized) {
            throw new Error('ApiService not initialized');
        }
        if (!this.isUsingPocketBase()) {
            throw new Error('Authentication is only available with PocketBase backend');
        }
        return await pocketBaseService.login(email, password);
    }

    logout() {
        if (this.isUsingPocketBase()) {
            pocketBaseService.logout();
        }
    }

    isAuthenticated() {
        if (this.isUsingPocketBase()) {
            return pocketBaseService.isAuthenticated();
        }
        return false;
    }

    isSuperuser() {
        if (this.isUsingPocketBase()) {
            return pocketBaseService.isSuperuser();
        }
        return false;
    }

    getCurrentUser() {
        if (this.isUsingPocketBase()) {
            return pocketBaseService.getCurrentUser();
        }
        return null;
    }

    // Private helper method for common checks
    _ensureReady(requireAuth = false) {
        if (!this.isInitialized) {
            throw new Error('ApiService not initialized');
        }
        
        if (requireAuth) {
            if (this.isUsingPocketBase()) {
                if (!this.isAuthenticated()) {
                    throw new Error('Authentication required');
                }
            }
            // For backend, no auth required
        }
    }

    // Words/Bingo data methods
    async getWords() {
        this._ensureReady();
        if (this.isUsingPocketBase()) {
            return await pocketBaseService.getBingoFields('default');
        } else {
            const response = await fetch('/api/words');
            if (!response.ok) {
                throw new Error('Failed to fetch words from backend');
            }
            return await response.json();
        }
    }

    async getAdminWords() {
        const requireAuth = this.isUsingPocketBase();
        this._ensureReady(requireAuth);
        
        if (this.isUsingPocketBase()) {
            return await pocketBaseService.getBingoFields('default');
        } else {
            const response = await fetch('/admin/words');
            if (!response.ok) {
                throw new Error('Failed to fetch admin words from backend');
            }
            return await response.json();
        }
    }

    async saveWords(words) {
        const requireAuth = this.isUsingPocketBase();
        this._ensureReady(requireAuth);
        
        if (this.isUsingPocketBase()) {
            return await pocketBaseService.createOrUpdateBingoGrid('default', words);
        } else {
            const response = await fetch('/admin/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words }),
            });
            if (!response.ok) {
                throw new Error('Failed to save words to backend');
            }
            return await response.json();
        }
    }

    async getUsers() {
        this._ensureReady(true);
        if (!this.isUsingPocketBase()) {
            throw new Error('User management is only available with PocketBase backend');
        }
        return await this.pb.collection('users').getFullList({
            sort: '-created',
            requestKey: null
        });
    }

    async createUser(userData) {
        this._ensureReady(true);
        if (!this.isUsingPocketBase()) {
            throw new Error('User management is only available with PocketBase backend');
        }
        return await this.pb.collection('users').create(userData);
    }

    async updateUser(userId, userData) {
        this._ensureReady(true);
        if (!this.isUsingPocketBase()) {
            throw new Error('User management is only available with PocketBase backend');
        }
        return await this.pb.collection('users').update(userId, userData);
    }

    async deleteUser(userId) {
        this._ensureReady(true);
        if (!this.isUsingPocketBase()) {
            throw new Error('User management is only available with PocketBase backend');
        }
        return await this.pb.collection('users').delete(userId);
    }
}

export const apiService = new ApiService();

export default apiService;
