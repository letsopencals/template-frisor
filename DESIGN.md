# Frisør: design contract ("Barber & Apothecary")

Frisør is a premium Berlin barbershop with three shops and a retail shelf. The site should feel like
walking in off Torstraße at dusk: bottle-green lacquer, brass, walnut, a steaming towel, gold-leaf
lettering on the window, and a shelf of things you'll want to take home. Read this before touching UI.

## The objects the design is built from

| Object in the shop | Becomes on the site |
|---|---|
| Gold-leaf lettering on the shop window | The hero wordmark and big headings (`.gilt`: brass gradient fill, dark keyline) |
| The clipper guard comb (No. 0, ½, 1, 1½, 2, 3, 4) | Section index and the dividing rule (`<GuardRule>`). Sections are numbered by guard, not 01/02/03 |
| The counter and the till | Navigation: the **Counter bar**, fixed at the *bottom* on every screen size, with the running tab |
| The station mirror and the wall clock | Booking: **the Mirror Dial**, free times as brass notches around the barber's mirror |
| Towel tags hung on a rail | The day picker |
| The apothecary wall | **The Shelf**: retail upsell in booking, checkout, thank-you, account and `/apothecary` |
| The barber's docket (a paper chit on a spike) | Checkout: one long paper docket, perforated between sections |
| The brass chair check (cloakroom-style token) | The confirmation artifact on thank-you and the next sitting in the account |
| The regular's punch card | The account's visit history |
| The barber pole | Live and holding states only (a moving oxblood/cream stripe) |

## Palette (tokens in `app/globals.css`)

- `lacquer` #18211F (page), `lacquer-2` #1F2A27, `felt` #273531 (raised), `line` #3A4A45
- `brass` #C49A58, `brass-hi` #E7CB8E, `brass-lo` #8A6631
- `towel` #F2ECDF (paper), `towel-2` #E5DCC8, `ink` #161D1B (text on paper)
- `oxblood` #7C2D29 (barber pole, "taken", destructive), `steel` #97A39E (muted text on lacquer)

Dark lacquer is the default; cream paper is used for things you hold: the menu card, the docket, the
regular's card, product labels.

## Type

- **Big Shoulders Display** (600–900): signage. Uppercase, tight, for the wordmark, section signs,
  times and big numbers.
- **Gloock**: the engraved serif for names, prices and quotes. Roman only. **No italic accent words.**
  Emphasis is a brass keyline (`.keyline`) or a switch to `.gilt`.
- **Schibsted Grotesk**: UI and body. Tabular numerals for money.

## Shape

- Buttons are **chamfered tags** (`.tag-btn`, clipped corners via `clip-path`), never pills or plain
  rectangles with radius. Primary = brass on lacquer, secondary = brass keyline.
- Cards on lacquer have a 1px `line` border and square corners. Paper elements have a deckled or
  perforated edge (`.perf`, `.deckle`).
- Photos sit in **round brass-ringed mirrors** (barbers) or full-bleed with a vignette (shop).

## Motion

- **Swivel**: blocks turn in around their vertical axis (rotateY 14° → 0, `.swivel`, IntersectionObserver
  adds `is-in`), like a chair turning to face you. Once, no stagger cascades.
- **Pole**: the barber-pole stripe (`.pole`) moves while something is held or loading.
- **Steam**: SVG wisps rise over hot-towel moments (`<Steam>`).
- **Strop**: link underlines run out and back once on hover, like a razor on a strop (`.strop`).
- **Into the kit**: adding a shelf product flies a ghost of it into the Counter bar's tab.
- **Dial hand**: the mirror's clock hand turns to the chosen time.
- Everything respects `prefers-reduced-motion` (no movement, content visible).

## How this differs from every other template

| | Frisør | Siblings |
|---|---|---|
| **Navigation model** | A fixed **bottom Counter bar** on every screen size (wordmark, links, running tab, "Take a chair"). No top header. The menu opens upward as a price board. | Top headers (HAAR, Clarity, NOIR, VOLT, Tensile, Fluently, Bali); Alba's left chart rail + bottom dock on phones only. |
| **Section rhythm** | Lacquer and paper alternate; sections are numbered by **clipper guard** ("No. 1½ — The Shelf") and divided by the guard-comb rule. | Eyebrow pill → H2 → three cards; editorial arches (HAAR); transit diagrams (Alba). |
| **Hero** | Shop-window **gilt lettering** over a full-bleed photo, plus a live "Chairs today" board per shop. | Split hero with chip + H1 + two pill CTAs + avatar stack. |
| **Booking interaction** | **The Mirror Dial**: the barber's mirror with free times as brass notches on a clock ring, towel-tag days, an accessible time list under it, and **The Shelf** beside it. One page, three zones, no steps. | Step accordion + sticky summary; consultation-card composer (HAAR); hall map (VOLT); timetable (Tensile); chair-time track (Alba). |
| **Checkout** | **The Docket**: one long perforated paper chit (sitting, shelf with steppers and "add to the docket", who's sitting, settle up), totals printed as a receipt. | Accordion + sticky summary card. |
| **Confirmation artifact** | A **brass chair check** token with an engraved rim, plus "your kit is set aside at the till". | Tickets (several), flippable reminder card (Alba). |
| **Account** | **The Regular's Card**: punched per completed sitting, a cadence line ("every 24 days, next due…"), the shelf you've bought with "restock". | Next booking as a ticket; Alba's recall ring + stamp passport. |
| **Type** | Big Shoulders Display, Gloock, Schibsted Grotesk. | See the ban list in `CLAUDE.md`. |
| **Motion** | Swivel, pole, steam, strop, into-the-kit, dial hand. | The shared kit (fade-up, parallax, marquee, magnetic, count-up, Lenis); Alba's gleam/aperture/flap. |

## Upselling rules

- Retail lives in add-ons whose slug starts with `shelf-` (see `lib/shelf.ts`). In-chair extras
  (hot towel finish, scalp massage…) are the other add-ons.
- The shelf appears in booking (beside the dial), in the docket ("Add to the docket"), on thank-you
  ("set aside at the till" + "restock next time"), in the account ("Your shelf"), on barber pages
  ("What Theo uses") and on `/apothecary`.
- Barbers' picks and "pairs with" come from `siteConfig`; prices, names and images always come from
  the store.
- `SHELF15` is applied automatically when the first shelf product lands in the cart, and the saving
  is shown in the docket. Stores without that code just don't show a saving.
- Never fake scarcity, countdowns or reviews.
