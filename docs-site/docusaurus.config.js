// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'İ-EP.APP Dokümantasyonu',
  tagline: 'Iqra Eğitim Portalı Geliştirici Rehberi',
  url: 'https://docs.i-ep.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config
  organizationName: 'tural-musab',
  projectName: 'i-ep.app',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang.
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/tural-musab/i-ep.app/tree/main/docs-site/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'İ-EP.APP Docs',
        logo: {
          alt: 'İ-EP.APP Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Dokümanlar',
          },
          {
            type: 'dropdown',
            label: 'Rehberler',
            position: 'left',
            items: [
              {
                label: 'Kurulum',
                to: '/docs/onboarding/setup-guide',
              },
              {
                label: 'Multi-tenant Testi',
                to: '/docs/testing/multi-tenant-testing',
              },
              {
                label: 'API Kullanımı',
                to: '/docs/api/endpoints',
              },
            ],
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/tural-musab/i-ep.app',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Dokümanlar',
            items: [
              {
                label: 'Geliştirici Onboarding',
                to: '/docs/onboarding/README',
              },
              {
                label: 'API Referansı',
                to: '/docs/api/endpoints',
              },
              {
                label: 'Multi-tenant Testi',
                to: '/docs/testing/multi-tenant-testing',
              },
            ],
          },
          {
            title: 'Mimari',
            items: [
              {
                label: 'Mimari Özet',
                to: '/docs/onboarding/architecture-overview',
              },
              {
                label: 'Veri İzolasyonu',
                to: '/docs/architecture/data-isolation',
              },
              {
                label: 'Multi-tenant Stratejisi',
                to: '/docs/architecture/multi-tenant-strategy',
              },
            ],
          },
          {
            title: 'Komponentler',
            items: [
              {
                label: 'Super Admin Panel',
                to: '/docs/components/super-admin-panel',
              },
            ],
          },
        ],
        copyright: `Telif Hakkı © ${new Date().getFullYear()} İ-EP.APP. Tüm Hakları Saklıdır.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'typescript', 'jsx', 'tsx'],
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'forest' },
      },
    }),
  
  markdown: {
    mermaid: true,
  },
  
  plugins: [],
};

module.exports = config; 