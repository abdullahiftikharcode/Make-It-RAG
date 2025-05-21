@echo off
echo ===== Converting Markdown to PDF =====
echo.

python -c "import sys; sys.exit(0 if all(x in sys.modules or __import__(x) for x in ['markdown']) else 1)" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Installing required Python packages...
    pip install markdown
)

echo.
echo Checking for Pandoc...

where pandoc >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Found Pandoc. Converting with Pandoc...
    pandoc "Description of Design Patterns.md" -o "Description of Design Patterns.pdf" --pdf-engine=wkhtmltopdf
    if %ERRORLEVEL% EQU 0 (
        echo Conversion successful!
    ) else (
        echo Conversion with Pandoc failed. Trying Python script...
        python convert_to_pdf.py
    )
) else (
    echo Pandoc not found. Running Python conversion script...
    python convert_to_pdf.py
)

echo.
if exist "Description of Design Patterns.pdf" (
    echo Success! PDF file created.
    echo Location: "%CD%\Description of Design Patterns.pdf"
) else (
    echo Failed to create PDF. Please check error messages above.
)

echo.
echo Press any key to continue...
pause > nul 