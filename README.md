<div align="center">

<br/>

```
██████╗ ██╗  ██╗ █████╗ ███╗   ██╗████████╗██╗██╗  ██╗
██╔══██╗██║  ██║██╔══██╗████╗  ██║╚══██╔══╝██║╚██╗██╔╝
██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║ ╚███╔╝ 
██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║   ██║   ██║ ██╔██╗ 
██║     ██║  ██║██║  ██║██║ ╚████║   ██║   ██║██╔╝ ██╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚════╝  ╚═╝   ╚═╝╚═╝  ╚═╝
```

**A simple, self-hosted internal messaging desktop app — fork it, own it, extend it.**

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](CONTRIBUTING.md)
[![Forks](https://img.shields.io/github/forks/imkaiwhyask/phantix?style=flat&color=orange)](https://github.com/imkaiwhyask/phantix/network/members)
[![Stars](https://img.shields.io/github/stars/imkaiwhyask/phantix?style=flat&color=yellow)](https://github.com/imkaiwhyask/phantix/stargazers)
[![Issues](https://img.shields.io/github/issues/imkaiwhyask/phantix)](https://github.com/imkaiwhyask/phantix/issues)

<br/>

</div>

---

## 💬 What is Phantix?

**Phantix** is an open-source, self-hosted internal messaging desktop app built with **Electron**, **PHP**, and **MySQL**. It's designed for teams and organizations that want a private, on-premise messaging solution without relying on third-party services.

No Slack. No Teams. No subscriptions. Just your own server, your own data.

> Fork it. Self-host it. Make it yours.

---

## ✨ Features

### 🔐 Authentication
- Email + password login
- Keyboard support (Enter to login)
- Session-based admin panel access

### 💬 Messaging
- 1-on-1 chat
- Real-time message refresh (polling)
- Send with Enter, newline with Shift+Enter
- Message bubbles (me vs. others)
- Auto-scroll to latest message

### 🧠 Chat Intelligence
- Unread message badge 🔴
- Read / Unread status (iMessage-style)
- Typing indicator (animated three dots)
- Active conversation highlight
- Escape key to close conversation

### 👤 Profile System
- Upload & crop avatar (1:1, powered by Cropper.js) 📷✂️
- Default avatar = first letter of name or nickname
- Nickname support ✏️
- Department field 🏢
- Status system: 🟢 Online · 🟡 Away · 🔴 Busy · ⚫ Offline
- Profile modal with editable info
- Clean sidebar profile display

### 🧑‍🤝‍🧑 User List
- Shows all users with avatar + name (nickname priority)
- Unread count badge per user
- Click to open chat
- Active user highlight

### 🖥️ UI / UX
- Lark/Slack-inspired layout
- Left icon rail + chat list panel + main chat window + right info panel
- Clean, modern design with responsive adjustments

### ⚙️ Admin Panel (Web App)
- Separate admin dashboard with login protection
- View, create, edit, and delete users
- Toggle admin role per user

### 🔄 Backend
- PHP REST-style API
- MySQL database
- Docker-ready structure
- Modular endpoints: login, users, messages, unread counts, typing, profile update, avatar upload

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop App | [Electron.js](https://www.electronjs.org/) |
| Backend | PHP |
| Database | MySQL |
| Infrastructure | Docker / Docker Compose |
| Frontend | HTML, CSS, JavaScript |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [PHP](https://www.php.net/) (v8.x recommended)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/imkaiwhyask/phantix.git
cd phantix

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and config

# 3. Start the backend with Docker
docker-compose up -d

# 4. Install Electron dependencies
cd electron-app
npm install

# 5. Launch the app
npm start
```

---

## 📁 Project Structure

```
phantix/
├── backend/           # PHP API — handles auth, messaging, and DB logic
├── electron-app/      # Electron desktop app — UI and IPC logic
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🤝 Contributing

Phantix is open-source and built for the community. **All contributions are welcome** — bug fixes, new features, UI improvements, docs — everything counts.

### 🗺️ Roadmap — what's planned

These are great starting points if you want to contribute:

| Feature | Status |
|---|---|
| File / image upload in chat | ⏳ Planned |
| Real-time online/offline presence (heartbeat) | ⏳ Planned |
| Delete message / "This message was removed" | ⏳ Planned |
| Delete conversation | ⏳ Planned |
| Emoji picker | ⏳ Planned |
| Desktop notifications | ⏳ Planned |
| AD / LDAP integration | ⏳ Planned |
| Settings panel (.env UI) | ⏳ Planned |
| Group / channel messaging | 💡 Idea |
| End-to-end encryption | 💡 Idea |
| Web client / browser version | 💡 Idea |
| Dark mode | 💡 Idea |
| Multi-language / i18n support | 💡 Idea |

### How to contribute

1. **Fork** this repo
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request** — describe what you built and why

Please follow the existing code style and keep PRs focused on a single change.

---

## 🐛 Reporting Issues

Found a bug? Have a feature request? [Open an issue](https://github.com/imkaiwhyask/phantix/issues) and describe what you're seeing. Screenshots and reproduction steps are always appreciated.

---

## 📄 License

Phantix is released under the **MIT License** — free to use, modify, distribute, and build upon.

See [LICENSE](LICENSE) for full details.

---

## 🌟 Show Your Support

If Phantix has been useful to you, give it a ⭐ on GitHub — it helps others discover the project and keeps the momentum going!

---

<div align="center">
  <sub>Built with ☕ by <a href="https://github.com/imkaiwhyask">imkaiwhyask</a> — open to the world 🌍</sub>
</div>
