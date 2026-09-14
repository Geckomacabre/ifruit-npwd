# iFruit NPWD — Handoff

This fork of [NPWD](https://github.com/project-error/new-phone-who-dis) is being turned into an
iOS-style ("iFruit") phone that fully replaces **lb-phone** on the EnhancedMafia (Qbox) server.
lb-phone is escrowed and its UI is minified, so nothing is copied from it: every app is rebuilt
natively here, using lb-phone only as a behaviour/content reference.

Status as of 2026-09-14. `server.cfg` still starts `lb-phone`; NPWD has not been switched on in game
yet, so everything below is verified by builds and the browser dev preview, **not in-game**.

> **Nothing here has run in game.** Every app was built against mock data in the browser preview.
> The single highest-value next step is the go-live in "Remaining work", because it is the first
> time any of this meets a real server.

---

## Running it

```bash
pnpm install
pnpm build            # turbo: game scripts (dist/game) + phone UI (dist/html)
pnpm --filter @npwd/nui dev   # browser preview at http://localhost:3050 (mock data)
```

In the browser preview every `fetchNui` returns the mock data passed as its third argument, so
all apps are clickable without a server. The preview starts on the lock screen — drag upward
anywhere to unlock.

### Server requirements

- `set npwd:framework "qbx"` (already in server.cfg)
- Resources started **before** npwd: `ox_lib`, `qbx_core`, `oxmysql`, `qbx_vehicles`, `qbx_garages`,
  `qbx_vehiclekeys`, `Renewed-Banking`, `screenshot-basic`, `pma-voice`, `ox_target`
  (`ox_target` is new — the Snarf/rydeme client uses it)
- `set NPWD_AUDIO_TOKEN "<fivemanage token>"` — currently **empty** in server.cfg, so voice notes
  and Voice Memos uploads fail with "No upload token found!" until it is set.
- New tables are created automatically on start; they are also appended to `import.sql`.
- **`um_gigs` must be stopped** once npwd is live. Its Lua now lives in `lua/gigs` and still
  registers the same `um_gigs:*` net events, so running both would double every handler.

---

## What's built

### Shell (iFruit)

| Area | Notes |
|---|---|
| Frame, status bar, lock screen | From the earlier iFruit rework commit. Lock screen swipe fixed (quick flicks now unlock). |
| **Control Center** | **Close to the reference but not pixel-exact — accepted as good enough for now (2026-09-13), not finished.** If picking this back up, measure ratios off the reference screenshot rather than adjusting by eye; the geometry currently in `ControlCenter.tsx` is commented with the values it was built to. Rebuilt to the real iOS layout: connectivity module (airplane/cellular/Wi-Fi/Bluetooth, the last three dimmed by airplane mode), Now Playing, standalone rotation-lock + flashlight circles, vertical brightness/volume sliders, a Do Not Disturb pill, and a shelf of extra controls (low power, appearance, nearby share, hotspot, and shortcuts to Timer/Camera/Calculator/Voice Memos). Nothing Apple- or brand-marked: AirDrop/AirPlay became "Nearby Share" and a generic cast glyph. **Brightness** drives `BrightnessOverlay` (a black overlay capped at 55% — a CSS `filter` on the phone container would create a containing block and kill every `backdrop-filter`). **Volume** writes `settings.callVolume` on release only, since each settings write re-sends the whole object over NUI. Cosmetic-only toggles (no game hook yet): rotation lock, flashlight, low power, nearby share, hotspot, bluetooth. |
| Pull-down gesture | Split like a real phone: dragging down the **clock side** of the status bar opens Notification Center, the **battery side** opens Control Center. Dragging the middle of the home screen still opens notifications. |
| Home indicator | Only inside apps now — hidden on the home screen and lock screen. |
| Home screen | **Pages sideways, never scrolls.** Fixed 4x6 grid; overflow goes to a new page, swiped with CSS scroll-snap, dots above the dock. Paging is computed on *visible* apps so an App Store deletion closes the gap. `AppIcon`'s built-in 24px top margin is zeroed inside `.home-page` (it was sized for the old scrolling list and pushes the sixth row off screen). |
| Status-bar spacing | `AppWrapper` pads every app 44px below the status bar on its theme background. Apps that paint under the status bar pass `fullBleed`. |
| Home indicator | Floats over apps (`Navigation.tsx`), difference-blended so it shows on light and dark. MUI bottom tab bars get extra bottom padding in `Phone.css`. |
| Notifications | Banners sit under the dynamic island (`Phone.css` → `.notistack-SnackbarContainer`). |
| **Liquid Glass** | `os/glass/glassTokens.ts` maps one 0–100 value to CSS variables; `.liquid-glass` (+ `-dark`, `-bar`) in `Phone.css`. Used by dock, banners, Control Center, tab bars. **Settings → Appearance → Liquid Glass** slider (Glossy ↔ Frosted, live preview). Setting key `glassFrost` is optional in the schema on purpose — making it required would invalidate everyone's saved settings. |
| iOS icon set | `os/apps/icons/ios` (default icon set). **Two sources.** Apps with a real counterpart use the iOS 18 artwork the user supplied, in `public/media/icons/appicons` via `appIcon('<file>')` — phone, messages, contacts, safari, camera, calculator, settings, clock, weather, notes, mail, voicememos, appstore, books (Pages), heart (Hookr). Those PNGs are 60×60 with their own squircle and transparent corners, so the renderer only adds a floor shadow. The pack is Apple stock apps only, so the game-specific apps (IRC, Life Invader, Marketplace, Garage, Services, Example) use the **generated** tiles below. BuckMe keeps its own artwork. The older pack at `public/media/icons/ios18` is unreferenced and can be deleted. |
| Generated tiles | For any app with no artwork — `liquidGlass.tsx` builds a real superellipse tile (n = 5) and supplies the glass — colored base, floor shadow, top-left specular bloom, diagonal sheen, Fresnel rim bright at the top edge into dark at the bottom. `glyphs.tsx` holds flat silhouettes drawn from primitives, which carry no lighting of their own. Adding an icon = a 3-line file pairing a gradient with a glyph. **BuckMe keeps its own icon** (still the npwd_icons artwork). Glyphs are drawn from primitives, not traced from an icon pack: iOS10-SVG-ICONS is unlicensed and recreates Apple's icons. |
| Typography | **SF Pro**, in `public/fonts` as Latin-subset woff2 (the source OTFs are ~6MB each; subsetting takes the whole set to ~530KB — regenerate with `fontTools.subset --flavor=woff2` if more weights are needed). Apple's split: `SF Pro Text` for body (the default on `.PhoneScreen`, the MUI theme and both theme presets), `SF Pro Display` for headings via `h1`/`h2` and the `.sf-display` class, `SF Pro Rounded` for the lock screen clock. |
| Lock screen | `LockFace.tsx` holds the clock, widget row and flashlight/camera controls; the lock screen and Notification Center both compose them, because on iOS they are the same surface. The clock is translucent tinted glass with a brighter edge (`lockscreen.css`), not a flat fill. Battery in the widget row is **decorative** — there is no battery model yet; the weather beside it is real. |
| Notifications | A locked phone shows no banner (the lock screen already lists it). Banners are `NotificationBase.tsx`, sized to the 400px screen and using the app's real icon. |
| Wallpaper | `ocean.jpg` is the default (only affects phones without saved settings). |
| Renames | Matchmaker shows as **Hookr**, Twitter as **Life Invader**, DarkChat as **IRC** (locale only; ids unchanged). Marketplace is back to **Marketplace** — the real App Store app now owns that name. |

### Apps

| App (id) | Backend | Highlights |
|---|---|---|
| **BuckMe** (`WALLET`) | TS `apps/game/server/wallet` | lb-phone's BuckMe rebrand rebuilt: flip card with the same deterministic card number/CVV (identifier-seeded, ported exactly), balance from qbx bank, Pay (contacts + numpad), History, BuckBot help. Payments only to online players (qbx offline `AddMoney` doesn't persist). Export `addWalletTransaction(citizenid, amount, title, logo?)`. |
| **Mail** (`EMAIL`) | TS `apps/game/server/mail` | Auto `first.last@lsmail.com` addresses, inbox/sent, compose, reply, delete, action buttons. **qb-phone compat**: `qb-phone:server:sendNewMail`, `sendNewMailToOffline` (server-only; client calls dropped), `exports['qb-phone']:sendNewMailToOffline`. Exports `sendMail`, `sendMailToPlayer`, `getEmailAddress`. HTML in mail is flattened to text. |
| **Clock** (`CLOCK`) | UI only | World Clock, Alarms, Stopwatch, Timers. Alarms/cities in localStorage. `useClockService` (mounted in `Phone.tsx`) rings alarms/timers even with the app closed. |
| **Weather** (`WEATHER`) | TS client `cl_weather.ts` | Reads GTA weather/rain/wind; lb-phone's temperature table on a smooth day curve; outlook from Renewed-Weathersync `GlobalState.weather.time`. Location is the player's real zone via `GetNameOfZone` against the documented zone-code table (Vespucci, Sandy Shores, Paleto Bay…), `GetLabelText` as fallback. **Animated sky** (`components/SkyScene.tsx` + `utils/sky.ts` + `weather.css`): the payload carries the in-game `hour`/`minute`, and the gradient interpolates between dawn/day/dusk/night anchors from that clock, then greys toward overcast by condition. Over it: a sun or moon on an arc, drifting clouds, rain, snow, fog banks, twinkling stars, lightning. Two deliberate choices — the sun/moon rides the **top edge** (a full horizon arc puts it behind the location/temperature type), and clouds blur their own body rather than using `backdrop-filter`, which is far cheaper with a dozen animating at once. No multi-day forecast on purpose — the server only knows the current weather and when it next changes, and inventing days would be fake data. |
| **Garage** (`GARAGE`) | **Lua** `lua/garage` | qbx_vehicles list, valet ($100, garaged cars only, driver brings it), **Summon** (car that's out, empty, ≤400m), **remote Lock/Unlock** via `qbx_vehiclekeys` `SetLockState` (+ lights/horn chirp), Find on map. |
| **Services** (`SERVICES`) | **Lua** `lua/services` | Companies (police/ambulance/mechanic/taxi, open = on-duty count), customer↔company threads with shared locations and notifications, duty toggle, boss tools (Renewed-Banking deposit/withdraw, staff ranks, fire, hire by server ID within 10m). |
| **Voice Memos** (`VOICEMEMOS`) | TS `apps/game/server/voicememos` | Apple-style list/player, record via existing `useRecorder` + `npwd:audio:uploadAudio`; saves only https links on `config.imageSafety.safeImageUrls`. |
| **Pages** (`PAGES`) | TS `apps/game/server/pages` | Yellow-pages ads: search, detail sheet with Call/Message, compose (title, price, image link, description), delete own, 1 post/minute. |
| **Snarf** (`SNARF`) / **rydeme** (`RYDEME`) | **Lua** `lua/gigs` | Ported from the `um_gigs` resource, whose Lua backend moved here largely untouched. `rydeme`'s identifier in the Lua is still `goober`. Shared UI in `apps/phone/src/apps/gigs`: `GigShell` (duty switch, incoming fare with a client-side countdown, active job, rating history) with Snarf as a board and rydeme dispatch-only plus a rider panel. **Not ported yet:** the Leaflet destination picker (the rider panel uses the player's map waypoint instead) and the live driving HUD (speed/limit/map), both of which exist in the old `um_gigs/ui`. Two polls: `getState` every 4s (server), `getLive` every 1s (client, drives the countdown). |
| **Crypto** (`CRYPTO`) | TS `apps/game/server/crypto` | Server-authoritative market: prices tick every 30s and are shared, so everyone sees the same number. Random walk with a weak pull toward the seed; **deliberately not persisted** — a restart reseeds it rather than keeping a table of noise. Holdings and trades are persisted. Money goes through the same framework bridge BuckMe uses. Buying spends dollars, selling sends coins; the price is read once per trade so a tick can't change the deal mid-way, and a partial sell shrinks the cost basis proportionally. |
| **InstaPic** (`INSTAPIC`) | TS `apps/game/server/instapic` | Feed, my-posts, like/unlike, delete. Posting picks from the phone's own camera roll rather than a URL box. Likes are a `(post_id, identifier)` table so one-like-per-player is enforced by the primary key; deletes check ownership in the DELETE's WHERE clause. |
| **Trendy** (`TRENDY`) | TS `apps/game/server/trendy` | Full-bleed vertical feed, paged by CSS scroll-snap rather than a gesture handler. One media URL field: `.mp4/.webm/.mov` autoplays muted and looping, anything else renders as an image. Same host allow-list and like/ownership rules as InstaPic. |
| **Home** (`HOME`) | **Lua** `lua/home` | Properties you own or hold a key to, with a waypoint button and owner-only key revocation. Reads qbx_properties' `properties` table **directly** — that resource registers lib.callbacks for its own client, not exports others can call. Only mutation is revoking a key (server-checked against the owner, refuses the owner's own). |
| **Music** (`MUSIC`) | **Lua** `lua/music` | Playlist of direct audio links via xsound. Two real mechanisms, not a cosmetic switch: **earbuds** plays on your client only; **speaker** is broadcast server-side as a positioned sound at where you started it, so anyone within 30m hears it. One speaker per player, cleaned up on disconnect and resource stop. Pause is earbuds-only on purpose. |
| **App Store** (`APPSTORE`) | UI only, client-side setting | Catalog/management screen for the "removable" apps (Marketplace, IRC/DarkChat, Life Invader/Twitter, Hookr/Match, Pages) — search, tap a row for a detail sheet (icon, description, provider, size), Get/Open/Remove. Free installs, no economy hook. Backed by `settings.removedApps: string[]` — **opt-out, deliberately**: an earlier opt-in `installedApps` list meant any app added in a later update never appeared for a player who had already used the store. Mark a new app `removable: true` in `apps.tsx` to list it here. Fixed the naming/icon collision this file used to warn about: **Marketplace** is back to "Marketplace" with a `Store` glyph tile; the real iOS-pack `appstore.png` artwork now belongs to this app. |

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
- **A spread of drag handlers carries its own `style`.** `{...dragProps}` placed after a `style`
  prop replaces it outright — this silently killed the Control Center's padding for a while. Spread
  first, then `style={{ ...dragProps.style, ... }}`.
