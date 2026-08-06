import nextVitals from 'eslint-config-next/core-web-vitals';

const ignores = [
  '.next/',
  'node_modules/',
  'build/',
  'public/',
  'postcss.config.js',
  'tailwind.config.js',
  'next.config.js',
];

const config = [
  {
    ignores,
  },
  ...[...nextVitals].map((entry) => ({
    ...entry,
    rules: {
      ...entry.rules,
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  })),
];

export default config;
