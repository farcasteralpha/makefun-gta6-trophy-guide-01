# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden until earned. No online trophies exist — the whole list is single-player.

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade; tick trophies off and progress is saved in the browser (localStorage), with export to a `.json` file and import back.
- **Cited guides** — each trophy has a guide written for this entry in its own words, naming its source beside it (PowerPyx, GTABase, EGamers, Exophase, PSNProfiles). Five methods are not yet confirmed at launch and are marked as such — nothing is invented.
- **Roadmap to the platinum** — five stages built from the official descriptions: story first, strangers and secrets, activities and collectibles, money and mayhem, then the 100% cleanup. PowerPyx puts the run at roughly 200 hours, difficulty 4/10.
- **Missables page** — only one trophy is possibly missable (Positive Mental Attitude, the Chapter 1 balcony meditation), with the save habits that protect you: a manual save at every chapter start, 15 save slots, a save before the final mission.
- **Filters & search** — by kind (story, missable, collectibles, activities, completion, online), by grade, by earned state, and free-text search (press `/`).
- **Spoiler-safe mode** — hidden trophies show as "Hidden trophy" until you earn them.
- **Next Up planner** — your next 5 trophies in roadmap order.
- **Notes** — a private note per trophy, saved with your progress.

## Try it

Serve `app/` with any static server and open `index.html`:

```sh
cd app && python3 -m http.server 8000
# open http://localhost:8000/
```

Add `?demo=1` to preview the guide with 13 trophies already earned. Everything works with the network off: the app loads only its own files.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Sources

- Exophase — the official PS5 trophy list (names, descriptions, grades): https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — PSN counts and targets: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- PowerPyx — GTA 6 Trophy Guide & Roadmap and 100% Completion Checklist: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- EGamers — GTA 6 Trophy List (hidden split, method tips): https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- GTABase — method tips for several trophies: https://www.gtabase.com/

## License

MIT — see `LICENSE`. Unofficial fan guide, not affiliated with Rockstar Games or PlayStation. No game art or logos are used.
