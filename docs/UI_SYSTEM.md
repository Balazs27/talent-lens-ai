# TalentLens — UI System (V1)
Design Direction: Modern AI SaaS (Linear / Vercel inspired)

This file defines the visual system. Agents must follow it strictly.

---

## 1. Design Principles

- Clean
- Minimal
- Structured
- Data-first
- Professional
- Subtle depth
- No heavy gradients
- No glass inside product UI
- Generous whitespace
- Clear hierarchy via weight, not huge size jumps

---

## 2. Color System

### Base
- Background: white (#FFFFFF)
- Surface: #F9FAFB
- Border: #E5E7EB
- Muted text: #6B7280
- Primary text: #111827

### Brand
- Primary: #2563EB (modern blue)
- Primary hover: #1D4ED8
- Success: #16A34A
- Warning: #F59E0B
- Danger: #DC2626

No random colors. Only use defined palette.

---

## 3. Typography Scale

Use consistent scale. Avoid too many sizes.

- App Title: 24px / font-semibold
- Section Title: 18px / font-semibold
- Card Title: 16px / font-semibold
- Body: 14px
- Small / Meta: 12px
- Score number: 20–24px / font-bold

Never mix more than 4 sizes on a single page.

---

## 4. Spacing System

Use 4px scale.

- 4px
- 8px
- 12px
- 16px (default padding)
- 24px (section spacing)
- 32px (page spacing)

Cards: 16px internal padding minimum.

---

## 5. Card System

Cards must:

- border: 1px solid #E5E7EB
- border-radius: 12px
- background: #FFFFFF
- shadow: very subtle (shadow-sm only)
- consistent internal padding (16px)

Do NOT:
- mix random shadows
- use thick borders
- use glass effect in product UI

---

## 6. Buttons

### Primary
- background: primary blue
- text: white
- border-radius: 8px
- height: consistent across app
- font-medium

### Secondary
- white background
- border: 1px solid #E5E7EB
- text: primary text color

### Ghost
- no border
- muted color
- used for tertiary actions

Buttons must align horizontally when space allows.

---

## 7. Badges

Used for:
- Required
- Preferred
- Nice to have
- Matched
- Missing

Style:
- Rounded-full
- Small font (12px)
- Subtle background tint
- No harsh saturation

---

## 8. Score Badge

- Rounded square
- Soft border
- Large number
- Muted “SCORE” label
- No gradients

---

## 9. Landing Page Only (Glass Allowed)

Glassmorphism allowed only on:
- Landing hero
- Signup card

Glass style:
- backdrop-blur
- bg-white/60
- border-white/30
- soft shadow
Never use in dashboards.

---

## 10. What We Avoid

- Overly rounded 20px radius everywhere
- Dark mode (out of scope)
- Complex gradients in product
- Card nesting inside card nesting
- Random spacing
- 6 different button styles

Consistency > Creativity

## 11. Brand Anchoring (NEW)

To avoid a flat UI, use the primary blue intentionally in:

- Sidebar background (subtle tinted blue, not pure white)
- Active navigation item
- Primary metric numbers (like Avg Match Score)
- Score badge border tint
- CTA sections
- Section dividers (subtle blue accent)

Do NOT:
- Make entire dashboard blue
- Overuse solid blue backgrounds
- Saturate everything

Goal:
The interface should feel anchored in blue, not flooded in blue.

## 12. Elevation System (NEW)

Hierarchy should be visible via:

- Background contrast (white vs #F9FAFB)
- Slight shadow differences
- Occasional soft blue-tinted surface blocks
- Section containers

Avoid flat infinite white scroll.

## 13. AI Feel Enhancement

To subtly imply “AI intelligence”:

- Use subtle blue gradient glow in hero sections only
- Use small highlight accents on score badges
- Use stronger blue in CTA blocks
- Add soft hover states on cards

No heavy neon effects.
No glass inside product.