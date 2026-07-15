# Haulin' Hooves

One app for the whole horse-event season — find rodeo arenas, horse lodging, feed, fuel, vets, and dump stations that actually fit your rig.

Imported from a [Claude Design](https://claude.ai/design) project and hosted on GitHub Pages.

## Pages

- **`index.html`** — the desktop **landing page**: the vision, the features, founder Kimberly Karlovich, the sample-data disclaimer, and beta lead-capture + feedback forms.
- **`app.html`** — the mobile-first **demo app** (the interactive prototype; "Launch the demo" from the landing opens it).
- **`privacy.html` · `terms.html` · `do-not-sell.html`** — legal template pages.

## Collecting leads &amp; feedback

Beta signups (landing) and feedback (landing + in-app survey) POST to the webhook set in **`config.js`** (`window.HH_WEBHOOK`). Left blank, submissions stay in the visitor's browser. See **[SETUP.md](SETUP.md)** for a 5-minute Google Sheet webhook (Apps Script) you can paste in.

## Features

- **Rig setup** — interactive 3D trailer configurator (three.js): gooseneck vs bumper-pull, overall length, height, loaded weight, horse slots, living quarters. Save **multiple rigs** and switch between them; fit recomputes for the active rig everywhere.
- **Trail map** — continental US map with venue, lodging, feed, parking, farrier, vet, and dump-station layers, all filtered to stops that fit your rig.
- **Season feed** — rodeo events with per-venue fit badges (fits / tight fit / too big) and one-tap add-to-calendar.
- **Venue details** — clearance, slots, rig spots, pull-through access, hookups, arena specs, star ratings, and a "last verified" freshness stamp.
- **Route mode** — the trip planner builds a corridor and auto-drops the nearest fuel, dump, feed, and emergency-vet stops along each leg, plus flags no-go roads that actually block *your* rig.
- **Fit engine** — bridge-clearance / length / grade / turning checks per rig, surfaced as a road-hazard verdict and a crosswind / brake-fade / tight-turn risk profile.
- **Deep actions** — tap-to-call/text farriers, feed stores and 24/7 emergency vets; reserve stays and hold parking spots; SOS call to the nearest vet.
- **Trail styles** — six western color skins (Sunset, Rosé, Turquoise, Sage, Denim, Buckskin) that retint the whole app.
- **Saddlebag** — saved venues and stays; trip and buddies screens.

## Running locally

Any static server works:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. The `.image-slots.state.json` sidecar supplies the venue photos, so serve the whole directory (opening `index.html` via `file://` won't load them).
