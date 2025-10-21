"""
Example: How to Let Gemini Access and Edit Files

This example demonstrates the correct way to enable Gemini to modify files.
The key insight: You don't give Gemini direct access - you act as the intermediary.
"""

import google.generativeai as genai
import os
from pathlib import Path

def setup_gemini():
    """Configure Gemini API"""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError(
            "Please set GEMINI_API_KEY environment variable.\n"
            "Get your key at: https://makersuite.google.com/app/apikey"
        )
    
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-pro')

def edit_file_with_gemini(filepath, instruction):
    """
    Edit a file using Gemini AI.
    
    This is the answer to "How do I let Gemini access/edit files?":
    1. YOU read the file
    2. YOU send content to Gemini
    3. YOU write Gemini's response back
    
    Args:
        filepath: Path to file to edit
        instruction: What you want Gemini to do with the file
    """
    model = setup_gemini()
    
    # Step 1: YOU read the file
    print(f"Reading {filepath}...")
    content = Path(filepath).read_text()
    
    # Step 2: YOU send to Gemini (Gemini doesn't access the file directly)
    print(f"Sending to Gemini with instruction: {instruction}")
    prompt = f"""
You are editing the file: {filepath}

Current content:
```
{content}
```

Task: {instruction}

Please provide the complete updated file content. Return ONLY the file content, no explanations.
    """
    
    response = model.generate_content(prompt)
    
    # Step 3: YOU write the response back
    print(f"Writing updated content to {filepath}...")
    Path(filepath).write_text(response.text)
    
    print("✓ File updated successfully!")
    return response.text

# Example Usage
if __name__ == "__main__":
    # Create a sample file
    sample_file = "sample.txt"
    Path(sample_file).write_text("Hello world\nThis is a test file.\n")
    
    print("=" * 60)
    print("HOW TO LET GEMINI ACCESS AND EDIT FILES")
    print("=" * 60)
    print()
    print("The answer is simple:")
    print("1. YOU read the file in your code")
    print("2. YOU send the content to Gemini via API")
    print("3. YOU write Gemini's response back to the file")
    print()
    print("Gemini NEVER has direct file access. You control everything.")
    print("=" * 60)
    print()
    
    try:
        # Edit the file
        result = edit_file_with_gemini(
            sample_file,
            "Add a friendly header and make the text more professional"
        )
        
        print()
        print("Updated content:")
        print("-" * 60)
        print(result)
        print("-" * 60)
        
    except ValueError as e:
        print(f"Error: {e}")
        print()
        print("To run this example:")
        print("1. Get API key: https://makersuite.google.com/app/apikey")
        print("2. Set it: export GEMINI_API_KEY='your-key'")
        print("3. Install SDK: pip install google-generativeai")
        print("4. Run: python example_file_access.py")
    
    except Exception as e:
        print(f"Error: {e}")
