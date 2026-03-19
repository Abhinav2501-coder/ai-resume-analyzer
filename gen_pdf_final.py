import os
import subprocess

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_path = r"C:\Users\dubey\Downloads\ai-resume-analyzer-main\ai-resume-analyzer-main\presentation_guide.html"
pdf_path = r"C:\Users\dubey\Downloads\ai-resume-analyzer-main\ai-resume-analyzer-main\presentation_guide.pdf"

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
        print("Successfully generated PDF!")
    else:
        print(f"Error generating PDF: {result.stderr}")
except Exception as e:
    print(f"Failed to run Edge: {e}")
