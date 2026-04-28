from fastapi import FastAPI, File, UploadFile
import json
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class ResumeRequest(BaseModel):
    resume_text: str

SKILL_MAP = {
    "python": ["python"],
    "javascript": ["javascript", "js"],
    "react": ["react"],
    "node": ["node", "nodejs"],
    "sql": ["sql",  "mysql"],
    "api": ["api", "apis", "rest", "restful"],
    "html": ["html"],
    "css": ["css"],
    "java": ["java"],
    "c++": ["c++"],
    "c#": ["c#", "csharp"],
    "aws": ["aws", "amazon web services"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "git": ["git"],
    "linux": ["linux"],
    "django": ["django"],
    "flask": ["flask"],
    "postgresql": ["postgresql", "postgres"],
    "sqlite": ["sqlite"],
    "github": ["github"],
    "oop": ["oop", "object oriented"],
}




def extract_skills_local(text):
    text = text.lower().replace("-", " ")  # 👈 ONLY CHANGE

    found = set()

    for skill, keywords in SKILL_MAP.items():
        for keyword in keywords:
            if keyword in text:
                found.add(skill)

    return found


def extract_skills_ai(text):
    try:
        prompt = f"""
        Extract technical skills from this text.
        Return ONLY a JSON array of lowercase skills.

        Text:
        {text}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )


        content = response.choices[0].message.content

        skills = json.loads(content)

        return set([s.lower() for s in skills])

    except Exception as e:
        print("AI failed, using fallback:", e)
        return extract_skills_local(text)


def match_score(resume_skills, job_desc):
    job_skills = extract_skills_local(job_desc)

    common = resume_skills.intersection(job_skills)

    return len(common), list(common)


def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text



@app.get("/")
def read_root():
    return {"message": "Backend is working"}


@app.get("/jobs")
def get_jobs():
    with open("jobs.json", "r") as file:
        jobs = json.load(file)
    return {"jobs": jobs}


@app.post("/match")
def match_jobs(request: ResumeRequest):
    with open("jobs.json", "r") as file:
        jobs = json.load(file)

    resume_skills = extract_skills_ai(request.resume_text)

    results = []

    for job in jobs:
        score, matches = match_score(
            resume_skills,
            job["description"]
        )

        results.append({
            "title": job["title"],
            "score": score,
            "match_skills": matches
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return {"results": results}


@app.post("/add-job")
def add_job(job: dict):
    with open("jobs.json", "r") as f:
        jobs = json.load(f)

    jobs.append(job)

    with open("jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)

    return {"message": "Job added"}


@app.get("/jobs")
def get_jobs():
    with open("jobs.json", "r") as f:
        jobs = json.load(f)

    return {"jobs": jobs}


@app.delete("/delete-job/{index}")
def delete_job(index: int):
    with open("jobs.json", "r") as f:
        jobs = json.load(f)

    if 0 <= index < len(jobs):
        jobs.pop(index)

    with open("jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)

    return {"message": "Deleted"}


@app.post("/match-file")
async def match_file(file: UploadFile = File(...)):
    text = extract_text_from_pdf(file.file)

    resume_skills = extract_skills_ai(text)

    with open("jobs.json", "r") as f:
        jobs = json.load(f)

    results = []

    for job in jobs:
        score, matches = match_score(
            resume_skills,
            job["description"]
        )

        results.append({
            "title": job["title"],
            "score": score,
            "match_skills": matches
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return {"results": results}