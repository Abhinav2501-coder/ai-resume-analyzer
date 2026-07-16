# 🚀 AI Resume Analyzer - Quick Reference Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   User's Browser (Frontend)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (Upload, Resume, Interview, Coach) │   │
│  │  ├── Navbar, FileUploader, Summary, ATS             │   │
│  │  ├── Details, MasterCoach                           │   │
│  │  └── Interview (future)                             │   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Zustand State Management                       │   │
│  │  (usePuterStore - handles all app state)            │   │
│  └──────────────────┬─────────────────────────────────┘   │
│                     ↓                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Puter.js SDK (Client Library)              │   │
│  └─────────┬──────────┬──────────┬──────────────────────┘   │
└────────────┼──────────┼──────────┼───────────────────────────┘
             │          │          │
    ┌────────▼──┐ ┌────▼────┐ ┌──▼────┐
    │Auth System│ │File Mgmt│ │ KV DB │
    └───────────┘ └─────────┘ └───────┘

             ↓ (All API calls via Puter Cloud)

    ┌─────────────────────────────────────┐
    │    Puter Cloud Backend              │
    │  - Authentication                   │
    │  - File Storage                     │
    │  - Key-Value Database               │
    └──────────────┬──────────────────────┘
                   ↓
    ┌─────────────────────────────────────┐
    │     Claude AI (via Puter)           │
    │  - Resume Analysis                  │
    │  - Interview Generation             │
    │  - Cover Letter Writing             │
    │  - Career Coaching                  │
    └─────────────────────────────────────┘
```

---

## Data Flow: Resume Upload to Analysis

```
1. USER INTERACTION
   ├─ Fill form (Company, Job Title, Job Description)
   ├─ Select PDF file
   └─ Click "Analyze"

2. FRONTEND PROCESSING (upload.tsx)
   ├─ Validate form inputs
   ├─ Read file from FileUploader
   └─ Call handleAnalyze()

3. FILE UPLOAD
   ├─ uploadedFile = await fs.upload([file])
   │  └─ Returns: { path: "~uploads/.../resume.pdf" }
   ├─ convertImageFile = await convertPdfToImage(file)
   │  └─ Returns: { file: Blob, ... }
   └─ uploadedImage = await fs.upload([imageFile.file])
      └─ Returns: { path: "~uploads/.../resume.png" }

4. METADATA PREPARATION
   ├─ uuid = generateUUID()
   ├─ data = {
   │    id: uuid,
   │    resumePath: uploadedFile.path,
   │    imagePath: uploadedImage.path,
   │    companyName, jobTitle, jobDescription,
   │    feedback: ''
   │  }
   └─ await kv.set(`resume:${uuid}`, JSON.stringify(data))

5. CLAUDE ANALYSIS
   ├─ instructions = prepareInstructions({ jobTitle, jobDescription })
   ├─ feedback = await ai.feedback(resumePath, instructions)
   │  └─ Claude processes the resume and returns JSON
   ├─ Parse response (remove markdown, parse JSON)
   └─ data.feedback = parsedFeedback

6. STORAGE & NAVIGATION
   ├─ await kv.set(`resume:${uuid}`, JSON.stringify(data))
   └─ navigate(`/resume/${uuid}`)

7. RESUME DISPLAY PAGE (resume.tsx)
   ├─ Resume = await kv.get(`resume:${id}`)
   ├─ Display Summary (overall score)
   ├─ Display ATS (ATS.tsx)
   ├─ Display Details (breakdown by category)
   ├─ Display MasterCoach (chatbot)
   └─ Display Interview (on demand)
```

---

## Claude Integration Points

### 1. Resume Analysis
**File:** `app/routes/upload.tsx`
```typescript
// Before calling Claude
const instructions = prepareInstructions({ jobTitle, jobDescription });

// Call Claude with resume
const feedback = await ai.feedback(
  uploadedFile.path,  // Path to resume PDF
  instructions        // Detailed analysis prompt
);

// Parse response
const feedbackText = typeof feedback.message.content === 'string'
  ? feedback.message.content
  : feedback.message.content[0].text;

