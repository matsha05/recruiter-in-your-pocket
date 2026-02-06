/** @type {import('tailwindcss').Config} */
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
					'var(--font-geist-sans)',
					'ui-sans-serif',
					'system-ui'
				],
				display: [
					'"Fraunces Variable"',
					'ui-serif',
					'Georgia',
					'serif'
				],
				serif: [
					'"Fraunces Variable"',
					'ui-serif',
					'Georgia',
					'serif'
				],
				mono: [
					'var(--font-geist-mono)',
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
					foreground: 'hsl(0 0% 100%)'
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
				'status-success': 'hsl(var(--success))',
				'status-warning': 'hsl(var(--warning))',
				'status-error': 'hsl(var(--destructive))'
			},
			fontSize: {
				'2xs': [
					'0.6875rem',
					{
						lineHeight: '1rem'
					}
				],
				xs: [
					'0.75rem',
					{
						lineHeight: '1rem'
					}
				],
				sm: [
					'0.8125rem',
					{
						lineHeight: '1.25rem'
					}
				],
				base: [
					'0.875rem',
					{
						lineHeight: '1.5rem'
					}
				],
				lg: [
					'1rem',
					{
						lineHeight: '1.75rem'
					}
				],
				xl: [
					'1.125rem',
					{
						lineHeight: '1.75rem'
					}
				],
				'2xl': [
					'1.5rem',
					{
						lineHeight: '2rem'
					}
				]
			},
			borderRadius: {
				DEFAULT: 'var(--radius)',
				sm: 'var(--radius-sm)',
				md: 'var(--radius)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)'
			},
			boxShadow: {
				sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
				DEFAULT: '0 1px 2px 0 rgb(0 0 0 / 0.04)'
			},
			transitionTimingFunction: {
				snap: 'cubic-bezier(0.16, 1, 0.3, 1)'
			},
			transitionDuration: {
				micro: '90ms',
				fast: '100ms',
				normal: '200ms',
				slow: '350ms'
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
						transform: 'translateY(10px)'
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
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'pulse-once': 'pulse-once 0.6s ease-out',
				'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
