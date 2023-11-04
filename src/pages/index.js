import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import BrowserOnly from '@docusaurus/BrowserOnly';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Intro from './../../docs/intro.md';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="#why">
            Why?
          </Link>
        </div>
      </div>
    </header>
  );
}

const statement = 'Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war.';

function Statement() {
	return (
      <div className={clsx('container', 'margin-bottom--sm', 'text--center', 'margin-top--lg', 'col-2')}>
        <p className="statement_text"><b>“{statement}”</b> <br/>
		— A statement signed by prominent AI executives and researchers {SoleLink('https://www.safe.ai/statement-on-ai-risk')}</p>
      </div>
	)
}

const Quotes = [
  {
    name: 'Sam Altman',
    title: 'the CEO of OpenAI, which created ChatGPT and GPT-4',
    text: 'Development of superhuman machine intelligence is probably the greatest threat to the continued existence of humanity',
	link: 'https://blog.samaltman.com/machine-intelligence-part-1',
	on_mobile: true,
  },
  {
    name: 'Jaan Tallinn',
    title: 'lead investor of Anthropic',
    text: 'I’ve not met anyone in AI labs who says the risk [from a large-scale AI experiment] is less than 1% of blowing up the planet. It’s important that people know lives are being risked',
	link: 'https://twitter.com/liron/status/1656929936639430657',
  },
  {
    name: 'Yoshua Bengio',
    title: 'deep learning pioneer, one of the three "Godfathers of AI", and winner of the Turing Award',
    text: 'Rogue AI may be dangerous for the whole of humanity. Banning powerful AI systems (say beyond the abilities of GPT-4) that are given autonomy and agency would be a good start',
	link: 'https://yoshuabengio.org/2023/05/22/how-rogue-ais-may-arise/',
	on_mobile: true,
  },
  {
    name: 'Eliezer Yudkowsky',
    title: 'founder of MIRI and conceptual father of the AI safety field',
    text: 'Many researchers steeped in these issues, including myself, expect that the most likely result of building a superhumanly smart AI, under anything remotely like the current circumstances, is that literally everyone on Earth will die',
	link: 'https://time.com/6266923/ai-eliezer-yudkowsky-open-letter-not-enough/',
  },
  {
    name: 'Geoffrey Hinton',
    title: 'deep learning pioneer, one of the three "Godfathers of AI", and winner of the Turing Award', //, left Google to speak out about the risk',
    text: 'The alarm bell I’m ringing has to do with the existential threat of them taking control [...] If you take the existential risk seriously, as I now do, it might be quite sensible to just stop developing these things any further',
	link: 'https://www.forbes.com/sites/craigsmith/2023/05/04/geoff-hinton-ais-most-famous-researcher-warns-of-existential-threat/',
	on_mobile: true,
  },
  {
    name: 'Demis Hassabis',
    title: 'the CEO of Google DeepMind',
    text: 'I would advocate not moving fast and breaking things. [...] When it comes to very powerful technologies—and obviously AI is going to be one of the most powerful ever—we need to be careful. [...] Not everybody is thinking about those things. It’s like experimentalists, many of whom don’t realize they’re holding dangerous material',
	link: 'https://time.com/6246119/demis-hassabis-deepmind-interview/',
  },
  {
    name: 'Stephen Hawking',
    title: 'theoretical physicist & cosmologist',
    text: 'The development of full artificial intelligence could spell the end of the human race',
	link: 'https://www.bbc.co.uk/news/technology-30290540',
  },
  {
    name: 'Stuart Russell',
    title: 'writer of the standard textbook on AI used in thousands of universities',
    text: 'If we pursue [our current approach], then we will eventually lose control over the machines',
	link: 'https://news.berkeley.edu/2023/04/07/stuart-russell-calls-for-new-approach-for-ai-a-civilization-ending-technology/',
  },
  {
    name: 'Bill Gates',
    title: 'Microsoft, Gates Foundation',
    text: 'Superintelligent AIs are in our future. [...] There’s the possibility that AIs will run out of control. [Possibly,] a machine could decide that humans are a threat, conclude that its interests are different from ours, or simply stop caring about us',
	link: 'https://www.gatesnotes.com/The-Age-of-AI-Has-Begun',
  },
  {
    name: 'Ursula von der Leyen',
    title: 'the president of the European Commission',
    text: '[We] should not underestimate the real threats coming from AI. [Fully quoted the above statement on the risk of extinction.] [...] It is moving faster than even its developers anticipated. [...] We have a narrowing window of opportunity to guide this technology responsibly',
	link: 'https://www.youtube.com/live/3CodB7iohUI?si=eIhi5KWUV3IdYhrG&t=2777',
  },
  {
    name: 'António Guterres',
    title: 'UN Secretary-General',
    text: 'AI poses a long-term global risk. Even its own designers have no idea where their breakthrough may lead. I urge [the UN Security Council] to approach this technology with a sense of urgency. Unforeseen consequences of some AI-enabled systems could create security risks by accident. Generative AI has enormous potential for good and evil at scale. Its creators themselves have warned that much bigger, potentially catastrophic and existential risks lie ahead. Without action to address these risks, we are derelict in our responsibilities to present and future generations.',
	link: 'https://www.youtube.com/watch?v=mpnfK5Zhxho',
	on_mobile: true,
  },
  {
    name: 'Zhang Jun',
    title: 'China’s UN Ambassador',
    text: 'The potential impact of AI might exceed human cognitive boundaries. To ensure that this technology always benefits humanity, we must regulate the development of AI and prevent this technology from turning into a runaway wild horse. [...] We need to strengthen the detection and evaluation of the entire lifecycle of AI, ensuring that mankind has the ability to press the pause button at critical moments',
	link: 'https://www.youtube.com/live/fJn9vmD1zfY?feature=share&t=1621',
  },
  /*{
    name: 'James Cleverly',
    title: 'UK’s Foreign Secretary',
    text: 'The potential impact of AI might exceed human cognitive boundaries. To ensure that this technology always benefits humanity, we must regulate the development of AI and prevent this technology from turning into a runaway wild horse',
	link: 'https://www.youtube.com/live/fJn9vmD1zfY?feature=share&t=1621',
  },*/
  /*{
    name: 'Anthropic',
    title: 'in "Core views on AI Safety"',
    text: 'No one knows how to train very powerful AI systems to be robustly helpful, honest, and harmless [...] Rapid AI progress will be disruptive to society and may trigger competitive races that could lead corporations or nations to deploy untrustworthy AI systems. The results of this could be catastrophic [...] because AI systems strategically pursue dangerous goals',
	link: 'https://www.anthropic.com/index/core-views-on-ai-safety',
  },*/
];

