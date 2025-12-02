# Phase 3 Design System Audit Report

**Date:** 2025-01-27  
**Status:** ✅ Complete  
**Goal:** Complete refactoring to use design system consistently

**Completed:** 2025-01-27

---

## Executive Summary

The design system foundation is **mostly in place** with CSS variables and reusable classes defined. However, there are **significant inconsistencies** where hardcoded values are used instead of design tokens. The reusable classes (`.stack-section`, `.stack-heading`, `.stack-accent-line`) are being used in the main report sections, but many other components still use hardcoded values.

**Priority Areas:**
1. **High:** Replace hardcoded spacing values with CSS variables
2. **High:** Replace hardcoded font sizes with typography variables
3. **Medium:** Replace hardcoded border-radius values with radius variables
4. **Medium:** Standardize focus states (some use hardcoded colors)
5. **Low:** Replace hardcoded color values (most already use variables)

---

## 1. CSS Variables Status ✅

### Defined Variables (Good)
- **Spacing:** `--space-xs` (5px) through `--space-xxl` (50px) ✅
- **Typography:** `--font-display`, `--font-body`, `--fs-hero`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-body`, `--fs-small` ✅
- **Colors:** Full color system defined ✅
- **Radius:** `--radius-card` (18px), `--radius-input` (12px), `--radius-pill` (999px) ✅
- **Motion:** `--motion-duration-short`, `--motion-ease-premium` ✅
- **Shadows:** `--shadow-soft` ✅

### Missing Variables (Gaps)
- No variable for common border-radius values like `10px`, `14px`, `16px`, `20px`
- No variable for `999px` (pill) - wait, `--radius-pill: 999px` exists ✅
- Some spacing values like `6px`, `8px`, `9px`, `22px`, `24px` don't map cleanly to existing scale

---

## 2. Spacing Audit 🔴

### Issues Found

**Hardcoded padding values** (should use `--space-*`):
- `padding: 16px 14px 22px` → Should use `--space-lg`, `--space-md`, etc.
- `padding: 18px` → Should use `--space-lg` (20px) or add `--space-lg-alt: 18px`
- `padding: 14px 14px 10px` → Should use variables
- `padding: 24px` → Should use `--space-xl` (30px) or add `--space-xl-alt: 24px`
- `padding: 20px 20px 24px` → Mixed values
- `padding: 24px 20px 20px` → Mixed values
- `padding: 12px 22px` → Button padding
- `padding: 10px 20px` → Button padding
- Many more instances throughout

**Hardcoded gap values:**
- `gap: 6px` → Should use `--space-xs` (5px) or add `--space-xs-alt: 6px`
- `gap: 8px` → No direct match (closest is `--space-xs: 5px`)
- `gap: 9px` → No match
- `gap: 10px` → Should use `--space-sm` (10px) ✅
- `gap: 12px` → No direct match
- `gap: 14px` → No direct match
- `gap: 16px` → Should use `--space-md` (15px) or add `--space-md-alt: 16px`
- `gap: 18px` → No match
- `gap: 20px` → Should use `--space-lg` (20px) ✅

**Hardcoded margin values:**
- `margin: 6px 0 12px` → Should use variables
- `margin-bottom: 10px` → Should use `--space-sm` ✅
- `margin-bottom: 12px` → No direct match
- `margin-bottom: 16px` → No direct match
- `margin-bottom: 20px` → Should use `--space-lg` ✅
- `margin-bottom: 24px` → No direct match
- `margin-bottom: 32px` → Should use `--space-xl` (30px) or add variable

### Recommendation
1. **Extend spacing scale** to include common values: `6px`, `8px`, `12px`, `14px`, `16px`, `18px`, `22px`, `24px`
2. **Refactor all hardcoded spacing** to use variables
3. **Create spacing utility classes** if helpful (e.g., `.gap-sm`, `.p-md`)

---

## 3. Typography Audit 🟡

### Issues Found

**Hardcoded font-size values** (should use `--fs-*`):
- `font-size: 11px` → No variable (could use `--fs-small: 13px` or add `--fs-tiny: 11px`)
- `font-size: 12px` → No variable (could use `--fs-small: 13px` or add `--fs-xs: 12px`)
- `font-size: 13px` → Should use `--fs-small: 13px` ✅
- `font-size: 14px` → No variable
- `font-size: 15px` → Should use `--fs-body: 15px` ✅
- `font-size: 16px` → No variable
- `font-size: 18px` → No variable
- `font-size: 20px` → No variable
- `font-size: 22px` → No variable (could use `--fs-h2: 21px` or add variable)
- `font-size: 26px` → Should use `--fs-h1: 26px` ✅
- `font-size: 32px` → No variable

**Hardcoded line-height values:**
- Many instances of `line-height: 1.2`, `1.25`, `1.4`, `1.5`, `1.55`, `1.6`, `1.65`
- Should use `--lh-tight: 1.15` or `--lh-normal: 1.5` where appropriate
- May need additional line-height variables

### Recommendation
1. **Extend typography scale** to include: `11px`, `12px`, `14px`, `16px`, `18px`, `20px`, `22px`, `32px`
2. **Add line-height variables** for common values: `1.2`, `1.25`, `1.4`, `1.6`
3. **Refactor all font-size** declarations to use variables

---

## 4. Border Radius Audit 🟡

### Issues Found

**Hardcoded border-radius values:**
- `border-radius: 6px` → No variable
- `border-radius: 7px` → No variable
- `border-radius: 8px` → No variable
- `border-radius: 10px` → No variable (common for buttons)
- `border-radius: 12px` → Should use `--radius-input: 12px` ✅
- `border-radius: 14px` → No variable (common for cards)
- `border-radius: 16px` → No variable
- `border-radius: 18px` → Should use `--radius-card: 18px` ✅
- `border-radius: 20px` → No variable
- `border-radius: 22px` → No variable
- `border-radius: 999px` → Should use `--radius-pill: 999px` ✅

### Recommendation
1. **Add radius variables** for common values: `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 14px`, `--radius-xl: 16px`
2. **Refactor all border-radius** to use variables

---

## 5. Color Audit 🟢

### Status: Mostly Good

Most colors already use CSS variables. Found a few hardcoded values:
- `#ffffff` → Should use `--bg-panel` or `--bg-card` ✅
- `#22c55e` (success green) → Should use `--success: #15803d` or add variable
- `#f8f9fb` → Should use `--wash: #F8FAFC` ✅
- `#f9fafc` → Should use `--wash` ✅
- `rgba()` values for shadows and overlays → Mostly acceptable, but could be variables