- **Match the reference by measuring it**, not by eye. Read proportions off the screenshot as a
  percentage of screen width and build to them; several rounds were lost adjusting sizes by feel
  when the real error was the block's inset (12% of width, not 4%).
- **Liquid Glass is refraction, not blur.** `os/glass/LiquidGlassFilters.tsx` drives
  `feDisplacementMap` through `backdrop-filter: url(#...)`, which this CEF-class browser supports.
  Blur past ~20px on a 400px screen erases what is behind the glass and it goes back to looking
  like frosted plastic.

---

## Adding an app

The repeated task, so the whole checklist in one place:

1. `typings/<app>.ts` — an events enum and the DTOs.
2. Backend — **TS** (`apps/game/server/<app>/`, `apps/game/client/cl_<app>.ts`, imported in
   `server.ts` / `client.ts`) or **Lua** (`lua/<app>/`, listed in `fxmanifest.lua`). Lua when the
   feature leans on qbx helpers or oxmysql. Either way the NUI callback is `npwd:<app>:<action>`.
3. UI in `apps/phone/src/apps/<app>/`, with browser mock data passed as `fetchNui`'s third argument.
4. Icons: `icons/{ios,material,npwd_icons}/{app,svg}/<ID>.tsx`. For a game-specific app that means a
   glyph in `icons/ios/glyphs.tsx` plus a 3-line `liquidIcon(...)` tile; for one with real artwork,
   `appIcon('<file>')`.