function QuotesSection() {
  return (
    <div className={clsx(styles.section, styles.sectionAlt)}>
      <div className={clsx('container', 'margin-bottom--lg', 'text--center', 'margin-top--lg')}>
        <div className={clsx('row', styles.tweetsSection)}>
          {Quotes.map((quote) => (
            <div className={clsx('col', 'col--4', quote.on_mobile?'quote_displayOnSmall':'quote_dontDisplayOnSmall')} key={quote.name}>
              <div className="avatar avatar--vertical padding-top--sm margin-bottom--sm">
                <div className="avatar__intro">
                  <div className="avatar__name">{quote.name}</div>
                  <small className="avatar__subtitle text--italic">{quote.title}</small>
                </div>
              </div>
              <p className="text--center padding-horiz--md">
                “{quote.text}” {SoleLink(quote.link)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoleLink(href) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className=""><svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24" className="iconExternalLink_node_modules-@docusaurus-theme-classic-lib-theme-Icon-ExternalLink-styles-module"><path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path></svg></a>
  );
}

export default function Home() {
	
  
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      description="To avoid an existential catastrophe, we need a global moratorium on large AI training runs until the technical problem of AI alignment is solved.">
      <HomepageHeader />
      <main>
        <Statement />
        <QuotesSection />
		<div className={clsx('container', 'margin-bottom--lg', 'margin-top--lg', 'md-intro')} id="why">
			<div className={clsx('index-md')} id="why">
			  <MDXContent>
				<Intro />
			  </MDXContent>
			</div>
		</div>
      </main><ToastContainer /><BrowserOnly fallback={<div></div>}>
      {() => {
        window.toast = toast;
        return <div></div>;
      }}
    </BrowserOnly>
    </Layout>
  );
}
