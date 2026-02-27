# Tab Organizer — Chrome Extension

Automatically groups your Chrome tabs into organized groups. Built for people who are chaotic with their tabs.

**Author:** Mourya Teja Kunuku

## Features

- **5 Organizing Templates** — switch between different grouping strategies:

  | Template | Groups Into |
  |----------|------------|
  | By Domain | YouTube, GitHub, Google... |
  | By Session | Tabs opened in the same browsing burst |
  | By Category | Work, Entertainment, Social, Shopping, Research |
  | By Recency | Today, Yesterday, This Week, Older |
  | By Activity | Active, Stale, Forgotten |

- **Auto-organize** — automatically groups new tabs as you open them
- **Manual organize** — click the Organize button anytime
- **Side panel UI** — dark-themed panel with search, drag-and-drop, and group management
- **Group management** — rename, recolor, and collapse groups
- **Tab actions** — click to switch, close tabs from the panel

## Installation

### Quick Install (No Build Required)

1. **Download this repo** — click the green **Code** button above, then **Download ZIP**
2. **Extract the ZIP** to a folder on your computer
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer Mode** (toggle in the top-right corner)
5. Click **Load unpacked**
6. Select the **`dist`** folder inside the extracted folder
7. Done! Click the extension icon in your toolbar to open the side panel

### Build From Source

If you want to modify the code:

```bash
# Clone the repo
git clone https://github.com/mouryat9/Tab-Organizer-Chrome.git
cd Tab-Organizer-Chrome

# Install dependencies
npm install

# Build
npm run build:quick

# Then load the dist/ folder in Chrome as described above
```

## How to Use

1. Click the **Tab Organizer** icon in your Chrome toolbar to open the side panel
2. Select an organizing template from the **dropdown** (By Domain, By Session, etc.)
3. Click **Organize** to group your tabs
4. Open **Settings** (gear icon) to:
   - Enable auto-organize
   - Choose your preferred template
   - Toggle pinned tab handling

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Chrome Extension Manifest V3
- @dnd-kit for drag-and-drop

## Permissions

This extension requires:
- `tabs` — to read and organize your tabs
- `tabGroups` — to create and manage tab groups
- `sidePanel` — to display the side panel UI
- `storage` — to save your settings

## License

MIT
