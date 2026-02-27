import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: [
		'./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
		'./vendor/laravel/jetstream/**/*.blade.php',
		'./storage/framework/views/*.php',
		'./resources/views/**/*.blade.php',
		'./resources/js/**/*.tsx',
		'./resources/js/**/*.jsx',
	],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Gilmer', 'Figtree', ...defaultTheme.fontFamily.sans],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				marquee: {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'marquee-reverse': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0%)' },
				},
				'collapsible-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-collapsible-content-height)' },
				},
				'collapsible-up': {
					from: { height: 'var(--radix-collapsible-content-height)' },
					to: { height: 0 },
				},

				// ✅ Added: smooth zoom in/out (Ken Burns-lite)
				zoom: {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' },
				},
				float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
				'msg-in': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
				popup: { from: { opacity: '0', transform: 'translateY(6px) scale(0.97)' }, to: { opacity: '1', transform: 'none' } },
				pop: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.4)' } },
				bounce: { '0%,80%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-5px)' } },
				'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
				'scale-in': { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'none' } },
			},
			animation: {
				marquee: 'marquee 25s linear infinite',
				'marquee-reverse': 'marquee-reverse 30s linear infinite',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',

				// ✅ Added
				zoom: 'zoom 25s ease-in-out infinite',
				float: 'float 3s ease-in-out infinite',
				'msg-in': 'msg-in 0.25s ease-out both',
				popup: 'popup 0.15s ease-out both',
				pop: 'pop 0.35s ease',
				bounce: 'bounce 1.2s ease-in-out infinite',
				'fade-in': 'fade-in 0.2s ease-out both',
				'scale-in': 'scale-in 0.2s ease-out both',
			},
			colors: {
				primary: '#0D3A69',
				'primary-foreground': '#fff',
				secondary: '#E394AF',
				'secondary-foreground': '#fff',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				brandBlue: '#0D3A69',
				brandMauve: '#E394AF',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
			},
		},
	},

	plugins: [forms, typography, require('tailwindcss-animate')],
};