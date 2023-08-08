import {
  useInView,
  animated,
  useTrail,
  useSpringRef,
  useChain,
} from '@react-spring/web';
import {
  IconCheck,
  IconDatabaseDollar,
  IconRotateClockwise2,
  IconUsersPlus,
} from '@tabler/icons-react';
import classNames from 'classnames';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { Waitlist } from '@/components/Waitlist';

const tabsFeature = [
  {
    title: 'Discover',
    desc: 'Keep track of all your products and how they communicate with each other.',
    img: 'discover.png',
  },
  {
    title: 'Understand',
    desc: 'Find all the information you need when you join a company or start working with a new team.',
    img: 'understand.png',
  },

  {
    title: 'Collaborate',
    desc: 'Edit anything at any time, propose changes and merge when you are ready.',
    img: 'collaborate.png',
  },

  {
    title: 'Consolidate',
    desc: 'Easily find all dependencies, redundant technologies, outdated packages and act upon it.',
    img: 'consolidate.png',
  },
];

const blocks = [
  {
    id: 1,
    icon: <IconUsersPlus />,
    title: 'Improve your engineers and managers onboarding',
    desc: 'Add your new employee to Specfy, let them understand everything asynchronously, remotely or use it as a presentation tool.',
  },
  {
    id: 2,
    icon: <IconRotateClockwise2 />,
    title: 'Stay on top of things with always up-to-date reporting',
    desc: 'Your stack is refreshed every time you push on Github. Never waste time ever again presenting outdated slides about your technical stack.',
  },
  {
    id: 3,
    icon: <IconDatabaseDollar />,
    title: 'Reduce Cost and consolidate your stack',
    desc: 'Easily find all dependencies, redundant technologies, outdated packages and act upon it. The platform intelligence help you do it at your company scale.',
  },
];

const faqs = [
  {
    id: 1,
    question: 'Does Specfy store my source code?',
    answer:
      'We only temporarly clone the repositories you allowed us to, the code is always deleted after use.',
  },
  {
    id: 2,
    question: 'What is Specfy storing?',
    answer:
      'We only keep metadata, e.g: service name, dependencies, technology used, etc.',
  },
  {
    id: 3,
    question: 'I want to review what Specfy is doing with my code',
    answer:
      'The platform is fully open-source, you can check the code on Github.',
  },
];

const Appears: React.FC<{
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}> = ({ className, children }) => {
  const [ref, style] = useInView(
    () => {
      return {
        from: {
          opacity: 0,
          y: 100,
        },
        to: {
          opacity: 1,
          y: 0,
        },
      };
    },
    { once: false }
  );
  return (
    <animated.div ref={ref} style={style} className={className}>
      {children}
    </animated.div>
  );
};

const OFFSET = 0.1 / 2;

