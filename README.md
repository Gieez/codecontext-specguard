# 🛡️ CodeContext SpecGuard

> **Autonomous Spec Audit & Traceability Engine on Atlassian Forge**  
> Built for **Codegeist 2026: Build with context. Ship with confidence.**  
> Target Tracks: **Apps for Software Teams** | **Bonus: Best App with Atlassian MCP** | **Bonus: Best Agents - Rovo**

---

## 💡 The Problem
In modern high-velocity software engineering, developers write code inside AI-powered IDEs (Cursor, VS Code, Claude Code), while product requirements and acceptance criteria live across Jira tickets and Confluence PRDs. 

Without continuous context sync:
- Engineers ship code that subtly drifts from product specifications.
- Edge cases and security constraints defined in Jira get missed during pull request reviews.
- Teams spend hours manually cross-checking diffs against acceptance criteria.

---

## ⚡ The Solution
**CodeContext SpecGuard** connects Jira, Confluence, and developer IDEs into a unified, continuous verification loop:

1. **Atlassian MCP Server (`rovo:mcp`)**: Exposes live Jira issue criteria, Confluence architecture decision records (ADRs), and automated audit tools directly to developer IDEs via the Model Context Protocol.
2. **Autonomous Rovo Agent (`rovo:agent`)**: Senior QA & Spec Compliance agent inside Jira and Confluence that reviews pull requests, analyzes code diffs, detects unfulfilled criteria, and posts official audit verdicts.
3. **Native Jira Issue Panel (`jira:issuePanel`)**: Embedded UI Kit 2 dashboard inside every Jira issue displaying real-time compliance badges, criterion checklists, and one-click verification.

---

## 🏛️ System Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │                 DEVELOPER IDE                 │
                  │   (Cursor / VS Code / Claude Desktop / CLI)   │
                  └───────────────────────┬───────────────────────┘
                                          │
                            Model Context Protocol (MCP)
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │                     ATLASSIAN FORGE RUNTIME (Node 24)                  │
     │                                                                        │
     │   ┌─────────────────────┐                   ┌──────────────────────┐   │
     │   │   rovo:mcp Server   │◄─────────────────►│   rovo:agent Agent   │   │
     │   │ (CodeContext Engine)│                   │     (SpecGuard)      │   │
     │   └──────────┬──────────┘                   └──────────┬───────────┘   │
     │              │                                         │               │
     │              └────────────────────┬────────────────────┘               │
     │                                   │                                    │
     │                                   ▼                                    │
     │   ┌────────────────────────────────────────────────────────────────┐   │
     │   │                       5 Unified Actions                        │   │
     │   │  • get-issue-context      • search-specs-prds                  │   │
     │   │  • audit-code-spec        • record-spec-audit                  │   │
     │   │  • get-sprint-spec-digest                                      │   │
     │   └───────────────────────────────┬────────────────────────────────┘   │
     │                                   │                                    │
     │                                   ▼                                    │
     │   ┌────────────────────────────────────────────────────────────────┐   │
     │   │         jira:issuePanel (Atlassian UI Kit 2 Reconciler)        │   │
     │   │      • Visual Checklist   • Progress Bar   • Audit Trigger     │   │
     │   └────────────────────────────────────────────────────────────────┘   │
     └───────────────────────────────────┬────────────────────────────────────┘
                                         │
                               Atlassian REST API
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
            ┌─────────────────┐                     ┌─────────────────┐
            │   Jira Cloud    │                     │ Confluence Cloud│
            │(Issues, Sprints)│                     │ (PRDs, Specs)   │
            └─────────────────┘                     └─────────────────┘
