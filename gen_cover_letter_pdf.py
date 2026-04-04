import os
import subprocess

html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>1-Click Cover Letter Generator - Implementation Guide</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
            background-color: #f9fafb;
        }
        h1 {
            color: #111827;
            font-size: 32px;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        h2 {
            color: #1f2937;
            margin-top: 40px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        h3 {
            color: #374151;
            margin-top: 30px;
        }
        p {
            font-size: 16px;
        }
        .diagram {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .box {
            background-color: #f3f4f6;
            border: 2px solid #9ca3af;
            border-radius: 8px;
            padding: 15px 25px;
            font-weight: bold;
            text-align: center;
            width: 250px;
        }
        .box.active {
            background-color: #ebf5ff;
            border-color: #3b82f6;
            color: #1d4ed8;
        }
        .box.data {
            background-color: #fdf4ff;
            border-color: #d946ef;
            color: #a21caf;
        }
        .arrow {
            color: #6b7280;
            font-size: 24px;
            font-weight: bold;
        }
        .code-block {
            background-color: #1f2937;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            overflow-x: auto;
            margin-top: 15px;
        }
        .feature-list {
            background-color: #ffffff;
            padding: 20px 40px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>

    <h1>📄 1-Click Cover Letter Generator<br><span style="font-size: 20px; font-weight: normal; color: #6b7280">Implementation Guide & Documentation</span></h1>

    <p>This document outlines the complete implementation of the <strong>1-Click Cover Letter Generator</strong> integrated into the AI Resume Analyzer application. It describes the architecture, data flow, and code integration strategies used to seamlessly build this feature.</p>

    <h2>1. System Architecture & Data Flow</h2>
    <p>The feature integrates entirely into the client-side React code and interfaces with the Puter.js AI and KV (Key-Value) systems. Wait times are reduced by relying on the previously extracted resume data and job description stored during the initial analysis phase.</p>

    <div class="diagram">
        <div class="box active">User Clicks "Generate Cover Letter"</div>
        <div class="arrow">↓</div>
        <div class="box data">Fetch Resume Context<br><span style="font-size: 12px; font-weight: normal">(Job Title, Company, Job Desc, PDF Path)</span></div>
        <div class="arrow">↓</div>
        <div class="box active">Call Puter.js AI (ai.feedback)<br><span style="font-size: 12px; font-weight: normal">+ Inject custom System Prompt</span></div>
        <div class="arrow">↓</div>
        <div class="box data">Receive Streamed/Formatted 3-Paragraph Text</div>
        <div class="arrow">↓</div>
        <div class="box active">Save to Puter KV Cache & Update UI</div>
    </div>

    <h2>2. Implementation Breakdown</h2>

    <h3>Step 1: The AI Instruction Prompt</h3>
    <p>Located in <code>constants/index.ts</code>, a specific instruction generator was created. It specifically asks the AI to act as a career coach, reading the PDF and the job description, and outputting exactly 3 paragraphs without Markdown or greeting artifacts.</p>

    <div class="code-block">
export const prepareCoverLetterInstructions = ({
    companyName,
    jobTitle,
    jobDescription,
}) => `You are an expert career coach and professional copywriter.
The candidate is applying for the role of "${jobTitle}" at "${companyName}".

Job Description:
${jobDescription}

Based on the attached resume and the job description, write a 
highly persuasive, customized 3-paragraph cover letter...`
    </div>

    <h3>Step 2: State Management & Component Logic</h3>
    <p>The <code>app/routes/resume.tsx</code> module was updated to handle the new generation lifecycle (idle, loading, completed, copied). The <code>puter.kv</code> store is leveraged to ensure that if a user reloads the page, their generated cover letter is immediately retrieved.</p>

    <ul class="feature-list">
        <li><b>State:</b> <code>coverLetter</code>, <code>isGeneratingCoverLetter</code>, <code>coverLetterCopied</code></li>
        <li><b>Persistence:</b> On success, updates the base dataset in <code>kv.set("resume:id", data)</code></li>
        <li><b>API Logic:</b> Leverages <code>ai.feedback(resumePath, instructions)</code> which sends the raw PDF blob to the Claude model along with the prompt.</li>
    </ul>

    <h3>Step 3: User Interface & Loading States</h3>
    <p>A completely customized CSS block was injected into <code>app.css</code> to ensure the feature feels premium and matches the "Dynamic Aesthetics" requirement.</p>
    
    <div class="diagram" style="flex-direction: row; flex-wrap: wrap; justify-content: center;">
        <div class="box" style="width: auto;">✨ Gradient Action Button</div>
        <div class="arrow">→</div>
        <div class="box" style="width: auto;">Animated Skeleton Loader</div>
        <div class="arrow">→</div>
        <div class="box" style="width: auto;">Glassmorphic Presentation Card</div>
    </div>

    <p>We use a custom CSS keyframe animation called <code>coverLetterShimmer</code> for the loading bar to keep the user engaged while the AI performs inference.</p>

    <h2>3. Conclusion</h2>
    <p>The feature perfectly marries previously implemented tech—Puter.js filesystem caching, KV stores, and Claude 4 AI Integration—to present a seamless "1-Click" experience. By enforcing a 3-paragraph rule in the prompt, the output remains professional, concise, and highly effective for modern job applications.</p>

</body>
</html>
"""

html_path = r"C:\Users\dubey\Downloads\ai-resume-analyzer-main\ai-resume-analyzer-main\cover_letter_implementation_guide.html"
pdf_path = r"C:\Users\dubey\Downloads\Cover_Letter_Implementation_Guide.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
command = [
    edge_path,
    "--headless",
    f"--print-to-pdf={pdf_path}",
    html_path
]

try:
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Successfully generated PDF at {pdf_path}")
    else:
        print(f"Error generating PDF: {result.stderr}")
except Exception as e:
    print(f"Failed to run Edge: {e}")
