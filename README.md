# Fiona's Closet — V1

A private Progressive Web App (PWA) for a digital wardrobe.

## Features
- Closet grid with categories and search
- Add clothing using camera/photo library
- Delete clothing
- Mix & Match: choose a top + bottom
- Shuffle outfit
- Save/delete favorite looks
- Works offline after first load
- Uploaded items are stored locally in the browser using IndexedDB

## Run locally
From this folder:
`python3 -m http.server 8000`

Then open:
`http://localhost:8000`

## Put it online with Vercel
1. Create a free Vercel account.
2. Create a new project and upload this folder, or push the folder to GitHub and import it.
3. No build command is required; this is a static site.
4. Open the generated Vercel URL on iPhone.
5. Safari → Share → Add to Home Screen.

## Important
The current V1 stores added/deleted items only on the device/browser where you use it.
For multi-device sync, the next step is to add Supabase/Firebase.
