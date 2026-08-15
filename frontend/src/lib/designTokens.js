// Enterprise Design Tokens System
// Inspired by Linear, Stripe Dashboard, Vercel, Notion, Raycast
// All styling should be derived from these tokens

const designTokens = {
  // ─── COLOR SYSTEM ───────────────────────────────────────────────────────────────
  colors: {
    // Primary brand - refined indigo for enterprise feel
    primary: {
      DEFAULT: '#6366F1',
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
      950: '#1E1B4B',
    },
    
    // Secondary - teal for balance
    secondary: {
      DEFAULT: '#14B8A6',
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
      950: '#042F2E',
    },
    
    // Accent - subtle amber for highlights
    accent: {
      DEFAULT: '#F59E0B',
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
    
    // Semantic colors - refined for enterprise
    success: {
      DEFAULT: '#10B981',
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
      950: '#022C22',
    },
    warning: {
      DEFAULT: '#F59E0B',
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
    danger: {
      DEFAULT: '#EF4444',
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#450A0A',
    },
    info: {
      DEFAULT: '#3B82F6',
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    
    // Neutral surfaces - refined slate scale
    neutral: {
      white: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      150: '#E5E7EB',
      200: '#E5E7EB',
      250: '#D1D5DB',
      300: '#D1D5DB',
      350: '#9CA3AF',
      400: '#9CA3AF',
      450: '#6B7280',
      500: '#6B7280',
      550: '#4B5563',
      600: '#4B5563',
      650: '#374151',
      700: '#374151',
      750: '#1F2937',
      800: '#1F2937',
      850: '#111827',
      900: '#111827',
      950: '#030712',
    },
    
    // Dark mode surfaces - refined for enterprise
    dark: {
      background: '#020617',
      surface: '#0F172A',
      surfaceSecondary: '#1E293B',
      surfaceTertiary: '#334155',
      surfaceElevated: '#1E293B',
      border: '#1E293B',
      borderHover: '#334155',
      hover: '#1E293B',
      hoverSecondary: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textTertiary: '#94A3B8',
      textMuted: '#64748B',
      textInverse: '#0F172A',
    },
  },
  
  // ─── TYPOGRAPHY SYSTEM ──────────────────────────────────────────────────────────
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
    },
    
    // Enterprise typography scale - larger, more readable
    sizes: {
      // Display scale - for hero sections
      'display-xs': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 40px
      'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 48px
      'display-md': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 60px
      'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 72px
      'display-xl': ['6rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }], // 96px
      
      // Heading scale - for page titles
      'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 36px
      'h2': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }], // 30px
      'h3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }], // 24px
      'h4': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0em' }], // 20px
      'h5': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0em' }], // 18px
      'h6': ['1rem', { lineHeight: '1.5', letterSpacing: '0em' }], // 16px
      
      // Body scale - for content
      'body-xl': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0em' }], // 18px
      'body-lg': ['1rem', { lineHeight: '1.7', letterSpacing: '0em' }], // 16px
      'body-base': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0em' }], // 15px
      'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em' }], // 14px
      'body-xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }], // 12px
      'body-2xs': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.02em' }], // 11px
      
      // Label scale - for labels and captions
      'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],
      'label-base': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
      'label-sm': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '700' }],
      'label-xs': ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '700' }],
    },
    
    // Font weights - Inter-specific
    weights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    // Line heights
    lineHeights: {
      none: '1',
      tight: '1.15',
      snug: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    // Letter spacing
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // ─── SPACING SYSTEM (8px grid) ─────────────────────────────────────────────────────
  spacing: {
    // Base 8px grid
    '0': '0px',
    'px': '1px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '2.5': '10px',
    '3': '12px',
    '3.5': '14px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '9': '36px',
    '10': '40px',
    '11': '44px',
    '12': '48px',
    '14': '56px',
    '16': '64px',
    '18': '72px',
    '20': '80px',
    '22': '88px',
    '24': '96px',
    '28': '112px',
    '32': '128px',
    '36': '144px',
    '40': '160px',
    '44': '176px',
    '48': '192px',
    '52': '208px',
    '56': '224px',
    '60': '240px',
    '64': '256px',
    '72': '288px',
    '80': '320px',
    '96': '384px',
    
    // Enterprise-specific large spacing
    '128': '512px',
    '144': '576px',
    '160': '640px',
  },
  
  // ─── BORDER RADIUS ───────────────────────────────────────────────────────────────
  borderRadius: {
    none: '0px',
    'xs': '2px',
    'sm': '4px',
    'md': '6px',
    'lg': '8px',
    'xl': '12px',
    '2xl': '16px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px',
    full: '9999px',
  },
  
  // ─── SHADOWS ─────────────────────────────────────────────────────────────────────
  shadows: {
    none: 'none',
    
    // Subtle shadows
    'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    
    // Medium shadows
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    
    // Large shadows
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Inner shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    
    // Component-specific shadows
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
    'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.08)',
    'card-lg': '0 20px 40px -8px rgba(0, 0, 0, 0.12)',
    'card-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    'modal-lg': '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
    
    dropdown: '0 4px 20px -2px rgba(0, 0, 0, 0.12)',
    popover: '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
    
    button: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'button-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
    
    input: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'input-focus': '0 0 0 3px rgba(99, 102, 241, 0.15)',
    
    // Colored shadows for depth
    'primary-sm': '0 2px 8px -2px rgba(99, 102, 241, 0.2)',
    'primary-md': '0 4px 16px -4px rgba(99, 102, 241, 0.25)',
    'primary-lg': '0 8px 24px -4px rgba(99, 102, 241, 0.3)',
    
    'success-sm': '0 2px 8px -2px rgba(16, 185, 129, 0.2)',
    'danger-sm': '0 2px 8px -2px rgba(239, 68, 68, 0.2)',
    'warning-sm': '0 2px 8px -2px rgba(245, 158, 11, 0.2)',
  },
  
  // ─── TRANSITIONS ─────────────────────────────────────────────────────────────────
  transitions: {
    // Durations
    'instant': '75ms',
    'fast': '150ms',
    'normal': '300ms',
    'slow': '500ms',
    'slower': '700ms',
    
    // Easing functions
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Enterprise easing
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'bounce-smooth': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    
    // Combined transitions
    'default': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'colors': 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'transform': 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'opacity': 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'shadow': 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // ─── Z-INDEX LAYERS ─────────────────────────────────────────────────────────────
  zIndex: {
    hide: '-1',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    tooltip: '1600',
    toast: '1700',
    notification: '1800',
    'skip-link': '9999',
  },
  
  // ─── BREAKPOINTS ───────────────────────────────────────────────────────────────
  breakpoints: {
    'xs': '475px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
  },
  
  // ─── CONTAINER WIDTHS ───────────────────────────────────────────────────────────
  container: {
    'xs': '20rem', // 320px
    'sm': '24rem', // 384px
    'md': '28rem', // 448px
    'lg': '32rem', // 512px
    'xl': '36rem', // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
    'full': '100%',
  },
  
  // ─── ANIMATIONS ─────────────────────────────────────────────────────────────────
  animations: {
    // Fade animations
    'fade-in': 'fadeIn 300ms ease-out',
    'fade-out': 'fadeOut 300ms ease-in',
    'fade-in-up': 'fadeInUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'fade-in-down': 'fadeInDown 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'fade-in-left': 'fadeInLeft 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'fade-in-right': 'fadeInRight 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Scale animations
    'scale-in': 'scaleIn 200ms ease-out',
    'scale-out': 'scaleOut 200ms ease-in',
    
    // Slide animations
    'slide-up': 'slideUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'slide-down': 'slideDown 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'slide-left': 'slideLeft 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'slide-right': 'slideRight 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Shimmer for loading states
    shimmer: 'shimmer 1.6s linear infinite',
    
    // Pulse for attention
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    
    // Spin for loading
    spin: 'spin 1s linear infinite',
    
    // Bounce
    bounce: 'bounce 1s infinite',
  },
  
  // ─── KEYFRAMES ─────────────────────────────────────────────────────────────────
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    fadeInUp: {
      '0%': { opacity: '0', transform: 'translateY(16px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    fadeInDown: {
      '0%': { opacity: '0', transform: 'translateY(-16px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    fadeInLeft: {
      '0%': { opacity: '0', transform: 'translateX(-16px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    fadeInRight: {
      '0%': { opacity: '0', transform: 'translateX(16px)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    scaleIn: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    scaleOut: {
      '0%': { opacity: '1', transform: 'scale(1)' },
      '100%': { opacity: '0', transform: 'scale(0.95)' },
    },
    slideUp: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    slideLeft: {
      '0%': { transform: 'translateX(100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    slideRight: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
    },
  },
  
  // ─── COMPONENT SPECIFIC ─────────────────────────────────────────────────────────
  components: {
    // Button
    button: {
      height: {
        xs: '32px',
        sm: '40px',
        md: '48px',
        lg: '56px',
        xl: '64px',
      },
      padding: {
        xs: '8px 16px',
        sm: '12px 20px',
        md: '16px 24px',
        lg: '20px 32px',
        xl: '24px 40px',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '0.9375rem',
        lg: '1rem',
        xl: '1.125rem',
      },
    },
    
    // Input
    input: {
      height: {
        sm: '40px',
        md: '48px',
        lg: '56px',
      },
      padding: {
        sm: '10px 16px',
        md: '14px 20px',
        lg: '18px 24px',
      },
      fontSize: {
        sm: '0.875rem',
        md: '0.9375rem',
        lg: '1rem',
      },
    },
    
    // Card
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '40px',
      },
    },
    
    // Table
    table: {
      cellPadding: '16px 20px',
      headerPadding: '16px 20px',
      rowHeight: '56px',
    },
    
    // Sidebar
    sidebar: {
      width: {
        collapsed: '72px',
        expanded: '280px',
      },
      itemPadding: '12px 16px',
      itemHeight: '44px',
    },
    
    // Header
    header: {
      height: '64px',
      padding: '0 24px',
    },
  },
};

export { designTokens };