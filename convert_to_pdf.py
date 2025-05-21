import os
import subprocess
import sys
import platform

def check_pandoc_installed():
    """Check if Pandoc is installed"""
    try:
        subprocess.run(["pandoc", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False

def install_dependencies():
    """Install required Python packages"""
    print("Installing required Python packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "weasyprint"])
        return True
    except subprocess.SubprocessError:
        return False

def convert_with_pandoc():
    """Convert Markdown to PDF using Pandoc"""
    print("Converting with Pandoc...")
    try:
        cmd = ["pandoc", "Description of Design Patterns.md", "-o", "Description of Design Patterns.pdf"]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.SubprocessError as e:
        print(f"Pandoc conversion failed: {e}")
        return False

def convert_with_weasyprint():
    """Convert Markdown to PDF using WeasyPrint"""
    print("Converting with WeasyPrint...")
    try:
        import markdown
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration

        # Read the markdown file
        with open("Description of Design Patterns.md", "r", encoding="utf-8") as f:
            md_content = f.read()
        
        # Convert markdown to HTML
        html = markdown.markdown(md_content, extensions=['extra', 'codehilite'])
        
        # Add CSS for styling
        css = CSS(string='''
            body { font-family: Arial, sans-serif; margin: 2em; line-height: 1.6; }
            h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            h2 { color: #444; margin-top: 1.5em; }
            h3 { color: #555; }
            pre { background-color: #f5f5f5; padding: 1em; border-radius: 5px; overflow: auto; }
            code { background-color: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
            p { margin-bottom: 1em; }
            ul, ol { margin-bottom: 1em; }
            li { margin-bottom: 0.3em; }
        ''')
        
        # Complete HTML document
        full_html = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Description of Design Patterns</title>
        </head>
        <body>
            {html}
        </body>
        </html>
        '''
        
        # Generate PDF
        font_config = FontConfiguration()
        HTML(string=full_html).write_pdf(
            "Description of Design Patterns.pdf", 
            stylesheets=[css],
            font_config=font_config
        )
        return True
    except Exception as e:
        print(f"WeasyPrint conversion failed: {e}")
        return False

def main():
    """Main function to convert Markdown to PDF"""
    input_file = "Description of Design Patterns.md"
    output_file = "Description of Design Patterns.pdf"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return
    
    print(f"Converting {input_file} to {output_file}...")
    
    # Try with Pandoc first (better quality)
    if check_pandoc_installed():
        if convert_with_pandoc():
            print(f"Success! {output_file} created with Pandoc.")
            return
    else:
        print("Pandoc not found. You can install it from: https://pandoc.org/installing.html")
    
    # Fallback to WeasyPrint
    print("Attempting conversion with WeasyPrint...")
    if install_dependencies():
        if convert_with_weasyprint():
            print(f"Success! {output_file} created with WeasyPrint.")
            return
    
    print("All conversion methods failed. Please install Pandoc or check your Python environment.")

if __name__ == "__main__":
    main() 