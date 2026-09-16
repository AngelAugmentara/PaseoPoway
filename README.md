# Poway Paseo — pre-leasing landing page

A single static page whose only job is to collect email addresses for a priority-access list. No build step, no frameworks, no dependencies.

```
index.html            the page
privacy.html          the privacy policy, linked from every footer
styles.css            all styling; retheme from the token block at the top
hero-fullbleed.css    the photographic sections; loads after styles.css (see §13)
main.js               form handler, success state, chips, analytics stub
brand.html            three CSS-only wordmark treatments (not part of the site)
favicon.svg           the "P" from wordmark #1, traced from Marcellus outlines (also inlined in index.html)
og-image.svg          share image source, 1200×630, type as paths
og-image.png          share image rendered from the SVG (what og:image points at)
hero.jpg              the hero photograph
poway-foother.jpg     the Restaurant & Retail photograph
README.md             this file
```

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

---

## 1. Tokens to fill in

Every fact that was not supplied is a `{{TOKEN}}`. Search for `{{` across `index.html`, `privacy.html`, and `main.js`; 22 distinct tokens remain open. `{{DEVELOPER_NAME}}` is already filled in as Valor Property Management, and `{{PRIVACY_POLICY_URL}}` is resolved: the footers now link to `privacy.html` directly. Nothing on the page is invented: no amenities, sizes, prices, addresses, or dates appear anywhere unless you fill them in.

| Token | Where | What to put there |
|---|---|---|
| `{{SITE_URL}}` | `<head>` canonical, `og:url`, `og:image`, `twitter:image` | Production origin with no trailing slash, e.g. `https://powaypaseo.com`. Required for share cards to work. |
| `{{OPENING_WINDOW}}` | Stat strip, FAQ "When does Poway Paseo open?" | The opening window as you are willing to state it publicly. Keep it short; it sits in the stat strip at display size. |
| `{{ONE_BED_LINE}}` | Residences, One Bedroom | One line for the one-bedroom, no square footage or price. |
| `{{TWO_BED_LINE}}` | Residences, Two Bedroom | One line for the two-bedroom, no square footage or price. |
| `{{RETAIL_SUITE_SIZES}}` | Retail body and spec list | Suite size range. It follows the words "Suites range from", so a range reads best. |
| `{{RETAIL_FRONTAGE}}` | Retail spec list | Storefront frontage. |
| `{{RETAIL_CEILING_HEIGHT}}` | Retail spec list | Clear ceiling height in the suites. |
| `{{RETAIL_DELIVERY_CONDITION}}` | Retail body and spec list | Delivery condition. In the body it follows the word "delivered", so a phrase like "in cold shell" reads best. |
| `{{RETAIL_AVAILABLE_DATE}}` | Retail body and spec list | When commercial suites are available for occupancy. |
| `{{LEASING_BROKER_CONTACT}}` | Retail body, FAQ, footer, and the commercial thank-you message (read from the footer by `main.js`) | Broker name and firm, or a name and phone. It is used as the subject of "follows up directly", so a name works better than a URL. |
| `{{FREEWAY_ACCESS}}` | Location | Factual freeway access, e.g. the route number and the exit. No drive-time claims are needed. |
| `{{NEARBY_LANDMARKS}}` | Location | Neutral landmarks only (parks, civic buildings, retail centers). Avoid schools, places of worship, and anything that implies who lives nearby; see §8. |
| `{{LIVE_WORK_USE_NOTE}}` | FAQ "What is a live-work unit?" | One sentence on permitted uses, or the phrase to direct people to ask. Written as a sentence fragment that ends in a period. |
| `{{EMAIL_CADENCE}}` | FAQ "How often will you email me?" | A cadence phrase such as "About once a month". It is followed by a period and "A handful of updates, then launch." |
| `{{CONTACT_EMAIL}}` | Footer | General inquiries address. It is used as both link text and `mailto:` target. |
| `{{PRIVACY_EFFECTIVE_DATE}}` | `privacy.html` header, twice | The date the policy takes effect, e.g. "March 3, 2026". Both the effective and last-updated lines read from this token; split them once you revise the policy. |
| `{{MAILING_ADDRESS}}` | `privacy.html`, sections 1 and 17 | A postal address where privacy requests can be sent. Required in commercial email under CAN-SPAM, so you need one regardless. |
| `{{EMAIL_PROVIDER}}` | `privacy.html`, section 7 | The platform used to send list email, e.g. "ConvertKit". If it is the same as the form provider, use the same name in both. |
| `{{ANALYTICS_PROVIDER}}` | `privacy.html`, sections 3 and 7 | The analytics tool, e.g. "Google Analytics" or "Plausible". If you never enable analytics, delete those two sentences rather than filling this in. |
| `{{DATA_RETENTION_PERIOD}}` | `privacy.html`, section 12 | How long list data is kept, e.g. "up to 24 months after the community opens". |

