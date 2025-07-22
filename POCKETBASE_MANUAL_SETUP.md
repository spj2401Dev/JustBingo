# Manual PocketBase Schema Setup Guide

This guide will walk you through manually setting up the required collections and schemas in PocketBase when the automatic import doesn't work.

## Prerequisites
1. PocketBase is downloaded and running
2. PocketBase admin interface is accessible at http://127.0.0.1:8090/_/
3. You have created a superuser account

## Step 1: Start PocketBase
```bash
# Windows
.\pocketbase.exe serve --origins="*"

# Linux/macOS
./pocketbase serve --origins="*"
```

## Step 2: Access PocketBase Admin
1. Open your browser and navigate to: http://127.0.0.1:8090/_/
2. Log in with your superuser credentials
3. You should see the PocketBase admin dashboard

## Step 3: Create Collections

### Collection 1: Users (Authentication Collection)

1. **Click "Collections" in the left sidebar**
2. **Click the "New collection" button**
3. **Select "Auth" as the collection type**
4. **Configure the collection:**
   - **Name:** `users`
   - **Id:** `users` (auto-generated)

5. **Add Schema Fields:**
   
   **Field 1: name**
   - Click "Add field" button
   - **Type:** Text
   - **Name:** `name`
   - **Required:** ❌ (unchecked)
   - **Unique:** ❌ (unchecked)
   - **Min length:** Leave empty
   - **Max length:** Leave empty
   - **Pattern:** Leave empty

6. **Configure API Rules:**
   - **List rule:** `id = @request.auth.id`
   - **View rule:** `id = @request.auth.id`
   - **Create rule:** Leave empty (allows registration)
   - **Update rule:** `id = @request.auth.id`
   - **Delete rule:** `id = @request.auth.id`

7. **Configure Auth Options:**
   - **Email auth:** ✅ (checked)
   - **Username auth:** ❌ (unchecked)
   - **OAuth2 auth:** ❌ (unchecked)
   - **Require email:** ✅ (checked)
   - **Min password length:** `6`
   - **Only email domains:** Leave empty
   - **Except email domains:** Leave empty

8. **Click "Create" to save the collection**

### Collection 2: Bingo Grids

1. **Click "New collection" button again**
2. **Select "Base" as the collection type**
3. **Configure the collection:**
   - **Name:** `bingoGrids`
   - **Id:** `bingo_grids` (auto-generated)

4. **Add Schema Fields:**
   
   **Field 1: bingoGridName**
   - Click "Add field" button
   - **Type:** Text
   - **Name:** `bingoGridName`
   - **Required:** ✅ (checked)
   - **Unique:** ✅ (checked)
   - **Min length:** Leave empty
   - **Max length:** Leave empty
   - **Pattern:** Leave empty

5. **Configure API Rules:**
   - **List rule:** Leave empty (public read)
   - **View rule:** Leave empty (public read)
   - **Create rule:** `@request.auth.id != ""`
   - **Update rule:** `@request.auth.id != ""`
   - **Delete rule:** `@request.auth.id != ""`

6. **Click "Create" to save the collection**

### Collection 3: Bingo Fields

1. **Click "New collection" button again**
2. **Select "Base" as the collection type**
3. **Configure the collection:**
   - **Name:** `bingoFields`
   - **Id:** `bingo_fields` (auto-generated)

4. **Add Schema Fields:**
   
   **Field 1: text**
   - Click "Add field" button
   - **Type:** Text
   - **Name:** `text`
   - **Required:** ✅ (checked)
   - **Unique:** ❌ (unchecked)
   - **Min length:** Leave empty
   - **Max length:** Leave empty
   - **Pattern:** Leave empty

   **Field 2: type**
   - Click "Add field" button
   - **Type:** Select (single)
   - **Name:** `type`
   - **Required:** ✅ (checked)
   - **Options:** Add these exact values (one per line):
     ```
     Field
     Free
     Timer
     ```
   - **Max select:** 1

   **Field 3: time**
   - Click "Add field" button
   - **Type:** Number
   - **Name:** `time`
   - **Required:** ❌ (unchecked)
   - **Min:** Leave empty
   - **Max:** Leave empty
   - **Only integer:** ❌ (unchecked)

   **Field 4: bingoGrid (Relation)**
   - Click "Add field" button
   - **Type:** Relation
   - **Name:** `bingoGrid`
   - **Required:** ✅ (checked)
   - **Collection:** Select `bingoGrids` from dropdown
   - **Cascade delete:** ✅ (checked)
   - **Min select:** Leave empty
   - **Max select:** 1
   - **Display fields:** Select `bingoGridName`

