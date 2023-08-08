import { useState } from 'react';

export const Waitlist: React.FC = () => {
  const [waitlistData, setWaitlistData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to submit Waitlist data
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    const data = {
      email,
      waitlist_id: 8888,
      referral_link: document.URL,
    };

    const res = await fetch('https://api.getwaitlist.com/api/v1/waiter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.status !== 200) {
      return;
    }

    const json = await res.json();
    setWaitlistData(json);
    setError(null);
    setEmail('');
  };

  return (
    <div className="flex w-full h-full">
      {!waitlistData ? (
        <form className="w-full flex" onSubmit={onSubmit} noValidate={true}>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            formNoValidate
            className="rounded-md w-2/4 border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <button
            disabled={loading}
            className="bg-[#242d3c] text-sm text-white px-4 py-2.5 rounded-lg mx-5 shadow-lg flex disabled:opacity-90 hover:opacity-95"
            type="submit"
          >
            {loading && (
              <svg
                aria-hidden="true"
                className="w-4 h-4 mr-2 text-gray-700 animate-spin dark:text-gray-300 fill-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            )}
            Join the waitlist
          </button>
          {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
        </form>
      ) : (
        <>
          <div className="px-3 py-2 text-sm">Thank you for signing up.</div>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setWaitlistData(null);
            }}
            className="bg-[#242d3c] text-sm text-white px-4 py-2.5 rounded-lg mx-5 shadow-lg"
          >
            Return to signup
          </button>
        </>
      )}
    </div>
  );
};