There are no rendering placeholders left. The hero and Restaurant & Retail carry real photographs (§13); the Architecture and Residences sections are type-only by design. If renderings for the individual unit types arrive later, the arch-masked slot markup and its aspect ratios are still documented in `styles.css` §6.

---

## 2. Three alternate H1s

The live H1 is **"72 residences. One release."**

1. **"Three buildings. Seventy-two homes. One list."** Same rhythm, but the third beat names the action instead of the event, so the button feels like the obvious next step.
2. **"Before the sign goes up."** Quieter and more confident. It sells the timing rather than the count and reads well over a construction rendering. Needs the subhead to carry the facts.
3. **"First to see it. First to choose."** Leads with the benefit the list actually confers. Pairs with benefit #2 and is the most direct of the three.

---

## 3. Typeface rationale

**Display: Marcellus.** The brief's starting point, kept. Marcellus is an inscriptional Roman: flat serifs, wide round capitals, no italic, one weight. That constraint suits the direction. The arch, the plaster wall, and the letter cut into stone are the same vocabulary, and the single weight forces hierarchy to come from size and space rather than boldness, which is what "quiet and expensive" looks like in practice. It also sets the wordmark well at 0.34em tracking because the caps were drawn to be spaced.

**Body: Karla, not Jost.** The brief asks for a humanist sans. Jost is geometric (a Futura revival), and the Marcellus + Jost pairing has become the default for developer sites, which is the "reads generic" case the brief anticipates. Karla is a grotesque with humanist proportions and a slightly wide, warm set; it sits closer to plaster and iron than to glass and steel. Two weights are loaded (400, 500); 500 is enough for eyebrows and buttons, so the contrast targets are met with weight and size rather than extra colors. Inter was the runner-up; it is more neutral but reads as software.

