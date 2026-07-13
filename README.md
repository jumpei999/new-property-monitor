# New Property Monitor 🏠

[![Workflow Status](https://github.com/jumpei999/new-property-monitor/actions/workflows/daily-monitoring.yml/badge.svg)](https://github.com/jumpei999/new-property-monitor/actions/workflows/daily-monitoring.yml)

A lightweight, automated web scraping tool designed to monitor real estate listings. Built with **TypeScript**, **Playwright**, and **pnpm**, it runs daily via **GitHub Actions** and stores data in a separate branch to keep the repository clean.

## 🚀 Features

- **Monitored Sites**:
  - [Angel Fudosan](https://www.angel-f.com/)
  - [At Home](https://www.akiya-athome.jp/)
  - [Rakuen Akiya](https://rakuen-akiya.jp/)
  - [SUUMO](https://suumo.jp/)
  - [Yuzawa Resort](https://yuzawaresort.jp/)
  - [Yuzawa Shoji](https://www.yuzawacorp.jp/)
  - [ある日、森のなか。](https://shinanomachi-iju.jp/)
- **Automated Scraping**: Periodically checks for new properties using Playwright.
- **Smart Data Persistence**: Stores results in a dedicated `data` branch, separating code history from data updates.
- **Slack Integration**: Notifies when new listings are found, or when a scrape fails (with a link to the Actions run).
- **Modern Stack**: Developed with TypeScript and managed with pnpm for fast, disk-efficient dependency handling.

## 🛠 Tech Stack

- **Runtime**: Node.js (LTS)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Language**: TypeScript
- **Automation**: GitHub Actions
- **Browser Automation**: [Playwright](https://playwright.dev/)
- **HTML Parsing**: [Cheerio](https://cheerio.js.org/)
- **Validation**: [Zod](https://zod.dev/)

---

## 📂 Repository Structure

This project utilizes an **"Orphan Branch"** strategy to manage data:

- **`main` branch**: Contains the source code, GitHub Actions workflows, and configuration.
- **`data` branch**: Acts as a storage vault for scraped JSON files.

Source layout on `main`:

```text
src/
  main.ts                 # Orchestration
  scrape-list-page.ts     # Shared list-page scrape helper
  scrape-*.ts             # Site scrapers
  parse-properties.ts     # HTML → property list
  persistence.ts          # Detect / save known IDs
  notifier.ts             # Slack notifications
  config.ts               # data directory helpers
  env.ts                  # Env validation
  types.ts                # Shared types
```

---

## ⚙️ Setup & Installation

1. **Clone the repository:**

```bash
git clone https://github.com/jumpei999/new-property-monitor.git
cd new-property-monitor
```

2. **Install dependencies:**

```bash
pnpm i
```

3. **Configure environment variables:**

   Create a `.env` file in the root directory (see `.env.example`). `SLACK_WEBHOOK_URL` is required even for local `pnpm start`.

```env
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
```

4. **Install Playwright browsers:**

```bash
pnpm exec playwright install --with-deps
```

---

## 🏃 Usage

### Local Development

To run the scraper manually on your machine:

```bash
pnpm start
```

### GitHub Actions (Automation)

The scraper is configured to run automatically via the `.github/workflows/daily-monitoring.yml` file.

- **Schedule**: Every day at 00:00 UTC (09:00 JST).
- **Manual Trigger**: You can trigger the workflow from the **Actions** tab in GitHub.

---

## 🔧 GitHub Actions Configuration

Ensure you have added the following secret to your GitHub repository (**Settings > Secrets and variables > Actions**):

- `SLACK_WEBHOOK_URL`: Your Slack Incoming Webhook URL.

---

## 📄 License

This project is licensed under the MIT License.
