"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [resume, setResume] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const getMatchLevel = (score: number) => {
    if (score >= 3) return { label: "Strong", color: "bg-green-100 text-green-700" };
    if (score === 2) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Weak", color: "bg-red-100 text-red-700" };
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await fetch("http://127.0.0.1:8000/jobs");
    const data = await res.json();
    setJobs(data.jobs);
  };

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      let res;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        res = await fetch("http://127.0.0.1:8000/match-file", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("http://127.0.0.1:8000/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume_text: resume }),
        });
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleAddJob = async () => {
    if (!jobTitle || !jobDesc) return;

    await fetch("http://127.0.0.1:8000/add-job", {
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
    await fetch(`http://127.0.0.1:8000/delete-job/${index}`, {
      method: "DELETE",
    });

    fetchJobs();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Smart Job Matcher</h1>
        <p className="text-gray-500 max-w-md">
          Upload your resume or paste text to match with jobs using AI
        </p>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* Resume Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-semibold mb-3">Analyze Resume</h2>

            <textarea
              placeholder="Paste your resume..."
              className="w-full h-32 border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />

            {/* Upload Box */}
            <label className="block mb-3">
              <span className="block mb-1 text-sm text-gray-600">
                Upload Resume (PDF)
              </span>

              <div className="flex items-center justify-center w-full border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
                <span className="text-sm text-gray-500">
                  Click to upload or drag & drop
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
              <p className="text-sm text-green-600 mb-3">
                Selected: {file.name}
              </p>
            )}

            <button
              onClick={handleAnalyze}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {/* Results */}
          <div>
            <h2 className="font-semibold mb-2">Results</h2>

            {results.length === 0 && (
              <p className="text-gray-400 text-sm">
                Results will appear here
              </p>
            )}

            {results.map((job, i) => {
              const level = getMatchLevel(job.score);

              return (
                <div key={i} className="bg-white p-5 rounded-xl border mb-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <span className={`text-xs px-3 py-1 rounded ${level.color}`}>
                      {level.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    Score: {job.score}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.match_skills.map((s: string, j: number) => (
                      <span key={j} className="bg-gray-100 px-2 py-1 rounded text-sm">
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="font-semibold mb-3">Add Job</h2>

            <input
              placeholder="Job Title"
              className="w-full border p-2 mb-3 rounded-lg"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <textarea
              placeholder="Job Description"
              className="w-full border p-2 mb-3 rounded-lg"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />

            <button
              onClick={handleAddJob}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Job
            </button>
          </div>

          {/* Jobs List */}
          <div>
            <h2 className="font-semibold mb-2">Jobs</h2>

            {jobs.map((job, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border mb-3 flex justify-between items-start shadow-sm"
              >
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(i)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}