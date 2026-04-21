# Known issues in the baseline goldens

Baseline goldens freeze the **current** (pre-modernization) rendering, warts and
all. Items below are bugs observed in the captured screenshots that **must not
be replicated** in the rewrite. During the corresponding port step, fix the
underlying CSS/layout and update the affected goldens with `npm run test:update`.
The PR diff is the evidence of the fix.

## 1. Quiz legend overlaps bar chart at 768 viewport

- **File:** `__screenshots__/interactive.spec.ts/quiz-midflow-tablet-768.png`
- **Symptom:** The color legend (`stimmt dafür · dagegen · nicht im Landtag`) in the top-right of the green "Richtig!" result banner overlaps the bar chart's row label "Partei war dafür".
- **Why:** Semantic UI's `<Responsive>` hides the legend under ~600 and inlines it above ~992, leaving a dead zone around 768 where the inline legend doesn't fit but also isn't stacked.
- **Behaves correctly at:** 1024, 1440, 1920 (room for inline) and 360, 600 (legend hidden).
- **Expected after port (Phase 4):** Stack the legend above/below the chart on viewports `< md` (Tailwind 768), inline on `md` and up. Update this screenshot in the Phase 4 commit that ports `client/src/components/positionChart/` + the quiz result banner.
