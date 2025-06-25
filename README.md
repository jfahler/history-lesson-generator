# 📜 History Lesson Generator

The **History Lesson Generator** is a web application that transforms raw world history teaching standards into full-fledged lesson ideas. Powered by OpenAI, it extracts key topics, aligns content with College Board and state-level expectations, and provides multimedia-rich lesson plans, activities, assessments, and resources—all in one click.

---

## ✨ Features

- **Smart Standard Parsing**  
  Automatically cleans input standards, removes duplicates, and extracts relevant topics and historical terms.

- **AI-Powered Lesson Generation**  
  Uses GPT to generate 3 detailed lesson plans, each with learning objectives, activities, assessments, and primary sources.

- **Grade Level Detection**  
  Detects and adjusts content based on grade level (e.g., middle vs. high school).

- **Interactive Resource Tabs**  
  Tabs for `Overview`, `Lesson Plans`, and `Resources`, including:
  - JSTOR, Archive.org, and World History Encyclopedia search links
  - Multimedia from Heimler History, Smarthistory, and BBC History
  - AI-suggested custom links and resources

- **Friendly UI with Helpful Prompts**  
  Tips built into the UI help users write better standards to get better results.

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS  
- **Backend Client**: OpenAI integration via custom `generate.ts` module  
- **UI Library**: ShadCN + Lucide Icons  
- **Bundler**: Vite  
- **Package Manager**: Bun

---

## 🚀 Getting Started

### 1. Clone the repository


`git clone https://github.com/your-username/history-lesson-generator.git
cd history-lesson-generator`

2. Install dependencies
bash
Copy
Edit
bun install
3. Set up environment
Create a .env file and add your OpenAI API key:

env
Copy
Edit
OPENAI_API_KEY=your-key-here
4. Run the development server
bash
Copy
Edit
bun run dev
The app will be available at http://localhost:5173.

🧠 Folder Structure
bash
Copy
Edit
frontend/
├── components/
│   ├── LessonGenerator.tsx      # Main input + generation logic
│   └── LessonResults.tsx        # Tabbed results view with preview, lessons, and resources
├── client.ts                    # Backend call handler for OpenAI
├── generate.ts                  # Lesson generation logic
├── main.tsx                     # React entry point
├── index.html                   # App entry shell
├── index.css                    # Tailwind styles
├── tsconfig.json                # TypeScript config
└── package.json                 # Project dependencies
⚠️ Rate Limiting
If you encounter:

bash
Copy
Edit
Error: AI service rate limit exceeded
This means the OpenAI API is temporarily throttling requests. Wait a few seconds and try again.

📚 Tips for Writing Better Standards
Be specific: mention civilizations, events, or regions

Include grade level (e.g. "6th grade", "AP World")

Focus on key skills (compare, analyze, evaluate)

Add time periods or thematic frameworks

Example:

"Describe how the Mongol Empire expanded across Eurasia during the 13th century, and analyze its cultural and economic impacts on the Silk Roads."

🧑‍🏫 For Educators
This tool is designed with teachers in mind. Whether you're planning for AP World, middle school world cultures, or IB, this app helps you:

Save time

Discover new resources

Build engaging lessons around historical thinking skills

🧩 Future Ideas
User authentication & saved lessons

Grade-specific tuning for assessments

Custom activity pack builder

Multi-standard upload for batch generation

🤝 Contributing
Pull requests, feedback, and historical jokes are welcome.

🧠 Author
Built with ❤️ by Joshua Fahler
Portfolio • LinkedIn

📜 License
MIT

yaml
Copy
Edit


