# iFruit NPWD — Handoff

This fork of [NPWD](https://github.com/project-error/new-phone-who-dis) is being turned into an
iOS-style ("iFruit") phone that fully replaces **lb-phone** on the EnhancedMafia (Qbox) server.
lb-phone is escrowed and its UI is minified, so nothing is copied from it: every app is rebuilt
natively here, using lb-phone only as a behaviour/content reference.

Status as of 2026-09-13. `server.cfg` still starts `lb-phone`; NPWD has not been switched on in game
yet, so everything below is verified by builds and the browser dev preview, **not in-game**.

---

## Running it

```bash
pnpm install
pnpm build            # turbo: game scripts (dist/game) + phone UI (dist/html)
pnpm --filter @npwd/nui dev   # browser preview at http://localhost:3050 (mock data)
```

In the browser preview every `fetchNui` returns the mock data passed as its third argument, so
all apps are clickable without a server.

### Server requirements

- `set npwd:framework "qbx"` (already in server.cfg)
- Resources started **before** npwd: `ox_lib`, `qbx_core`, `oxmysql`, `qbx_vehicles`, `qbx_garages`,
  `qbx_vehiclekeys`, `Renewed-Banking`, `screenshot-basic`, `pma-voice`
- `set NPWD_AUDIO_TOKEN "<fivemanage token>"` — currently **empty** in server.cfg, so voice notes
  and Voice Memos uploads fail with "No upload token found!" until it is set.
- New tables are created automatically on start; they are also appended to `import.sql`.

---

## What's built

### Shell (iFruit)

| Area | Notes |
|---|---|
| Frame, status bar, lock screen | From the earlier iFruit rework commit. Lock screen swipe fixed (quick flicks now unlock). |
| **Control Center** | Rebuilt to the real iOS layout: connectivity module (airplane/cellular/Wi-Fi/Bluetooth, the last three dimmed by airplane mode), Now Playing, standalone rotation-lock + flashlight circles, vertical brightness/volume sliders, a Do Not Disturb pill, and a shelf of extra controls (low power, appearance, nearby share, hotspot, and shortcuts to Timer/Camera/Calculator/Voice Memos). Nothing Apple- or brand-marked: AirDrop/AirPlay became "Nearby Share" and a generic cast glyph. **Brightness** drives `BrightnessOverlay` (a black overlay capped at 55% — a CSS `filter` on the phone container would create a containing block and kill every `backdrop-filter`). **Volume** writes `settings.callVolume` on release only, since each settings write re-sends the whole object over NUI. Cosmetic-only toggles (no game hook yet): rotation lock, flashlight, low power, nearby share, hotspot, bluetooth. |
| Pull-down gesture | Split like a real phone: dragging down the **clock side** of the status bar opens Notification Center, the **battery side** opens Control Center. Dragging the middle of the home screen still opens notifications. |
| Home indicator | Only inside apps now — hidden on the home screen and lock screen. |
| Status-bar spacing | `AppWrapper` pads every app 44px below the status bar on its theme background. Apps that paint under the status bar pass `fullBleed`. |
| Home indicator | Floats over apps (`Navigation.tsx`), difference-blended so it shows on light and dark. MUI bottom tab bars get extra bottom padding in `Phone.css`. |
| Notifications | Banners sit under the dynamic island (`Phone.css` → `.notistack-SnackbarContainer`). |
| **Liquid Glass** | `os/glass/glassTokens.ts` maps one 0–100 value to CSS variables; `.liquid-glass` (+ `-dark`, `-bar`) in `Phone.css`. Used by dock, banners, Control Center, tab bars. **Settings → Appearance → Liquid Glass** slider (Glossy ↔ Frosted, live preview). Setting key `glassFrost` is optional in the schema on purpose — making it required would invalidate everyone's saved settings. |
| iOS icon set | `os/apps/icons/ios` (default icon set). PNGs from [SysAdminDoc/iOSIconPack](https://github.com/SysAdminDoc/iOSIconPack) (MIT, license in `public/media/icons/ios18`). Apps without artwork use gradient glyph tiles. **User wants every icon redone except BuckMe once all apps exist.** |
| Wallpaper | `ocean.jpg` is the default (only affects phones without saved settings). |
| Renames | Marketplace shows as **App Store**, Matchmaker as **Hookr** (locale only; ids unchanged). |

### Apps

| App (id) | Backend | Highlights |
|---|---|---|
| **BuckMe** (`WALLET`) | TS `apps/game/server/wallet` | lb-phone's BuckMe rebrand rebuilt: flip card with the same deterministic card number/CVV (identifier-seeded, ported exactly), balance from qbx bank, Pay (contacts + numpad), History, BuckBot help. Payments only to online players (qbx offline `AddMoney` doesn't persist). Export `addWalletTransaction(citizenid, amount, title, logo?)`. |
| **Mail** (`EMAIL`) | TS `apps/game/server/mail` | Auto `first.last@lsmail.com` addresses, inbox/sent, compose, reply, delete, action buttons. **qb-phone compat**: `qb-phone:server:sendNewMail`, `sendNewMailToOffline` (server-only; client calls dropped), `exports['qb-phone']:sendNewMailToOffline`. Exports `sendMail`, `sendMailToPlayer`, `getEmailAddress`. HTML in mail is flattened to text. |
| **Clock** (`CLOCK`) | UI only | World Clock, Alarms, Stopwatch, Timers. Alarms/cities in localStorage. `useClockService` (mounted in `Phone.tsx`) rings alarms/timers even with the app closed. |
| **Weather** (`WEATHER`) | TS client `cl_weather.ts` | Reads GTA weather/rain/wind; lb-phone's temperature table on a smooth day curve; outlook from Renewed-Weathersync `GlobalState.weather.time`. Location is the player's real zone via `GetNameOfZone` against the documented zone-code table (Vespucci, Sandy Shores, Paleto Bay…), `GetLabelText` as fallback. No multi-day forecast on purpose — the server only knows the current weather and when it next changes, and inventing days would be fake data. |
| **Garage** (`GARAGE`) | **Lua** `lua/garage` | qbx_vehicles list, valet ($100, garaged cars only, driver brings it), **Summon** (car that's out, empty, ≤400m), **remote Lock/Unlock** via `qbx_vehiclekeys` `SetLockState` (+ lights/horn chirp), Find on map. |
| **Services** (`SERVICES`) | **Lua** `lua/services` | Companies (police/ambulance/mechanic/taxi, open = on-duty count), customer↔company threads with shared locations and notifications, duty toggle, boss tools (Renewed-Banking deposit/withdraw, staff ranks, fire, hire by server ID within 10m). |
| **Voice Memos** (`VOICEMEMOS`) | TS `apps/game/server/voicememos` | Apple-style list/player, record via existing `useRecorder` + `npwd:audio:uploadAudio`; saves only https links on `config.imageSafety.safeImageUrls`. |
| **Pages** (`PAGES`) | TS `apps/game/server/pages` | Yellow-pages ads: search, detail sheet with Call/Message, compose (title, price, image link, description), delete own, 1 post/minute. |
| **App Store** (`APPSTORE`) | UI only, client-side setting | Catalog/management screen for the "removable" apps (Marketplace, IRC/DarkChat, Life Invader/Twitter, Hookr/Match, Pages) — search, tap a row for a detail sheet (icon, description, provider, size), Get/Open/Remove. Free installs, no economy hook. Backed by `settings.installedApps: string[]` (optional — undefined means "everyone already has every removable app", so existing saves don't lose apps). Fixed the naming/icon collision this file used to warn about: **Marketplace** is back to "Marketplace" with a `Store` glyph tile; the real iOS-pack `appstore.png` artwork now belongs to this app. |

---

## Architecture & conventions

- **TS apps** follow NPWD's pattern: `typings/<app>.ts` (events enum + DTOs) →
  `apps/game/server/<app>/{controller,service,database,utils}.ts` (import controller in `server.ts`) →
  `apps/game/client/cl_<app>.ts` (`RegisterNuiProxy`, import in `client.ts`) →
  `apps/phone/src/apps/<app>/` UI → registered in `os/apps/config/apps.tsx`.
- **Lua apps** (`lua/<app>/`) are used when the feature leans on qbx Lua helpers
  (`qbx.spawnVehicle`, `lib.callback`, oxmysql). They're loaded from `fxmanifest.lua`
  (`shared_scripts` also pulls `@ox_lib/init.lua`, `@qbx_core/modules/lib.lua`). NUI callbacks are
  registered from Lua with the same `npwd:<app>:<action>` names the UI calls.
- Every server handler re-validates ownership/job/amounts; nothing from the NUI is trusted.
- Each new app needs, besides its route: a locale key `APPS_<ID>` in `locale/en.json`, and icon
  files `icons/{material,npwd_icons,ios}/{app,svg}/<ID>.tsx` (the icon hook dynamically imports them).
- Design: Apple look like Clock/Weather — large bold titles, rounded cards, iOS controls,
  Liquid Glass (`.liquid-glass`) for bars/sheets that float.

## Gotchas

- **`lucide-react` is 0.294.0.** Newer icon names (e.g. `LockOpen`) don't exist, and one bad import
  blanks the whole phone. Check names with
  `node -e "const l=require('lucide-react');console.log(['Name'].filter(n=>!(n in l)))"` from `apps/phone`.
- **The `[phone]` folder name is a wildcard** in PowerShell `-Path`/`-OutFile` and curl `-o`. Use
  `-LiteralPath` or write bytes directly.
- **Vite dev server caches failed imports.** If you edit `apps.tsx` before a file it imports exists,
  the preview goes blank; touch `apps.tsx` (or restart dev) after the file exists.
- `AppWrapper`'s `paddingTop` must stay after the `padding` shorthand or it resets to 0.
- Mock data in `fetchNui(..., mock)` only applies outside the game.

---

## Remaining work

1. **Music** — lb-phone's Music was escrowed and had no songs configured. `xsound` is installed
   (`[Scripts]/xsound`), so a Music app could play URLs with 3D positional audio. Needs a design decision.
2. **Home** (housing; server has `qbx_properties`), **Crypto**, **InstaPic**, **Trendy**.
   (App Store is done — see the Apps table above.)
3. **Rewrite custom lb-phone apps natively**: `um_gigs` (Snarf / rydeme), `geocaching_phone`,
   `noted_fitbit`, `noted_crimeapp`, `lonelymans`, `sk_streetkings`. Also re-point `jim_bridge`
   (`GetEquippedPhoneNumber`/`SendMail`) and `ox_inventory`'s `UsePhoneItem` hook to NPWD.
4. **Redo all app icons except BuckMe** (user request, after the build-out).
5. **Go live in game**: swap `ensure lb-phone` for `ensure npwd` in server.cfg, set
   `NPWD_AUDIO_TOKEN`, then test money flows (BuckMe, valet, Services banking), Mail compat events,
   Garage summon/lock, and Services notifications with real players.
