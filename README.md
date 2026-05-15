# New Property Monitor 🏠

![Workflow Status](https://github.com/jumpei999/new-property-monitor/actions/workflows/daily-monitoring.yml/badge.svg)

A lightweight, automated web scraping tool designed to monitor real estate listings. Built with **TypeScript**, **Playwright**, and **pnpm**, it runs daily via **GitHub Actions** and stores data in a separate branch to keep the repository clean.

## 🚀 Features

- **Automated Scraping**: Periodically checks for new properties using Playwright.
- **Smart Data Persistence**: Stores results in a dedicated `data` branch, separating code history from data updates.
- **Slack Integration**: Sends instant notifications when new listings are found.
- **Modern Stack**: Developed with TypeScript and managed with pnpm for fast, disk-efficient dependency handling.

## 🛠 Tech Stack

- **Runtime**: Node.js (LTS)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Language**: TypeScript
- **Automation**: GitHub Actions
- **Browser Automation**: [Playwright](https://playwright.dev/)

---

## 📂 Repository Structure

This project utilizes an **"Orphan Branch"** strategy to manage data:

- **`main` branch**: Contains the source code, GitHub Actions workflows, and configuration.
- **`data` branch**: Acts as a storage vault for scraped JSON/CSV files.

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
   Create a `.env` file in the root directory:

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

The scraper is configured to run automatically via the `.github/workflows/daily-check.yml` file.

- **Schedule**: Every day at 00:00 UTC (09:00 JST).
- **Manual Trigger**: You can trigger the workflow from the **Actions** tab in GitHub.

---

## 🔧 GitHub Actions Configuration

Ensure you have added the following secret to your GitHub repository (**Settings > Secrets and variables > Actions**):

- `SLACK_WEBHOOK_URL`: Your Slack Incoming Webhook URL.

---

## 📄 License

This project is licensed under the MIT License.
