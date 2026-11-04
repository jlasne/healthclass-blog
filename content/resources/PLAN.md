# Resources: the daily plan

One new page a day under `/resources`, in the order below, until the list is done. Each page targets a search that
Google suggests (checked on November 4, 2026), links to the other 3 families, and ends on "Get the app".
The founders do not review each page: the rules and the check below are the review. Publish straight to `main`.

## The 4 families

| Folder | Name on the site | What a page is |
|---|---|---|
| `tools` | Free tools | An interactive tool (quiz, timer, chart) with its result on screen. No email, nothing saved. |
| `compare` | Side by side | Health Class next to an app, a device or a method; or 2 to 6 others with Health Class as one side. |
| `classes` | The classes | A class, one week of a class, or one exercise from the app. |
| `made-for-you` | Made for you | One woman's moment (a sneeze, a run, after birth): her goal, what helps, the class that fits. |

## The daily routine

1. **Pick** the first unchecked line in the list below. Skip a line marked "ONLY if the module ships" when the module is
   not in the app's current content (`www/js/content-*.js` in jlasne/healthclass, not `www/js/next/`); tick it as skipped.
2. **Research** the search: read the top results, note the questions people ask (the FAQ), and find 2 to 5 sources
   (guidelines, PubMed, the app store listing, the maker's own site). For a comparison, check every fact about the other
   side on its store page or website **today**, and set `checked` to today's date.
3. **Write** `content/resources/<family>/<slug>.mdx`. Copy the front matter of the page of the same family that already
   exists (see "Templates" below). `date` and `updated`: today. Body: 3 to 5 short sections with `##` titles.
4. **Link** the page: `links` names 3 pages, one from each other family when they exist (a link to a page not written
   yet is skipped on the site until it exists). `letters` names 1 or 2 letters from `content/articles`. Then add the new
   page to the `links` of 1 or 2 older pages that should point to it, and set their `updated` to today.
5. **Check**: `npm run check:resources` (must pass), `npm run typecheck`, `npm run build`, then with the site running
   (`npx next start -p 3005`) `node tests/shots.mjs http://localhost:3005 /resources/<family>/<slug>` and look at the
   phone and desktop shots next to an older page of the same family. Same look, nothing cut, nothing wider than the phone.
6. **Publish**: commit on `main` with the message `Resources: <title>`, push. Vercel deploys; the sitemap, the family page
   and `/resources` update by themselves.
7. **Tick** the line in this file (same commit) and **report** in 3 lines: the link, the search it targets, the pages it
   links to and from.

If a step fails and cannot be fixed the same day, publish nothing, leave the line unticked, and report what failed.
The site keeps its last good version when a deploy fails.

**Mondays**, add the weekly report: pages published, page views per resource page and visits from Google over the
last 7 days (Vercel Web Analytics, project `healthclass-blog`), and the 3 pages with the most visits.

**Every day**, also check whether "Pelvic Health Class: for Women" is live on the App Store and on Google Play. When a
listing is live, set `appStoreUrl` (and `appStoreId`) or `playStoreUrl` in `lib/site.ts`: the "Get the app" pop-up then
gives way to the store link on every page. Report it.

## The rules (the review)

- **Education only.** Teach, never diagnose or treat. No page promises a cure. A tool's result says "This is not a
  diagnosis". Every page gets the doctor note from the template; add page-specific lines in `doctor`.
- **Avoid medical topics.** No disease pages, no surgery recovery advice, no medicine, no scores used by doctors to
  diagnose. When a search needs a doctor, the page says so and points to one.
- **Signed by the Health Class team.** Never write that Dr. Dana reviewed or wrote a page. Quote her only from text
  already on the site or in the app.
- **Honest comparisons.** At least 2 points where the other side wins, true and useful (price, a device, a physio, a
  feature). Then where Health Class wins. No attack on a brand. Facts dated (`checked`) and sourced. Never mention our
  store ratings or review count.
- **Our price is not set yet.** Write "Subscription, price shown in the app. Week 1 is open to everyone", until the
  prices are in `lib/site.ts` and the founders confirm them.
- **Copy:** no em or en dashes, under 30 words a sentence, a number instead of an adjective, no weasel words, simple
  words, say what to do. English (US).
- **One page per search.** Do not write a page for a search an existing letter or page already answers; link to it.
- **Design:** use only the template and the components that exist (`components/Resource.tsx`, the MDX boxes of the
  letters: `<Try>`, `<Doctor>`, `<Remember>`, `<Steps>`, `<Bars>`). A new tool goes in `components/tools/` built from
  `LeakQuiz.tsx` (same card, same option tiles, same result block), registered in `components/tools/index.tsx` and in
  `TOOLS` in `scripts/check-resources.mjs`. No new colors, fonts or layouts.

## Templates

- Tool: `tools/leak-type-quiz.mdx` (`tool:` names the component).
- Health Class vs one other: `compare/health-class-vs-squeezy.mdx` (`rival`, `table`, `wins`, `pick`).
- 3 sides or more (X vs Y, alternatives, best of): use `sides` (Health Class as the last side), `rows` (one value per
  side), `winsBy` (every side, 2 points or more) and `pickBy`, in place of `rival`, `table`, `wins` and `pick`.
- Class or week or exercise: `classes/bladder-leaks.mdx` (`status`, `facts`, `weeks`; an exercise page leaves `weeks` out
  and uses a `<Try>` box in the body). A class not out yet: `status: soon`.
- Made for you: `made-for-you/leak-when-you-sneeze.mdx` (`goal`, `fit`).

## The list

### Leaks with effort

- [x] 001 · `tools/leak-type-quiz` · type of incontinence
- [x] 002 · `made-for-you/leak-when-you-sneeze` · peeing when sneezing
- [x] 003 · `classes/bladder-leaks` · bladder leaks program
- [x] 004 · `compare/health-class-vs-squeezy` · squeezy app
- [ ] 005 · `made-for-you/leak-when-you-laugh` · leaking urine when laughing
- [ ] 006 · `made-for-you/leak-when-you-cough` · bladder leaks when coughing
- [ ] 007 · `made-for-you/leak-when-you-walk` · bladder leaks when walking

### Choosing an app

- [ ] 008 · `compare/health-class-vs-perifit` · perifit vs / is perifit worth it
- [ ] 009 · `compare/health-class-vs-elvie-trainer` · is elvie trainer worth it
- [ ] 010 · `compare/elvie-trainer-vs-perifit` · elvie trainer vs perifit (3 sides: Elvie Trainer, Perifit, Health Class)
- [ ] 011 · `compare/best-pelvic-floor-app-for-women` · best pelvic floor app for women (sides: 4 to 6 apps, Health Class one of them)
- [ ] 012 · `tools/kegel-timer` · kegel timer online free
- [ ] 013 · `classes/slow-holds` · slow kegel holds
- [ ] 014 · `made-for-you/leak-when-you-lift` · leaking when lifting weights

### Kegels done right

- [ ] 015 · `classes/how-to-find-your-pelvic-floor` · how to find your pelvic floor muscles
- [ ] 016 · `classes/quick-flicks` · quick flicks kegel
- [ ] 017 · `classes/pelvic-floor-101` · pelvic floor 101 / pelvic floor program
- [ ] 018 · `tools/kegel-plan-by-age` · kegel exercise plan according to your age
- [ ] 019 · `tools/weak-or-tight-pelvic-floor-quiz` · how to know your pelvic floor is weak or tight
- [ ] 020 · `compare/kegels-vs-pelvic-floor-exercises` · kegels vs pelvic floor exercises
- [ ] 021 · `made-for-you/desk-workers` · is sitting bad for pelvic floor

### Sudden urges

- [ ] 022 · `tools/bladder-diary` · bladder diary (with a printable version)
- [ ] 023 · `tools/overactive-bladder-quiz` · overactive bladder quiz
- [ ] 024 · `tools/urge-wave-timer` · urge suppression techniques
- [ ] 025 · `tools/bladder-training-schedule` · bladder training schedule
- [ ] 026 · `classes/bladder-training` · bladder training program (ONLY if the module ships in the app; else skip)
- [ ] 027 · `made-for-you/teachers` · teacher bladder
- [ ] 028 · `compare/pelvic-floor-therapy-vs-kegels` · pelvic floor therapy vs kegel exercises

### After birth

- [ ] 029 · `tools/weeks-postpartum-calculator` · postpartum calculator by week
- [ ] 030 · `made-for-you/postpartum` · pelvic floor postpartum
- [ ] 031 · `made-for-you/after-a-c-section` · pelvic floor after c section
- [ ] 032 · `made-for-you/after-twins` · pelvic floor after twins
- [ ] 033 · `made-for-you/moms-of-3-or-more` · pelvic floor after 3 kids
- [ ] 034 · `compare/health-class-vs-every-mother` · every mother vs
- [ ] 035 · `compare/best-pelvic-floor-app-postpartum` · best pelvic floor app postpartum

### Running and jumping

- [ ] 036 · `made-for-you/leak-when-you-run` · leaking when running
- [ ] 037 · `made-for-you/runners` · pelvic floor exercises for runners
- [ ] 038 · `made-for-you/postpartum-runners` · pelvic floor exercises postpartum running
- [ ] 039 · `tools/return-to-running-postpartum-test` · return to running postpartum test
- [ ] 040 · `made-for-you/leak-when-you-jump` · bladder leaks when jumping
- [ ] 041 · `made-for-you/trampoline-moms` · peeing on trampoline
- [ ] 042 · `classes/bladder-leaks-week-5` · Bladder leaks week 5 (title from the app)

### Menopause

- [ ] 043 · `tools/perimenopause-quiz` · perimenopause quiz free no email
- [ ] 044 · `tools/menopause-symptoms-checklist` · menopause symptoms checklist printable
- [ ] 045 · `made-for-you/perimenopause` · pelvic floor perimenopause
- [ ] 046 · `made-for-you/menopause` · pelvic floor menopause
- [ ] 047 · `made-for-you/women-over-50` · pelvic floor exercises for women over 50
- [ ] 048 · `classes/menopause` · menopause class (status: soon)
- [ ] 049 · `compare/emsella-vs-kegels` · emsella vs kegels

### Everyday bladder

- [ ] 050 · `tools/how-often-should-you-pee` · how many times a day should you pee female
- [ ] 051 · `tools/nighttime-pee-checker` · how often should you pee at night
- [ ] 052 · `tools/bladder-irritants-checker` · bladder irritants list
- [ ] 053 · `tools/caffeine-and-bladder-calculator` · caffeine bladder urgency
- [ ] 054 · `classes/bladder-leaks-week-4` · Bladder leaks week 4 (title from the app)
- [ ] 055 · `made-for-you/nurses` · pelvic floor for nurses / holding pee at work
- [ ] 056 · `made-for-you/leak-when-you-stand-up` · bladder leaks when i stand up

### More apps

- [ ] 057 · `compare/health-class-vs-mutu-system` · mutu system vs
- [ ] 058 · `compare/health-class-vs-restore-your-core` · restore your core reviews
- [ ] 059 · `compare/health-class-vs-kegel8` · is kegel8 worth it
- [ ] 060 · `compare/perifit-alternatives` · perifit alternative
- [ ] 061 · `compare/elvie-trainer-alternatives` · elvie trainer alternative
- [ ] 062 · `made-for-you/weightlifters` · does weight lifting weaken pelvic floor
- [ ] 063 · `classes/pelvic-floor-101-week-1` · Pelvic Floor 101 week 1 (title from the app)

### Sport

- [ ] 064 · `made-for-you/crossfit` · peeing during double unders
- [ ] 065 · `made-for-you/jump-rope` · bladder leaks when jumping rope
- [ ] 066 · `made-for-you/pilates` · pelvic floor pilates
- [ ] 067 · `made-for-you/yoga` · pelvic floor yoga
- [ ] 068 · `compare/yoga-vs-pilates-for-pelvic-floor` · yoga vs pilates for pelvic floor
- [ ] 069 · `classes/pelvic-floor-101-week-2` · Pelvic Floor 101 week 2 (title from the app)
- [ ] 070 · `tools/360-breathing-pacer` · 360 breathing / pelvic floor breathing animation

### Breath and core

- [ ] 071 · `classes/360-breathing` · 360 breathing pelvic floor
- [ ] 072 · `classes/belly-breathing` · diaphragmatic breathing pelvic floor
- [ ] 073 · `classes/transverse-abdominis` · transverse abdominis exercises
- [ ] 074 · `classes/pelvic-floor-101-week-3` · Pelvic Floor 101 week 3 (title from the app)
- [ ] 075 · `made-for-you/singers` · pelvic floor for singing
- [ ] 076 · `compare/health-class-vs-hinge-health-pelvic` · hinge health pelvic floor
- [ ] 077 · `compare/health-class-vs-sword-bloom` · sword bloom reviews

### Strength

- [ ] 078 · `classes/glute-bridge` · pelvic floor and glute exercises
- [ ] 079 · `classes/ball-squeeze-between-knees` · pelvic floor exercise with ball between knees
- [ ] 080 · `classes/pelvic-floor-101-week-4` · Pelvic Floor 101 week 4 (title from the app)
- [ ] 081 · `classes/pelvic-floor-101-week-5` · Pelvic Floor 101 week 5 (title from the app)
- [ ] 082 · `made-for-you/athletes` · pelvic floor for athletes
- [ ] 083 · `compare/health-class-vs-origin` · origin pelvic floor therapy reviews
- [ ] 084 · `compare/hinge-health-pelvic-alternatives` · hinge health pelvic trainer alternative

### Stretch and let go

- [ ] 085 · `classes/pelvic-floor-stretches` · pelvic floor stretches female
- [ ] 086 · `classes/hip-stretches-for-pelvic-floor` · hip stretches for pelvic floor
- [ ] 087 · `compare/kegels-vs-reverse-kegels` · kegels vs reverse kegels
- [ ] 088 · `tools/pelvic-floor-self-check` · pelvic floor self exam
- [ ] 089 · `classes/self-check` · pelvic floor self check (ONLY if the module ships in the app; else skip)
- [ ] 090 · `made-for-you/cyclists` · is cycling bad for pelvic floor
- [ ] 091 · `made-for-you/horse-riders` · pelvic floor horse riding

### Every position

- [ ] 092 · `classes/pelvic-floor-exercises-lying-down` · pelvic floor exercises lying down
- [ ] 093 · `classes/pelvic-floor-exercises-sitting` · can you do pelvic floor exercises sitting down
- [ ] 094 · `classes/pelvic-floor-exercises-standing` · pelvic floor exercises standing
- [ ] 095 · `classes/pelvic-floor-exercises-with-a-ball` · pelvic floor exercises with ball
- [ ] 096 · `classes/pelvic-floor-routine` · pelvic floor routine for women
- [ ] 097 · `classes/pelvic-floor-101-week-6` · Pelvic Floor 101 week 6 (title from the app)
- [ ] 098 · `compare/kegel-balls-vs-kegel-exercises` · kegel balls vs kegel exercises

### Gut and bladder

- [ ] 099 · `tools/fiber-calculator` · fiber intake per day for women
- [ ] 100 · `tools/constipation-check` · pelvic floor constipation symptoms
- [ ] 101 · `made-for-you/constipation` · pelvic floor constipation
- [ ] 102 · `classes/fiber-tracker` · fiber (ONLY if the module ships in the app; else skip)
- [ ] 103 · `classes/bladder-leaks-week-1` · Bladder leaks week 1 (title from the app)
- [ ] 104 · `compare/kegel-balls-vs-weights` · kegel balls vs weights
- [ ] 105 · `made-for-you/overweight` · pelvic floor exercises for overweight women

### Leak moments, part 2

- [ ] 106 · `made-for-you/leak-during-sex` · leaking during sex (point to a doctor for any pain)
- [ ] 107 · `classes/intimacy` · intimacy class (status: soon)
- [ ] 108 · `made-for-you/chronic-cough-or-asthma` · chronic cough pelvic floor
- [ ] 109 · `classes/bladder-leaks-week-2` · Bladder leaks week 2 (title from the app)
- [ ] 110 · `classes/bladder-leaks-week-3` · Bladder leaks week 3 (title from the app)
- [ ] 111 · `classes/bladder-leaks-week-6` · Bladder leaks week 6 (title from the app)
- [ ] 112 · `compare/health-class-vs-elitone` · elitone reviews

### Pregnancy and later

- [ ] 113 · `made-for-you/third-trimester` · pelvic floor exercises during pregnancy 3rd trimester
- [ ] 114 · `made-for-you/pregnant-runners` · pelvic floor exercises for pregnant runners
- [ ] 115 · `compare/best-pelvic-floor-app-for-pregnancy` · best pelvic floor app for pregnancy
- [ ] 116 · `made-for-you/1-year-postpartum` · pelvic floor 1 year postpartum
- [ ] 117 · `classes/postpartum` · postpartum class (status: soon)
- [ ] 118 · `compare/health-class-vs-expecting-and-empowered` · expecting and empowered reviews
- [ ] 119 · `compare/health-class-vs-bloom-method` · what is the bloom method

### Strong after 60

- [ ] 120 · `made-for-you/women-over-60` · pelvic floor exercises for women over 60
- [ ] 121 · `made-for-you/postmenopause` · pelvic floor postmenopausal
- [ ] 122 · `classes/prolapse` · prolapse class (status: soon; send symptoms to a doctor)
- [ ] 123 · `classes/lift-a-bag-safely` · pelvic floor and heavy lifting
- [ ] 124 · `classes/breath-test` · breath test (ONLY if the module ships in the app; else skip)
- [ ] 125 · `classes/plan-for-life` · plan for life (ONLY if the module ships in the app; else skip)
- [ ] 126 · `compare/health-class-vs-leva` · leva pelvic health system reviews

### Devices

- [ ] 127 · `compare/perifit-vs-kegel8` · kegel8 vs perifit
- [ ] 128 · `compare/kegel8-vs-elvie-trainer` · kegel 8 vs elvie
- [ ] 129 · `compare/perifit-vs-kgoal` · perifit vs kgoal
- [ ] 130 · `compare/perifit-vs-emy` · perifit vs emy
- [ ] 131 · `compare/app-vs-pelvic-floor-trainer-device` · pelvic floor trainer device vs app
- [ ] 132 · `compare/best-pelvic-floor-trainer-for-women` · pelvic floor trainer for women
- [ ] 133 · `compare/health-class-vs-yarlap` · yarlap reviews

### Postpartum programs

- [ ] 134 · `compare/every-mother-vs-mutu-system` · mutu system vs every mother
- [ ] 135 · `compare/restore-your-core-vs-mutu-system` · restore your core vs mutu
- [ ] 136 · `compare/every-mother-vs-restore-your-core` · every mother vs restore your core
- [ ] 137 · `compare/expecting-and-empowered-vs-every-mother` · expecting and empowered vs every mother
- [ ] 138 · `compare/bloom-method-vs-every-mother` · bloom method vs every mother
- [ ] 139 · `compare/every-mother-alternatives` · every mother alternatives
- [ ] 140 · `compare/mutu-system-alternatives` · mutu system alternatives

### Kegel apps

- [ ] 141 · `compare/health-class-vs-kegel-trainer` · kegel trainer app review
- [ ] 142 · `compare/health-class-vs-easy-kegel` · easy kegel app
- [ ] 143 · `compare/health-class-vs-kegel-exercises-leap` · kegel exercises app for women
- [ ] 144 · `compare/best-kegel-app-for-women` · best kegel app for women
- [ ] 145 · `compare/best-free-pelvic-floor-app` · best pelvic floor app free
- [ ] 146 · `compare/squeezy-alternatives` · squeezy alternatives
- [ ] 147 · `compare/health-class-vs-pelvic-floor-strong` · pelvic floor strong reviews

### Big searches

- [ ] 148 · `compare/health-class-vs-emsella` · emsella chair reviews
- [ ] 149 · `compare/emsella-vs-pelvic-floor-therapy` · emsella vs pelvic floor therapy
- [ ] 150 · `tools/stream-counter` · how long should you pee for women
- [ ] 151 · `tools/urine-color-chart` · urine color chart for hydration
- [ ] 152 · `tools/water-intake-calculator` · water intake calculator by weight
- [ ] 153 · `tools/bristol-stool-chart` · bristol stool chart
- [ ] 154 · `tools/kegel-chart` · kegel exercise chart for women (with a printable version)
