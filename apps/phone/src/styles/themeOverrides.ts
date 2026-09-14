// Some remnants of the migration to Material UI v5

// iFruit-style typography/shape: a rounded system-font stack and softer,
// larger corner radii than MUI's Material defaults, closer to how the
// stock in-game phones read.
import { ThemeOptions } from '@mui/material';

const themeOverrides: ThemeOptions = {
  typography: {
    fontFamily: [
      '"SF Pro Text"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'unset', borderRadius: 16 } },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, textTransform: 'none' } },
    },
  },
};

export default themeOverrides;
