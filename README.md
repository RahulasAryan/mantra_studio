# MANTRA — Your Personal AI Operating System

MANTRA is an intelligent personal operating system rewritten in **React, TypeScript, Tailwind CSS, and Vite**. It features a floating tactile avatar, conversational voice interaction, natural language command recognition, scheduled task management, speed-dial contacts, and a rich apps launcher.

## Key Features

- **Floating & Interactive Avatar**: Reacts dynamically to assistant states (`idle`, `listening`, `thinking`, `speaking`, `success`, `error`, `offline`) with WebGL fluid shader effects, concentric sound rings, and equalizer wave bars. Can be dragged across the viewport or docked.
- **Voice & Speech Synthesis**: Full speech recognition (STT) and text-to-speech synthesis (TTS) supporting hands-free voice commands, wake words, and customizable speech rates.
- **Command & Intent Interpreter**: Natural language parsing for tasks (e.g., "Add task to study at 5pm", "Show open tasks"), app launching (e.g., "Open YouTube", "Search for recipes on Google"), screenshots, contacts/calling, and general questions.
- **Task Management Board**: Full task workflow with priority tags (high, medium, low), scheduled date/time pickers, overdue tracking, search & filters, and inline editing.
- **Apps Catalog**: Over 50+ curated applications organized by categories (Google, Communication, Work, Dev, AI, Media, Social, Shopping, Learning, Utilities) with favorite pinning and custom web app support.
- **Productivity Insights**: 7-day completion activity histograms, streaks counter, task completion rates, and command breakdown metrics.
- **Mindloop Concept & Onboarding**: Two-minute mental checkpoint system ("Spot, Shrink, Go") to turn procrastinated items into bite-sized actionable loops.
- **Full Customization & Local Persistence**: Dark/light themes, avatar aura color palettes, shape choices (circle, squircle, rounded), reminder scheduling with browser notifications, and JSON data backup.

## Development

```bash
npm install
npm run dev
```

Dev server starts on port `3000` at `http://0.0.0.0:3000`.