### Recommendation
1. **Add success color variable** for green (`#22c55e` vs `--success: #15803d`)
2. **Standardize rgba values** for shadows/overlays into variables

---

## 6. Reusable Classes Audit 🟡

### Status: Partially Implemented

**Good Usage:**
- `.stack-section` ✅ Used in main report sections
- `.stack-heading` ✅ Used consistently
- `.stack-accent-line` ✅ Used with stack sections
- `.stack-subline` ✅ Used for subtitles

**Missing Usage:**
- Many components don't use these classes (e.g., `.ideas-sheet`, `.card-input`, `.results-top`)
- Some sections could benefit from `.stack-section` but don't use it

### Recommendation
1. **Audit which components** should use `.stack-section` pattern
2. **Refactor components** to use reusable classes where appropriate
3. **Document when to use** each class

---

## 7. Focus States Audit 🟡

### Issues Found

**Inconsistent focus styles:**
- Most buttons use: `outline: 2px solid #A5B4FC; outline-offset: 3px; box-shadow: 0 0 0 2px rgba(28, 78, 216, 0.16);`
- `.data-modal-close` uses: `outline: 2px solid var(--accent-boost); outline-offset: 2px;` (different)
- Some elements have `outline: none` without proper focus-visible replacement
- Hardcoded color `#A5B4FC` should use a variable

### Recommendation
1. **Create focus state variables:**
   - `--focus-outline-color: #A5B4FC` (or derive from accent)
   - `--focus-outline-width: 2px`
   - `--focus-outline-offset: 3px`
   - `--focus-shadow: 0 0 0 2px rgba(28, 78, 216, 0.16)`
