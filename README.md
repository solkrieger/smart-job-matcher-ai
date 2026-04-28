Smart Job Matcher AI

AI-powered full-stack web application that analyzes resumes and matches them against job descriptions using intelligent scoring and skill extraction.

🚀 Live Demo

Frontend: https://smart-job-matcher-32cye3rkm-solkriegers-projects.vercel.app

Backend API: https://smart-job-matcher-ai.onrender.com

🧠 Features
Upload resume (PDF) or paste text
AI-powered job matching and scoring
Match levels (Strong / Medium / Weak)
Extract and display matching skills
Add and manage job descriptions
PDF parsing and file upload support
Fallback logic when AI is unavailable
🏗 Tech Stack

Frontend

Next.js (App Router)
React
Tailwind CSS

Backend

FastAPI
Python
OpenAI API

Other

PyPDF2 (PDF parsing)
REST API architecture
⚙️ How It Works
User uploads a resume or pastes text
Backend extracts and processes content
AI compares resume against job descriptions
System returns:
Match score
Matching skills
Ranked job results
📦 Local Setup
1. Clone the repository
git clone https://github.com/solkrieger/smart-job-matcher-ai.git
cd smart-job-matcher-ai
2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create .env file:

OPENAI_API_KEY=your_key_here

Run server:

uvicorn main:app --reload
3. Frontend setup
cd frontend
npm install
npm run dev
🌐 Deployment

Frontend

Deployed on Vercel

Backend

Deployed on Render
📁 Project Structure
smart-job-matcher/
│
├── backend/              # FastAPI server
│   ├── main.py
│   ├── jobs.json
│   └── requirements.txt
│
├── frontend/             # Next.js app
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
🔐 Notes
Backend may take a few seconds to wake up (free hosting)
API usage depends on your OpenAI key
CORS is currently open for development
💡 Future Improvements
User authentication
Saved resumes and job history
Improved AI scoring logic
UI/UX enhancements
Rate limiting and API protection
👤 Author

GitHub: https://github.com/solkrieger

⭐ Why This Project

This project demonstrates:

Full-stack development (frontend + backend)
AI API integration in a real application
File upload and PDF parsing
Deployment of a production-style app