# CodeContext SpecGuard: Remotion Video Production Prompt

> **Project**: CodeContext SpecGuard  
> **Hackathon**: Codegeist 2026: Build with context. Ship with confidence. (Atlassian)  
> **Target Tracks**: Apps for Software Teams | Best App with Atlassian MCP | Best Agents - Rovo  
> **Format**: 1920x1080 (16:9), 30 FPS, ~90 seconds (2,700 frames).  
> **Motion Standard**: Claude-Grade Remotion 2D (Physics-based `spring()`, semantic SFX via `<Sfx at={...}>`, dark studio theme).

---

## 🎬 Video Overview & Narrative Arc

- **0:00 - 0:15 (Scene 1 - The Spec Drift Dilemma)**: Developer in modern IDEs writing AI code, completely disconnected from acceptance criteria locked in Jira & PRDs in Confluence. High bug rates and missing edge cases.
- **0:15 - 0:35 (Scene 2 - Introducing CodeContext SpecGuard)**: The autonomous sentinel bridge built on Atlassian Forge. Combines `rovo:mcp` (MCP Server) + `rovo:agent` (Rovo AI) + native Jira Issue Panel.
- **0:35 - 0:65 (Scene 3 - Live Workflow Demo)**:
  1. Automated criteria parsing from Jira ADF descriptions.
  2. Git diff audit detecting missing requirements (75% score & warnings).
  3. Code fix to 100% compliance.
  4. Instant publishing to Jira issue comment thread.
- **0:65 - 0:80 (Scene 4 - Dual Architecture: IDE MCP + Rovo Chat)**: How IDEs (Cursor/VS Code) query criteria via Model Context Protocol while Rovo Agent performs autonomous triage.
- **0:80 - 0:90 (Scene 5 - Outro & Team Impact)**: Ship with confidence, zero spec drift, built natively on Forge. Call to action.

---

## 🎨 Theme Tokens & Design Spec (`src/theme.ts`)

```typescript
export const theme = {
  colors: {
    bgDark: '#070A10',
    cardBg: '#0E1626',
    border: '#1F2A3D',
    textPrimary: '#FFFFFF',
    textSecondary: '#8C9BAB',
    accentBlue: '#0052CC',
    accentCyan: '#00C7E6',
    accentGreen: '#36B37E',
    accentAmber: '#FFAB00',
    accentRed: '#FF5630',
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    code: '"SF Mono", "Fira Code", monospace',
  }
};
```

---

## 📜 Scene Breakdown & Script

### Scene 1: The Disconnect (Frames 0 - 450 | 0:00 - 0:15)
- **Visuals**:
  - Two split floating cards: Left card labeled `Developer IDE (Cursor)` showing rapid code output. Right card labeled `Jira & Confluence` showing acceptance criteria.
  - Red dashed disconnect line pulsing between them.
  - Red warning lozenge appears: `SPEC DRIFT DETECTED: 2/4 Requirements Missing`.
- **Motion**:
  - Cards slide in with `spring({ damping: 14, stiffness: 90, mass: 0.6 })`.
  - Staggered entrance by 6 frames.
- **SFX**:
  - `at={0.2}`: Subtle low whoosh (`whoosh.mp3`).
  - `at={7.5}`: Warning thud (`alert.mp3`).
- **Voiceover (EN)**:
  *"AI lets software teams code faster than ever. But speed without context leads to spec drift. Developers build in IDEs, while critical acceptance criteria and PRDs remain locked in Jira and Confluence."*

---

### Scene 2: The Forge Sentinel (Frames 450 - 1050 | 0:15 - 0:35)
- **Visuals**:
  - Central 3D-shield logo of **CodeContext SpecGuard** emerges with cyan neon glow.
  - Three radiating nodes connecting to:
    1. `rovo:mcp` (Atlassian MCP Server for IDEs)
    2. `rovo:agent` (Autonomous Rovo Agent)
    3. `jira:issuePanel` (Native UI Kit 2 Reconciler)
- **Motion**:
  - Shield scales from `0.6` to `1.0` via spring. Orbit nodes expand outward in radial symmetry.
- **SFX**:
  - `at={0.5}`: High-tech ascending sweep (`startup.mp3`).
  - `at={5.0}`: Three consecutive soft pops for the 3 capability chips (`pop.mp3`).
