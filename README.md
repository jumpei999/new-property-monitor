# New Property Monitor 🏠

[![Workflow Status](https://github.com/jumpei999/new-property-monitor/actions/workflows/daily-monitoring.yml/badge.svg)](https://github.com/jumpei999/new-property-monitor/actions/workflows/daily-monitoring.yml)

A lightweight, automated web scraping tool designed to monitor real estate listings. Built with **TypeScript**, **Playwright**, and **pnpm**, it runs weekly via **GitHub Actions** and stores data in a separate branch to keep the repository clean.

## 🚀 Features

- **Monitored Sites**:
  - [Angel Fudosan](https://www.angel-f.com/)
  - [At Home](https://www.akiya-athome.jp/) (local execution only; see below)
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
  main.ts                 # Orchestration (GitHub Actions)
  main-akiya-athome.ts    # Akiya Athome only (local)
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

### Akiya Athome (local only)

Akiya Athome sits behind AWS WAF and returns **HTTP 403** from GitHub Actions datacenter IPs. A one-region-per-day rotation on hosted runners was tried and still returned 403, so **IP blocking on cloud runners is the likely cause**. Run Akiya Athome from a machine on a residential or office network.

1. Sync known property IDs from the `data` branch (recommended before each run):

```bash
git fetch origin data
git checkout origin/data -- data/
```

2. Run all four regions sequentially:

```bash
pnpm start:akiya-athome
```

3. Updated files are written under `data/akiya-athome-*.json`. Pushing to the remote `data` branch is **manual**—fetch `origin/data` first and merge so you do not overwrite JSON updated by GitHub Actions for other sites.

#### macOS scheduled run (launchd)

Example plist (`~/Library/LaunchAgents/com.new-property-monitor.akiya-athome.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.new-property-monitor.akiya-athome</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd /path/to/new-property-monitor &amp;&amp; git fetch origin data &amp;&amp; git checkout origin/data -- data/ &amp;&amp; pnpm start:akiya-athome</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/new-property-monitor-akiya.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/new-property-monitor-akiya.err</string>
</dict>
</plist>
```

Load with `launchctl load ~/Library/LaunchAgents/com.new-property-monitor.akiya-athome.plist`.

### GitHub Actions (Automation)

The scraper is configured to run automatically via the `.github/workflows/daily-monitoring.yml` file.

- **Schedule**: Every Monday at 00:00 UTC (09:00 JST).
- **Manual Trigger**: You can trigger the workflow from the **Actions** tab in GitHub.
- **Scope**: All monitored sites **except** Akiya Athome (run locally with `pnpm start:akiya-athome`).

After changing Akiya or workflow behavior, run **workflow_dispatch** once and confirm Actions logs show no Akiya Athome entries and no related errors.

---

## 🔧 GitHub Actions Configuration

Ensure you have added the following secret to your GitHub repository (**Settings > Secrets and variables > Actions**):

- `SLACK_WEBHOOK_URL`: Your Slack Incoming Webhook URL.

---

## 📄 License

This project is licensed under the MIT License.
