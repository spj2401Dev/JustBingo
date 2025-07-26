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
            throw new Error('PocketBase not initialized');
        }
        
        if (!this.isConnected) {
            throw new Error('PocketBase connection not established');
        }

        // If regular users not found try superusers.

        try {
            try {
                const authData = await this.pb.collection('users').authWithPassword(email, password);
                console.log('Regular user authentication successful');
                return authData;
            } catch (error) {
                const authData = await this.pb.collection('_superusers').authWithPassword(email, password);
                return authData;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Invalid email or password');
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

    isSuperuser() {
        return this.pb && this.pb.authStore && this.pb.authStore.isValid && this.pb.authStore.isSuperuser;
    }

    getCurrentUser() {
        return this.pb?.authStore?.model;
    }

    isReady() {
        return this.pb !== null && this.isConnected && typeof PocketBase !== 'undefined';
    }

    async getBingoGrid(gridName = 'Test') {
        if (!this.pb) throw new Error('PocketBase not initialized');
        
        try {
            const result = await this.pb.collection('bingoGrids').getFirstListItem(`bingoGridName="${gridName}"`, {
                expand: 'bingoFields'
            });
            return result;
        } catch (error) {
            if (error.status === 404 || error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async createOrUpdateBingoGrid(gridName = 'default', fields) {
        if (!this.pb) throw new Error('PocketBase not initialized');
        if (!this.isAuthenticated()) throw new Error('Authentication required');

        try {
            let grid = await this.getBingoGrid(gridName);

            if (grid) {
                console.log('Grid exists, deleting existing fields in batch');
                const existingFields = await this.pb.collection('bingoFields').getFullList({
                    filter: `bingoGrid="${grid.id}"`
                });
                if (existingFields.length > 0) {
                    const deleteBatch = this.pb.createBatch();
                    for (const field of existingFields) {
                        deleteBatch.collection('bingoFields').delete(field.id);
                    }
                    await deleteBatch.send();
                }
            } else {
                console.log('Creating new grid');
                grid = await this.pb.collection('bingoGrids').create({
                    bingoGridName: gridName
                });
            }

            if (fields && fields.length > 0) {
                console.log('Creating fields in batch for grid:', grid.id);
                const batch = this.pb.createBatch();
                for (const field of fields) {
                    const fieldData = {
                        text: field.word,
                        type: field.type,
                        time: field.time,
                        bingoGrid: grid.id
                    };
                    batch.collection('bingoFields').create(fieldData);
                }
                await batch.send();
            }

            return await this.getBingoGrid(gridName);
        } catch (error) {
            console.error('Error creating/updating bingo grid:', error);
            throw error;
        }
    }

    async getBingoFields(gridName = 'default') {
        if (!this.pb) throw new Error('PocketBase not initialized');
        
        try {
            const grid = await this.getBingoGrid(gridName);
            if (!grid) return [];

            const fields = await this.pb.collection('bingoFields').getFullList({
                filter: `bingoGrid="${grid.id}"`
            });

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
}

export const pocketBaseService = new PocketBaseService();
