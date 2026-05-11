---
name: Committee Management Design System
colors:
  surface: '#fbf8fc'
  surface-dim: '#dbd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e4e2e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#303033'
  inverse-on-surface: '#f2f0f3'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e82'
  primary: '#031636'
  on-primary: '#ffffff'
  primary-container: '#1a2b4c'
  on-primary-container: '#8293ba'
  inverse-primary: '#b6c6f0'
  secondary: '#006d36'
  on-secondary: '#ffffff'
  secondary-container: '#6dfe9c'
  on-secondary-container: '#007439'
  tertiary: '#241300'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f2600'
  on-tertiary-container: '#b28c5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6f0'
  on-primary-fixed: '#071b3b'
  on-primary-fixed-variant: '#364669'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#eabf8a'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#5e4117'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e2e5'
typography:
  display:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  h1:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h3:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The visual identity of this design system centers on institutional trust, financial clarity, and administrative efficiency. It targets committee members and financial administrators who require a high degree of oversight and reliability. 

The design style is a hybrid of **Minimalism** and **Corporate Modern**. It prioritizes heavy whitespace and a restricted color palette to reduce cognitive load during complex financial tasks. By utilizing clean lines, high-quality typography, and subtle depth, the UI evokes an emotional response of security and professional calm. Every element is designed to feel intentional and grounded, avoiding unnecessary decoration in favor of functional elegance.

## Colors

The palette is anchored by a **Deep Navy (#1A2B4C)**, serving as the primary color to establish authority and stability. This is contrasted against a neutral background of soft slates and whites to maintain a clean, "light-filled" environment.

Semantic colors are utilized for critical status indicators:
- **Soft Mint Green (#4ADE80):** Used for "Trusted" or "Paid" states, signaling positive completion.
- **Warm Amber (#FBBF24):** Used for "Risky" or "Pending" states, highlighting items requiring attention without creating alarm.
- **Muted Coral (#FB7185):** Used for "Fraud" or "Late" states, providing a clear but sophisticated warning.

Backgrounds should utilize off-white neutrals to reduce eye strain, while text follows a high-contrast hierarchy using dark slates rather than pure black.

## Typography

This design system utilizes **Public Sans** for all levels of the hierarchy. As an institutional sans-serif, it provides the "official" and "government-grade" clarity necessary for fintech applications. 

The typographic scale is designed for high readability in data-dense environments. Headlines use slightly tighter letter spacing and heavier weights to anchor sections, while body text maintains a generous line height (1.5x) to ensure legibility when reading financial statements or committee reports. Labels utilize uppercase styling in smaller sizes to differentiate metadata from primary content.

## Layout & Spacing

The layout philosophy is based on a **12-column fluid grid** for dashboard views and a **centered fixed grid** for administrative forms. A strict 8px spatial rhythm governs all padding and margins, ensuring a rhythmic consistency across the interface.

- **Margins:** Large page margins (40px+) are used to frame content and emphasize a premium, uncluttered aesthetic.
- **Grid:** Layouts should use 24px gutters. Dashboard widgets and cards should span 3, 4, 6, or 12 columns.
- **Density:** The system prioritizes "Comfortable" density, using significant vertical padding (24px+) within cards to separate data points.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a layered hierarchy without the harshness of traditional borders. Depth is conveyed through three primary tiers:

1.  **Level 0 (Base):** The neutral background (#F8FAFC), appearing flat and furthest away.
2.  **Level 1 (Cards/Navigation):** Primary containers use a soft shadow with an 8-16px blur and very low opacity (2-4% #1A2B4C). This makes the cards appear as if they are floating just above the surface.
3.  **Level 2 (Modals/Dropdowns):** Active overlays use a slightly more pronounced shadow (24px blur, 6% opacity) to provide a clear focus and separation from the underlying data.

Borders are used sparingly, primarily as a secondary 1px stroke in a light neutral tone (#E2E8F0) to define card boundaries on high-brightness displays.

## Shapes

The shape language is defined by **large, friendly corner radii** that soften the professional navy tones. 

- **Primary Cards:** Use a 16px (`rounded-xl`) radius to emphasize the "containerized" nature of the committee data.
- **Buttons & Inputs:** Use an 8px (`rounded-md`) radius for a more precise, clickable feel.
- **Status Badges:** Use a pill-shaped (fully rounded) radius to distinguish them from interactive buttons.

This approach creates a modern, accessible interface that feels approachable despite its serious financial context.

## Components

### Cards
Cards are the primary structural unit. They must have a white background, a 16px border radius, and the Level 1 ambient shadow. Internal padding should never be less than 24px.

### Buttons
- **Primary:** Deep Navy background with white text. High-contrast.
- **Secondary:** Transparent background with a 1px Navy border.
- **Status:** Mint, Amber, or Coral backgrounds with high-contrast text for critical actions related to those states.

### Status Badges
Small, pill-shaped indicators. They should use a subtle, 10% opacity version of the semantic color for the background, and the 100% opacity color for the text to ensure accessibility.

### Progress Bars
Used for committee funding or payment cycles. They feature a 12px height with a light grey track and a Primary Navy or Mint Green fill, utilizing a smooth 1-second transition for value updates.

### Sidebar Navigation
The sidebar uses a "clean-vertical" approach. Icons are monolinear and 24px, paired with `label-md` typography. The active state is indicated by a subtle vertical bar on the left in Mint Green and a shift to a slightly lighter background shade.

### Forms
Input fields use a 1px border (#E2E8F0) that thickens and changes to Primary Navy on focus. Labels always sit above the input field using the `label-sm` style.