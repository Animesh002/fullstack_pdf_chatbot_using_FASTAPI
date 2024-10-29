import fitz  # PyMuPDF

def extract_text_from_pdf(file_path):
    text = ""
    # Open the PDF file
    with fitz.open(file_path) as pdf:
        # Iterate through each page
        for page in pdf:
            text += page.get_text()  # Extract text from the page
    return text