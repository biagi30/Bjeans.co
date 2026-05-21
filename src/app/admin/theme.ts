export type Theme = 'light' | 'dark';

export const colors = {
  dark: {
    bg: '#0F172A',
    bgSecondary: '#1E293B',
    bgTertiary: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    accent: '#3B82F6',
    accentSecondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    // Neumorphism
    shadowLight: 'rgba(255, 255, 255, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
  },
  light: {
    bg: '#F8FAFC',
    bgSecondary: '#E2E8F0',
    bgTertiary: '#CBD5E1',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    border: '#CBD5E1',
    accent: '#3B82F6',
    accentSecondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    // Neumorphism
    shadowLight: 'rgba(255, 255, 255, 1)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',
  }
};

export function getThemeColors(theme: Theme | string | undefined) {
  const resolved = theme === 'light' || theme === 'dark' ? theme : 'dark';
  return colors[resolved];
}
