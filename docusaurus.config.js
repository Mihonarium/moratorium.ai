// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Global AI Moratorium',
  tagline: 'To avoid an existential catastrophe, we call on policymakers around the world to implement a global moratorium on large AI training runs until the technical problem of AI alignment is solved.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://moratorium.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Mihonarium', // Usually your GitHub org/user name.
  projectName: 'moratorium.ai', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Mihonarium/moratorium.ai/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Mihonarium/moratorium.ai/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/og_image3.png',
      navbar: {
		hideOnScroll: true,
        title: 'Global AI Moratorium',
        /*logo: {
          alt: 'Global AI Moratorium Logo',
          src: 'img/logo.svg',
        },*/
        items: [
          {
            label: 'Get in touch', position: 'right',
            items: [
              {
                label: 'Help AI Moratorium',
                href: 'https://docs.google.com/forms/d/e/1FAIpQLSeqKAqC4B4fAQu6temjRmvZjHO98HQ9xdBDokMrWZE3OD-8Mw/viewform',
              },
              {
                label: 'Talk to us',
                href: 'https://docs.google.com/forms/d/e/1FAIpQLSfRfqhOOVh2QP4kiadJw6jkV43Q5oalckG7jrWat62FbjF0JA/viewform?usp=sf_link',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Get in touch',
            items: [
              {
                label: 'Help AI Moratorium',
                href: 'https://docs.google.com/forms/d/e/1FAIpQLSeqKAqC4B4fAQu6temjRmvZjHO98HQ9xdBDokMrWZE3OD-8Mw/viewform',
              },
              {
                label: 'Talk to us',
                href: 'https://docs.google.com/forms/d/e/1FAIpQLSfRfqhOOVh2QP4kiadJw6jkV43Q5oalckG7jrWat62FbjF0JA/viewform?usp=sf_link',
              },
            ],
          },
          {
            title: 'More about AI safety',
            items: [
              {
                label: 'AI Safety Fundamentals',
                href: 'https://aisafetyfundamentals.com/',
              },
              {
                label: 'AI Alignment Intro Materials',
                href: 'https://www.lesswrong.com/tag/ai-alignment-intro-materials',
              },
            ],
          },
          {
            title: 'More about policy proposals',
            items: [
              {
                label: 'Center for AI Policy (US)',
                href: 'https://www.aipolicy.us',
              },
              {
                label: 'Center for AI Safety',
                href: 'https://safe.ai',
              },
            ],
          },
        ],
        copyright: `${new Date().getFullYear()}, work in progress`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