```

---

## 🛠️ Unified Toolset (Rovo Actions & MCP Tools)

| Tool Name | Action Verb | Description |
|---|---|---|
| `get-issue-context` | `GET` | Fetches Jira summary, ADF description, priority, assignee, and extracts concrete acceptance criteria. |
| `search-specs-prds` | `GET` | Performs CQL search across Confluence knowledge bases for technical specifications & architecture documents. |
| `audit-code-spec` | `TRIGGER` | Compares a git diff or pull request summary against issue criteria. Calculates compliance score (0-100%), missing requirements, and code hygiene/security flags. |
| `record-spec-audit` | `CREATE` | Formats and posts an official ADF audit report directly into the Jira issue comment thread. |
| `get-sprint-spec-digest`| `GET` | Aggregates all open issues and pending acceptance criteria across the active sprint for release readiness. |

---

## 🚀 How to Test & Review (For Judges)

### Official Forge Installation Link
Judges can install CodeContext SpecGuard directly onto their Atlassian Cloud test sites (Jira & Confluence):  
👉 **[Install CodeContext SpecGuard on Atlassian Cloud](https://developer.atlassian.com/console/install/88274a83-0ad3-46ef-a6dc-661729967d0b?signature=AYABeIfk1jo5kWha8aeAKeiE8w4AAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucB821x7TGad46AHAtPDliFjQAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDLvC5ST3gLEH92lsngIBEIA7cbPU1q98Os1y38UWZN7zkrc1MCmZXpQM41Y0dDYGSQhu%2FUjkXd14IeOnQp09SzzP0avUGDDGvqWNa8cAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgFVg1e0wH18fS53qAGf8iU8AAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMmo2pAo8MSCrnkSI%2BAgEQgDsWI4r3n1qXSnTtWGVJmJz15MZ%2BLNmG1gdP4P%2BGfq95VJJbZs%2F44WB8x%2F%2BbM51wrnRDS3FsOvkNtCfstwAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAbJjkaSsnPr1PTXtQd95ln0AAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxnoRQiFh%2BL9NrL7P4CARCAO6F%2BpoBFH2j3v7u4grdBUh7%2B1VEZN27Nh8IpgNOclYHEuXd%2Bkgqmb4RYPgTJmsbLmqkqbVGn%2BvnvSCHrAgAAAAAMAAAQAAAAAAAAAAAAAAAAADSFmyZhJfXtp6fPCPrbrj%2F%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADJUkYLpGBihSl2vRlK68uQlQWWxhSUzI7H7srVMZAmP2Po%2B9HjfnqLvJDMczlZd2GM05pOzZ8bSaouNG%2BfF3Fn7iZA%3D&product=jira&product=confluence)**

### Option 1: Live Interactive Jira Issue Panel
1. Open any issue on the target Jira site (e.g., `https://gieez-dev.atlassian.net`).
2. Notice the **SpecGuard Sentinel** panel on the issue view.
3. The panel automatically parses the issue description and renders an **Active Acceptance Criteria Checklist**.
4. Paste a git diff into the verification input box and click **Verify Spec Compliance**.
5. Observe the instant compliance score progress bar and missing criteria warnings.
6. Click **Publish to Jira Comments** to record the audit report permanently on the ticket.

### Option 2: Rovo Agent Chat
1. Click the **Rovo** chat icon in Jira or Confluence.
2. Mention `@SpecGuard` or select **SpecGuard** from the available agents.
3. Try conversation starters:
   - *"Audit code diff against Jira issue KAN-1"*
   - *"Fetch acceptance criteria for issue KAN-1"*
   - *"Search Confluence for feature PRD"*
   - *"Summarize sprint spec digest for project KAN"*

### Option 3: IDE via Atlassian MCP
Add the Forge MCP server to your `claude_desktop_config.json` or Cursor MCP settings using the Atlassian MCP connector to invoke `get-issue-context` and `audit-code-spec` while writing code locally.

---

## 🧪 Local Testing & Verification

Run the automated test suite verifying ADF parser, criteria extractor, and diff compliance algorithms:

```bash
npm test
```

Expected output:
```
✔ ADF text extraction test passed
✔ Acceptance criteria extraction test passed
✔ Diff compliance verification test passed
All 3 unit test suites PASSED successfully.
```

---

## 📦 Deployment

Deploy to Atlassian Cloud via Forge CLI:

```bash
forge lint
forge deploy -e development
forge install --upgrade all -s <your-site>.atlassian.net -p jira -e development
forge install --upgrade all -s <your-site>.atlassian.net -p confluence -e development
```

---

## 📄 License
MIT License. Created by **Anugrah Syahban (Gieez)** for Codegeist 2026.
