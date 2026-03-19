import sys
from markdown_pdf import MarkdownPdf, Section

try:
    pdf = MarkdownPdf(toc_level=2)
    with open("AI_Resume_Analyzer_Benefits.md", "r", encoding="utf-8") as f:
        md_content = f.read()
    
    pdf.add_section(Section(md_content))
    pdf.save("AI_Resume_Analyzer_Benefits.pdf")
    print("PDF generated successfully.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