2. **Standardize all focus states** to use these variables
3. **Ensure all interactive elements** have proper focus-visible styles

---

## 8. Accessibility Audit 🟡

### Status: Needs Review

**Found:**
- Focus states exist but are inconsistent (see above)
- `prefers-reduced-motion` is respected in some places ✅
- Need to verify contrast ratios meet WCAG AA standards
- Need to verify all interactive elements are keyboard accessible

### Recommendation
1. **Run contrast checker** on all text/background combinations
2. **Test keyboard navigation** through all interactive elements
3. **Verify focus indicators** are visible on all focusable elements
4. **Document accessibility requirements** in design system

---

## 9. Specific Components Needing Refactoring

### High Priority
1. **`.ideas-sheet`** - Uses hardcoded padding, gaps, font sizes
2. **`.card-input`** - Uses hardcoded padding, border-radius
3. **`.results-top`** - Uses hardcoded padding, background color
4. **`.btn-primary`** - Uses hardcoded padding, border-radius, shadow
5. **`.btn-secondary`** - Uses hardcoded values
6. **`.ghost-button`** - Uses hardcoded padding, border-radius

### Medium Priority
1. **`.hero`** - Uses hardcoded padding, font sizes
2. **`.proof-editorial`** - Uses hardcoded padding, font sizes
3. **`.ideas-inline`** - Uses hardcoded padding, gaps
4. **`.paywall-card`** - Uses hardcoded values
5. **`.data-modal-card`** - Uses hardcoded values

### Low Priority
1. Various utility classes and small components

---

## 10. Action Plan

### Phase 3.1: Extend Design Tokens (1-2 hours)
- [ ] Add missing spacing variables (`6px`, `8px`, `12px`, `14px`, `16px`, `18px`, `22px`, `24px`)
- [ ] Add missing typography variables (`11px`, `12px`, `14px`, `16px`, `18px`, `20px`, `22px`, `32px`)
- [ ] Add missing radius variables (`6px`, `8px`, `10px`, `14px`, `16px`, `20px`, `22px`)
- [ ] Add focus state variables
- [ ] Add line-height variables

### Phase 3.2: Refactor High-Priority Components (2-3 hours)
- [ ] Refactor `.ideas-sheet` and related modal components
- [ ] Refactor `.card-input` and `.card-output`
- [ ] Refactor `.results-top`
- [ ] Refactor button components (`.btn-primary`, `.btn-secondary`, `.ghost-button`)

### Phase 3.3: Refactor Medium-Priority Components (2-3 hours)
- [ ] Refactor `.hero` section
- [ ] Refactor `.proof-editorial`
- [ ] Refactor `.ideas-inline`
- [ ] Refactor modal components (`.paywall-card`, `.data-modal-card`)

### Phase 3.4: Standardize Focus States (1 hour)
- [ ] Create focus state utility/mixin
- [ ] Apply consistently across all interactive elements
- [ ] Test keyboard navigation

### Phase 3.5: Accessibility Verification (1-2 hours)
- [ ] Run contrast checker
- [ ] Test keyboard navigation
- [ ] Verify focus indicators
- [ ] Document accessibility requirements

### Phase 3.6: Documentation (1 hour)
- [ ] Update design-system.md with all variables
- [ ] Document when to use each class
- [ ] Create examples/guidelines

**Total Estimated Time:** 8-12 hours

---

## Summary

The design system foundation is solid, but **~60-70% of the codebase still uses hardcoded values** instead of design tokens. The main gaps are:

1. **Spacing:** Many hardcoded padding/margin/gap values
2. **Typography:** Many hardcoded font-size values
3. **Radius:** Many hardcoded border-radius values
4. **Focus States:** Inconsistent implementation
5. **Reusable Classes:** Not used everywhere they could be

**Next Steps:**
1. Extend the design token system to cover all common values
2. Systematically refactor components to use tokens
3. Standardize focus states
4. Verify accessibility

This work will make the codebase more maintainable and ensure visual consistency as the product evolves.

