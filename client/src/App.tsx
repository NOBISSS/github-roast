import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [githubData, setGithubData] = useState<any>(null);

  const handleRoast = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) return;

    setLoading(true);
    setError("");
    setGithubData(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/roast/${encodeURIComponent(trimmedUsername)}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong.");
      }

      setGithubData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch GitHub data.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090b] text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-600/10 blur-[120px]" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl">
            🔥
          </div>

          <span className="text-lg font-bold tracking-tight">
            GitHub<span className="text-orange-500">Roast</span>
          </span>
        </a>

        <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-400">
          NO SIGNUP REQUIRED
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          YOUR CODE IS SAFE. YOUR EGO ISN'T.
        </div>

        <h1 className="max-w-4xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-8xl">
          YOUR GITHUB
          <br />
          IS ABOUT TO GET
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
            COOKED.
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
          Your repositories. Your commits. Your questionable coding habits.
          Give us your GitHub username, and let AI do what your code reviewers
          are too polite to do.
        </p>

        {/* Username form */}
        <form
          onSubmit={handleRoast}
          className="mt-10 flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/30 sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-zinc-500"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.163 6.839 9.489.5.092.682-.217.682-.48 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.646.35-1.088.636-1.339-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.684-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.824a9.55 9.55 0 0 1 2.504.336c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.203 2.394.1 2.647.64.7 1.028 1.593 1.028 2.684 0 3.842-2.339 4.687-4.566 4.935.36.31.68.923.68 1.86 0 1.343-.012 2.425-.012 2.756 0 .266.18.577.688.479A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z"
              />
            </svg>

            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter GitHub username..."
              aria-label="GitHub username"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600 sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || loading}
            className="rounded-xl bg-orange-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 sm:py-3"
          >
            {loading ? "🔥 Fetching..." : "🔥 Roast Me"}
          </button>
        </form>
        {error && (
          <div
            role="alert"
            className="mt-6 w-full max-w-xl rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {githubData && (
          <div className="mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left">
            <div className="flex items-center gap-4">
              <img
                src={githubData.profile.avatar_url}
                alt={`${githubData.profile.login}'s avatar`}
                className="h-16 w-16 rounded-full border border-white/10"
              />

              <div>
                <h2 className="text-xl font-bold">
                  {githubData.profile.name || githubData.profile.login}
                </h2>

                <a
                  href={githubData.profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  @{githubData.profile.login}
                </a>

                <p className="mt-1 text-sm text-zinc-400">
                  {githubData.profile.bio || "No bio. Mysterious developer. 💀"}
                </p>
              </div>
            </div>
            {githubData.roast && (
              <div className="mt-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">💀</span>

                  <div>
                    <h3 className="text-lg font-black text-orange-400">
                      YOUR GITHUB ROAST
                    </h3>

                    <p className="text-xs text-zinc-500">
                      You asked for it. Don't blame us.
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-zinc-200
                prose-headings:font-bold
                prose-headings:text-orange-400
                prose-strong:text-orange-300
                prose-a:text-orange-400
                prose-li:marker:text-orange-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {githubData.roast}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-sm text-zinc-500">Public Repositories</p>
                <p className="mt-2 text-2xl font-bold">
                  {githubData.profile.public_repos}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.04] p-4">
                <p className="text-sm text-zinc-500">Followers</p>
                <p className="mt-2 text-2xl font-bold">
                  {githubData.profile.followers}
                </p>
              </div>
            </div>

            <h3 className="mt-6 mb-3 font-bold">Recently Updated Repositories</h3>

            <div className="space-y-3">
              {githubData.repositories.map((repo: any) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-white/[0.08] p-4 transition hover:border-orange-500/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{repo.name}</span>

                    <span className="shrink-0 text-xs text-zinc-500">
                      ⭐ {repo.stargazers_count}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                    {repo.description || "No repository description."}
                  </p>

                  {repo.language && (
                    <span className="mt-3 inline-block text-xs text-orange-300">
                      {repo.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-600">
          No account needed. Just a public GitHub username.
        </p>

        {/* Feature cards */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            emoji="📂"
            title="Your Repos"
            description="We'll inspect your public projects."
          />

          <FeatureCard
            emoji="📊"
            title="Your Activity"
            description="We'll examine available public activity."
          />

          <FeatureCard
            emoji="💀"
            title="Your Roast"
            description="We'll turn the findings into comedy."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-600">
        Built for developers who can handle the truth. 🔥
      </footer>
    </main>
  );
}

type FeatureCardProps = {
  emoji: string;
  title: string;
  description: string;
};

function FeatureCard({ emoji, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition hover:border-orange-500/30 hover:bg-white/[0.04]">
      <div className="mb-4 text-2xl">{emoji}</div>

      <h2 className="mb-2 text-sm font-bold text-zinc-100">{title}</h2>

      <p className="text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

export default App;
