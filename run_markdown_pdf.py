import sys
from markdown_pdf import MarkdownPdf, Section

try:
    pdf = MarkdownPdf(toc_level=2)
    with open(r"c:\Users\dubey\Downloads\ai-resume-analyzer-main\ai-resume-analyzer-main\cover_letter_guide.md", "r", encoding="utf-8") as f:
        md_content = f.read()
    
    pdf.add_section(Section(md_content))
    pdf_path = r"C:\Users\dubey\Downloads\Cover_Letter_Implementation_Guide.pdf"
    pdf.save(pdf_path)
    print(f"PDF generated successfully at {pdf_path}")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