- **Voiceover (EN)**:
  *"Meet CodeContext SpecGuard — an autonomous spec audit and traceability engine built natively on Atlassian Forge. It turns connected organizational context into continuous delivery confidence."*

---

### Scene 3: Live In-Issue Verification (Frames 1050 - 1950 | 0:35 - 0:65)
- **Visuals**:
  - Simulated Jira Issue View (Ticket `KAN-1`: "Implement JWT Authentication").
  - Sidebar shows `SpecGuard Sentinel` panel:
    - 4 checklist criteria extracted automatically from ADF.
    - Code diff box pastes git diff.
    - Click `Verify Spec Compliance`: Progress bar animates to 75%, amber lozenge `NEEDS_WORK (75%)`, missing requirement tagged in red.
    - Code updated: Instant transition to green lozenge `PASSED (100%)`.
    - Auto-generated ADF comment pinned to the ticket thread.
- **Motion**:
  - Smooth zoom-in on the SpecGuard sidebar.
  - Number counter interpolates `0` to `75`, then `75` to `100`.
- **SFX**:
  - `at={2.0}`: Fast keystroke clicks (`typing.mp3`).
  - `at={6.5}`: Warning chime for 75% (`chime_amber.mp3`).
  - `at={14.0}`: Clean success bell (`ding_success.mp3`).
  - `at={18.0}`: Paper send sound (`sent.mp3`).
- **Voiceover (EN)**:
  *"Inside Jira, the SpecGuard panel parses ADF descriptions into live criteria. When engineers submit code or diffs, SpecGuard audits them in milliseconds. Missing a constraint? It catches it before QA. Fully compliant? An official audit report is posted directly to Jira."*

---

### Scene 4: Unified via Atlassian MCP (Frames 1950 - 2400 | 0:65 - 0:80)
- **Visuals**:
  - Terminal/IDE split view on the left, Rovo AI chat on the right.
  - Cursor IDE queries: `mcp__atlassian__get_issue_context("KAN-1")` → returns criteria straight into the LLM context window.
  - Jira Rovo Chat prompts: `@SpecGuard audit pull request against KAN-1`.
- **Motion**:
  - Code editor lines appear with staggered typewriter effect (`frame - i * 3`).
- **SFX**:
  - `at={1.0}`: Rapid keyboard clicks.
  - `at={8.0}`: AI reply pulse sound.
- **Voiceover (EN)**:
  *"Powered by the Model Context Protocol, SpecGuard exposes these tools directly to developer IDEs via rovo:mcp. Developers never leave their editor, while Rovo agents guard quality autonomously in the cloud."*

---

### Scene 5: Outro & Call to Action (Frames 2400 - 2700 | 0:80 - 0:90)
- **Visuals**:
  - Big centered hero typography:  
    `CodeContext SpecGuard`  
    `Build with context. Ship with confidence.`
  - Badges: `Atlassian Forge Node 24` | `Codegeist 2026` | `Open Source on GitHub`.
- **Motion**:
  - Final camera pullback with soft background blur.
- **SFX**:
  - `at={0.2}`: Deep sub-bass outro hit (`outro_boom.mp3`).
- **Voiceover (EN)**:
  *"CodeContext SpecGuard. Eliminate spec drift. Built for Codegeist 2026."*

---

## 🛠️ Implementation Checklist for Remotion Project

1. Run `npx create-video@latest` or scaffold Remotion template in `codecontext-specguard-video/`.
2. Copy `assets/logo.svg` into `public/logo.svg`.
3. Implement `src/ui.tsx` with `<Sfx>`, `<Stage>`, `<Card>`, `<LozengeBadge>`, and `<TerminalBlock>`.
4. Create scenes:
   - `src/scenes/ProblemScene.tsx`
   - `src/scenes/IntroScene.tsx`
   - `src/scenes/JiraDemoScene.tsx`
   - `src/scenes/McpRovoScene.tsx`
   - `src/scenes/OutroScene.tsx`
5. Generate voiceover audio using ElevenLabs (e.g. voice "Adam" or "George" - calm tech narrator) or `edge-tts --voice en-US-ChristopherNeural`.
6. Render with:
   ```bash
   npx remotion render src/index.ts Main out/specguard-codegeist-demo.mp4
   ```