5. Locale key `APPS_<ID>` in `locale/en.json`, then register in `os/apps/config/apps.tsx`
   (add `removable: true` + `storeDescription`/`storeSizeKb` to list it in the App Store).

## Remaining work

1. ~~Music, Home, Crypto, InstaPic, Trendy~~ — all built; see the Apps table. **Every stock app on
   the original port list now exists.**
2. **Finish Snarf / rydeme**: the Leaflet destination picker and the live driving HUD from
   `[UM]/um_gigs/ui` are not ported (see the Apps table). Once npwd is live, **stop `um_gigs`** —
   its net events are still named `um_gigs:*` here, so both running at once doubles every handler.
3. **Rewrite the remaining custom lb-phone apps natively**: `geocaching_phone`, `noted_fitbit`,
   `noted_crimeapp`, `lonelymans`, `sk_streetkings` (all under `[Scripts]/`). Also re-point
   `jim_bridge` (`GetEquippedPhoneNumber`/`SendMail`) and `ox_inventory`'s `UsePhoneItem` hook to NPWD.
4. Optional: iOS icon *appearance variants* (default / dark / clear / tinted), per Apple's HIG
   "Appearances" — keep an icon's core shape identical across variants.
5. **Go live in game**: swap `ensure lb-phone` for `ensure npwd` in server.cfg, stop `um_gigs`, set
   `NPWD_AUDIO_TOKEN`, then test money flows (BuckMe, valet, Services banking), Mail compat events,
   Garage summon/lock, Services notifications, and a full Snarf delivery + rydeme ride with real players.

## Known-imperfect, deliberately

- **Control Center** is close to the reference but not pixel-exact (see its row above).
- **Battery** in the lock screen widget row and Control Center is hardcoded 100% — there is no
  battery model. The weather beside it is real.
- Cosmetic-only Control Center toggles (no game hook): rotation lock, flashlight, low power,
  nearby share, hotspot, bluetooth, screen mirroring.
- `tsc` reports ~200 pre-existing errors in this fork, nearly all `t(...)` returning
  `TFunctionResult` where a `ReactNode` is wanted. The build uses esbuild/Vite and does not
  typecheck, so these are inherited noise — but it does mean `tsc` can't be used as a clean gate.
