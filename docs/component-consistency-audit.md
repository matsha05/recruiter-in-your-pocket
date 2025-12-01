# Component Consistency Audit

## Summary
Comprehensive audit of button variants, card patterns, form elements, and typography hierarchy to ensure design system consistency.

## Findings

### 1. Button Variants

**Issues Found:**
- `.ghost-button` has hardcoded `padding: 7px` (should use tokens)
- `.sample-resume-button` and `.clear-button` have hardcoded `margin: 6px 0 10px` (should use tokens)
- `.paywall-primary` and `.paywall-secondary` missing hover states (inconsistent with `.btn-primary` and `.btn-secondary`)
- `.ideas-actions .ghost-button` has different padding than base `.ghost-button`
- `.paywall-list` and `.paywall-actions` have hardcoded margins

**Standard Pattern:**
- Primary: Accent background, white text, `var(--radius-input)`, premium shadow, hover lift
- Secondary: Outline style, `var(--radius-md)`, hover background change
- Ghost: Subtle background, `var(--radius-md)`, minimal styling

### 2. Card Patterns

**Issues Found:**
- `.ideas-section-title` has hardcoded `margin: 0 0 12px`
- `.ideas-section-subline` has hardcoded `margin: 0 0 16px`
- `.ideas-list` has hardcoded `padding-left: 24px`
- `.ideas-list li` has hardcoded `margin-bottom: 10px`
- `.ideas-sublist` has hardcoded spacing values
- `.ideas-divider` has hardcoded `margin: 12px 0 8px`

**Standard Pattern:**
- Cards: `var(--radius-lg)` or `var(--radius-card)`, consistent padding
- Headers: Consistent gap and margin-bottom
- Lists: Consistent padding-left and item spacing

### 3. Typography Hierarchy

**Issues Found:**
- `.ideas-section-title` uses `var(--fs-lg)` but `.stack-heading` uses `var(--fs-h1)` (inconsistent hierarchy)
- `.ideas-section-subline` uses `var(--fs-small)` but `.stack-subline` uses `var(--fs-label)` (inconsistent)
- `.bridge-heading` uses `var(--fs-base)` (should it be larger?)
- `.data-modal-title` uses `var(--fs-base)` (consistent with bridge-heading)

**Standard Hierarchy:**
- H1 (Hero): `var(--fs-hero)`
- H1 (Section): `var(--fs-h1)` - 26px
- H2: `var(--fs-h2)` - 21px
- H3: `var(--fs-h3)` - 17px
- Body: `var(--fs-body)` - 15px
- Label: `var(--fs-label)` - 14px
- Small: `var(--fs-small)` - 13px
- XS: `var(--fs-xs)` - 12px

### 4. Form Elements

**Status:** ✅ Already consistent
- `textarea` uses tokens
- `label` uses tokens
- Focus states standardized

## Action Plan

1. Fix all hardcoded spacing in buttons
2. Add missing hover states to paywall buttons
3. Standardize card spacing
4. Align typography hierarchy
5. Replace all hardcoded values with tokens

