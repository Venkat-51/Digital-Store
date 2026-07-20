// PostCSS configuration for Tailwind CSS v4
// Uses @tailwindcss/postcss (v4 split package) instead of the deprecated
// `tailwindcss` PostCSS plugin that was merged into v3.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
