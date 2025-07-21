/**
 * PocketBase Service - Handles all PocketBase operations
 */
export class PocketBaseService {
    constructor() {
        this.pb = null;
        this.isConnected = false;
    }

    async initialize(pocketBaseUrl) {
        try {
            await this.waitForPocketBase();
            
            console.log('Creating PocketBase instance with URL:', pocketBaseUrl);
            this.pb = new PocketBase(pocketBaseUrl);
            
            // Verify the instance is working
            if (!this.pb) {
                throw new Error('Failed to create PocketBase instance');
            }
            
            this.isConnected = true;
            console.log('PocketBase service initialized successfully');
            return this.pb;
        } catch (error) {
            this.isConnected = false;
            console.error('Failed to initialize PocketBase service:', error);
            throw error;
        }
    }

    async waitForPocketBase() {
        return new Promise((resolve, reject) => {
            if (typeof PocketBase !== 'undefined') {
                console.log('PocketBase SDK already available');
                resolve();
                return;
            }

            console.log('Waiting for PocketBase SDK to load...');
            let attempts = 0;
            const maxAttempts = 100;
            
            const check = () => {
                attempts++;
                if (typeof PocketBase !== 'undefined') {
                    console.log('PocketBase SDK loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('PocketBase SDK not loaded after 10 seconds');
                    reject(new Error('PocketBase SDK not loaded after 10 seconds'));
                } else {
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }

    async login(email, password) {
        if (!this.pb) {
            throw new Error('PocketBase not initialized. Please ensure the service is initialized first.');
        }
        
        // Wait for PocketBase to be fully loaded if it's not ready yet
        if (!this.isConnected) {
            throw new Error('PocketBase connection not established. Please try again.');
        }

        try {
            // Method 1: Try modern SDK approach first (if collection method exists)
            if (this.pb.collection && typeof this.pb.collection === 'function') {
                console.log('Using modern SDK collection method for authentication');
                return await this.pb.collection('users').authWithPassword(email, password);
            }
            
            // Method 2: Direct API call for older SDK versions
            console.log('Using direct API call for authentication');
            const response = await fetch(`${this.pb.baseUrl}/api/collections/users/auth-with-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identity: email,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Authentication API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                
                // Provide specific error messages based on status
                let errorMessage;
                switch (response.status) {
                    case 400:
                        errorMessage = 'Invalid email or password. Please check your credentials.';
                        break;
                    case 404:
                        errorMessage = 'User not found or authentication service unavailable.';
                        break;
                    case 403:
                        errorMessage = 'Authentication disabled or account not verified.';
                        break;
                    default:
                        errorMessage = errorData.message || `Authentication failed: ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }

            const authData = await response.json();
            console.log('Authentication successful, updating auth store');
            
            // Manually update the auth store
            this.pb.authStore.save(authData.token, authData.record);
            
            return authData;

        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    logout() {
        if (this.pb) {
            this.pb.authStore.clear();
        }
    }

    isAuthenticated() {
        return this.pb && this.pb.authStore && this.pb.authStore.isValid;
    }

    getCurrentUser() {
        return this.pb?.authStore?.model;
    }

    isReady() {
        return this.pb !== null && this.isConnected && typeof PocketBase !== 'undefined';
    }

    // Bingo Grids operations
    async getBingoGrid(gridName = 'Test') {
        if (!this.pb) throw new Error('PocketBase not initialized');
        
        try {
            let result;
            
            // Method 1: Try modern SDK with collection method
            if (this.pb.collection && typeof this.pb.collection === 'function') {
                console.log('Using modern SDK collection method for getBingoGrid');
                result = await this.pb.collection('bingoGrids').getFirstListItem(`bingoGridName="${gridName}"`, {
                    expand: 'bingoFields'
                });
            } else {
                // Method 2: Direct API call for older SDK
                console.log('Using direct API call for getBingoGrid');
                const response = await fetch(`${this.pb.baseUrl}/api/collections/bingoGrids/records?filter=${encodeURIComponent(`bingoGridName="${gridName}"`)}&expand=bingoFields&perPage=1`, {
                    headers: {
                        'Authorization': this.pb.authStore.token ? `Bearer ${this.pb.authStore.token}` : ''
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 404) {
                        return null; // Grid doesn't exist
                    }
                    throw new Error(`Failed to fetch bingo grid: ${response.statusText}`);
                }
                
                const data = await response.json();
                result = data.items && data.items.length > 0 ? data.items[0] : null;
            }
            
            return result;
        } catch (error) {
            if (error.status === 404 || error.message.includes('404')) {
                return null; // Grid doesn't exist
            }
            throw error;
        }
    }

    async createOrUpdateBingoGrid(gridName = 'Test', fields) {
        if (!this.pb) throw new Error('PocketBase not initialized');
        if (!this.isAuthenticated()) throw new Error('Authentication required');

        try {
            // First, try to get existing grid
            let grid = await this.getBingoGrid(gridName);
            
            if (grid) {
                console.log('Grid exists, deleting existing fields');
                // Delete existing fields
                if (this.pb.collection && typeof this.pb.collection === 'function') {
                    const existingFields = await this.pb.collection('bingoFields').getFullList({
                        filter: `bingoGrid="${grid.id}"`
                    });
                    for (const field of existingFields) {
                        await this.pb.collection('bingoFields').delete(field.id);
                    }
                } else {
                    // Direct API call to get and delete existing fields
                    const response = await fetch(`${this.pb.baseUrl}/api/collections/bingoFields/records?filter=${encodeURIComponent(`bingoGrid="${grid.id}"`)}`, {
                        headers: {
                            'Authorization': `Bearer ${this.pb.authStore.token}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        for (const field of data.items) {
                            await fetch(`${this.pb.baseUrl}/api/collections/bingoFields/records/${field.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${this.pb.authStore.token}`
                                }
                            });
                        }
                    }
                }
            } else {
                console.log('Creating new grid');
                // Create new grid
                if (this.pb.collection && typeof this.pb.collection === 'function') {
                    grid = await this.pb.collection('bingoGrids').create({
                        bingoGridName: gridName
                    });
                } else {
                    // Direct API call to create grid
                    const response = await fetch(`${this.pb.baseUrl}/api/collections/bingoGrids/records`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.pb.authStore.token}`
                        },
                        body: JSON.stringify({
                            bingoGridName: gridName
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to create bingo grid: ${response.statusText}`);
                    }
                    
                    grid = await response.json();
                }
            }

            console.log('Creating fields for grid:', grid.id);
            // Create new fields
            for (const field of fields) {
                const fieldData = {
                    text: field.word,
                    type: field.type,
                    time: field.time,
                    bingoGrid: grid.id
                };
                
                if (this.pb.collection && typeof this.pb.collection === 'function') {
                    await this.pb.collection('bingoFields').create(fieldData);
                } else {
                    // Direct API call to create field
                    const response = await fetch(`${this.pb.baseUrl}/api/collections/bingoFields/records`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.pb.authStore.token}`
                        },
                        body: JSON.stringify(fieldData)
                    });
                    
                    if (!response.ok) {
                        console.error(`Failed to create field: ${response.statusText}`);
                    }
                }
            }

            return await this.getBingoGrid(gridName);
        } catch (error) {
            console.error('Error creating/updating bingo grid:', error);
            throw error;
        }
    }

    async getBingoFields(gridName = 'Test') {
        if (!this.pb) throw new Error('PocketBase not initialized');
        
        try {
            const grid = await this.getBingoGrid(gridName);
            if (!grid) return [];

            let fields;
            if (this.pb.collection && typeof this.pb.collection === 'function') {
                fields = await this.pb.collection('bingoFields').getFullList({
                    filter: `bingoGrid="${grid.id}"`
                });
            } else {
                // Direct API call for older SDK
                const response = await fetch(`${this.pb.baseUrl}/api/collections/bingoFields/records?filter=${encodeURIComponent(`bingoGrid="${grid.id}"`)}&perPage=500`, {
                    headers: {
                        'Authorization': this.pb.authStore.token ? `Bearer ${this.pb.authStore.token}` : ''
                    }
                });
                
                if (!response.ok) {
                    console.error(`Failed to fetch bingo fields: ${response.statusText}`);
                    return [];
                }
                
                const data = await response.json();
                fields = data.items || [];
            }

            return fields.map(field => ({
                word: field.text,
                type: field.type || 'Field',
                time: field.time
            }));
        } catch (error) {
            console.error('Error fetching bingo fields:', error);
            return [];
        }
    }

    // Test PocketBase connection
    async testConnection() {
        if (!this.pb) throw new Error('PocketBase not initialized');
        
        try {
            // Try to get server health/info
            const response = await fetch(this.pb.baseUrl + '/api/health');
            console.log('PocketBase health check response:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('PocketBase health data:', data);
                return { connected: true, data };
            } else {
                console.log('PocketBase health check failed:', response.status);
                return { connected: false, status: response.status };
            }
        } catch (error) {
            console.error('PocketBase connection test failed:', error);
            return { connected: false, error: error.message };
        }
    }

    // Debug method to check PocketBase status
    getStatus() {
        const status = {
            sdkAvailable: typeof PocketBase !== 'undefined',
            initialized: this.pb !== null,
            connected: this.isConnected,
            ready: this.isReady(),
            pbType: this.pb ? typeof this.pb : 'null',
            hasCollection: this.pb ? typeof this.pb.collection : 'n/a'
        };

        // Add more detailed method availability
        if (this.pb) {
            status.availableMethods = {
                collection: typeof this.pb.collection,
                admins: typeof this.pb.admins,
                authWithPassword: typeof this.pb.authWithPassword,
                records: typeof this.pb.records
            };

            // If collection method exists, check what's available on a collection
            if (this.pb.collection && typeof this.pb.collection === 'function') {
                try {
                    const userCollection = this.pb.collection('users');
                    status.collectionMethods = {
                        authWithPassword: typeof userCollection.authWithPassword,
                        getFullList: typeof userCollection.getFullList,
                        create: typeof userCollection.create
                    };
                } catch (e) {
                    status.collectionError = e.message;
                }
            }
        }

        return status;
    }

    // Debug method to explore available authentication methods
    debugAuthMethods() {
        if (!this.pb) {
            console.log('PocketBase not initialized');
            return;
        }

        console.log('=== PocketBase Authentication Methods Debug ===');
        console.log('PocketBase instance:', this.pb);
        console.log('Available properties on pb:', Object.getOwnPropertyNames(this.pb));
        
        if (this.pb.users) {
            console.log('Users object:', this.pb.users);
            console.log('Users methods:', Object.getOwnPropertyNames(this.pb.users));
            console.log('users.authViaEmail:', typeof this.pb.users.authViaEmail);
            console.log('users.authWithPassword:', typeof this.pb.users.authWithPassword);
        }

        if (this.pb.admins) {
            console.log('Admins object:', this.pb.admins);
            console.log('Admins methods:', Object.getOwnPropertyNames(this.pb.admins));
            console.log('admins.authViaEmail:', typeof this.pb.admins.authViaEmail);
            console.log('admins.authWithPassword:', typeof this.pb.admins.authWithPassword);
        }

        if (this.pb.records) {
            console.log('Records object:', this.pb.records);
            console.log('Records methods:', Object.getOwnPropertyNames(this.pb.records));
            console.log('records.authViaEmail:', typeof this.pb.records.authViaEmail);
        }

        console.log('AuthStore:', this.pb.authStore);
        console.log('=== End Debug ===');
    }
}

// Export singleton instance
export const pocketBaseService = new PocketBaseService();
