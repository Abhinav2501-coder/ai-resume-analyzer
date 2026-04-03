import sys
from markdown_pdf import MarkdownPdf, Section

try:
    pdf = MarkdownPdf(toc_level=2)
    with open(r"C:\Users\dubey\.gemini\antigravity\brain\b37972b8-5c85-4c78-b624-2411d9dab7f9\walkthrough.md", "r", encoding="utf-8") as f:
        md_content = f.read()
    
    pdf.add_section(Section(md_content))
    pdf.save(r"C:\Users\dubey\.gemini\antigravity\brain\b37972b8-5c85-4c78-b624-2411d9dab7f9\walkthrough.pdf")
    print("PDF generated successfully.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
