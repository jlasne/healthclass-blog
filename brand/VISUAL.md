# Visual identity

The app's full design language lives in `docs/design-language.md` (screens, haptics, motion, icons). This file is the
brand level summary for all surfaces, with the website's choices added. Values: `tokens.json`.

## Palette (2 main colors and a balance)

- **Paper** `#FFFBF6` is every background. White is for cards. A blush glow on top, a sky glow bottom left.
- **Rose** is the next action. One rose element per screen. Buttons use rose ink `#B93D57` (5.4:1 with white).
  Plain rose `#D9566F` holds only the logo and large text.
- **Plum** `#7C2D4B` is structure: icons, eyebrows, links, chosen and done marks, the ink of every tint.
- **Sky** `#C5DDF1` balances: one calm shape per screen.
- **Neutrals** are warm: ink `#2A2421`, muted `#7A6E66`, well `#F5EFE7`. Faint `#A3978F` never carries words.
- **Banned:** yellow, lavender, green, peach, tan. One exception: the urine-color drawing.
- **Tones** (a tile's pastel): plum, rosy, blush, sky. The words on a tone are always plum.

## Type

| Surface | Titles | Text | Other |
|---|---|---|---|
| App | Fraunces | Instrument Sans | |
| Stores (images) | Fraunces Light | Instrument Sans | the headline's key word in rose-ink italic over the smile bar |
| Website | Playfair Display | Source Sans 3 (lining numerals) | Caveat for sketch labels and the signature only |

The website is Editorial across the whole site (decided 2026-11-16). Titles in Playfair, tight tracking, balanced wrap.
Body near 65 characters wide. Numbers tabular wherever they line up.

## The logo

"HC" with one curved bar under it, the smile. In the app and on the site: rose on paper. App icon: white on rose.
Files: `assets/logo/` (`logo.svg`, `icon.png`, `icon-192.png`, `icon-maskable.png`), `assets/app/` (icon layers and splash).
Keep clear space equal to the bar's height. Do not recolor, outline or stretch it.

## The cat

Hand-drawn in plum ink, white fur, blush cheeks and ears. 6 frames per pose, swapped 7 times a second while on screen.
Under reduced motion, frame 1 stays. One cat per screen at most, doing what the screen is about. It stands for her. Its
home is the hammock (the pelvic floor).

18 poses live in `assets/cats/` (animated SVG) and `assets/cats/still/` (one frame): bell, calendar, cheer, gift, hammock,
heart, hello, laugh, lift, peek, read, reading, selfie, sleep, stretch, think, worry, write. Meaning of each:
`docs/design-language.md`, section 4. The website adds peek, reading, stretch and worry. The source is the app's
`www/js/ink.js` (the website builds its SVGs from a copy).

## Five motifs

1. The curved bar: the smile, the hammock, the line under a title.
2. The cat.
3. Dotted circles: days to come.
4. Offset color: fills sit 1.5 px off their line, like a print out of register.
5. Sparkles: only after something is done.

## Dr. Kivlin's photos

Her professional headshot only (`assets/dana/bio.webp`, `avatar.webp`). Round avatar with a thin ring beside her name.
No video stills. A new photo needs her approval.

## Layout rules

- Content sits on the paper. Shapes only where they catch the eye: the rose button, a chosen answer, a tone tile.
- Lists are rows with a hairline, not white cards with shadows (app). On the site, cards use the soft shadow in `tokens.json`.
- Side gutter at least 16 px. Works at 390 px wide. Never a sideways scroll.
- Motion: transform and opacity only. Reduced motion lands everything at once.
- Light only today. No dark mode on the app or the site yet.

## Store images

8 iPhone screenshots (1320x2868 master), Google Play: icon 512, feature graphic 1024x500, phone and tablet shots. Real app
screens in a device frame, a headline above or around them. Eyebrow, headline with the moment word in italics, the phone,
a cat, and sourced proof at frames 3 and 4. Details and scripts: `store/`. No store badges, no calls to action
("Download now"), no price.

## Accessibility

Contrast is measured and written in `docs/design-language.md`. Decorative images use an empty alt text on purpose.
Keyboard focus is always visible. Respect reduced motion.
