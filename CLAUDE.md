# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite exists. There is no TypeScript — all files are `.js`.

## Application Overview

Vehicle-counting tool ("Contador de Veículos — Gnoatto Botoni") for traffic analysis. Users import camera footage or AI-detected frames, classify each vehicle that passes, and export CSVs grouped by vehicle type, direction, and 15-minute time intervals.

## Architecture

**Entry point:** `app/page.js` renders `<Main />`. Everything lives inside that single route.

**`components/main/Main.js`** is the central orchestrator. It owns all top-level state and decides which player to render:

- `mode === 'zip'` → `<ImageLoader>` (frame-by-frame review)
- `mode === 'mp4'` → `<Mp4Player>` (video playback)
- Project mode → same two players but driven by `projectData` + `currentFolderIndex`

**State management:** React state + `localStorage`. No Redux, Zustand, or Context. `localStorage` keys:

| Key | Purpose |
|---|---|
| `vehicleList` | JSON array of all vehicle records |
| `serviceTitle` | Service/project name shown in UI |
| `leftDirection` / `rightDirection` | Direction labels (e.g. "Porto Alegre" / "Rio Grande") |
| `currentFileName` | Active file or folder name (used for per-file reset) |
| `startDateTime_{filename}` | Saved start datetime for a given MP4/folder |

## Processing Modes

### Frames mode (`ImageLoader` + `ImportFile`)
Input: a folder containing a JSON file with `{ detections: [...] }` and image files. `utils/fileReader.js` reads them and returns `{ tempRegistros, tempImagens }`. Each detection has `track_id`, `time`, `date`, `image_path` (relative to the folder root). `ImportFile` shows one frame at a time; classifying a vehicle auto-advances to the next via `nextFnRef`.

### MP4 mode (`Mp4Player`)
Input: a single `.mp4` (or other video) file. The user sets a start datetime via DateTimePicker; current datetime is computed as `startDateTime + video.currentTime`. Vehicles are recorded at the playback position.

### Project mode (`utils/projectReader.js` + `ProjectNavigation`)
Reads an entire project folder with this structure:
```
project/
  config.txt           # servico: / esquerda: / direita:
  1.video/
    config.txt         # ISO datetime: "YYYY-MM-DDTHH:MM:SS"
    video.mp4
  2.frames/
    detections.json
    subfolder/
      image.jpg
  3.video/
    ...
```
Subfolders are sorted by numeric prefix and typed by name (`"video"` or `"frames"`). `Main.js` drives navigation via `currentFolderIndex`. Each folder gets a unique React `key` (`project-folder-{index}`) so players fully remount on folder change. Auto-advance: classifying the last frame calls `onFolderComplete` → `handleProjectNextFolder`; video `onEnded` calls `onFolderEnd`.

## Vehicle Record Schema

```js
{
  id: UUID,
  trackId: string,        // detection track_id (empty for manual entries)
  time: "HH:MM:SS",
  date: "YYYY-MM-DD",
  direction: string,      // left or right direction label
  fromTo: string,         // "DirectionA - DirectionB"
  type: string,           // export code, e.g. "2E", "3C", "Moto"
  category: string,       // "Passeio" | "Onibus" | "Caminhão"
  raisedAxles: number,
  fileName: string,       // source file/folder name
  videoTime: number,      // seconds into video (0 for frames)
}
```

## Key Utilities

- **`utils/staticVehicles.js`** — `getVehicleData('passeio'|'onibus'|'caminhao')` returns vehicle type definitions with `exportName` (CSV column) and `eixos` (axle count).
- **`utils/exportUtils.js`** — `exportVehicles()` and `exportAxles()` produce CSVs bucketed into 15-minute intervals; `exportAsZip()` bundles both.
- **`utils/fileReader.js`** — `readFolder(files)` processes a flat frames folder from a `<input webkitdirectory>`.
- **`utils/projectReader.js`** — `readProjectFolder(files)` processes a full project folder tree; normalizes video datetimes to ISO T-format before passing to dayjs.

## UI Patterns

- All components are `'use client'` (Next.js App Router).
- MUI v7 is the component library. The brand color is `#22423A`.
- `FullScreenSpinner` wraps heavy async operations (file reading, export) inside a `setTimeout(..., 100)` so the spinner renders before blocking work starts.
- `Toaster` is used for success/error feedback inside players; `alert()` is used for import errors in `MainHeader`.
- The PWA config (`@ducanh2912/next-pwa`) is present as a dependency but commented out in `next.config.mjs`.
