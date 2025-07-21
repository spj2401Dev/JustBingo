const PocketBase = require('pocketbase/cjs');
const fs = require('fs');

async function setupPocketBase() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    try {
        console.log('🚀 Setting up PocketBase with demo data...');
        console.log('⚠️  Make sure PocketBase is running: ./pocketbase serve --origins="*"');
        console.log('📝 Make sure you have created collections manually first (see POCKETBASE_MANUAL_SETUP.md)');
        
        // Create demo user
        console.log('\n1️⃣ Creating demo user...');
        try {
            const demoUser = await pb.collection('users').create({
                email: 'admin@example.com',
                password: 'password123',
                passwordConfirm: 'password123',
                name: 'Demo Admin'
            });
            console.log('✅ Demo user created: admin@example.com / password123');
        } catch (error) {
            if (error.message.includes('already exists') || error.data?.email?.message?.includes('already exists')) {
                console.log('⚠️  Demo user already exists, skipping...');
            } else {
                console.error('❌ Failed to create demo user:', error.message);
                // Continue anyway - user might exist
            }
        }

        // Create default bingo grid
        console.log('\n2️⃣ Creating default bingo grid...');
        let bingoGridId;
        try {
            const bingoGrid = await pb.collection('bingoGrids').create({
                bingoGridName: 'default'
            });
            bingoGridId = bingoGrid.id;
            console.log('✅ Default bingo grid created');
        } catch (error) {
            if (error.message.includes('already exists') || error.data?.bingoGridName?.message?.includes('already exists')) {
                console.log('⚠️  Default bingo grid already exists, fetching...');
                const existingGrid = await pb.collection('bingoGrids').getFirstListItem('bingoGridName="default"');
                bingoGridId = existingGrid.id;
            } else {
                throw error;
            }
        }

        // Demo words matching original backend structure
        const demoWords = [
            { word: "Meeting starts on time", type: "Field", time: null },
            { word: "Someone mentions coffee", type: "Field", time: null },
            { word: "Technical difficulties", type: "Field", time: null },
            { word: "Someone joins late", type: "Field", time: null },
            { word: "Awkward silence", type: "Field", time: null },
            { word: "Someone says 'Can you hear me?'", type: "Field", time: null },
            { word: "Background noise", type: "Field", time: null },
            { word: "Someone eating on camera", type: "Field", time: null },
            { word: "Pet appearance", type: "Field", time: null },
            { word: "Someone forgets to mute", type: "Field", time: null },
            { word: "Connection issues", type: "Field", time: null },
            { word: "Screen sharing problems", type: "Field", time: null },
            { word: "FREE SPACE", type: "Free", time: null },
            { word: "Someone mentions weather", type: "Field", time: null },
            { word: "Awkward goodbye", type: "Field", time: null },
            { word: "Someone wearing pajama pants", type: "Field", time: null },
            { word: "Echo feedback", type: "Field", time: null },
            { word: "Someone types loudly", type: "Field", time: null },
            { word: "Child interruption", type: "Field", time: null },
            { word: "Someone says 'Sorry, go ahead'", type: "Field", time: null },
            { word: "Virtual background malfunction", type: "Field", time: null },
            { word: "Someone drinking coffee", type: "Field", time: null },
            { word: "5 minute break", type: "Timer", time: 5 },
            { word: "Stand up and stretch", type: "Timer", time: 3 },
            { word: "Quick water break", type: "Timer", time: 2 },
            { word: "Someone mentions deadline", type: "Field", time: null },
            { word: "Someone says 'Let's take this offline'", type: "Field", time: null },
            { word: "Someone joins from car", type: "Field", time: null },
            { word: "Presentation goes over time", type: "Field", time: null },
            { word: "Someone asks 'Are we recording?'", type: "Field", time: null }
        ];

        // Clear existing demo fields first
        console.log('\n3️⃣ Clearing existing demo fields...');
        try {
            const existingFields = await pb.collection('bingoFields').getFullList({
                filter: `bingoGrid = "${bingoGridId}"`
            });
            
            for (const field of existingFields) {
                await pb.collection('bingoFields').delete(field.id);
            }
            console.log(`✅ Cleared ${existingFields.length} existing demo fields`);
        } catch (error) {
            console.log('⚠️  No existing fields to clear or error clearing:', error.message);
        }

        // Add demo fields
        console.log('\n4️⃣ Adding demo bingo fields...');
        let successCount = 0;
        let errorCount = 0;

        for (const [index, demoWord] of demoWords.entries()) {
            try {
                await pb.collection('bingoFields').create({
                    text: demoWord.word,
                    type: demoWord.type,
                    time: demoWord.time,
                    bingoGrid: bingoGridId
                });
                successCount++;
                
                // Show progress every 5 items
                if ((index + 1) % 5 === 0) {
                    console.log(`   📝 Added ${index + 1}/${demoWords.length} fields...`);
                }
            } catch (error) {
                console.error(`❌ Failed to create field "${demoWord.word}":`, error.message);
                errorCount++;
            }
        }

        console.log(`\n✅ Demo data setup complete!`);
        console.log(`   📊 Successfully added: ${successCount} fields`);
        if (errorCount > 0) {
            console.log(`   ⚠️  Errors: ${errorCount} fields failed`);
        }

        console.log('\n🎯 Next steps:');
        console.log('1. Update public/appsettings.json to use PocketBase');
        console.log('2. Run: npm run dev');
        console.log('3. Go to http://localhost:5173/admin/');
        console.log('4. Login with: admin@example.com / password123');
        console.log('5. Test the admin interface');
        console.log('6. Visit http://localhost:5173/ to see your bingo grid!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        
        if (error.status === 404) {
            console.log('\n💡 Troubleshooting:');
            console.log('- Make sure PocketBase is running: ./pocketbase serve --origins="*"');
            console.log('- Verify you can access http://127.0.0.1:8090/_/');
            console.log('- Make sure collections are created (see POCKETBASE_MANUAL_SETUP.md)');
        } else if (error.status === 400) {
            console.log('\n💡 Troubleshooting:');
            console.log('- Collections might not exist yet');
            console.log('- Follow POCKETBASE_MANUAL_SETUP.md to create them manually');
            console.log('- Check collection names and field types match exactly');
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    setupPocketBase();
}

module.exports = { setupPocketBase };
