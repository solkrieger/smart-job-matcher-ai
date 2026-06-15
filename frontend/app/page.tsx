"use client";

import { useCallback, useEffect, useState } from "react";

type Job = {
  title: string;
  description: string;
};

type MatchResult = Job & {
  score: number;
  match_skills: string[];
};

const API = "https://smart-job-matcher-ai.onrender.com";

const features = [
  {
    title: "Resume Intelligence",
    description: "Upload a PDF or paste resume text to quickly surface role-ready strengths.",
    icon: "📄",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    title: "AI Match Scores",
    description: "Compare candidates against open roles with clear, color-coded match levels.",
    icon: "🎯",
    accent: "from-violet-500 to-fuchsia-400",
  },
  {
    title: "Skill Highlights",
    description: "Spot matched skills instantly so recruiters can screen with confidence.",
    icon: "✨",
    accent: "from-emerald-500 to-teal-400",
  },
];

export default function Home() {
  const [resume, setResume] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const getMatchLevel = (score: number) => {
    if (score >= 3) {
      return {
        label: "Strong Match",
        color: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      };
    }

    if (score === 2) {
      return {
        label: "Medium Match",
        color: "bg-amber-100 text-amber-700 ring-amber-200",
      };
    }

    return {
      label: "Low Match",
      color: "bg-rose-100 text-rose-700 ring-rose-200",
    };
  };

  const fetchJobs = useCallback(async () => {
    const res = await fetch(`${API}/jobs`);
    const data: { jobs: Job[] } = await res.json();
    setJobs(data.jobs);
  }, []);

  useEffect(() => {
    // Fetch the initial role list from the API when the dashboard loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      let res;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        res = await fetch(`${API}/match-file`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${API}/match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume_text: resume }),
        });
      }

      const data: { results: MatchResult[] } = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleAddJob = async () => {
    if (!jobTitle || !jobDesc) return;

    await fetch(`${API}/add-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: jobTitle,
        description: jobDesc,
      }),
    });

    setJobTitle("");
    setJobDesc("");
    fetchJobs();
  };

  const handleDelete = async (index: number) => {
    await fetch(`${API}/delete-job/${index}`, {
      method: "DELETE",
    });

    fetchJobs();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <section className="relative px-6 py-10 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.28),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#eef6ff_44%,_#f8fafc_100%)]" />
        <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
          {/* Header */}
          <div className="mb-8 max-w-3xl text-center text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-blue-950/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              AI-powered recruiting workspace
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Smart Job Matcher
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Present a polished, recruiter-ready workflow for analyzing resumes,
              comparing candidates to jobs, and highlighting the skills that matter most.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mb-8 grid w-full gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-xl shadow-slate-900/10 backdrop-blur"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-xl shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h2 className="mb-2 text-lg font-semibold text-slate-950">
                  {feature.title}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Resume Card */}
              <div className="rounded-3xl border border-white bg-white/95 p-6 shadow-2xl shadow-slate-900/10">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Candidate review
                    </p>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Analyze Resume
                    </h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    PDF or text
                  </span>
                </div>

                <textarea
                  placeholder="Paste your resume..."
                  className="mb-4 h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />

                {/* Upload Box */}
                <label className="mb-4 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Upload Resume (PDF)
                  </span>

                  <div className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-5 text-center transition hover:border-blue-400 hover:bg-blue-100/70">
                    <span className="mb-1 text-sm font-semibold text-blue-700">
                      Click to upload or drag & drop
                    </span>
                    <span className="text-xs text-slate-500">
                      Keep screening documents organized and easy to review.
                    </span>

                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </label>

                {/* Show file */}
                {file && (
                  <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
                    Selected: {file.name}
                  </p>
                )}

                <button
                  onClick={handleAnalyze}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Analyze Candidate Fit"}
                </button>
              </div>

              {/* Results */}
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                      Match insights
                    </p>
                    <h2 className="text-2xl font-bold text-slate-950">Results</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {results.length} result{results.length === 1 ? "" : "s"}
                  </span>
                </div>

                {results.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Results will appear here after you analyze a resume.
                  </div>
                )}

                {results.map((job, i) => {
                  const level = getMatchLevel(job.score);

                  return (
                    <div
                      key={i}
                      className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-slate-950">{job.title}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${level.color}`}
                        >
                          {level.label}
                        </span>
                      </div>

                      <p className="mb-3 text-sm font-medium text-slate-500">
                        Score: <span className="text-slate-800">{job.score}</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {job.match_skills.map((s: string, j: number) => (
                          <span
                            key={j}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Add Job */}
              <div className="rounded-3xl border border-white bg-white/95 p-6 shadow-2xl shadow-slate-900/10">
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Role library
                </p>
                <h2 className="mb-5 text-2xl font-bold text-slate-950">Add Job</h2>

                <input
                  placeholder="Job Title"
                  className="mb-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />

                <textarea
                  placeholder="Job Description"
                  className="mb-4 h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />

                <button
                  onClick={handleAddJob}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-700 hover:to-teal-700"
                >
                  Add Job
                </button>
              </div>

              {/* Jobs List */}
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Open roles
                    </p>
                    <h2 className="text-2xl font-bold text-slate-950">Jobs</h2>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                    {jobs.length} active
                  </span>
                </div>

                <div className="space-y-3">
                  {jobs.map((job, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-950">{job.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                          {job.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(i)}
                        className="rounded-full px-3 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
