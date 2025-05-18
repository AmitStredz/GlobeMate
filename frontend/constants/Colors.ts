/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: {
    main: '#171717',  // Dark text
    light: '#2D2D2D',
  },
  secondary: {
    main: '#B4D147',  // Lime green accent
    dark: '#0A3B07',  // Dark green for selected states
  },
  background: {
    main: '#F5F5F0',  // Light beige/cream
    card: '#FFFFFF',  // White
    subtle: '#F8F8F5', // Subtle background variation
  },
  text: {
    primary: '#171717',
    secondary: '#666666',
    light: '#FFFFFF',
  },
  border: {
    light: '#E5E5E5',
    dark: '#D1D1D1',
  },
  status: {
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
  },
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
