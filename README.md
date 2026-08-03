# Fiona's Closet V2.1

A polished, mobile-first tween fashion game built as a static website. This complete deployment package includes 31 cleaned wardrobe photographs connected to the Closet and Outfit Lab.

## What is included

- Layered illustrated Home screen with tappable closet, mirror, and discovery areas
- Searchable and filterable Closet with 31 real garments, favorites, and add-item flow
- Interactive Style Me / Outfit Lab with moods, outfit slots, shuffle, scores, and saved looks
- Discover experience with closet-match trend cards and six style worlds
- Wishlist showing how many outfits a new garment could unlock
- Local device persistence for custom pieces, favorites, and saved looks
- Responsive layouts for iPhone, tablet, and desktop
- Accessibility labels, keyboard-friendly controls, and reduced-motion support

## Deployment

This app uses plain HTML, CSS, and JavaScript. There is no build step.

Upload everything in this folder to the existing `SRCFIO/fionas-closet` repository:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `assets/` (31 PNG garment images)

The included `assets/` folder is ready to replace or merge with the existing assets folder. Keep the existing `manifest.json` and `service-worker.js` files if GitHub does not show them in this package. Vercel will automatically redeploy after the GitHub commit.

## Existing garment images

V2.1 loads the included images using predictable paths such as:

`assets/top-pink.png`, `assets/top-jersey.png`, `assets/bottom-cargo.png`, and so on.

If an image is ever missing, the interface shows a colorful garment placeholder instead of a broken image.

## Notes

- Google Fonts are used when the device has internet access; safe fallback fonts remain available.
- User-added photos are stored in browser storage on that device. Large photo libraries will eventually benefit from cloud storage.
- Trend concepts in this prototype are curated examples. A future version can connect to a moderated trend source.
