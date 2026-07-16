import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { prepareInterviewInstructions, evaluateAnswerInstructions, prepareCoverLetterInstructions, prepareTailoringInstructions } from "../../constants";
import MasterCoach from "~/components/MasterCoach";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv, ai } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
    const [coverLetterCopied, setCoverLetterCopied] = useState(false);
    const [tailoredResume, setTailoredResume] = useState<any>(null);
    const [isTailoring, setIsTailoring] = useState(false);
    const [tailoredCopied, setTailoredCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if (!resume) return;

            const data = JSON.parse(resume);
            setResumeData(data);
            if (data.interview) {
                setInterviewQuestions(data.interview);
            }
            if (data.coverLetter) {
                setCoverLetter(data.coverLetter);
            }
            if (data.tailoredResume) {
                setTailoredResume(data.tailoredResume);
            }

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({ resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    const handleGenerateInterview = async () => {
        if (!resumeData) return;
        setIsGeneratingInterview(true);

        try {
            const { companyName, jobTitle, jobDescription, resumePath } = resumeData;
            const instructions = prepareInterviewInstructions({ companyName, jobTitle, jobDescription });

            const response = await ai.generateInterview(resumePath, instructions);
            if (!response) {
                console.error("Failed to generate interview");
                setIsGeneratingInterview(false);
                return;
            }

            const responseText = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            const questions = JSON.parse(responseText.replace(/```json|```/g, "").trim());
            setInterviewQuestions(questions);

            // Save back to KV
            const updatedData = { ...resumeData, interview: questions };
            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
            setResumeData(updatedData);
        } catch (error) {
            console.error("Error generating interview:", error);
        } finally {
            setIsGeneratingInterview(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!resumeData) return;
        setIsGeneratingCoverLetter(true);
        setCoverLetter(null);
        setCoverLetterCopied(false);

        try {
            const { companyName, jobTitle, jobDescription, resumePath } = resumeData;
            const instructions = prepareCoverLetterInstructions({ companyName, jobTitle, jobDescription });

            const response = await ai.feedback(resumePath, instructions);
            if (!response) {
                console.error("Failed to generate cover letter");
                setIsGeneratingCoverLetter(false);
                return;
            }

            const responseText = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            setCoverLetter(responseText.trim());

            // Save to KV
            const updatedData = { ...resumeData, coverLetter: responseText.trim() };
            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
            setResumeData(updatedData);
        } catch (error) {
            console.error("Error generating cover letter:", error);
        } finally {
            setIsGeneratingCoverLetter(false);
        }
    };

    const handleCopyCoverLetter = () => {
        if (!coverLetter) return;
        navigator.clipboard.writeText(coverLetter);
        setCoverLetterCopied(true);
        setTimeout(() => setCoverLetterCopied(false), 2500);
    };

    const handleDownloadCoverLetter = () => {
        if (!coverLetter) return;
        const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = resumeData?.jobTitle ? `Cover_Letter_${resumeData.jobTitle.replace(/[^a-z0-9]/gi, '_')}.txt` : 'Cover_Letter.txt';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleAnswerChange = (idx: number, value: string) => {
        if (!interviewQuestions) return;
        const newQuestions = [...interviewQuestions];
        newQuestions[idx].userAnswer = value;
        setInterviewQuestions(newQuestions);
    };

    const handleSubmitAnswer = async (idx: number) => {
        if (!interviewQuestions) return;
        const questionData = interviewQuestions[idx];
        if (!questionData.userAnswer?.trim()) return;

        const newQuestions = [...interviewQuestions];
        newQuestions[idx].isEvaluating = true;
        setInterviewQuestions(newQuestions);

        try {
            const instructions = evaluateAnswerInstructions({
                question: questionData.question,
                hint: questionData.expectedAnswerHint,
                userAnswer: questionData.userAnswer
            });

            const response = await ai.chat(instructions);
            if (!response) throw new Error("No response from AI");

            const responseText = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            const evaluation = JSON.parse(responseText.replace(/```json|```/g, "").trim());

            newQuestions[idx].evaluation = evaluation;
            newQuestions[idx].isEvaluating = false;
            setInterviewQuestions(newQuestions);

            const updatedData = { ...resumeData, interview: newQuestions };
            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
            setResumeData(updatedData);

        } catch (error) {
            console.error("Evaluation failed:", error);
            const resetQuestions = [...interviewQuestions];
            resetQuestions[idx].isEvaluating = false;
            setInterviewQuestions(resetQuestions);
        }
    };

    const handleTailorResume = async () => {
        if (!resumeData || !feedback) return;
        setIsTailoring(true);

        try {
            const { jobTitle, jobDescription } = resumeData;

            const flawsList: string[] = [];

            // Include current scores so AI knows how far each category is from 95
            flawsList.push(`CURRENT SCORES (each must reach 95+):`);
            flawsList.push(`  ATS: ${feedback.ATS?.score || 0}/100`);
            flawsList.push(`  Tone & Style: ${feedback.toneAndStyle?.score || 0}/100`);
            flawsList.push(`  Content: ${feedback.content?.score || 0}/100`);
            flawsList.push(`  Structure: ${feedback.structure?.score || 0}/100`);
            flawsList.push(`  Skills: ${feedback.skills?.score || 0}/100`);
            flawsList.push(`  Overall: ${feedback.overallScore || 0}/100`);
            flawsList.push('');

            const addFlaws = (category: string, tips: any[]) => {
                const improves = tips.filter((t: any) => t.type === 'improve');
                const goods = tips.filter((t: any) => t.type === 'good');
                if (improves.length > 0 || goods.length > 0) {
                    flawsList.push(`${category}:`);
                    improves.forEach((t: any) => {
                        flawsList.push(`  [MUST FIX] ${t.tip}${t.explanation ? ': ' + t.explanation : ''}`);
                    });
                    goods.forEach((t: any) => {
                        flawsList.push(`  [KEEP] ${t.tip}${t.explanation ? ': ' + t.explanation : ''}`);
                    });
                }
            };

            addFlaws('ATS', feedback.ATS?.tips || []);
            addFlaws('Tone & Style', feedback.toneAndStyle?.tips || []);
            addFlaws('Content', feedback.content?.tips || []);
            addFlaws('Structure', feedback.structure?.tips || []);
            addFlaws('Skills', feedback.skills?.tips || []);

            const currentFeedback = flawsList.join('\n');

            const instructions = prepareTailoringInstructions({
                jobTitle,
                jobDescription,
                currentFeedback,
            });

            const response = await ai.feedback(resumeData.resumePath, instructions);
            if (!response) {
                console.error('Failed to tailor resume');
                setIsTailoring(false);
                return;
            }

            const responseText = typeof response.message.content === 'string'
                ? response.message.content
                : response.message.content[0].text;

            const tailoredData = JSON.parse(responseText.replace(/```json|```/g, '').trim());
            setTailoredResume(tailoredData);

            const updatedData = { ...resumeData, tailoredResume: tailoredData };
            await kv.set(`resume:${id}`, JSON.stringify(updatedData));
            setResumeData(updatedData);
        } catch (error) {
            console.error('Error tailoring resume:', error);
        } finally {
            setIsTailoring(false);
        }
    };

    const handleCopyTailored = () => {
        if (!tailoredResume) return;
        navigator.clipboard.writeText(JSON.stringify(tailoredResume, null, 2));
        setTailoredCopied(true);
        setTimeout(() => setTailoredCopied(false), 2500);
    };

    const handleDownloadTailoredPDF = () => {
        if (!tailoredResume) return;
        const w = window.open('', '_blank');
        if (!w) return;

        const escHtml = (s: string) => s?.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') || '';

        const expHtml = (tailoredResume.experience || []).map((exp: any) => `
            <div class="entry">
                <div class="entry-header">
                    <strong>${escHtml(exp.position)} | ${escHtml(exp.company)}</strong>
                    <span>${escHtml(exp.duration)}</span>
                </div>
                <div class="entry-sub">${escHtml(exp.location)}</div>
                <ul>${(exp.bullet_points || []).map((bp: string) => `<li>${escHtml(bp)}</li>`).join('')}</ul>
            </div>
        `).join('');

        const eduHtml = (tailoredResume.education || []).map((edu: any) => `
            <div class="entry">
                <div class="entry-header">
                    <strong>${escHtml(edu.institution)}</strong>
                    <span>${escHtml(edu.duration)}</span>
                </div>
                <div class="entry-sub">${escHtml(edu.degree)} | ${escHtml(edu.location)}</div>
            </div>
        `).join('');

        const projHtml = (tailoredResume.projects || []).length > 0 ? `
            <h2>PROJECTS</h2>
            ${tailoredResume.projects.map((p: any) => `
                <div class="entry">
                    <strong>${escHtml(p.name)}</strong>
                    <div class="entry-sub">${escHtml(p.description)}</div>
                    <ul>${(p.bullet_points || []).map((bp: string) => `<li>${escHtml(bp)}</li>`).join('')}</ul>
                </div>
            `).join('')}
        ` : '';

        const certHtml = (tailoredResume.certifications || []).length > 0 ? `
            <h2>CERTIFICATIONS</h2>
            <ul>${tailoredResume.certifications.map((c: string) => `<li>${escHtml(c)}</li>`).join('')}</ul>
        ` : '';

        const ci = tailoredResume.contact_info || {};
        const contactParts = [ci.email, ci.phone, ci.location, ci.linkedin, ci.portfolio].filter(Boolean).map(escHtml);

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escHtml(tailoredResume.full_name)} - Optimized Resume</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;line-height:1.45;color:#222;max-width:780px;margin:30px auto;padding:0 24px;font-size:13px}
  h1{font-size:22px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px}
  .contact{font-size:11px;color:#555;margin-bottom:16px;padding-bottom:10px;border-bottom:1.5px solid #222}
  .contact span{margin-right:12px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1.5px solid #222;padding-bottom:3px;margin:18px 0 8px}
  .summary{font-size:13px;margin-bottom:12px;color:#333}
  .entry{margin-bottom:10px}
  .entry-header{display:flex;justify-content:space-between;font-size:13px}
  .entry-sub{font-size:11px;color:#555;margin:1px 0 4px}
  ul{margin:3px 0 0;padding-left:18px}
  li{font-size:12px;margin-bottom:3px}
  .skills-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px}
  .skills-row div strong{display:block;margin-bottom:2px}
  .no-print{margin-top:40px;text-align:center}
  .no-print button{padding:10px 24px;background:#606beb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600}
  .no-print button:hover{background:#4957eb}
  .no-print p{font-size:11px;color:#888;margin-top:6px}
  @media print{.no-print{display:none}body{margin:0;padding:0}}
</style>
</head>
<body>
  <h1>${escHtml(tailoredResume.full_name)}</h1>
  <div class="contact">${contactParts.map(p => `<span>${p}</span>`).join('')}</div>

  <h2>PROFESSIONAL SUMMARY</h2>
  <div class="summary">${escHtml(tailoredResume.professional_summary)}</div>

  <h2>EXPERIENCE</h2>
  ${expHtml}

  <h2>SKILLS</h2>
  <div class="skills-row">
    <div><strong>Technical:</strong>${(tailoredResume.skills?.technical || []).map(escHtml).join(', ')}</div>
    <div><strong>Soft Skills:</strong>${(tailoredResume.skills?.soft || []).map(escHtml).join(', ')}</div>
  </div>

  <h2>EDUCATION</h2>
  ${eduHtml}

  ${projHtml}
  ${certHtml}

  <div class="no-print">
    <button onclick="window.print()">Save as PDF / Print</button>
    <p>Tip: In the print dialog, select "Save as PDF" as destination for a downloadable file.</p>
  </div>
</body>
</html>`;

        w.document.write(html);
        w.document.close();
    };

    const resumeContext = resumeData && feedback
        ? `Job Title: ${resumeData.jobTitle || "N/A"}
Company: ${resumeData.companyName || "N/A"}
Job Description: ${resumeData.jobDescription || "N/A"}
Overall Score: ${feedback.overallScore}/100
ATS Score: ${feedback.ATS?.score || "N/A"}/100
Tone & Style Score: ${feedback.toneAndStyle?.score || "N/A"}/100
Content Score: ${feedback.content?.score || "N/A"}/100
Structure Score: ${feedback.structure?.score || "N/A"}/100
Skills Score: ${feedback.skills?.score || "N/A"}/100
ATS Tips: ${(feedback.ATS?.tips || []).map((t: any) => `[${t.type}] ${t.tip}`).join("; ")}
Tone Tips: ${(feedback.toneAndStyle?.tips || []).map((t: any) => `[${t.type}] ${t.tip}: ${t.explanation || ""}`).join("; ")}
Content Tips: ${(feedback.content?.tips || []).map((t: any) => `[${t.type}] ${t.tip}: ${t.explanation || ""}`).join("; ")}
Structure Tips: ${(feedback.structure?.tips || []).map((t: any) => `[${t.type}] ${t.tip}: ${t.explanation || ""}`).join("; ")}
Skills Tips: ${(feedback.skills?.tips || []).map((t: any) => `[${t.type}] ${t.tip}: ${t.explanation || ""}`).join("; ")}`
        : "";

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />

                            {/* Cover Letter Generator */}
                            <hr className="my-8 border-gray-200" />
                            <div className="flex flex-col gap-4" id="cover-letter-section">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">✉️</span>
                                    <h3 className="text-2xl font-bold text-black">Cover Letter Generator</h3>
                                </div>
                                <p className="text-sm text-gray-500">Generate a tailored, persuasive cover letter that highlights exactly where your skills match this job.</p>

                                {!coverLetter && !isGeneratingCoverLetter && (
                                    <button
                                        onClick={handleGenerateCoverLetter}
                                        className="cover-letter-generate-btn w-fit mt-2"
                                        id="generate-cover-letter-btn"
                                    >
                                        <span className="cover-letter-btn-icon">✨</span>
                                        Generate Cover Letter for this Job
                                    </button>
                                )}

                                {isGeneratingCoverLetter && (
                                    <div className="cover-letter-loading">
                                        <div className="cover-letter-loading-bar" />
                                        <div className="cover-letter-loading-bar delay-1" />
                                        <div className="cover-letter-loading-bar delay-2" />
                                        <p className="text-sm text-gray-400 mt-4 animate-pulse">Crafting your cover letter with AI...</p>
                                    </div>
                                )}

                                {coverLetter && (
                                    <div className="cover-letter-card animate-in fade-in duration-700">
                                        <div className="cover-letter-card-header">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📄</span>
                                                <span className="font-semibold text-gray-800">Your Cover Letter</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCopyCoverLetter}
                                                    className="cover-letter-copy-btn"
                                                    id="copy-cover-letter-btn"
                                                >
                                                    {coverLetterCopied ? (
                                                        <><span>✅</span> Copied!</>
                                                    ) : (
                                                        <><span>📋</span> Copy to Clipboard</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleGenerateCoverLetter}
                                                    className="cover-letter-regen-btn"
                                                    id="regenerate-cover-letter-btn"
                                                    title="Regenerate"
                                                >
                                                    🔄 Regenerate
                                                </button>
                                                <button
                                                    onClick={handleDownloadCoverLetter}
                                                    className="cover-letter-copy-btn"
                                                    id="download-cover-letter-btn"
                                                >
                                                    ⬇️ Download
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cover-letter-body">
                                            {coverLetter.split('\n\n').map((paragraph, idx) => (
                                                <p key={idx} className="cover-letter-paragraph">{paragraph}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resume Tailoring Section */}
                            <hr className="my-8 border-gray-200" />
                            <div className="flex flex-col gap-4" id="tailoring-section">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🚀</span>
                                    <h3 className="text-2xl font-bold text-black">AI Resume Tailoring</h3>
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">95+ ATS Score</span>
                                </div>
                                <p className="text-sm text-gray-500">Automatically resolve every identified flaw and generate an ATS-optimized version of your resume tailored for this specific job role.</p>

                                {!tailoredResume && !isTailoring && (
                                    <button
                                        onClick={handleTailorResume}
                                        className="tailoring-generate-btn w-fit mt-2"
                                        id="tailor-resume-btn"
                                    >
                                        <span className="tailoring-btn-icon">✨</span>
                                        Tailor &amp; Resolve All Flaws
                                    </button>
                                )}

                                {isTailoring && (
                                    <div className="tailoring-loading">
                                        <div className="tailoring-loading-spinner" />
                                        <p className="text-sm text-gray-600 font-medium mt-4 animate-pulse">Optimizing your resume for a 95+ ATS score...</p>
                                        <p className="text-xs text-gray-400 mt-1">Resolving tone, structure, content, and keyword flaws...</p>
                                    </div>
                                )}

                                {tailoredResume && (
                                    <div className="tailoring-card animate-in fade-in duration-700">
                                        <div className="tailoring-card-header">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 text-lg">✅</span>
                                                <span className="font-bold text-gray-800">Optimized Resume Ready</span>
                                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">95+ TARGET</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button onClick={handleCopyTailored} className="cover-letter-copy-btn" id="copy-tailored-btn">
                                                    {tailoredCopied ? (<><span>✅</span> Copied!</>) : (<><span>📋</span> Copy JSON</>)}
                                                </button>
                                                <button onClick={handleTailorResume} className="cover-letter-regen-btn" id="retailor-btn">
                                                    🔄 Re-Tailor
                                                </button>
                                                <button onClick={handleDownloadTailoredPDF} className="tailoring-download-btn" id="download-tailored-btn">
                                                    📄 Download PDF
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 max-h-[520px] overflow-y-auto flex flex-col gap-5">
                                            {/* Professional Summary */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Professional Summary</h4>
                                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                                                    "{tailoredResume.professional_summary}"
                                                </p>
                                            </div>

                                            {/* Experience Preview */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Experience (Optimized)</h4>
                                                <div className="flex flex-col gap-3">
                                                    {tailoredResume.experience?.slice(0, 3).map((exp: any, i: number) => (
                                                        <div key={i} className="bg-white border border-gray-100 rounded-xl p-3">
                                                            <div className="flex justify-between items-start text-sm mb-1">
                                                                <span className="font-bold text-blue-700">{exp.position}</span>
                                                                <span className="text-gray-400 text-xs">{exp.company} · {exp.duration}</span>
                                                            </div>
                                                            <ul className="list-disc ml-4 text-xs text-gray-600 flex flex-col gap-0.5">
                                                                {exp.bullet_points?.slice(0, 3).map((bp: string, j: number) => (
                                                                    <li key={j}>{bp}</li>
                                                                ))}
                                                                {exp.bullet_points?.length > 3 && (
                                                                    <li className="text-gray-400 italic">+{exp.bullet_points.length - 3} more in PDF...</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Skills Preview */}
                                            {tailoredResume.skills && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Skills</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(tailoredResume.skills.technical || []).slice(0, 10).map((skill: string, i: number) => (
                                                            <span key={i} className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-blue-100">{skill}</span>
                                                        ))}
                                                        {(tailoredResume.skills.soft || []).slice(0, 5).map((skill: string, i: number) => (
                                                            <span key={`s-${i}`} className="bg-purple-50 text-purple-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-purple-100">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Improvement Summary */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                                <h4 className="font-bold text-blue-900 text-sm mb-2">🚀 What Was Improved</h4>
                                                <ul className="text-xs text-blue-800 flex flex-col gap-1.5">
                                                    <li className="flex gap-2"><span>✨</span><b>Tone & Style:</b> Replaced passive voice with high-impact action verbs</li>
                                                    <li className="flex gap-2"><span>📈</span><b>Metrics:</b> Added quantification to every achievement bullet</li>
                                                    <li className="flex gap-2"><span>🔑</span><b>Keywords:</b> Integrated job-specific keywords from the description</li>
                                                    <li className="flex gap-2"><span>📐</span><b>Structure:</b> Reorganized into ATS-standard section hierarchy</li>
                                                    <li className="flex gap-2"><span>🎯</span><b>Summary:</b> Tailored professional summary for this exact role</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="my-8 border-gray-200" />
                            <div className="flex flex-col gap-4">
                                <h3 className="text-2xl font-bold text-black">Mock Interview Simulator</h3>
                                <p className="text-sm text-gray-500">Generate personalized interview questions based on your resume and the target job description.</p>

                                {!interviewQuestions && (
                                    <button
                                        onClick={handleGenerateInterview}
                                        disabled={isGeneratingInterview}
                                        className="primary-button w-fit mt-2"
                                    >
                                        {isGeneratingInterview ? 'Generating Questions...' : 'Generate Mock Interview'}
                                    </button>
                                )}

                                {interviewQuestions && (
                                    <div className="flex flex-col gap-6 mt-4 pb-12">
                                        {interviewQuestions.map((q, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.type === 'technical' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {q.type.toUpperCase()}
                                                    </span>
                                                    <h4 className="font-bold text-lg text-black">Question {idx + 1}</h4>
                                                </div>
                                                <p className="font-medium text-gray-800 text-lg">{q.question}</p>

                                                {!q.evaluation && (
                                                    <div className="flex flex-col gap-3 mt-3">
                                                        <textarea
                                                            rows={4}
                                                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                                            placeholder="Type your answer here..."
                                                            value={q.userAnswer || ''}
                                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                            disabled={q.isEvaluating}
                                                        />
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl text-sm w-fit transition-all disabled:opacity-50"
                                                            onClick={() => handleSubmitAnswer(idx)}
                                                            disabled={q.isEvaluating || !q.userAnswer?.trim()}
                                                        >
                                                            {q.isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                                                        </button>
                                                    </div>
                                                )}

                                                {q.evaluation && (
                                                    <div className="flex flex-col gap-4 mt-2">
                                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                            <p className="text-sm font-semibold text-gray-500 mb-1">Your Answer:</p>
                                                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{q.userAnswer}</p>
                                                        </div>

                                                        <div className={`p-4 rounded-xl border ${q.evaluation.score >= 80 ? 'bg-green-50 border-green-200' : q.evaluation.score >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className={`flex items-center justify-center font-bold text-lg rounded-full w-12 h-12 ${q.evaluation.score >= 80 ? 'bg-green-100 text-green-700' : q.evaluation.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {q.evaluation.score}
                                                                </div>
                                                                <h4 className="font-bold text-lg text-black">AI Feedback</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-700 leading-relaxed">{q.evaluation.feedback}</p>
                                                        </div>

                                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                            <p className="text-sm font-semibold text-blue-800 mb-1">💡 Expected Answer Hint:</p>
                                                            <p className="text-sm text-blue-900 leading-relaxed">{q.expectedAnswerHint}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>

            {/* Master Career Coach Chatbot */}
            {feedback && <MasterCoach resumeContext={resumeContext} />}
        </main>
    )
}
export default Resume