5. **Configure API Rules:**
   - **List rule:** Leave empty (public read)
   - **View rule:** Leave empty (public read)
   - **Create rule:** `@request.auth.id != ""`
   - **Update rule:** `@request.auth.id != ""`
   - **Delete rule:** `@request.auth.id != ""`

6. **Click "Create" to save the collection**

## Step 4: Create a Test User Account

1. **Go to Collections → users**
2. **Click "New record" button**
3. **Fill in the form:**
   - **email:** `admin@example.com` (or your preferred email)
   - **password:** Choose a secure password
   - **passwordConfirm:** Repeat the same password
   - **name:** `Admin` (optional)
4. **Click "Create" to save the user**

## Step 5: Create Sample Data (Optional)

### Create a Bingo Grid:
1. **Go to Collections → bingoGrids**
2. **Click "New record" button**
3. **Fill in:**
   - **bingoGridName:** `default`
4. **Click "Create"**

### Add Some Bingo Fields:
1. **Go to Collections → bingoFields**
2. **Click "New record" button**
3. **Create several records with different types:**

   **Example Field 1:**
   - **text:** `Meeting starts on time`
   - **type:** `Field`
   - **time:** Leave empty
   - **bingoGrid:** Select `default`

   **Example Field 2:**
   - **text:** `FREE SPACE`
   - **type:** `Free`
   - **time:** Leave empty
   - **bingoGrid:** Select `default`

   **Example Field 3:**
   - **text:** `Someone mentions coffee`
   - **type:** `Field`
   - **time:** Leave empty
   - **bingoGrid:** Select `default`

   **Example Field 4:**
   - **text:** `5 minute break`
   - **type:** `Timer`
   - **time:** `5`
   - **bingoGrid:** Select `default`

4. **Repeat to create at least 25 fields total** (needed for a 5x5 bingo grid)

## Step 6: Verify Setup

1. **Check all collections exist:**
   - ✅ users (auth type)
   - ✅ bingoGrids (base type)  
   - ✅ bingoFields (base type)

2. **Verify you can:**
   - Create user records
   - Create bingo grid records
   - Create bingo field records with proper relations

## Step 7: Configure Your App

1. **Update `public/appsettings.json`:**
   ```json
   {
       "usingPocketBase": true,
       "pocketBaseUrl": "http://127.0.0.1:8090",
       "usingBackend": false,
       "backendUrl": "http://localhost:3000"
   }
   ```

2. **Start your development server:**
   ```bash
   npm run dev
   ```

3. **Test the admin interface:**
   - Go to http://localhost:5173/admin/
   - Log in with the user credentials you created
   - You should be able to add/edit words

## Troubleshooting

### Common Issues:

**1. Collection creation fails:**
- Make sure you're logged in as a superuser
- Check that field names match exactly (case-sensitive)
- Verify required fields are marked correctly

**2. Relation field doesn't work:**
- Ensure the target collection (`bingoGrids`) exists first
- Select the correct collection in the relation dropdown
- Check that `bingoGridName` is selected as display field

**3. API rules errors:**
- Copy the rules exactly as shown
- `@request.auth.id != ""` means "user must be authenticated"
- Empty rule means "public access"

**4. Authentication not working:**
- Verify email auth is enabled on users collection
- Check that the user record was created successfully
- Ensure password meets minimum length requirement (6 characters)

**5. CORS errors:**
- Make sure PocketBase is started with `--origins="*"`
- Check that the URL in appsettings.json matches your PocketBase server

If you encounter any issues, check the browser console for detailed error messages.
