# Frisør: design contract (v2, "The House & the Shelf")

Frisør is a premium Berlin barbershop: three shops, thirteen barbers and an apothecary shelf of
things they use at the chair. The site should feel like the best barber + apothecary brand in the
city: calm, confident and well printed. Big editorial photography, a classic serif, generous paper,
fine engraved rules, and a booking flow anyone can finish in under a minute.

Read this before touching UI. The usability rules at the bottom are binding.

## Concept

A barbershop that is also an apothecary, art-directed like a printed house catalogue. Two
materials carry the whole design:

- **Paper** (warm cream, the page): menus, price lists, labels, forms. Ink-black type, hairline and
  double engraved rules, small-caps labels, dot leaders between a name and its price.
- **Bottle-green lacquer** (deep green bands): the shop itself. Full-bleed photography sits on it,
  and so do the hero, the shop pages and the footer.

Brass is the single accent (one primary action per view, the active state, the SHELF15 seal).

Everything sellable is presented as an **apothecary label**: an oval cartouche or a framed label with
a lot number ("No. 07"), the product name in the serif, one line of benefit, the price. Services get
the same label treatment on the menu, which ties the chair and the shelf together.

## Palette (tokens in `app/globals.css`)

- `paper` #F3EEE4 (page), `paper-2` #EAE3D5 (raised paper, hovers), `paper-3` #DCD2BF (rules on paper)
- `ink` #17201C (text), `ink-2` #4B544F (secondary), `ink-3` #7D837D (muted)
- `green` #1E3A2F (lacquer bands, primary buttons), `green-2` #162C23 (deeper), `green-hi` #2C5242
- `brass` #B28A4C (accent, active), `brass-hi` #D7B57A (on green), `brass-lo` #8C6A33
- `oxblood` #7A2E2A (errors, "taken", destructive only)

## Type

