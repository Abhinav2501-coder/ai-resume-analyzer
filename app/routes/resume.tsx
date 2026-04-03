import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { prepareInterviewInstructions, evaluateAnswerInstructions } from "../../constants";
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
