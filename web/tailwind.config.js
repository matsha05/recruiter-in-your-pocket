/** @type {import('tailwindcss').Config} */

/** A Tailwind font size that reads one type role from app/globals.css. */
const role = (name, extra = {}) => [`var(--type-${name}-size)`, { lineHeight: `var(--type-${name}-leading)`, ...extra }];

module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
			extend: {
			fontFamily: {
				sans: [
					'var(--font-body)',
					'ui-sans-serif',
					'system-ui'
				],
				display: [
					'var(--font-display)',
					'ui-sans-serif',
					'system-ui'
				],
				serif: [
					'var(--font-editorial)',
					'Georgia',
					'serif'
				],
				mono: [
					'var(--font-mono)',
					'ui-monospace',
					'monospace'
				]
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					strong: 'hsl(var(--brand-strong))',
					tint: 'hsl(var(--brand-tint))',
					foreground: 'hsl(0 0% 100%)'
				},
				citron: 'hsl(var(--citron))',
				'blue-ink': 'hsl(var(--blue-ink))',
				'red-pen': 'hsl(var(--red-pen))',
				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))'
				},
				'cyan-bright': 'hsl(var(--cyan-bright))',
				'error-surface': 'hsl(var(--destructive-surface))',
				'success-surface': 'hsl(var(--success-surface))',
				'warning-surface': 'hsl(var(--warning-surface))',
				'disabled-surface': 'hsl(var(--disabled-surface))',
				'control-line': 'hsl(var(--control-line))',
				paper: 'hsl(var(--surface-page))',
				proof: 'hsl(var(--surface-proof))',
				line: 'hsl(var(--line))',
				iris: 'hsl(var(--brand))',
				'surface-sky': 'hsl(var(--surface-sky))',
				'accent-apricot': 'hsl(var(--accent-apricot))',
				'accent-butter': 'hsl(var(--accent-butter))',
				mineral: {
					DEFAULT: 'hsl(var(--mineral))',
					strong: 'hsl(var(--mineral-strong))',
					soft: 'hsl(var(--mineral-soft))'
				},
				ink: {
					DEFAULT: 'hsl(var(--ink))',
					deep: 'hsl(var(--ink-deep))'
				},
				slate: {
					DEFAULT: 'hsl(var(--slate))',
					muted: 'hsl(var(--slate-muted))'
				},
				premium: 'hsl(var(--premium))',
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				moss: {
					DEFAULT: 'hsl(var(--moss))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				amber: {
					DEFAULT: 'hsl(var(--amber))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				rose: {
					DEFAULT: 'hsl(var(--rose))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				'warning-foreground': 'hsl(var(--warning-foreground))',
				'status-success': 'hsl(var(--success))',
				'status-warning': 'hsl(var(--warning))',
				'status-error': 'hsl(var(--destructive))'
			},
			// Type roles (Highlighter 1.1). The sizes live in app/globals.css (--type-*) so phone steps change in one
			// place. Tailwind's own keys are aliases of a role, so every text-* class lands on the same scale.
			fontSize: {
				display: role('display', { letterSpacing: 'var(--tracking-display)', fontWeight: '800' }),
				headline: role('headline', { letterSpacing: 'var(--tracking-headline)', fontWeight: '800' }),
				title: role('title', { letterSpacing: 'var(--tracking-title)', fontWeight: '800' }),
				heading: role('heading', { letterSpacing: 'var(--tracking-heading)', fontWeight: '600' }),
				lead: role('lead'),
				prose: role('prose'),
				body: role('body'),
				small: role('small'),
				label: role('label', { fontWeight: '600' }),
				verdict: role('verdict'),
				'verdict-lead': role('verdict-lead'),
				note: role('note'),
				// Deprecated aliases kept for files another workstream is editing; the guardrail caps their use.
				'report-title': role('heading', { letterSpacing: 'var(--tracking-heading)', fontWeight: '600' }),
				data: role('small'),
				'2xs': role('label'),
				xs: role('label'),
				sm: role('small'),
				base: role('body'),
				lg: role('prose'),
				xl: role('lead'),
				'2xl': role('heading'),
				'3xl': role('title'),
				'4xl': role('title'),
				'5xl': role('headline'),
				'6xl': role('headline'),
				'7xl': role('display'),
				'8xl': role('display'),
				'9xl': role('display')
			},
			// 400 reading, 600 headings and controls, 800 headlines. Older weight names fold onto these.
			fontWeight: {
				thin: '400',
				extralight: '400',
				light: '400',
				normal: '400',
				medium: '600',
				semibold: '600',
				bold: '800',
				extrabold: '800',
				black: '800'
			},
			borderRadius: {
				DEFAULT: 'var(--radius)',
				sm: 'var(--radius-sm)',
				md: 'var(--radius)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)',
				sheet: 'var(--radius-sheet)',
				inset: 'var(--radius-inset)'
			},
			maxWidth: {
				marketing: '85rem', workspace: '60rem', form: '47.5rem',
				report: '75rem', auth: '27.5rem', account: '47.5rem',
				// About 69 characters per line at any size: Schibsted Grotesk text averages 0.46em a glyph, a "0" is 0.61em.
				reading: '52ch'
			},
			boxShadow: {
				sheet: 'var(--shadow-sheet)',
				sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
				DEFAULT: '0 1px 2px 0 rgb(0 0 0 / 0.04)'
			},
			transitionTimingFunction: {
				DEFAULT: 'var(--ease)',
				snap: 'var(--ease)'
			},
			transitionDuration: {
				DEFAULT: 'var(--duration-normal)',
				micro: 'var(--duration-fast)',
				fast: 'var(--duration-fast)',
				normal: 'var(--duration-normal)',
				slow: 'var(--duration-slow)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: 0,
						transform: 'translateY(2px)'
					},
					'100%': {
						opacity: 1,
						transform: 'translateY(0)'
					}
				},
				'pulse-once': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down var(--duration-normal) var(--ease)',
				'accordion-up': 'accordion-up var(--duration-fast) var(--ease)',
				'fade-in-up': 'fade-in-up var(--duration-normal) var(--ease) forwards',
				'pulse-once': 'pulse-once 0.6s ease-out',
				'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
