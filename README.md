# 📜 History Lesson Generator

The **History Lesson Generator** is a web application that transforms world history teaching standards into complete, standards-aligned lesson plans. It extracts key topics, generates rich lesson content using OpenAI, and provides a curated list of primary sources and multimedia resources—all designed for busy educators.

---

## ✨ Features

- **Smart Standard Parsing**  
  Cleans input standards and extracts historical keywords

- **AI-Powered Lesson Plans**  
  Each prompt generates 3 full lessons with:
  - Learning objectives
  - Detailed activities
  - Assessments
  - Primary source excerpts

- **Grade Level Awareness**  
  Adjusts tone and complexity based on grade level (e.g., 6th vs. AP)

- **Interactive UI with Tabs**  
  Navigate between:
  - `Overview`
  - `Lesson Plans`
  - `Resources`

- **Automated Search Links**  
  Built-in links to JSTOR, Archive.org, World History Encyclopedia, Heimler History, and Smarthistory

---

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Icons**: Lucide + ShadCN UI
- **State & API**: Local TypeScript backend calling OpenAI
- **Tooling**: Vite + Bun

---

## 🚀 Getting Started

1. Clone the repo:
    
        git clone https://github.com/your-username/history-lesson-generator.git
        cd history-lesson-generator

2. Install dependencies:

        bun install

3. Create a `.env` file and add your OpenAI key:

        OPENAI_API_KEY=your-key-here

4. Run the dev server:

        bun run dev

App will be live at `http://localhost:5173`

---

## 🧠 Project Structure

    frontend/
    ├── components/
    │   ├── LessonGenerator.tsx      # Input form and API logic
    │   └── LessonResults.tsx        # Tabbed display for overview, lessons, and resources
    ├── client.ts                    # API handler
    ├── generate.ts                  # Lesson generation + prompt formatting
    ├── main.tsx                     # App root
    ├── index.html                   # App shell
    ├── index.css                    # Tailwind styles
    ├── tsconfig.json                # TypeScript config
    └── package.json                 # Dependencies and scripts

---

## ❗ Common Errors

**Rate Limiting**

If you see:

    Error: AI service rate limit exceeded

It means OpenAI is throttling requests. Wait a moment, then try again.

---

## 🧑‍🏫 Educator Tips

Write better standards for better output:

- Mention specific civilizations, regions, or themes
- Include time periods (e.g., "13th century", "Post-Classical Era")
- Describe desired learning outcomes (e.g., "Compare trade networks...")

**Example Input:**

    Explain how the Silk Roads contributed to cultural diffusion during the 8th–14th centuries. Include trade goods, religions, and regional connections.

---

## 📌 Future Plans

- Save/export lessons to PDF
- Custom activity builder
- Editable objectives
- Teacher accounts

---

## 👤 Author

Built with ❤️ by Joshua Fahler  
[Website](https://jfahler.com) • [LinkedIn](https://linkedin.com/in/jfahler)

---

## 📄 License

MIT
