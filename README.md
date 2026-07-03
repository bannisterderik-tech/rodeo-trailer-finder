# Rodeo Trailer Finder

Mobile-first prototype for finding rodeo arenas, horse lodging, and feed stops that actually fit your rig.

Imported from a [Claude Design](https://claude.ai/design) project and hosted on GitHub Pages.

## Features

- **Rig setup** — interactive 3D trailer configurator (three.js): gooseneck vs bumper-pull, overall length, height, horse slots, living quarters.
- **Trail map** — continental US map with venue, lodging, and feed-store layers filtered to stops that fit your rig.
- **Season feed** — rodeo events with per-venue fit badges (fits / tight fit / too big).
- **Venue details** — clearance, slots, rig spots, pull-through access, hookups, arena specs.
- **Saddlebag** — saved venues and stays; trip and buddies screens.

## Running locally

Any static server works:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. The `.image-slots.state.json` sidecar supplies the venue photos, so serve the whole directory (opening `index.html` via `file://` won't load them).
