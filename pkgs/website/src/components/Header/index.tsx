import { Logo } from '../Logo';

export const Header: React.FC = () => {
  return (
    <header className="fixed bg-white inset-x-0 top-0 z-50 w-full md:bg-opacity-95 transition duration-300 ease-in-out">
      <div className="flex flex-col max-w-6xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
        <nav
          className="flex grow items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="xl:mr-16">
            <a href="/">
              <Logo />
            </a>
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
  );
};
