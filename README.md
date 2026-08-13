<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <img width="1049" height="482" alt="Untitled - August 12, 2026 at 04 26 41" src="https://github.com/user-attachments/assets/4b8c2b7e-f163-4ded-9b5d-45883685ef58" />

  <p align="center">
    Find local volunteer events and drop-in impact spots on the Snap Map - RSVP with friends, check in with the camera, and track your volunteer hours.
    <br />
    <a href="https://www.figma.com/proto/xTIcb1naUsQuPvRdCbkMb7/Impacts-%7C-Sustainability?node-id=1508-34358&p=f&viewport=628%2C461%2C0.11&t=9djHLMEeAja9n99y-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1508%3A34241&show-proto-sidebar=1&page-id=1508%3A34240"><strong>View the Figma »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#database-setup">Database Setup</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#team">Team</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

People who want to give back often don't know where to start. Volunteer opportunities are scattered across dozens of sites, so half the effort is just finding something nearby.

Impacts puts them on a map you already open. It's a feature built inside a Snapchat clone that surfaces local sustainability events and drop-in spots, shows which of your friends are going, and turns showing up into something you can track and share.

The idea is that discovery, motivation, and participation already live on Snap - the Map, your friends, and the camera. **Impacts** connects those three things to something meaningful, without asking anyone to download another app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

<div align="center">
- **Map discovery** - volunteer events and drop-in spots appear as pins on the Snap Map, with a bottom sheet listing everything nearby.

<img width="295" height="640" alt="Simulator Screen Recording - iPhone 17 Pro - 2026-08-12 at 04 38 48" src="https://github.com/user-attachments/assets/8fc038f7-0487-4380-a7f4-7624ab594a3f" />

- **Two kinds of opportunity** - scheduled events you RSVP to, and anytime drop-ins (food banks, community gardens, fixit clinics) that show live open/closed status from their opening hours.

  <img width="295" height="640" alt="Simulator Screen Recording - iPhone 17 Pro - 2026-08-12 at 04 40 30" src="https://github.com/user-attachments/assets/8e0ea358-05cc-4292-acd4-8be8cefca2be" />

- **Friends attending** - each event shows which of your friends are going, so signing up feels like making plans rather than volunteering alone.

  <img width="386" height="147" alt="image" src="https://github.com/user-attachments/assets/b052e7a5-8e5a-4642-b555-7dee4d75c4b0" />


- **RSVP and save** - RSVP to events or heart a place to save it; both persist to the database and stay in sync across the list, the map, and the detail page.
<img width="295" height="640" alt="Simulator Screen Recording - iPhone 17 Pro - 2026-08-12 at 04 44 31" src="https://github.com/user-attachments/assets/630e97a2-a154-42d9-88b2-c30abea43566" />

- **Impact profile** - volunteer hours, events attended, and organizations are computed from your attendance, with rewards and progress toward Impact Medals.
  
<img width="295" height="640" alt="image" src="https://github.com/user-attachments/assets/61498a35-0e53-49d5-8521-42408cd66a57" /> <img width="295" height="640" alt="image" src="https://github.com/user-attachments/assets/1b09a0d2-5edf-4869-9b30-4230b1494d13" />

- **Community tab** - surfaces familiar faces from events you've attended so you can turn them into friends.
<img width="295" height="640" alt="image" src="https://github.com/user-attachments/assets/c00c9306-92e3-43aa-898b-703e41427be5" />
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![JavaScript][JavaScript.com]][JavaScript-url]
- [![React Native][ReactNative]][ReactNative-url]
- [![Expo][Expo.dev]][Expo-url]
- [![Supabase][Supabase.com]][Supabase-url]
- [![Git][Git.com]][Git-url]
- [![GitHub][GitHub.com]][GitHub-url]

Also built on `react-native-maps` for the map and pins, `@gorhom/bottom-sheet` for the sliding sheets, and `react-native-reanimated` for the pill and press animations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- Node.js and npm
  ```sh
  npm install npm@latest -g
  ```
- The Expo Go app on your phone, or an iOS simulator / Android emulator
- A [Supabase](https://supabase.com) project

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/sea2026_sustainability.git
   cd sea2026_sustainability
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a `.env.local` file in the project root with your Supabase credentials, found under **Project Settings → API**
   ```sh
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key
   ```
4. Start the app
   ```sh
   npx expo start
   ```

> If you change `.env.local` while the server is running, restart with `npx expo start -c`. Expo inlines those values at bundle time, so Metro will otherwise serve the old ones.

### Database Setup

The app reads everything from Supabase, so a fresh project needs the schema and some seed data before anything shows up. Run the SQL files in the `sql/` folder in order via the Supabase SQL editor.

The schema is:

| Table | What it holds |
| --- | --- |
| `events` | Both scheduled events and drop-in places, told apart by a `type` column |
| `organizations` | Event hosts |
| `attending` | Who RSVP'd or attended which event |
| `saved_impacts` | Places a user has hearted |
| `friends` | Friend pairs, stored in both directions |
| `users` | Profiles, extending `auth.users` |
| `rewards` | Unlockable items and their point thresholds |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->

## Project Structure

```
src/
├── components/
│   ├── EventCard.jsx      # one row in the list - thumbnail, details, save heart
│   ├── EventList.jsx      # bottom sheet with Events / Drop-In / Favorites tabs
│   ├── EventPageTab.jsx   # event detail sheet - RSVP, directions, attendees
│   └── MapPillBar.jsx     # the horizontal filter pills on the map
├── lib/
│   ├── eventsAPI.js       # every Supabase read/write, normalized into one shape
│   └── supabase.ts        # client setup
├── screens/
│   ├── MapScreen.jsx      # the map, pins, and everything that opens from it
│   ├── ImpactScreen.js    # hours, rewards, and recent impact
│   └── CameraScreen.js    # capture and check in at an event
└── utils/
    ├── datetimeUtil.js    # date formatting and opening-hours helpers
    └── geoUtil.js         # distance and drive-time estimates
```

`eventsAPI.js` is the single boundary between the app and the database. Rows from `events` get normalized there into one common shape, so no component has to care whether it's looking at a scheduled event or a drop-in - they read `kind` instead.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TEAM -->

## Team

| Name | GitHub |
| --- | --- |
| Keziah M | [@3nk4kuu](https://github.com/3nk4kuu) |
| Vaughn A| [@Vaughn-Alston](https://github.com/Vaughn-Alston) |
| Melissa L| [@h3x-cod3](https://github.com/h3x-cod3) |

Built during Snap Engineering Academy 2026.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the project_license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[ReactNative]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactNative-url]: https://reactnative.dev/
[Expo.dev]: https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://expo.dev/
[Supabase.com]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Git.com]: https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white
[Git-url]: https://git-scm.com/
[GitHub.com]: https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white
[GitHub-url]: https://github.com/
[JavaScript.com]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