const parsedFeedback = JSON.parse(
  feedbackText.replace(/```json|```/gi, "").trim()
);
```

### 2. Interview Questions
**File:** `app/routes/resume.tsx`
```typescript
const handleGenerateInterview = async () => {
  const instructions = prepareInterviewInstructions({
    companyName, jobTitle, jobDescription
  });
  
  const response = await ai.generateInterview(resumePath, instructions);
  const questions = JSON.parse(responseText.replace(/```json|```/g, "").trim());
  setInterviewQuestions(questions);
};
```

### 3. Cover Letter
**File:** `app/routes/resume.tsx`
```typescript
const handleGenerateCoverLetter = async () => {
  const instructions = prepareCoverLetterInstructions({
    companyName, jobTitle, jobDescription
  });
  
  const response = await ai.feedback(resumePath, instructions);
  setCoverLetter(responseText.trim());
};
```

### 4. Master Coach (Chat)
**File:** `app/components/MasterCoach.tsx`
```typescript
const sendMessage = async (text: string) => {
  const chatMessages: ChatMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n--- USER RESUME DATA ---\n${resumeContext}\n---`
    },
    ...messages.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: text }
  ];
  
  const response = await ai.chat(chatMessages);
};
```

---

## State Management with Zustand

**File:** `app/lib/puter.ts`

```typescript
interface PuterStore {
  // Loading states
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;

  // Authentication
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  };

  // File system
  fs: {
    upload: (files: File[]) => Promise<FSItem>;
    read: (path: string) => Promise<Blob>;
    delete: (path: string) => Promise<void>;
  };

  // Claude AI
  ai: {
    chat: (messages: ChatMessage[]) => Promise<AIResponse>;
    feedback: (path: string, message: string) => Promise<AIResponse>;
    generateInterview: (path: string, message: string) => Promise<AIResponse>;
    img2txt: (image: File | Blob) => Promise<string>;
  };

  // Key-Value Database
  kv: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    list: (pattern: string) => Promise<string[]>;
  };
}

// Usage in components
const { auth, fs, ai, kv } = usePuterStore();
```

---

## Data Models

### Resume
```typescript
interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;          // ~uploads/.../resume.png
  resumePath: string;         // ~uploads/.../resume.pdf
  feedback: Feedback;         // Claude's analysis
  interview?: InterviewQuestion[];
  coverLetter?: string;
}
```

### Feedback (Claude's Output)
```typescript
interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  content: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  structure: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
  skills: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string; }[];
  };
}
```

### InterviewQuestion
```typescript
interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral";
  expectedAnswerHint: string;
  userAnswer?: string;
  evaluation?: { score: number; feedback: string; };
  isEvaluating?: boolean;
}
```

---

## Component Structure

```
app/
├── root.tsx                 # App entry, layout
├── routes.ts                # Route definitions
├── routes/
│   ├── auth.tsx            # Login/signup
│   ├── home.tsx            # Landing page
│   ├── upload.tsx          # Resume upload & analysis
│   ├── resume.tsx          # Analysis results display
│   └── wipe.tsx            # Data deletion
├── components/
│   ├── Navbar.tsx          # Top navigation
│   ├── FileUploader.tsx    # File input
│   ├── Summary.tsx         # Overall score
│   ├── ScoreGauge.tsx      # Circular progress
│   ├── ScoreBadge.tsx      # Color indicator
│   ├── ATS.tsx             # ATS score & tips
│   ├── Details.tsx         # Category breakdown
│   ├── Accordion.tsx       # Expandable sections
│   ├── ResumeCard.tsx      # Resume preview
│   └── MasterCoach.tsx     # Chat interface
├── lib/
│   ├── puter.ts           # Zustand store setup
│   ├── pdf2img.ts         # PDF to image conversion
│   └── utils.ts           # Helper functions
└── types/
    ├── index.d.ts         # Main types
    └── puter.d.ts         # Puter SDK types
```

---

## Prompt Templates

### Resume Analysis Prompt
```typescript
`You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume and suggest how to improve it.
The rating can be low if the resume is bad.

The job title is: ${jobTitle}
The job description is: ${jobDescription}

Provide feedback using this JSON format:
{
  "overallScore": number,
  "ATS": { "score": number, "tips": [...] },
  "toneAndStyle": { "score": number, "tips": [...] },
  "content": { "score": number, "tips": [...] },
  "structure": { "score": number, "tips": [...] },
  "skills": { "score": number, "tips": [...] }
}

Return ONLY the JSON, no markdown.`
```

### Interview Questions Prompt
```typescript
`You are an expert Hiring Manager and Technical Recruiter for ${companyName}.
The candidate is applying for: ${jobTitle}
Job description: ${jobDescription}

Generate exactly 5-7 customized interview questions.
Include a mix of technical and behavioral questions.

Return JSON array format:
[
  {
    "question": "string",
    "type": "technical" | "behavioral",
    "expectedAnswerHint": "string"
  }
]

Return ONLY JSON, no markdown.`
```

### Cover Letter Prompt
```typescript
`You are an expert career coach and professional copywriter.
The candidate is applying for "${jobTitle}" at "${companyName}".

Write a 3-paragraph cover letter:
1. Strong opening expressing enthusiasm
2. Core pitch - match specific skills with job requirements
3. Confident closing with call to action

End with "Sincerely," followed by the REAL name from resume.

Output ONLY the letter text.`
```

### Master Coach Prompt
```typescript
`You are "CareerPath AI", a Senior Technical Recruiter and Career Mentor.

RULES:
1. Focus ONLY on resume improvement, career advice, courses, and project ideas
2. Name specific platforms (Coursera, Udemy, LinkedIn Learning)
3. Tailor projects to the resume's technologies
4. Format using sections: 📈 Resume Tweaks, 🎓 Learning, 🛠️ Projects
5. Provide actionable, bulleted suggestions
6. Be encouraging but honest
7. Use STAR method for resume improvements

Here's the user's resume data:
${resumeContext}`
```

---

## Common Workflows

### Login Flow
```
User clicks login → puter.auth.signIn() → 
  Puter handles OAuth → User authenticated → 
  usePuterStore updates auth state → 
  Components rendered based on auth → 
  Can now access protected routes
```

### Upload & Analyze Flow
```
User fills form & selects PDF →
  fs.upload(resumePDF) →
  convertPdfToImage(file) →
  fs.upload(imageFile) →
  kv.set(metadata) →
  ai.feedback(resumePath, instructions) →
  Parse JSON response →
  kv.set(feedback) →
  Navigate to resume page
```

### View Results Flow
```
User navigates to /resume/:id →
  kv.get(`resume:${id}`) →
  Load all data (paths, feedback) →
  fs.read(imagePath) → Display preview →
  Render Summary, ATS, Details components →
  Optional: Generate Interview or Cover Letter
```

---

## Testing & Debugging Tips

### Check Store State
```typescript
// In browser console
// Access Zustand store
const store = await usePuterStore();
console.log(store.auth);        // Check auth
console.log(store.puterReady);  // Check init
```

### Debug Claude Response
```typescript
// Print raw Claude response
console.log("Raw response:", feedback.message.content);

// Check after parsing
console.log("Parsed feedback:", parsedFeedback);

// Validate JSON
try {
  JSON.parse(responseText);
  console.log("✅ Valid JSON");
} catch (e) {
  console.log("❌ Invalid JSON:", e);
}
```

### Monitor KV Database
```typescript
// List all resume data
const allKeys = await kv.list("resume:*", true);
console.log("Stored resumes:", allKeys);

// Get specific resume
const resume = await kv.get(`resume:${id}`);
console.log(JSON.parse(resume));
```

---

## Performance Optimization Tips

1. **Image Conversion:**
   - Convert PDFs to images only for display
   - Keep original PDF for Claude analysis
   - Cache image URLs using React useMemo

2. **API Calls:**
   - Use React.memo to prevent unnecessary re-renders
   - Debounce rapid API calls
   - Show loading states to users

3. **Storage:**
   - Use KV database for structured data
   - File storage only for PDFs/images
   - Clean up old data periodically

4. **State Updates:**
   - Update Zustand store in batches
   - Use selective state subscriptions
   - Avoid re-rendering entire app on small changes

---

## Security Considerations

1. **Authentication:**
   - Use Puter's built-in auth system
   - Never store credentials in state
   - Clear auth on logout

2. **Data Privacy:**
   - Resumes stored in user's Puter account
   - User controls access
   - Files encrypted in transit

3. **API Validation:**
   - Validate Claude responses before parsing
   - Check JSON structure
   - Handle errors gracefully

---

## Environment Variables

```bash
# No API keys needed! Puter handles everything.
# Just ensure you have:
# - Internet connection
# - Puter.js loaded in HTML
# - User authenticated with Puter
```

---

## Resources

- **Project README:** [README.md](README.md)
- **Puter.js Docs:** https://puter.com/
- **Claude Capabilities:** https://www.anthropic.com/
- **React Doc:** https://react.dev/
- **React Router:** https://reactrouter.com/
- **Zustand:** https://github.com/pmndrs/zustand
- **Tailwind:** https://tailwindcss.com/

---

**Last Updated:** April 2026  
**Project:** AI Resume Analyzer  
**Creator:** Your Development Team
