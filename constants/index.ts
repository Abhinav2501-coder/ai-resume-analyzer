export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({ jobTitle, jobDescription }: { jobTitle: string; jobDescription: string; }) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;

export const InterviewResponseFormat = `
    [
      {
        "question": "string",
        "type": "technical" | "behavioral",
        "expectedAnswerHint": "string"
      }
    ]
`;

export const prepareInterviewInstructions = ({ companyName, jobTitle, jobDescription }: { companyName: string, jobTitle: string; jobDescription: string; }) =>
    `You are an expert Hiring Manager and Technical Recruiter for ${companyName}.
      The candidate is applying for the role of: ${jobTitle}.
      The job description is: ${jobDescription}.
      
      Based on the candidate's resume and the job description, generate exactly 5-7 customized interview questions.
      Include a mix of hard technical questions and behavioral questions tailored entirely to their experience.
      
      Provide the feedback using the following JSON array format exactly:
      ${InterviewResponseFormat}
      
      Return ONLY the JSON array, without any backticks, markdown formatting, or conversational text.`;

export const EvaluateResponseFormat = `
{
  "score": 0,
  "feedback": "string"
}
`;

export const evaluateAnswerInstructions = ({ question, hint, userAnswer }: { question: string, hint: string, userAnswer: string }) =>
    `You are an expert Technical Interviewer.
      The candidate was asked the following question: "${question}".
      The ideal answer should cover these points: "${hint}".
      
      The candidate provided this answer:
      "${userAnswer}"
      
      Evaluate the candidate's answer based on the question and the expected hint.
      Provide a matching score from 0 to 100 representing how well their answer matches the expected criteria, and provide constructive feedback on what they did well and what they missed.
      
      Provide the evaluation using the following JSON format exactly:
      ${EvaluateResponseFormat}
      
      Return ONLY the JSON object, without any backticks, markdown formatting, or conversational text.`;

export const prepareCoverLetterInstructions = ({
    companyName,
    jobTitle,
    jobDescription,
}: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
}) =>
    `You are an expert career coach and professional copywriter.
The candidate is applying for the role of "${jobTitle}" at "${companyName}".

Job Description:
${jobDescription}

Based on the attached resume and the job description above, write a highly persuasive, customized 3-paragraph cover letter.

Rules:
1. Write exactly 3 paragraphs.
2. Paragraph 1: A strong opening expressing enthusiasm for the specific role and company, with a hook about why the candidate is a great fit.
3. Paragraph 2: The core pitch — focus EXACTLY on where the candidate's specific skills and past experiences match the job description's requirements. Use concrete examples from the resume.
4. Paragraph 3: A confident closing paragraph reaffirming their fit and a call to action for an interview.
5. Tone: Professional, confident, and persuasive.
6. Sign-off: End the letter with "Sincerely," followed by the candidate's ACTUAL real name extracted from the top of the attached resume. NEVER invent or make up a random name. If you absolutely cannot find a name, just write "Sincerely,". Do NOT use placeholders.
7. Output ONLY the cover letter text — no introductory remarks, no sign-off metadata, no markdown formatting.`;

export const TailoredResumeFormat = `
{
  "full_name": "string",
  "contact_info": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "professional_summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "duration": "string",
      "bullet_points": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "location": "string",
      "duration": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "bullet_points": ["string"]
    }
  ],
  "certifications": ["string"]
}`;