- **Libre Caslon Display**: headlines, prices on labels, the wordmark. Roman only, never an italic
  accent word in colour (that's Clarity/HAAR). Big, tight, sentence case.
- **Libre Caslon Text**: product and service names at reading size, numbers on the appointment card.
- **Manrope**: UI, body, buttons, slot times (tabular numerals). Small-caps labels are Manrope
  uppercase at 0.7rem with 0.16em tracking (`.label`).

## Shape and detail

- Buttons are **square-cornered rectangles with a 1px inner keyline** (`.btn`, a 3px inset
  double border on the primary). No pills, no chamfers, no offset shadows.
- Rules: `.rule` (hairline), `.rule-double` (two hairlines 3px apart, the engraved look).
- Price lists use dot leaders (`.leader`).
- Photos are rectangular, full-bleed or in tall 4:5 frames, with a thin paper inset frame on
  barber portraits. No circles, no mirrors, no arches.
- Radius: 2px on inputs, 0 elsewhere.

## Motion

Subtle and functional only: 150–250 ms colour/opacity transitions on hover and selection, a short
cross-fade between booking steps, a gentle image zoom (1.03) on hover of photo cards. No scroll-driven
animation, no parallax, no marquees, no reveal-on-scroll. `prefers-reduced-motion` turns it all off.

## Page composition

- **Header** (sticky, paper): wordmark left; Services, Barbers, Shops, The Shelf centred; account,
  "Your booking" (when a chair is held) and the green **Book a chair** button right. A slim green
  strip above it says which shops are open now. Phones: wordmark, Book button, menu button that opens
  a full-height sheet.
- **Home**: a full-bleed photographic hero on green with a large Caslon headline and one CTA; then a
  printed price list (two columns, dot leaders, "Book" on each row); the barbers as a tall photo
  row; The Shelf as a row of apothecary labels; the three shops as large photo panels with hours.
- **Footer**: green, three shop addresses with hours, contact, small print.

## The booking flow (`/book`)

Three short steps, each fitting one screen, with **"Your chair"** (a summary panel: shop, service,
barber, time, shelf lines, running total and the primary button) always in view: a sticky right
column on desktop, a compact bar fixed to the bottom on phones (tap to expand the details).

1. **Shop & service.** The three shops as tabs at the top (default: the last one used, else the
   first). Below, the menu for that shop as rows (name, length, from-price). Tapping a service with
   options opens them inline under it; choosing an option moves on to step 2.
2. **Barber & time.** A row of barber portraits, "Any available" first and selected by default. The
   date strip sits directly above the time slots; the first day with free times is selected. Slots
   are plain buttons grouped Morning / Afternoon / Evening. Choosing a time updates the panel and
   enables "Continue".
3. **The Shelf.** "Pairs with your Skin Fade": three products first, then the rest of the shelf as
   labels with a photo, price, one-line benefit and a one-tap Add (becomes a stepper). The SHELF15
   seal says 15% comes off anything from the shelf, applied automatically. "Skip the shelf" sits next
   to "Continue to details". Leaving this step holds the chair and opens checkout.

## Checkout (`/checkout`)

Conventional two columns. Left: **Contact** (email first, "Been here before? Sign in with a code"
inline, name, phone), then **Payment** (provider choice, Stripe card). Right: the order as a printed
**house receipt**: each sitting, the shelf lines with steppers, a last-chance shelf row (two
products), the discount-code field, totals. Phones: the receipt collapses into a "Show order ·
€58" toggle at the top, and the pay button is the last thing in the form.

## Thank-you (`/thank-you`)

The signature artifact is **the appointment label**: a cream apothecary label with a double rule,
an oval cartouche holding the time, and the lot line "No. 0427 · Station with Theo · Mitte". Beside
it, a plain scannable list (When, Where with directions, Barber, Set aside at the chair, Paid), then
Add to calendar (.ics and Google), Directions, Manage booking. Below: "Restock at your next visit"
and "Book the next one around 24 Nov".

## Account (`/account`)

Tabs: Visits, Orders, Profile. The next visit on top with Manage / Reschedule / Cancel; past visits
as a list with **Book again** on each row; "Your shelf" shows what you've bought with a restock link
(`/book?kit=…`).

## How this differs from every other template

| | Frisør v2 | Siblings |
|---|---|---|
| **Navigation** | Paper header with an "open now" green strip, centred nav, square green Book button with a keyline | HAAR/Clarity pill headers, NOIR's dark bar, VOLT's club switcher, Alba's chart rail + dock |
| **Section rhythm** | Paper ↔ green lacquer bands; printed price lists with dot leaders; apothecary labels with lot numbers | Eyebrow pill → H2 → three cards; arches (HAAR); transit diagrams (Alba); timetable (Tensile) |
| **Hero** | One full-bleed photograph, Caslon headline set large on green, a single square CTA | Split hero with chip + H1 + two pills + avatar stack |
| **Booking** | Three screen-sized steps with the "Your chair" panel always in view; shop tabs + menu rows; barber portraits row; date strip directly above grouped slots; an apothecary shelf step | Step accordion (Clarity), consultation composer (HAAR), hall map (VOLT), timetable (Tensile), chair-time track (Alba) |
| **Checkout** | Contact + payment on one page, the house receipt on the right with live shelf steppers and a last-chance row | Accordion + sticky summary card |
| **Confirmation** | The appointment label: apothecary label with an oval cartouche time and a lot line | Tickets, Alba's flippable reminder card |
| **Account** | Visits with one-click Book again, "Your shelf" restock | Next booking as a ticket; Alba's recall ring |
| **Type** | Libre Caslon Display / Text, Manrope | See the ban list in the skill's `uniqueness.md` |
| **Motion** | Colour and opacity only, step cross-fade | Shared motion kit, Alba's gleam/aperture/flap |

## Usability rules (binding, Stan Oct 2026)

Uniqueness comes from brand, typography, photography, composition and the confirmation artifact,
**not** from inventing interaction patterns. A classic, obvious control beats a clever one.

- A normal **top header**. "Book a chair" is visible on every page; so are the account and the held
  booking. No bottom navigation bar on desktop.
- In the booking flow, every choice sits next to the one after it. The date strip is directly above
  the times. Times are plain, large buttons (min 44px tall). No dials, no decorative pickers, nothing
  that looks clickable and isn't.
- The primary action and the running total are **always visible without scrolling**, on desktop
  (sticky panel) and phones (fixed bar). Choosing something advances or reveals the next choice in
  view (scrolls it into view under the header when needed). No scroll ping-pong.
- Skipping the shelf is one obvious button next to Continue.
- Checkout reads instantly: labelled fields, one column of form, the order on the side.
- Thank-you and account: the facts (when, where, who, what's set aside) are scannable in a list,
  never only inside a decorative artifact.
- Everything works at 390px wide with no horizontal scroll; tap targets ≥ 44px.

## Upselling rules

- Retail lives in add-ons whose slug starts with `shelf-` (`siteConfig.shelf.prefix`). Other add-ons
  are in-chair extras.
- The shelf appears in: the booking step 3, the checkout receipt (steppers + last-chance row), the
  thank-you ("set aside at the chair" + restock), the account ("Your shelf"), service rows on the
  menu ("Pairs well with"), barber profiles ("What Theo uses"), home, and `/shelf`.
- Pairs and notes come from `siteConfig`; names, prices and photos always from the store.
- `SHELF15` (`siteConfig.shelf.autoCode`) is applied automatically when the chair is held with a
  shelf product, or when the first one is added at checkout, and removed with the last one. A store
  without that code just shows no saving.
- Never fake scarcity, countdowns or reviews.
