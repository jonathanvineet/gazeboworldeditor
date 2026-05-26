'use client'

/**
 * Industrial UI Theme
 * VSCode/Unreal-inspired styling for robotics IDE
 */

export const industrialTheme = {
  // Core Colors
  colors: {
    background: '#1e1e1e',      // Primary background
    surface: '#252526',          // Panel/Surface background
    surfaceAlt: '#2d2d30',       // Hover/Alt surface
    border: '#3e3e42',           // Borders, dividers
    borderLight: '#464647',      // Light borders
    
    // Text
    text: '#cccccc',             // Primary text
    textSecondary: '#858585',    // Secondary/dimmed text
    textTertiary: '#6a6a6a',     // Very dimmed text
    
    // Accents
    accent: '#0e639c',           // Selection/active (blue)
    accentRed: '#f48771',        // Error/warning
    accentGreen: '#6a9955',      // Success/valid
    accentOrange: '#ce9178',     // Info/warning
    accentYellow: '#dcdcaa',     // Highlight
    
    // Component-specific
    buttonBg: '#464647',         // Button background
    buttonBgHover: '#565656',    // Button hover
    inputBg: '#3c3c3c',          // Input background
    scrollbar: '#797979',        // Scrollbar color
  },

  // Spacing (compact, dense)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
  },

  // Typography
  typography: {
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      lg: '14px',
      xl: '16px',
    },
    fontFamily: 'Segoe UI, Roboto, system-ui, sans-serif',
  },

  // Sizes
  sizes: {
    buttonHeight: '24px',
    panelHeaderHeight: '32px',
    toolbarHeight: '40px',
    statusBarHeight: '24px',
  },
}

/**
 * CSS Classes for Industrial Styling
 */
export const industrialClasses = {
  // Containers
  panel: 'bg-[#252526] border border-[#3e3e42]',
  panelHeader: 'bg-[#2d2d30] border-b border-[#3e3e42] px-2 py-1.5 text-xs font-semibold text-[#cccccc]',
  
  // Buttons
  button: 'bg-[#464647] hover:bg-[#565656] text-[#cccccc] px-2 py-1 text-xs border border-[#333] rounded-none transition-colors',
  buttonActive: 'bg-[#0e639c] text-[#cccccc] border border-[#0a4f7f]',
  buttonSmall: 'bg-[#464647] hover:bg-[#565656] text-[#cccccc] px-1.5 py-0.5 text-xs border border-[#333]',
  
  // Inputs
  input: 'bg-[#3c3c3c] text-[#cccccc] border border-[#464647] px-2 py-1 text-xs placeholder-[#858585]',
  inputFocus: 'bg-[#3c3c3c] text-[#cccccc] border-[#0e639c] focus:outline-none focus:border-[#0e639c]',
  
  // Text
  label: 'text-[#cccccc] text-xs font-medium',
  labelSecondary: 'text-[#858585] text-xs',
  
  // Icons
  iconSmall: 'w-4 h-4',
  iconMedium: 'w-5 h-5',
  
  // Dividers
  divider: 'border-t border-[#464647]',
  dividerVertical: 'border-l border-[#464647]',
  
  // Lists/Trees
  listItem: 'hover:bg-[#3e3e42] px-2 py-1 text-xs',
  listItemActive: 'bg-[#0e639c] text-[#cccccc]',
  
  // Scrollbars
  scrollbar: 'scrollbar-thin scrollbar-thumb-[#464647] scrollbar-track-[#1e1e1e]',
}

/**
 * Tailwind CSS custom utilities for industrial theme
 * Add to tailwind.config.ts:
 * 
 * plugins: [
 *   function({ addUtilities }) {
 *     addUtilities({
 *       '.industrial-panel': {
 *         backgroundColor: '#252526',
 *         borderColor: '#3e3e42',
 *         borderWidth: '1px',
 *       },
 *       '.industrial-button': {
 *         backgroundColor: '#464647',
 *         '&:hover': {
 *           backgroundColor: '#565656',
 *         },
 *         color: '#cccccc',
 *         fontSize: '12px',
 *         padding: '0.5rem 0.75rem',
 *         borderWidth: '1px',
 *         borderColor: '#333',
 *       },
 *     })
 *   },
 * ]
 */
