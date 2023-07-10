export default function Home() {
  return (
    <main className="relative isolate px-6 pt-14 lg:px-8">
      <div className="relative">
        <div className="mx-auto max-w-5xl py-32 sm:py-48 lg:py-56">
          <div className="max-w-3xl">
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                One click infrastructure documentation
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-800">
                Specfy extract metadata from all your organization repositories
                and build an exhaustive infrastructure documentation that helps
                Dev Ops and speed up Engineers onboarding
              </p>
              <div className="mt-10">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
