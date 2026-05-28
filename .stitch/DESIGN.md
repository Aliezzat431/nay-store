# Flip7 Design System

## Overview

Flip7 is a retro-playful, teal-coral-gold design system crafted for the Flip7 card game scoring mini-program. Inspired by the original Flip7 board game packaging, it blends vintage warmth with modern mobile UX. The visual language is bold, joyful, and tactile -- combining BounceBox's bubbly energy with QuizForge's competitive gamification patterns. Every element feels like a game piece you want to tap.

---

## Colors

- **Primary Teal** (#2BA8A2): Main UI, backgrounds, avatars, progress bars
- **Primary Light** (#3CC4BD): Hover states, lighter accents
- **Primary Dark** (#1E8C86): Deep backgrounds, text on light surfaces
- **Primary BG** (#E8F6F5): Subtle teal tint for backgrounds
- **Accent Gold** (#FFD23F): CTAs, highlights, first-player badges, celebrations
- **Accent Light** (#FFE47A): Soft gold tints, active states
- **Accent Dark** (#E6B800): Gold hover states, depth
- **Coral** (#EF6C4A): BOOM state, warnings, ranking #3, energy
- **Coral Light** (#FF8A6A): Soft coral tints
- **Coral Dark** (#D45233): Coral depth, hover
- **Cream** (#FFF8E7): Card backgrounds, input surfaces
- **Sky Blue** (#5DADE2): Flip7 bonus, info states
- **Surface Base** (#EFF8F7): Page background
- **Surface Card** (#FFFFFF): Card backgrounds
- **Success** (#27AE60): Positive states
- **Error** (#E74C3C): Error states

## Typography

- **Headline Style**: System font stack, extra-bold (800), generous letter-spacing (4-6px)
- **Body Font**: Inter, -apple-system, BlinkMacSystemFont
- **Display**: 72px extra-bold
- **h1**: 48px extra-bold
- **h2**: 36px extra-bold
- **h3**: 32px bold
- **body**: 28px medium
- **sm**: 24px medium
- **xs**: 20px medium

---

## Spacing

Base unit: **8px**
- **xs**: 8px
- **sm**: 16px
- **md**: 24px
- **lg**: 32px
- **xl**: 48px

## Border Radius

- **sm** (8px): Small tags, inputs
- **md** (16px): Cards, buttons, inputs
- **lg** (24px): Feature cards, panels, scoring items
- **xl** (32px): Hero cards, modals, logo
- **round** (999px): Pill buttons, badges, rank badges

## Elevation — Colored Glow System

- **shadow-sm**: 0 2px 8px rgba(0,0,0,0.08)
- **shadow-md**: 0 4px 16px rgba(0,0,0,0.12)
- **shadow-lg**: 0 8px 32px rgba(0,0,0,0.16)
- **shadow-card**: 0 4px 20px rgba(43,168,162,0.10)
- **shadow-coral-glow**: 0 4px 20px rgba(239,108,74,0.35)
- **shadow-teal-glow**: 0 4px 20px rgba(43,168,162,0.30)
- **shadow-accent-glow**: 0 4px 20px rgba(255,210,63,0.40)
- **shadow-sky-glow**: 0 4px 16px rgba(93,173,226,0.30)
- **shadow-focus**: 0 0 0 4px rgba(43,168,162,0.15)

## Components

### Buttons

Pill shape (999px radius), minimum 48px height, bounce transition curve.

#### Primary (Gold CTA)
- Gradient gold background (#FFD23F → #E6B800)
- Shadow: shadow-accent-glow
- Active: scale(0.95) with cubic-bezier(0.175, 0.885, 0.32, 1.275)

#### Secondary (Teal)
- Teal fill (#2BA8A2), white text
- Shadow: shadow-teal-glow

#### Destructive / Warning (Coral)
- Coral fill (#EF6C4A)
- Shadow: shadow-coral-glow

### Cards

White (#FFFFFF) background, 24px radius, shadow-card, 6px colored left accent bar.
- **Default**: teal-light (#3CC4BD) left border
- **Highlighted / Winner**: gold (#FFD23F) left border, golden gradient background, shadow-accent-glow
- **Warning / Alert**: coral (#EF6C4A) left border, coral gradient, pulse animation

### Navigation

- Sticky top nav: cream (#FFF8E7) background, 3px teal bottom border
- Logo: retro folded-ribbon banner style, skewX(-6deg) parallelogram with dark border
- Active nav link: teal (#2BA8A2) with underline indicator

### Data Tables

- Header: Primary BG (#E8F6F5) background, teal text
- Row hover: cream (#FFF8E7) tint
- Status badges: pill-shaped, color-coded (teal=active, gold=pending, coral=rejected, success=approved)

### Forms & Inputs

- Background: cream (#FFF8E7)
- Border: 2px solid #BCC9C7, focus: 2px solid #2BA8A2 + shadow-focus
- Border radius: 16px
- Label: teal-dark (#1E8C86), 14px medium

### Section Dividers

- 3px dashed border using teal-light at 40% opacity
- Playful, game-board inspired feel

---

## Animations

### Bounce (Buttons)
- Active press: scale(0.95), cubic-bezier(0.175, 0.885, 0.32, 1.275), 200ms

### Glow Pulse (Highlighted Cards)
- 2s infinite, opacity 0.5–1.0, scale 1.0–1.03

### Confetti (Victory / Success States)
- 10 pieces, varied colors (teal, gold, coral), 3.2–4.5s fall with rotation

---

## Design Principles

1. Use colored glow shadows — never plain black shadows on interactive elements.
2. Pill-shaped buttons (999px radius) for all CTAs.
3. Cream (#FFF8E7) for all input surfaces and card backgrounds.
4. 3px dashed borders for section dividers.
5. Left-border color accents on cards communicate state.
6. All touch/click targets minimum 48px height.
7. Retro folded-ribbon pattern for banner/hero elements.
8. Typography: Plus Jakarta Sans for headlines (800 weight), Inter for body.
9. Tinted shadows (teal, gold, coral) at 30–40% opacity for depth.
10. Surface Base (#EFF8F7) for page backgrounds — never pure white.
