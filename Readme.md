# ComplySense - E-Invoicing Readiness & Gap Analyzer

This is a full-stack web application built for the Complyance Fall 2025 Internship assignment. The tool allows users to upload a sample of their invoice data (in CSV or JSON format) to analyze its compliance against a mock GETS v0.1 standard. It provides a detailed report with scores and a list of compliance gaps.

---

## Live URLs

* **Frontend (Live Application):** [https://readiness-analyzer-hpe0r8by3-shrutis0405work-9205s-projects.vercel.app](https://readiness-analyzer-hpe0r8by3-shrutis0405work-9205s-projects.vercel.app)
* **Backend (Live API):** [https://complyance-assignment.onrender.com](https://complyance-assignment.onrender.com)

---

## Technology Stack

* **Backend:** Java 17, Spring Boot, Spring Data JPA, Maven
* **Frontend:** React, Next.js, TypeScript, Tailwind CSS
* **Database:** H2 (File-based)

---

## How to Run Locally

This is a monorepo containing both the backend and frontend projects.

### 1. Run the Backend (Port 8080)
1.  Navigate into the backend folder: `cd readiness-analyzer`
2.  Open the project in an IDE like IntelliJ IDEA.
3.  Run the `ReadinessAnalyzerApplication` class.
4.  The server will start on `http://localhost:8080`.

### 2. Run the Frontend (Port 3000)
1.  Open a new terminal.
2.  Navigate into the UI folder: `cd readiness-analyzer-ui`
3.  Install dependencies: `npm install` (or `pnpm install`)
4.  Start the development server: `npm run dev`
5.  Open your browser to `http://localhost:3000`.

---

## Configuration Details

### Database
* An H2 file-based database is used for persistence, as required by the P0 scope. The data is stored in the `data/analyzerDB.mv.db` file, ensuring report data survives application restarts.

### Scoring Weights
The overall readiness score is calculated as a weighted sum of four categories, as documented in the PRD:
* **Data (25%):** Score is 100 if rows are parsed, 0 otherwise.
* **Coverage (35%):** Based on the percentage of required GETS fields matched in the data.
* **Rules (30%):** Equally weighted score based on the pass/fail status of the 5 business rules.
* **Posture (10%):** Calculated from the 3-question questionnaire.