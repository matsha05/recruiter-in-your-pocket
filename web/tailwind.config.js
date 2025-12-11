/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // Consistent spacing scale
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '40px',
        'section': '48px',
        'section-lg': '64px',
      },

      // Custom font families
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif']
      },

      // Font sizes for heading hierarchy
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],      // Main page titles
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],    // Major card titles
        'h3': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],  // Subsection titles
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.8125rem', { lineHeight: '1.4' }],
      },

      // Brand color palette
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#4F46E5',
          600: '#4338CA',
          DEFAULT: '#4F46E5'
        },
        ink: {
          DEFAULT: '#1C1917',
          soft: '#4B5563'
        },
        surface: '#FFFFFF',
        paper: {
          cool: '#F7F8FA'
        },
        // Cool gray neutrals
        neutral: {
          50: '#F7F8FA',
          100: '#EFF0F3',
          200: '#D9DBE0',
          600: '#4B5563',
          900: '#1C1917'
        },
        gold: {
          DEFAULT: '#F5B25C',
          light: '#FBBF77'
        },
        // Moss - for positive/success states
        moss: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#059669'
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#059669'
        },
        // Amber - for caution/attention states
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          DEFAULT: '#FBBF24'
        },
        // Rose - for error states
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          DEFAULT: '#F43F5E'
        },
        accent: {
          warm: '#F5B25C',
          success: '#059669',
          warning: '#D97706',
          danger: '#F43F5E'
        }
      },

      // Custom box shadows
      boxShadow: {
        card: '0 18px 40px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 22px 50px rgba(15, 23, 42, 0.12)',
        'card-dark': '0 22px 45px rgba(0, 0, 0, 0.5)',
        soft: '0 18px 30px rgba(15, 23, 42, 0.06)',
        button: '0 4px 14px rgba(79, 70, 229, 0.25)',
        'button-hover': '0 6px 18px rgba(79, 70, 229, 0.32)',
        modal: '0 18px 45px rgba(15, 23, 42, 0.12)',
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
      },

      // Custom border radius
      borderRadius: {
        card: '24px',
        'card-sm': '16px',
        'card-xs': '12px',
        pill: '999px'
      },

      // Easing
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.21, 0.74, 0.23, 0.99)'
      }
    }
  },
  plugins: []
};