export const prepareTailoringInstructions = ({
    jobTitle,
    jobDescription,
    currentFeedback,
}: {
    jobTitle: string;
    jobDescription: string;
    currentFeedback: string;
}) =>
    `You are an elite ATS Resume Optimizer. Your ONLY goal is to rewrite the attached resume so that when re-analyzed by an ATS resume analyzer, it scores 95-100 in EVERY category.

The analyzer scores resumes on exactly these 5 categories (each out of 100):
1. ATS Score - keyword matching, standard formatting, parsability
2. Tone & Style Score - professional language, active voice, confidence, no filler
3. Content Score - achievements, quantified results, relevance to role
4. Structure Score - section hierarchy, order, completeness, readability
5. Skills Score - keyword coverage from JD, technical + soft skill balance

TARGET JOB ROLE: "${jobTitle}"

TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT FLAWS THE ANALYZER FOUND (you MUST fix ALL of these):
${currentFeedback}

============================
CATEGORY-SPECIFIC OPTIMIZATION RULES:
============================

▸ ATS OPTIMIZATION (target: 95-100):
- Extract EVERY technical keyword, tool, framework, methodology, and certification mentioned in the Job Description
- Integrate each keyword naturally into Experience bullet points, Skills section, or Professional Summary
- Use EXACT keyword matches (e.g., if JD says "React.js", write "React.js" not just "React")
- Use standard section headers ONLY: "Professional Summary", "Experience", "Education", "Skills", "Projects", "Certifications"
- No tables, columns, headers/footers, images, or special characters that break ATS parsers
- Spell out acronyms at least once (e.g., "Continuous Integration/Continuous Deployment (CI/CD)")

▸ TONE & STYLE OPTIMIZATION (target: 95-100):
- Start EVERY bullet point with a strong, unique action verb. Use a DIFFERENT verb for each bullet. Examples: Architected, Spearheaded, Orchestrated, Engineered, Accelerated, Streamlined, Pioneered, Championed, Delivered, Transformed, Elevated, Optimized
- Eliminate ALL passive voice ("was responsible for" → "Led", "was involved in" → "Drove")
- Remove ALL filler words: "various", "several", "helped", "assisted", "worked on", "responsible for", "involved in"
- Tone must be confident, direct, and results-oriented throughout
- Professional Summary must be authoritative and role-specific, not generic
- Eliminate first-person pronouns (no "I", "my", "me")

▸ CONTENT OPTIMIZATION (target: 95-100):
- EVERY bullet point must use the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
- Add specific metrics to EVERY achievement. If the original has no metrics, add realistic placeholders: "[Achieved X% improvement in Y]" or "[Reduced Z by X%, saving $Y annually]"
- Each experience entry must have 4-6 bullet points showing impact
- Professional Summary must directly address the target role requirements
- Content must demonstrate clear alignment between candidate's experience and the JD requirements
- Show progression and increasing responsibility across roles

▸ STRUCTURE OPTIMIZATION (target: 95-100):
- Section order MUST be: Professional Summary → Experience → Skills → Education → Projects → Certifications
- Experience entries must be in reverse chronological order
- Each experience entry must include: Position Title, Company Name, Location, Date Range, and 4-6 bullet points
- Education must include: Institution, Degree, Location, Graduation Date
- Skills must be split into "technical" and "soft" categories
- Every section must be present and populated (no empty sections)

▸ SKILLS OPTIMIZATION (target: 95-100):
- List EVERY technical skill mentioned in the Job Description that the candidate has evidence of
- Include programming languages, frameworks, tools, platforms, methodologies
- Add relevant soft skills demonstrated in their experience: Leadership, Communication, Problem-Solving, Collaboration, Project Management, etc.
- Skills must appear BOTH in the Skills section AND naturally within Experience bullet points
- Minimum 8-12 technical skills and 4-6 soft skills

============================
ABSOLUTE RULES:
============================
- DO NOT fabricate new jobs, companies, degrees, dates, or certifications
- DO NOT change the candidate's name, contact info, or factual employment history
- You CAN rephrase, restructure, reorder, and enhance the expression of existing facts
- You CAN add metric placeholders where real numbers don't exist
- You CAN infer and list skills that are clearly demonstrated in their experience even if unlisted
- EVERY "improve" flaw listed above MUST have a corresponding fix in your output

OUTPUT FORMAT:
Return the optimized resume as a strictly valid JSON object following this exact schema:
${TailoredResumeFormat}

Return ONLY the JSON object. No backticks, no markdown, no explanation, no conversation.`;

