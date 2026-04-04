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
