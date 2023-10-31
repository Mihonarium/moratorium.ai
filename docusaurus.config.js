// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AI Moratorium',
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
				target: '_top',
                href: '/#how-to-help',
              },
              {
                label: 'Contact us',
				target: '_top',
                href: '/#contact',
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
                html: `<a class="footer__link-item" href="/#how-to-help">Help AI Moratorium</a>`,
              },
              {
                html: `<a class="footer__link-item" href="/#contact">Contact us</a>`,
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
        copyright: `<div><form id="subscription_form_footer"><input class="form-input" type="text" name="email" id="email_subscribe" placeholder="Email address" value="" style="width:300px;height:30px;margin-right:10px;" required=""><button class="button button--outline button--secondary" type="submit">Subscribe to our news</button></form></div>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
		announcementBar: {
		  id: 'wip',
		  content:
			'<b>Work in progress</b>. Feel free to use the website as is, but please don\'t share it widely just yet.  <a target="_self" rel="noopener noreferrer" href="#contact">Get in touch</a> | <a target="_self" rel="noopener noreferrer" href="#how-to-help">Сontribute</a>',
		  backgroundColor: 'var(--ifm-color-primary-darkest)',
		  textColor: 'white',
		  isCloseable: false,
		},
    }),
	scripts: [
		{src: '/scripts.js', async: true},
	],
};

module.exports = config;
