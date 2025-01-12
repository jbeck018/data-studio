export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', "./index.html"],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49'
  			},
  			dark: {
  				bg: {
  					primary: '#1a1b1e',
  					secondary: '#25262b',
  					tertiary: '#2c2e33'
  				},
  				text: {
  					primary: '#ffffff',
  					secondary: '#a6a7ab',
  					tertiary: '#5c5f66'
  				},
  				border: '#2c2e33'
  			},
  			light: {
  				bg: {
  					primary: '#ffffff',
  					secondary: '#f8f9fa',
  					tertiary: '#f1f3f5'
  				},
  				text: {
  					primary: '#1a1b1e',
  					secondary: '#868e96',
  					tertiary: '#adb5bd'
  				},
  				border: '#dee2e6'
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [],
}
