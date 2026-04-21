# Known issues in the baseline goldens

Baseline goldens freeze the **current** (pre-modernization) rendering, warts and
all. Items below are bugs observed in the captured screenshots that **must not
be replicated** in the rewrite. During the corresponding port step, fix the
underlying CSS/layout and update the affected goldens with `npm run test:update`.
The PR diff is the evidence of the fix.

_No known issues open — the original entry (quiz legend overlap at 768) was
fixed in Phase 4 when the quiz reveal banner was restructured. The legend now
stacks below the banner copy below the `md` (768) breakpoint and flows inline
at `md` and up._
