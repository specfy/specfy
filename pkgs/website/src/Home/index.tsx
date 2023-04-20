import { Logo } from '../Logo';

export const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        ></nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
        >
          {/* <div className="blur-[106px]  h-64 bg-gradient-to-r from-indigo-400 to-indigo-100"></div> */}
        </div>
        <div className="relative">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                <Logo />
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-800">
                Next-gen documentation platform for engineers.
              </p>
              <p className="text-lg leading-8 text-gray-700">Coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
