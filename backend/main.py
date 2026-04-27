from fastapi import FastAPI
import json
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class ResumeRequest(BaseModel):
    resume_text: str

SKILL_MAP = {
    "python": ["python"],
    "javascript": ["javascript", "js"],
    "react": ["react"],
    "node": ["node", "nodejs"],
    "sql": ["sql", "postgres", "postgresql", "mysql"],
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
    "linux": ["linux"]
}




def extract_skills_local(text):
    text = text.lower()
    found_skills = set()

    for skill, keywords in SKILL_MAP.items():
        for keyword in keywords:
            if keyword in text:
                found_skills.add(skill)

    return found_skills


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