'use client'

/**
 * Monochrome technical UI theme.
 * Near-black surfaces, hairline borders, uppercase mono labels,
 * one bright neutral accent (no hue) for active/selected state,
 * red reserved solely as a functional error/destructive signal.
 */

export const industrialTheme = {
  colors: {
    background: '#050505',
    surface: '#0b0b0b',
    surfaceAlt: '#161616',
    border: '#232323',
    borderLight: '#303030',

    text: '#f2f2f2',
    textSecondary: '#8a8a8a',
    textTertiary: '#525252',

    accent: '#eaeaea',
    accentInk: '#050505', // text color to use on top of a filled accent
    error: '#ff5c5c',

    buttonBg: '#141414',
    buttonBgHover: '#202020',
    inputBg: '#0a0a0a',
    scrollbar: '#303030',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },

  typography: {
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '14px',
      xl: '16px',
    },
    fontFamily: 'var(--font-sans)',
    fontFamilyMono: 'var(--font-mono)',
  },

  sizes: {
    buttonHeight: '24px',
    panelHeaderHeight: '32px',
    toolbarHeight: '44px',
    statusBarHeight: '24px',
  },
}

export const industrialClasses = {
  // Containers
  panel: 'bg-[#0b0b0b] border border-[#232323]',
  panelHeader:
    'bg-[#101010] border-b border-[#232323] px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]',

  // Buttons
  button:
    'bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] px-2.5 py-1 text-xs border border-[#2a2a2a] rounded-none transition-colors',
  buttonActive: 'bg-[#eaeaea] text-[#050505] border border-[#eaeaea]',
  buttonSmall: 'bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] px-1.5 py-0.5 text-xs border border-[#2a2a2a]',

  // Inputs
  input: 'bg-[#0a0a0a] text-[#f2f2f2] border border-[#2a2a2a] px-2 py-1 text-xs placeholder-[#525252]',
  inputFocus:
    'bg-[#0a0a0a] text-[#f2f2f2] border-[#2a2a2a] focus:outline-none focus:border-[#eaeaea]',

  // Text
  label: 'text-[#f2f2f2] text-xs font-medium',
  labelSecondary: 'text-[#8a8a8a] text-xs',

  // Icons
  iconSmall: 'w-4 h-4',
  iconMedium: 'w-5 h-5',

  // Dividers
  divider: 'border-t border-[#232323]',
  dividerVertical: 'border-l border-[#232323]',

  // Lists/Trees
  listItem: 'hover:bg-[#141414] px-2 py-1 text-xs border-l-2 border-transparent',
  listItemActive: 'bg-[#141414] text-[#f2f2f2] border-l-2 border-[#eaeaea]',

  // Scrollbars
  scrollbar: 'scrollbar-thin scrollbar-thumb-[#303030] scrollbar-track-[#050505]',
}