const AnimatedGrid: React.FC = () => {
  const [strokeWidth, setStrokeWidth] = useState<number>(0.1);
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);
  const [cols, setCols] = useState<number>(16);
  const [spacing, setSpacing] = useState<number>(12);
  const gridApi = useSpringRef();

  const gridSprings = useTrail(cols, {
    ref: gridApi,
    from: {
      x2: 0,
      y2: 0,
      color: '#aaaaaa',
    },
    to: {
      x2: width,
      y2: height,
      // color: '#1a71ff',
    },
    reset: false,
  });

  const boxApi = useSpringRef();

  useChain([gridApi, boxApi], [0, 1], 1500);
  useEffect(() => {
    const large = window.innerWidth > 600;
    setStrokeWidth(large ? 0.1 : 0.1);
    setHeight(window.innerHeight / 10);
    setWidth(window.innerWidth / 10);
    setCols(large ? 30 : 15);
    setSpacing(large ? 7 : 5);
  }, []);

  return (
    <div className="">
      <div className="text-gray-200">
        <svg viewBox={`0 0 ${width} ${height}`}>
          <g>
            {gridSprings.map(({ x2, color }, index) => (
              <animated.line
                x1={0}
                y1={index * spacing + OFFSET}
                x2={x2}
                y2={index * spacing + OFFSET}
                key={index}
                strokeWidth={strokeWidth}
                stroke={color}
              />
            ))}
            {gridSprings.map(({ y2, color }, index) => (
              <animated.line
                x1={index * spacing + OFFSET}
                y1={0}
                x2={index * spacing + OFFSET}
                y2={y2}
                key={index}
                strokeWidth={strokeWidth}
                stroke={color}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default function Home() {
  const [tabFeature, setTabFeature] = useState('Discover');
  const [refFeature, inViewFeature] = useInView({ once: false });
  const [trails, api] = useTrail(
    4,
    () => {
      return {
        config: { mass: 5, tension: 2000, friction: 200 },
        delay: 500,
        opacity: inViewFeature ? 1 : 0,
        y: inViewFeature ? 0 : 20,
        from: { opacity: 0, y: 20 },
      };
    },
    [inViewFeature]
  );

  const [refBlock, inViewBlock] = useInView({ once: true });
  const [trailsBlock] = useTrail(
    3,
    () => {
      return {
        config: { mass: 5, tension: 2000, friction: 200 },
        delay: 500,
        opacity: inViewFeature ? 1 : 0,
        y: inViewFeature ? 0 : 20,
        from: { opacity: 0, y: 20 },
        reverse: false,
      };
    },
    [inViewBlock]
  );

  const [trailsCard] = useTrail(
    3,
    () => {
      return {
        config: {
          mass: 20,
          tension: 2000,
          friction: 200,
          duration: 500,
          damping: 0.1,
        },
        delay: 1000,
        to: { opacity: 1, y: 20 },
        from: { opacity: 0, y: 0 },
      };
    },
    [inViewBlock]
  );

  useEffect(() => {
    if (inViewFeature === false) {
      api.set({ opacity: 0, y: 0 });
    }
  }, [inViewFeature]);

  return (
    <main className="relative">
      <Head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css"
        />
        <script src="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js"></script>
      </Head>
      <div className="relative isolate overflow-hidden px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="py-32 sm:py-48 lg:py-56 lg:pl-2 grid grid-cols-1 lg:grid-cols-12">
            <div className="absolute w-screen h-screen top-12 -left-0 z-0 opacity-20">
              <AnimatedGrid />
            </div>

            <div className="relative z-10 lg:col-span-7">
              <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Stack Intelligence Platform
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-800">
                  Specfy extract metadata from your organization&apos;s
                  repositories and automatically build an exhaustive
                  infrastructure documentation that helps onboarding, and
                  managing your stack at scale
                </p>
                <div className="mt-12 pt-2">
                  <Waitlist />
                </div>
              </div>
            </div>
            <div className="relative mt-20 pr-20 mx-auto w-[200px] h-[120px] lg:mx-0 lg:col-span-5 lg:pl-40">
              {trailsCard.map((props, i) => {
                return (
                  <animated.div
                    key={i}
                    className="bg-[#0b101b] absolute rounded-xl w-40 h-40"
                    style={{
                      transformStyle: 'preserve-3d',
                      backgroundImage:
                        'linear-gradient(135deg, #797979, #322f39)',
                      boxShadow:
                        'rgb(20 28 42 / 50%) 20px 20px 60px, rgb(83, 77, 100) 1px 1px 0px 1px',
                      transform: `rotateX(55deg) rotateY(0deg) rotate(45deg) scale(1) translate(-${
                        i * 40
                      }px, -${i * 40}px)`,
                      top: props.y,
                      opacity: props.opacity,
                    }}
                  ></animated.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative isolate overflow-hidden px-8 py-14 lg:px-8 bg-[#0b101b]"
        id="features"
      >
        <div className="mx-auto max-w-7xl py-16">
          <div className="max-w-3xl md:mx-auto md:text-center xl:max-w-none">
            <Appears>
              <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
                All in one platform, for your entire team
              </h2>
            </Appears>
          </div>
          <div className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0">
            <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-4">
              <div
                className="relative z-10 flex gap-x-4 whitespace-nowrap px-4 sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal"
                role="tablist"
                aria-orientation="vertical"
                ref={refFeature}
              >
                {trails.map((props, i) => {
                  const { title, desc } = tabsFeature[i];
                  const selected = tabFeature === title;
                  return (
                    <animated.div
                      key={`menu-${title}`}
                      style={props}
                      className={classNames(
                        'group relative rounded-full px-4 py-1 lg:rounded-l-xl lg:rounded-r-none lg:p-6 hover:cursor-pointer',
                        selected
                          ? 'bg-white lg:bg-white/10 lg:hover:bg-white/10'
                          : 'lg:hover:bg-white/5'
                      )}
                      onClick={() => setTabFeature(title)}
                    >
                      <h3>
                        <button
                          className={classNames(
                            'font-display text-lg lg:text-white',
                            !selected && 'text-gray-500'
                          )}
                          role="tab"
                          type="button"
                          aria-selected="true"
                          tabIndex={0}
                        >
                          {title}
                        </button>
                      </h3>
                      <p
                        className={classNames(
                          'mt-2 hidden text-sm lg:block text-white/50',
                          selected && 'text-white'
                        )}
                      >
                        {desc}
                      </p>
                    </animated.div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-8 lg:h-[565px]">
              {tabsFeature.map(({ title, img, desc }) => {
                return (
                  <Appears
                    key={`img-${title}`}
                    className={classNames(tabFeature !== title && 'hidden')}
                    once={false}
                  >
                    <p className="text-center text-base lg:hidden text-white">
                      {desc}
                    </p>
                    <div className="mt-10 overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-blue-900/20 w-auto lg:mt-0 lg:w-[67.8125rem]">
                      <img
                        alt=""
                        width="2174"
                        height="1464"
                        className="w-full"
                        src={img}
                      />
                    </div>
                  </Appears>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative isolate px-6 py-20 lg:px-8 " id="features">
        <div className="mx-auto max-w-2xl lg:max-w-7xl py-16" ref={refBlock}>
          <div className="grid grid-cols-1 items-center gap-y-10 sm:gap-y-16 lg:gap-x-20 lg:grid-cols-12">
            {trailsBlock.map((props, i) => {
              const { id, title, desc, icon } = blocks[i];
              return (
                <animated.div
                  key={`block-${id}`}
                  style={props}
                  className={classNames(
                    'flex pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-4'
                    // block !== id && 'opacity-75 hover:opacity-100'
                  )}
                >
                  <div className={classNames('group relative')}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0b101b] text-white">
                      {icon}
                    </div>
                    <h3 className="mt-5 lg:h-20 font-display text-2xl text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-4 text-sm text-slate-600">{desc}</p>
                  </div>
                </animated.div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="relative isolate px-6 py-20 lg:px-8 bg-gray-100"
        id="features"
      >
        <div className="mx-auto lg:max-w-7xl py-10">
          <div className="pb-20 max-w-2xl md:mx-auto md:text-center xl:max-w-none">
            <Appears>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
                A Pricing that fits your business
              </h2>
            </Appears>
          </div>

          <div className="grid grid-cols-1 max-w-xl mx-auto lg:max-w-7xl items-center gap-y-2 sm:gap-y-6 lg:gap-x-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="rounded-md px-8 py-8 pb-15 bg-white  transition-all duration-300 ease-in-out hover:scale-105">
                <h4 className="text-slate-600">Starter</h4>
                <h3 className="mt-2 mb-6 font-display text-3xl text-slate-900">
                  Free
                </h3>
                <p className="text-slate-600">
                  Good to discover the platform and for small startup
                </p>
                <ul className="mt-10">
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> 3 Projects
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> 5 Users
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Unlimited Deploy
                  </li>
                </ul>

                <button className="mt-10 w-full ring-1 ring-slate-400 rounded p-3 transition-all hover:bg-[#0b101b] hover:text-white">
                  Get Started
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-md px-12 py-14 bg-[#0b101b] text-white transition-all duration-300 ease-in-out hover:scale-105">
                <h4 className="text-slate-200">Pro</h4>
                <h3 className="mt-2 mb-2 font-display text-xl text-slate-100">
                  <span className=" line-through">$9.99</span>
                  <span className="text-slate-500 text-lg">/month/project</span>
                </h3>
                <h3 className="mt-2 mb-6 font-display text-5xl text-slate-100">
                  Free{' '}
                  <span className="text-slate-500 text-2xl">(during beta)</span>
                </h3>
                <p className="text-slate-200">
                  Perfect medium sized business and fast growing company
                </p>
                <ul className="mt-10">
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> 50 Projects
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> 100 Users
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Unlimited Deploy
                  </li>
                </ul>

                <button className="mt-10 w-full ring-1 ring-slate-600 rounded p-3 transition-all hover:bg-white hover:text-[#0b101b]">
                  Get Started
                </button>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-md px-8 py-8 pb-15 bg-white  transition-all duration-300 ease-in-out hover:scale-105">
                <h4 className="text-slate-600">Enterprise</h4>
                <h3 className="mt-2 mb-6 font-display text-3xl text-slate-900 ">
                  Custom
                </h3>
                <p className="text-slate-600">
                  Perfect medium sized business and fast growing company
                </p>
                <ul className="mt-10">
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Unlimited Projects
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Unlimited Users
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Unlimited Deploy
                  </li>
                  <li className="flex gap-x-2 h-7">
                    <IconCheck /> Premium Support
                  </li>
                </ul>

                <button className="mt-10 w-full ring-1 ring-slate-400 rounded p-3 transition-all hover:bg-[#0b101b] hover:text-white">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative isolate px-6 py-20 lg:px-8 " id="features">
        <div className="mx-auto max-w-2xl lg:max-w-7xl py-16">
          <div className="pb-20 max-w-2xl xl:max-w-none">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 items-start gap-y-2 sm:gap-y-10 lg:gap-x-10 lg:grid-cols-12">
            {faqs.map(({ id, question, answer }) => {
              return (
                <div
                  key={`faq-${id}`}
                  className={classNames(
                    'flex pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-4'
                  )}
                >
                  <div className={classNames('group relative')}>
                    <h4 className="mt-5 font-display text-xl text-slate-900">
                      {question}
                    </h4>
                    <p className="mt-4 text-sm text-slate-600">{answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
