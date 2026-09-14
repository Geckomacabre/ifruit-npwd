<div align="center">
    <img href="https://projecterror.dev" width="150" src="https://user-images.githubusercontent.com/55056068/147729117-5ab762d8-44be-48f0-bc33-a6664061b6cf.png" alt="Material-UI logo" />
</div>

<div align="center">
  <h1>iFruit NPWD</h1>
  <h3>The iFruit phone you've always wanted but couldn't afford.</h3>
  <p>
    A full visual & UX rework of the excellent <a href="https://github.com/project-error/npwd">NPWD</a><br>
    that finally makes your FiveM phone look and feel like a real iFruit — while staying firmly inside GTA lore.
  </p>
</div>

<div align="center">

[![Discord](https://img.shields.io/discord/791854454760013827?label=Our%20Discord)](https://discord.com/invite/HYwBjTbAY5)

[**Watch the NPWD Trailer**](https://www.youtube.com/watch?v=Yh8gT8wuywU)

![2-1](https://user-images.githubusercontent.com/55056068/147857192-cd8502e6-fb38-4975-b182-4aaaeadff877.png)

</div>

---

### What is this?

Tired of phones that cost more than a high-end apartment in Vinewood just to look halfway decent?

This is a free, fully open-source fork of NPWD that turns the phone into the iFruit device Rockstar never quite delivered:

- Liquid Glass UI (actual refraction, not just a blur filter)
- iOS 18-style home screen icons & dock
- Proper Control Center
- Lock screen with tinted clock, widgets & Notification Center
- SF Pro typography
- Animated weather sky driven by the server's real weather + time
- Native App Store, Settings, and other rebuilt apps

All built on top of the already excellent NPWD foundation — no paid "premium" phone required.

**100% free. Public source code. Fork it, skin it, improve it, do whatever you want.**

---

### Built on the shoulders of giants

Massive respect to the original [NPWD](https://github.com/project-error/npwd) team.
This is a visual/UX layer on top of their solid work, not a replacement.

(And yes, you can still use all the regular NPWD features without paying extra for the privilege of a nicer looking home screen.)

---

## Features

**Everything NPWD already does well:**
- Extremely optimised (idle ~0.01 ms)
- Twitter / Birdy
- Matchmaker
- Marketplace
- Messages (including groups)
- Calling
- Camera + Gallery
- Contacts
- Notes
- Calculator
- Themes, frames, icon sets
- Streamer mode
- Multi-language support
- Discord logging
- Framework-agnostic (ESX, QBCore, custom, etc.)

**Plus the iFruit treatment (recent work):**
- Full iFruit-styled shell
- Liquid Glass design language throughout
- Real Control Center
- Lock screen with widgets + Notification Center
- SF Pro typeface
- iOS 18 icon artwork + Liquid Glass home screen tiles
- Animated weather that actually reacts to the server
- Rebuilt apps with the new design system

More features are actively being added.

### Feature gallery (inherited from NPWD)

- [Optimized](https://i.imgur.com/mN5ib42.png)
  - 0.01 ms on idle and 0.05 while in use.
- [Twitter](https://i.imgur.com/BjwovRR.png)
  - Like, reply, retweet, report and delete your own Tweets.
  - Send emojis and images directly from the phone's gallery, or from an external url. _Gifs too!_
  - NPWD features discord logging so all reported tweets will be sent to the configured webhook.
  - Log tweets directly to discord with configured webhook.
- [Matchmaker](https://i.imgur.com/46XtZ06.jpeg)
  - Like tinder but without all the bots. Swipe right into romance or rejection.
  - As of v1.0, there is no filter for sexual preference.
  - Don't want this app? Follow the documentation [here](https://projecterror.dev/docs/npwd/dev/disable_apps) to disable it.
- [Marketplace](https://user-images.githubusercontent.com/55056068/147530933-d56ceb19-0db2-471f-a8ca-7cc3986b87be.png)
  - Post an ad with/without a picture.
  - Choose a picture from your gallery or from a url.
  - Features calling/messaging icons so no need to provide your number.
- [Text Messaging](https://i.imgur.com/9vFHqhW.png)
  - Send a message or an image taken straight from the phones Gallery.
  - Group messages
- [Calling](https://i.imgur.com/7T0JbQl.png)
  - Call anyone from anywhere.
- [Camera](https://i.imgur.com/Fk6wQkg.png)
  - Take pictures of oneself or your surroundings.
  - All pictures save to the gallery where they can be retrieved with a copyable link.
  - As of v1.0, there is currently [two photo modes](https://i.imgur.com/pole8bA.jpeg) for front/rear camera.
- [Contacts](https://i.imgur.com/Qxs35rj.png)
  - Add a phone number to your contacts for easier access.
  - Supports up to 19 characters for phone number by default and easily changed within the
  - Gif support for avatar.
  - Quickly call, text, and with additional configuration send money.
- [Notes](https://i.imgur.com/0Hvvlah.png)
  - Something you want to remember in game? Make a note!
- [Calculator](https://user-images.githubusercontent.com/55056068/147531020-b7527a69-0b0e-4e81-83c7-58ad836eab23.png)
  - Peform calculations.
- [Themes](https://i.imgur.com/2DpBHuM.png)
  - Default dark theme or light theme with other themes in the works. Want to make your own? Follow our [documentation](https://projecterror.dev/docs/npwd/dev/setup#setting-up-the-theme).
  - Set within the Settings app.
- [6 Custom Cases/Frames](https://i.imgur.com/opyF0J1.png)
  - These cases were made by [DayIsKuan](https://github.com/dayiskuan)
  - Set within the Settings app.
- [Icon Sets](https://i.imgur.com/z7pyrmU.png)
  - Change between material UI icons or our custom made icons.
  - Want to make your own? Follow our [documentation](https://projecterror.dev/docs/npwd/dev/setup#adding-icons).
  - Set within the Settings app.
- [Notifications - Closed](https://i.imgur.com/j474Sc2.png)
  - While closed, only a portion of it will render to display a notification.
  - As of v1.0, this is currently used for calls, text and tweets.
- [Notifications - Open](https://i.imgur.com/33BlJn6.png)
  - While open, all notifications occur across the top of the phone.
  - View [missed notifications](https://i.imgur.com/3B4Ezyq.png) by clicking on the phone's header.
- [Streamer Mode](https://i.imgur.com/jzU075n.png)
  - A mode designed for streamers where images are hidden unless clicked.
  - This applies across all apps on the phone.
  - Easily set within the phone's setting app.
- [Settings Configuration](https://user-images.githubusercontent.com/55056068/147530852-78934a48-b478-472c-b7f4-61860e4f8479.mp4)
  - Use a slider to set ringtone and notification alert volume.
  - Copy your phone number to clipboard for easy sharing.
  - Configure a chosen ringtone or alert sound.
  - Choose betwen **twelve** languages as of v1.0.
  - Change frames, icon sets and themes.
  - Adjust Zoom (100% to 70%).
  - Filter notification preferences.
- Discord Logging
  - Follow our [documentation](https://projecterror.dev/docs/npwd/start/installation#setting-up-discord-log-integration) for intial setup.
  - Never used a webhook before? Follow Discord's [documentation](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for creating a webhook.

---

### Installation

Same process as regular NPWD — just use this repo instead of the original.

1. Follow the official NPWD installation docs:
   https://projecterror.dev/docs/npwd/start/installation
2. Make sure you have [screenshot-basic](https://github.com/project-error/screenshot-basic).
3. Drop this resource in and configure `config.json` as usual.

Because this is still NPWD under the hood, existing bridges, frameworks, and external apps continue to work.

## Technical Stack and Development

_NPWD_ uses React + TypeScript to form the NUI front end and uses TypeScript (V8 runtime) for game
scripts. You can find more technical information regarding the development of this project on our docs
page [here](https://projecterror.dev/docs/npwd/dev/dev_bootstrap).

---

### Development & Contributing

Monorepo structure is identical to upstream NPWD:

#### Apps

- `phone`: The React code for NPWD.
- `game`: Game releated scripts and code that runs on the client/server-side in FiveM.

#### Packages

- `npwd-hooks`: Hooks used throughout external apps. Mainly to communicate with `npwd` through custom window events.
- `npwd-types`: Auto-generated types from NPWD that can be used in external apps.
- `database`: Database configuration and classes for each app
- `logger`: Logging lib with `winston`
- `config`: NPWD related config functions

PRs that push the iFruit vision further are welcome.

## Feature Request & Issue Reporting

Please open an issue/enhancement on our [Github Repo](https://github.com/project-error/npwd/issues/new/choose). This is the best way for us to track what needs to be resolved or improved upon.

---

### License

Same license as original NPWD (see `LICENSE`).

## Final words

A special thanks to all the people who have helped out with the translations! You have all been amazing.

Thanks to [Ultrahacx](https://github.com/ultrahacx) for all the artwork and animations seen in the trailer and this post.

---

*In Los Santos you can buy a yacht, a private jet, and a small army… but somehow the only way to get a phone that doesn't look like it came from 2012 is to open-source it yourself.*
