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
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Specfy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Next-gen documentation platform for engineers.
            </p>
            <p className="text-lg leading-8 text-gray-600">Coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
