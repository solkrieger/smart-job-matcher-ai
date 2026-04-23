from fastapi import FastAPI
import json

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Backend is working"}

@app.get("/jobs")
def get_jobs():
    with open("jobs.json", "r") as file:
        jobs = json.load(file)
    return {"jobs": jobs}