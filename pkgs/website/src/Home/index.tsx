import { IconBrandGithubFilled } from '@tabler/icons-react';

import { Logo } from '../Logo';

export const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <header className="fixed bg-white inset-x-0 top-0 z-50 w-full md:bg-opacity-95 transition duration-300 ease-in-out">
        <div className="flex flex-col max-w-6xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
          <nav
            className="flex grow items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="xl:mr-16">
              <Logo />
            </div>
            <nav className="grow md:flex gap-x-6 xl:gap-x-10 flex justify-end">
              <a
                className="text-gray-700 hover:text-indigo-900 focus:text-accent-900"
                href="/blog"
              >
                Blog
              </a>
              <a
                className="text-gray-700 hover:text-indigo-900 focus:text-accent-900"
                href="https://github.com/specfy"
              >
                Github
              </a>
            </nav>
          </nav>
        </div>
      </header>

      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="relative">
          <div className="mx-auto max-w-5xl py-32 sm:py-48 lg:py-56">
            <div className="max-w-3xl">
              <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  One click infrastructure documentation
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-800">
                  Specfy extract metadata from all your organization
                  repositories and build an exhaustive infrastructure
                  documentation that helps Dev Ops and speed up Engineers
                  onboarding
                </p>
                <p className="mt-10">
                  <form
                    action="https://iokp8ne2vtf.typeform.com/to/nITnXJdP"
                    method="GET"
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="rounded-md w-1/3 border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <button
                      className="bg-[#242d3c] text-sm text-white px-4 py-2.5 rounded-lg mx-5 shadow-lg"
                      type="submit"
                    >
                      Join the waitlist
                    </button>
                  </form>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex-0 pt-8 pb-4 border-t border-gray-700 bg-[#242d3c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 columns-1 sm:columns-2 md:columns-4">
          <div className="pb-4 space-y-6 text-gray-400 break-inside-avoid md:break-after-column">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/specfy"
                target="_blank"
                title="GitHub"
                className="text-gray-200 hover:text-gray-50 focus:text-gray-50"
                rel="noreferrer"
              >
                <IconBrandGithubFilled />
              </a>
            </div>
            <p className="text-sm">© 2023 Specfy, all rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