**If you want more editorial:** Cormorant Garamond for display (already loaded on `brand.html` for wordmark #3) pairs with Karla as well. It has an italic, which Marcellus lacks, but it is thin at small sizes and would need heading sizes bumped a step.

**Scale.** A fluid modular scale, ratio 1.20 at 360px viewport rising to 1.25 at 1280px, defined as `--step--2` through `--step-6` in `styles.css` §1. The H1 has its own clamp (38px to 76px) so it can outrun the scale on wide screens.

---

## 4. Contrast check (WCAG 2.1 AA)

Computed from the exact hex values. Body text needs 4.5:1; large text (24px+, or 18.66px+ at weight 700) needs 3:1.

| Foreground | Background | Ratio | Use on the site |
|---|---|---|---|
| #434341 near-black | #F1EFEB plaster | **8.63:1** | body text, chips, focus ring |
| #54504A dark warm | #F1EFEB plaster | **6.97:1** | headings, stat values, slot tags |
| #636562 slate | #F1EFEB plaster | **5.12:1** | secondary text, eyebrows, captions, error text, placeholders |
| #6D595A mauve | #F1EFEB plaster | 5.67:1 | not used as text; CTA fill only |
| #817A6E stone | #F1EFEB plaster | 3.70:1 | **large text only**: benefit numerals (27px+), treatment numbers on brand.html |
| #837E74 taupe | #F1EFEB plaster | 3.52:1 | not text; field and chip borders (3:1 non-text boundary passes), slot fills |
| #979083 sage | #F1EFEB plaster | 2.76:1 | never text; hairlines and dividers only |
| #F1EFEB plaster | #54504A dark warm | **6.97:1** | all text on dark sections |
| #F1EFEB plaster | #6D595A mauve | **5.67:1** | button label |
| #817A6E stone | #54504A dark warm | 1.88:1 | **fails**; the brief's "stone for dark-section text" was not usable. Stone is used on dark only for hairlines. |
| #979083 sage | #54504A dark warm | 2.53:1 | fails; not used on dark |
| #6D595A mauve | #54504A dark warm | 1.23:1 | the CTA nearly vanishes against the dark fill, so on dark sections the button carries a 1px plaster edge (`--btn-edge`) to keep a visible boundary |

Two consequences worth knowing: on dark sections every piece of text is plaster, and secondary text is distinguished by size rather than color; and nothing on the site uses stone or taupe below 24px.

---

## 5. Design system notes

- **Palette roles.** Components never reference a hex. They read `--text`, `--heading`, `--rule`, `--border`, `--field-bg`, and so on, and `.section--dark` re-maps those roles. Change a color once in `styles.css` §1.
- **The accent.** `#6D595A` appears in exactly one rule: `.btn`. Nothing else may use it.
- **Grain.** One 280px SVG tile with `feTurbulence` at 7% alpha, set as a repeating `background-image` on the body, and on dark sections. Cheap to paint; no runtime filter on large elements.
- **Arches.** Now carried by the architecture itself rather than by CSS masks, since the hero shows a real photograph. The arch-masked `.slot` rules remain in `styles.css` §6 if a future section needs one.
- **Photographs.** `object-fit: cover` on both, so any crop works. Each sits under an adjustable overlay; see §13.
- **Motion.** Scroll reveals use one `IntersectionObserver` and only run under `html.js` and `prefers-reduced-motion: no-preference`. The hero never animates.
- **Section centering.** `.section--centered` (used on “What you get by joining”) centers a measure-capped section as a block on desktop, where its left-aligned content would otherwise leave a wide empty gap on the right of a full-width row. Text inside stays left-aligned. Below the 60em breakpoint it has no effect, since content already runs near full width. Add the class to any other section that needs the same treatment.

---

## 6. Form setup

All three forms (hero, retail, closing) share one handler and one success state. Everything configurable is at the top of `main.js`:

```js
const FORM_ENDPOINT = '/api/lead';   // the Pages Function; see §15
const FORM_ENCODING = 'json';
const PROFILE_METHOD = 'POST';
const EXTRA_FIELDS = {};
const HONEYPOT_NAME = '_gotcha';
```

Submissions go to a Cloudflare Pages Function at `functions/api/lead.js`, which writes to a D1 database. Because the endpoint is same-origin there is no CORS to configure, and because the database is reached from the Function rather than the browser, **no key or credential appears anywhere in `main.js`**. That file is public to every visitor, so nothing secret may ever go in it.

Full setup steps, the schema, and useful queries are in §15.

If `FORM_ENDPOINT` is ever blanked or left as a `{{TOKEN}}`, submissions are simulated instead (a short delay, a `console.warn`, and the success state still renders) so the flow can be reviewed without a backend.

**Payloads.** The signup sends `email, source (hero|retail|closing), lead_id, lead_type (residential|commercial), stage: 'signup', page`. Each chip click and the concept note send a second request with the same `email` and `lead_id`, `stage: 'profile'`, and one of `interest`, `timeline`, or `concept`. Submissions from the retail form carry `lead_type: 'commercial'` and `interest: 'interest_retail'` from the first request, so they can be routed to the broker without waiting for the chip.

**Progressive profiling.** After submit the form is replaced in place with a confirmation, then "What are you interested in?" (six chips). Choosing "Restaurant or retail space", or submitting from the retail form (which pre-selects that chip), swaps the second question for an optional free-text field, "Tell us about your concept and the size you need." Otherwise the second question is "When are you looking?" Both rows have a Skip. The wrapper has `aria-live="polite"` and focus moves to the confirmation.

---

## 7. Analytics

`trackEvent(name, params)` at the top of `main.js` forwards to `gtag` or `plausible` if either is present, otherwise logs to `console.debug`. Add the GA4 or Plausible snippet to `<head>` and it starts working. Events:

| Event | Params | When |
|---|---|---|
| `form_view` | `source` | a form is at least half visible, once per form |
| `signup_submit` | `source, lead_type` | valid email, request sent |
| `signup_success` | `source, lead_type` | endpoint accepted |
| `signup_error` | `source` | endpoint failed |
| `chip_select` | `row, value, lead_type, source, auto` | any chip; `auto: true` when pre-selected by the retail form |
| `profile_note` | `source, lead_type, length` | concept note sent |
| `profile_skip` | `row, source` | a row was skipped |

Chip values are namespaced (`interest_1br`, `interest_2br`, `interest_townhome`, `interest_livework`, `interest_retail`, `interest_unsure`, `timeline_6mo`, `timeline_6_12mo`, `timeline_exploring`) and every event carries `lead_type`, so residential and commercial demand read separately in any dashboard.

---

## 8. Fair housing notes

The copy avoids references to families, children, religion, national origin, disability, and "safe" or "quiet" neighborhoods, and avoids ability-implying phrases ("walking distance", "steps from"). The footer carries the HUD Equal Housing Opportunity statement and logo, plus the conceptual-renderings disclaimer. Two places need care when tokens are filled: `{{NEARBY_LANDMARKS}}` (keep to parks, civic, and retail; no schools or places of worship) and `{{LIVE_WORK_USE_NOTE}}` (describe the use, not the user). Benefit #2 promises first choice in list order; make sure leasing operations can honor it exactly as written.

---

## 9. Share image

`og-image.svg` is the source: the wordmark, headline, and subline are Marcellus outlines converted to paths (with real kerning), so it renders identically without fonts. Social crawlers do not accept SVG, so `og:image` points at `og-image.png`, rendered from the SVG with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --screenshot=og-image.png --window-size=1200,630 "file://$PWD/og-image.svg"
```

Edit the SVG, re-run the command, and both stay in sync.

---

## 10. Deploy

There is no build. The folder is the site.

**Netlify.** Drag the folder onto app.netlify.com, or:

```bash
npx netlify-cli deploy --prod --dir .
```

If you use Netlify Forms, deploy once with the `data-netlify` attributes in place so Netlify can register the form at build time.

**Vercel.**

```bash
npx vercel --prod
```

Vercel serves static folders as-is; no `vercel.json` is needed. For either host, set `{{SITE_URL}}` to the final domain before deploying so canonical and share tags are absolute.

**Headers (optional).** Both hosts let you add `Cache-Control: public, max-age=31536000, immutable` for `styles.css`, `main.js`, and the images. Rename files with a hash if you do.

---

## 11. Launch checklist

- [ ] Fill the remaining 22 tokens across all three page files (search `{{`)
- [ ] Set `FORM_ENDPOINT` in `main.js` and the three `<form action>` attributes; test one real submission end-to-end including a chip click
- [ ] Add the analytics snippet; confirm `form_view` and `signup_success` arrive
- [ ] Drop the hero rendering into the slot, move `data-alt` into `alt`, remove `.slot__tag`
- [ ] Delete the `#art-a` sprite once the hero has a real image
- [ ] Have a California attorney review `privacy.html` before launch (see §14)
- [ ] Legal review of benefit #2 and the retail spec values
- [ ] Run Lighthouse (Chrome DevTools, Lighthouse tab, mobile) and confirm 95+ across all four categories. The page was built to that bar (system fonts as fallbacks, preconnect to Google Fonts, no images beyond inline SVG, explicit image dimensions, one h1, labeled landmarks, 48px targets, AA contrast throughout), but the score was not measured in the build environment because the Lighthouse CLI needs Node, which was not installed. Measure before launch.

---

## 12. Copy notes

See the closing message of the build session, reproduced here for the record.

- "One release." is the strongest two words on the page, but it is also ambiguous out of context (a software release, a press release). The subhead resolves it, and the alternate "One list." is available if the ambiguity bothers anyone.
- The subhead is 36 words. It fits above the fold on a 375px phone but not with much room; a tighter cut is "One- and two-bedroom apartments, townhomes, and live-work residences in Poway, California. Join the list to see floor plans, pricing, and tour dates first."
- "One email field." in the microcopy describes what the reader is already looking at. "No spam, and you can leave the list in one click." carries the whole message.
- "Get First Access" is fine. "Join the Priority List" says what happens and reuses the phrase from the subhead, which tends to lift conversion on single-field forms.
- "Your commute is a staircase." is the best line in the brief. Keep it.
- Benefit #2 is a promise, not a benefit statement. It should stay only if leasing will honor list order exactly.
- The FAQ "How often will you email me?" answer depends on the shape of `{{EMAIL_CADENCE}}`; the token description above is written so the sentence reads cleanly.
- The Architecture section makes soft physical claims (plaster walls, iron rails, courtyards, deep arches). They follow the brief's direction, but the architect should confirm them against the drawings before launch.

---

## 13. The photographic sections

`hero-fullbleed.css` loads after `styles.css` and owns everything that puts copy over a photograph: the full-viewport hero, and Restaurant & Retail. It began as a variant of an earlier arch-slot hero; that version has been retired and this is now the only page. Every knob below lives in the `:root` block at the top of that file.

| Variable | Default | What it does |
|---|---|---|
| `--hero-image` | `url("hero.jpg")` | Path to the ultra-wide rendering. Also update the `<img src>` and the `<link rel="preload">` in `index.html`'s `<head>` so the browser fetches it first. |
| `--hero-scrim` | `0.45` | Opacity of the dark layer between the image and the copy. `0` shows the image untouched, `1` is solid. |
| `--hero-focus` | `50% 50%` | `object-position` of the image. On phones an ultra-wide image is cropped hard at the sides; raise the second value (e.g. `50% 70%`) to keep the ground in frame. |
| `--hero-gradient` | a CSS `linear-gradient()` | The gradient layered over the photo. Traced from the supplied `Gradient.png` at zero bytes and no extra request. Swap in `url("Gradient.png")` to use the file instead — it is still in the project folder — and restore its preload link in `index.html`. |
| `--hero-gradient-opacity` | `1` | `0` hides the gradient, `1` is full strength. Independent of the scrim. |
| `--hero-gradient-size` | `100% 100%` | `background-size` for the gradient. `100% 100%` stretches the full left-to-right ramp across the hero. Raising the first value pushes more of the dark end across; phones already override this to `260% 100%`. |
| `--chip-glass` | `0.52` | Ink tint of the frosted-glass chips in the post-submit "What are you interested in?" row, on the hero and on Restaurant & Retail. At 0.52 the plaster label passes AA (4.5:1) even over a pure-white patch of photo with the scrim at 0. Lower it if you raise the scrim; raise it for a brighter photo. |
| `--chip-glass-blur` | `16px` | How much the photo softens behind each chip. |
| `--chip-glass-edge` | `0.30` | Alpha of the plaster hairline rim. Together with an inset highlight on the top edge, it is what makes the chip read as glass rather than a dark pill. The selected chip inverts to solid plaster with ink text. |
| `--hero-lede-weight` | `600` | Weight of the subhead. It is the smallest block of running text over the image, so it is set heavier than the rest of the site. `400` matches the body default, `500` is a light emphasis. Karla 600 is requested only by this variant. |
| `--hero-text-shadow` | `0 1px 2px rgba(67, 67, 65, 0.55)` | A tight, low-opacity shadow on the hero text, so each letter keeps an edge where the image behind it is busy. It does no visible work over flat areas. Set to `none` to remove. It is scoped to the eyebrow, headline, subhead, microcopy, and wordmark; the email field and button are excluded. |

The hero stacks in four layers, bottom to top: the photograph, the gradient, the scrim, then every piece of text. The gradient and the scrim are separate, so you can dial either without disturbing the other. The gradient is a horizontal fade, dark at the left edge where the copy sits and clear at the right so the rendering stays visible, which is why the scrim can sit at `0` and the copy still reads. It ships as a CSS `linear-gradient()` traced from the original `Gradient.png`; the PNG itself is still in the folder if you'd rather point `--hero-gradient` back at it.

The chips in the post-submit row use a dark frosted glass (`--chip-glass*`) so they hold contrast independently of the scrim; on the flat dark fills they keep the original transparent hairline style. The hero also remaps `--bg` to the dark fill so a selected chip's ink text never falls back to page plaster.

Contrast on the image depends on the gradient, the scrim, the weight, and the shadow together. Plaster text needs 4.5:1 against whatever sits behind it, so after placing the rendering, sample the lightest area under the copy with a contrast checker. Raise `--hero-scrim` if the image itself is too bright, and use `--hero-lede-weight` and `--hero-text-shadow` when only parts of the image fight the text. `--hero-scrim-color` defaults to near-black (`#434341`); dark warm (`#54504A`) gives a warmer cast at the cost of a slightly higher scrim value.

Both photographs ship as JPEG at quality 80: `hero.jpg` (414KB, above the fold and preloaded) and `poway-foother.jpg` (468KB, lazy-loaded, shared by the retail and closing sections). The original PNGs are still in the folder, unreferenced, and can be deleted before deploying. To regenerate either one after editing:

```bash
sips -s format jpeg -s formatOptions 80 hero.png --out hero.jpg
```

Restaurant & Retail carries a photograph behind an adjustable overlay via the `.section--photo` modifier, tuned with `--retail-image`, `--retail-scrim`, `--retail-scrim-color`, and `--retail-focus`. The closing CTA uses the flat `#54504A` fill. To give another section the same treatment, add `.section--photo` to it along with the two layer divs, then map its own `--photo-*` values; the mechanics carry fallbacks so a section with no mapping still renders.

The image is the LCP element, so keep it under about 300KB (a 2400px-wide JPEG at quality 70, or WebP) and consider an `<picture>` with a narrower crop for phones if the full-width file is heavy.

---

## 14. Privacy policy

`privacy.html` is a separate page rather than a section of the landing page. The landing page exists to do one thing, and a legal document inline competes with that, dilutes the page's topical focus for search, and adds weight to the page whose load time matters most. Every footer links to it, so it is one click away from anywhere on the site. It reuses `styles.css` and carries its own small `<style>` block for the document layout, the same pattern `brand.html` uses.

**It describes what the site actually does**, not boilerplate. The data inventory was written from `main.js`: email address, the optional interest and timeframe chips, the optional commercial free-text note, which form was used, and the timestamp. It states correctly that the site sets no cookies and uses no local storage, and it discloses that Google Fonts receives the visitor's IP address because the typefaces load from Google's servers. If you change what the forms collect, or add a cookie, update sections 3, 4, and 9 to match.

**Fair housing protections are in section 5.** It states the Equal Housing Opportunity commitment, lists the characteristics protected under federal law and California's broader FEHA and Unruh standards, and says plainly that none of them are requested. Most importantly it commits that the home-type and timeframe selections are used only to decide which information to send, never to screen, qualify, rank, steer, limit, or determine eligibility, and that priority list order is set by signup time alone. That last point backs the promise made in benefit two on the landing page, so the two documents agree.

**Section 15 handles age carefully.** Saying a website is intended for adults is standard data-collection language, but age is a protected characteristic in California housing, so the section is explicitly scoped to who submits information through the website and is followed by a statement that it says nothing about who may live at Poway Paseo.

**Business protections** are spread through the policy: the list is not an application or an offer to lease (section 2), security is reasonable but not guaranteed (section 13), third-party sites are not our responsibility (section 14), information may transfer in a sale or reorganization (section 7), and the policy may be revised (section 16).

**Before launch, have a California attorney review it.** This page is written to be accurate and conservative, and its factual claims match the code, but it is not legal advice. Two things in particular need a lawyer's eye: whether Valor Property Management meets the CCPA and CPRA applicability thresholds, which changes what section 11 must promise, and whether the retention period you put in `{{DATA_RETENTION_PERIOD}}` fits your record-keeping obligations.

**Two promises the policy makes that operations must keep.** Every email needs a working one-click unsubscribe, which the landing page microcopy also promises. And requests to access, correct, or delete sent to `{{CONTACT_EMAIL}}` need someone actually monitoring and acting on them.

---

## 15. Cloudflare Pages + D1

The form backend is one Pages Function writing to one D1 database.

```
functions/api/lead.js   the endpoint, POST /api/lead
schema.sql              the two tables, run once against D1
```

### How it fits together

The browser posts to `/api/lead` on your own domain. The Function validates the request and writes to D1 through a binding named `DB`. The database is never exposed to the browser, so there is no public API key to leak or rotate.

Each visitor produces two or three requests: the signup, then one per optional answer. That shape is why there are two tables.

**`submissions`** takes one row per request and is never updated or deleted by the app. It is the audit trail.

**`leads`** holds one row per person, filling in as answers arrive. This is the table you work from. It is keyed on **email, not lead_id**, so a second signup from the same address updates the existing row instead of creating a duplicate, and `joined_at` keeps its original value. That matters beyond tidiness: your page promises "first choice of residence, in the order the list was joined," and the privacy policy states that position is set solely by when an address was added. `joined_at` is the record backing both claims, so nothing in the Function ever writes to it after the first insert.

### Setup, dashboard route

No Node is installed on this machine, so `wrangler` is not available locally. These steps use the Cloudflare dashboard only.

1. **Create the database.** Cloudflare dashboard → **Storage & Databases → D1** → **Create**. Name it `poway-paseo`.
2. **Create the tables.** Open the database → **Console** tab → paste the entire contents of `schema.sql` → run it. You should end up with `submissions` and `leads` under Tables.
3. **Bind it to the site.** **Workers & Pages** → your Pages project → **Settings** → **Bindings** → **Add** → **D1 database**. Set the variable name to exactly `DB` and pick `poway-paseo`. Add the binding for **Production and Preview** both, or previews will fail while production works.
4. **Deploy with the `functions` folder included.** Cloudflare detects `functions/` automatically and routes `/api/lead` to it. There is no build step and no config file to add. If you deploy by dragging the folder in, make sure `functions` is inside it.
5. **Redeploy.** Bindings only reach a deployment created *after* the binding exists. If you added the binding to an already-live site, trigger a fresh deployment or the Function will return `server_misconfigured`.
6. **Test it.** Submit the hero form on the live site, answer both questions, then run `SELECT * FROM leads;` in the D1 console. You should see one row with `interest` and `timeline` filled in, and three rows in `submissions`.

### Setup, CLI route

If you install Node later, the same thing from a terminal:

```bash
npx wrangler d1 create poway-paseo
npx wrangler d1 execute poway-paseo --remote --file=./schema.sql
npx wrangler pages deployment tail        # live logs, useful when a write fails
```

### Queries you will actually use

The priority list, in order. This is the one that settles who gets first choice:

```sql
SELECT joined_at, email, lead_type, interest, timeline
FROM leads ORDER BY joined_at ASC;
```

Commercial enquiries for the broker:

```sql
SELECT joined_at, email, concept
FROM leads WHERE lead_type = 'commercial' ORDER BY joined_at ASC;
```

Demand by home type, for deciding what to release first:

```sql
SELECT interest, COUNT(*) AS people
FROM leads WHERE lead_type = 'residential' AND interest IS NOT NULL
GROUP BY interest ORDER BY people DESC;
```

Handling a deletion request, which §10 of the privacy policy commits you to:

```sql
DELETE FROM leads       WHERE email = 'someone@example.com';
DELETE FROM submissions WHERE email = 'someone@example.com';
```

Export for an email platform:

```sql
SELECT email, joined_at, interest, timeline FROM leads ORDER BY joined_at;
```

The D1 console exports results to CSV.

### What the Function refuses

| Input | Result |
|---|---|
| Honeypot field filled | Returns success, writes nothing |
| Malformed or oversized email | `400 invalid_email`, nothing written |
| Body over 8KB | `400 bad_request` |
| An `interest`, `timeline`, `source`, `lead_type` or `stage` value the page cannot produce | Discarded, stored as `NULL` |
| Concept note over 800 characters | Truncated to 800 |

Values are written through bound parameters, never string concatenation, so a crafted value cannot alter the query. Anything outside the allowlist is dropped rather than stored, so the columns your leasing team reads only ever contain values the page itself can generate.

### Data minimisation

The Function stores the visitor's **country** but deliberately not their IP address. An IP is personal data under CCPA, it is not needed to run a mailing list, and Cloudflare already retains it at the edge for abuse handling. Storing less is less to secure, less to disclose, and less to hand over on a deletion request. If you ever do need the IP, it is available as `request.headers.get('CF-Connecting-IP')`.

### Still to wire up

D1 stores the list; it cannot send email. Your microcopy and privacy policy both promise one-click unsubscribe, and CAN-SPAM requires a working unsubscribe plus a postal address in every commercial message. Pick an email platform before your first send, fill `{{EMAIL_PROVIDER}}` in `privacy.html`, and export from `leads` to seed it.

