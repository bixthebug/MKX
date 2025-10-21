# Gemini File Access Guide

This guide explains how to grant Google's Gemini AI access to read and modify files in your project.

## Overview

To enable Gemini to access and edit files, you need to:
1. Use the Gemini API with the appropriate permissions
2. Provide file content through the API
3. Implement file write operations based on Gemini's responses

## Method 1: Using Gemini API with File Operations

### Python Example

```python
import google.generativeai as genai
import os

# Configure API
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Initialize model
model = genai.GenerativeModel('gemini-pro')

# Read file
def read_file(filepath):
    with open(filepath, 'r') as f:
        return f.read()

# Write file
def write_file(filepath, content):
    with open(filepath, 'w') as f:
        f.write(content)

# Grant Gemini "access" by sending file content
file_content = read_file('example.txt')

# Ask Gemini to modify the file
prompt = f"""
Here is the content of the file 'example.txt':

{file_content}

Please modify this file to add proper documentation.
Return ONLY the updated file content.
"""

response = model.generate_content(prompt)

# Write Gemini's response back to file
write_file('example.txt', response.text)
```

### Node.js Example

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;

// Initialize API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function modifyFileWithGemini(filepath) {
    // Read file
    const fileContent = await fs.readFile(filepath, 'utf-8');
    
    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Ask Gemini to modify
    const prompt = `
Here is the content of ${filepath}:

${fileContent}

Please improve this file and return the updated content.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const updatedContent = response.text();
    
    // Write back to file
    await fs.writeFile(filepath, updatedContent);
}

// Usage
modifyFileWithGemini('example.txt');
```

## Method 2: Using Function Calling (Recommended)

Function calling allows Gemini to explicitly request file operations:

### Python with Function Calling

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Define file operation functions
def read_file_function(filepath: str) -> str:
    """Read content from a file"""
    with open(filepath, 'r') as f:
        return f.read()

def write_file_function(filepath: str, content: str) -> str:
    """Write content to a file"""
    with open(filepath, 'w') as f:
        f.write(content)
    return f"Successfully wrote to {filepath}"

# Define function declarations for Gemini
file_functions = [
    {
        'name': 'read_file',
        'description': 'Read the contents of a file',
        'parameters': {
            'type': 'object',
            'properties': {
                'filepath': {
                    'type': 'string',
                    'description': 'Path to the file to read'
                }
            },
            'required': ['filepath']
        }
    },
    {
        'name': 'write_file',
        'description': 'Write content to a file',
        'parameters': {
            'type': 'object',
            'properties': {
                'filepath': {
                    'type': 'string',
                    'description': 'Path to the file to write'
                },
                'content': {
                    'type': 'string',
                    'description': 'Content to write to the file'
                }
            },
            'required': ['filepath', 'content']
        }
    }
]

# Create model with functions
model = genai.GenerativeModel(
    'gemini-pro',
    tools=file_functions
)

# Start chat with function calling
chat = model.start_chat()

response = chat.send_message("Please read example.txt and add a header")

# Handle function calls
for part in response.parts:
    if fn := part.function_call:
        if fn.name == 'read_file':
            result = read_file_function(fn.args['filepath'])
            response = chat.send_message(
                genai.protos.Content(
                    parts=[genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name='read_file',
                            response={'content': result}
                        )
                    )]
                )
            )
        elif fn.name == 'write_file':
            result = write_file_function(fn.args['filepath'], fn.args['content'])
            response = chat.send_message(
                genai.protos.Content(
                    parts=[genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name='write_file',
                            response={'result': result}
                        )
                    )]
                )
            )
```

## Method 3: Using File API (for image/media files)

For binary files or large media files:

```python
import google.generativeai as genai

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Upload file to Gemini
uploaded_file = genai.upload_file('path/to/image.png')

# Use in generation
model = genai.GenerativeModel('gemini-pro-vision')
response = model.generate_content([
    "Describe this image",
    uploaded_file
])

print(response.text)
```

## Security Best Practices

1. **Never hardcode API keys** - Use environment variables
2. **Validate file paths** - Prevent directory traversal attacks
3. **Sanitize Gemini output** - Don't blindly write responses to files
4. **Use allowlists** - Restrict which files can be accessed
5. **Implement logging** - Track all file operations

### Example with Security

```python
import os
import google.generativeai as genai
from pathlib import Path

# Allowed directories
ALLOWED_DIRS = ['/home/user/project/data', '/home/user/project/docs']

def is_path_allowed(filepath):
    """Check if file path is in allowed directories"""
    resolved = Path(filepath).resolve()
    return any(str(resolved).startswith(allowed) for allowed in ALLOWED_DIRS)

def safe_read_file(filepath):
    """Safely read file with permission check"""
    if not is_path_allowed(filepath):
        raise PermissionError(f"Access denied: {filepath}")
    
    with open(filepath, 'r') as f:
        return f.read()

def safe_write_file(filepath, content):
    """Safely write file with permission check"""
    if not is_path_allowed(filepath):
        raise PermissionError(f"Access denied: {filepath}")
    
    # Additional validation
    if len(content) > 10_000_000:  # 10MB limit
        raise ValueError("Content too large")
    
    with open(filepath, 'w') as f:
        f.write(content)
```

## Common Patterns

### Pattern 1: Interactive File Editor

```python
def interactive_file_editor():
    """Allow Gemini to interactively edit files"""
    model = genai.GenerativeModel('gemini-pro')
    chat = model.start_chat()
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            break
            
        response = chat.send_message(user_input)
        print(f"Gemini: {response.text}")
        
        # Check if Gemini wants to edit a file
        if "EDIT_FILE:" in response.text:
            # Parse file edit command
            lines = response.text.split('\n')
            for line in lines:
                if line.startswith('EDIT_FILE:'):
                    filepath = line.split(':')[1].strip()
                    # Continue conversation to get new content
                    content_response = chat.send_message(
                        f"Please provide the complete updated content for {filepath}"
                    )
                    write_file(filepath, content_response.text)
```

### Pattern 2: Batch File Processing

```python
def batch_process_files(file_list, instruction):
    """Process multiple files with same instruction"""
    model = genai.GenerativeModel('gemini-pro')
    
    for filepath in file_list:
        content = read_file(filepath)
        
        prompt = f"""
{instruction}

File: {filepath}
Content:
{content}

Return only the updated content.
        """
        
        response = model.generate_content(prompt)
        write_file(filepath, response.text)
        print(f"Processed: {filepath}")
```

## Troubleshooting

### Issue: API Key Not Working
- Verify your API key at https://makersuite.google.com/app/apikey
- Check environment variable is set: `echo $GEMINI_API_KEY`
- Ensure API is enabled in Google Cloud Console

### Issue: Rate Limiting
- Implement exponential backoff
- Use batch processing
- Consider upgrading API quota

### Issue: File Not Found
- Use absolute paths or verify working directory
- Check file permissions
- Ensure file exists before reading

### Issue: Encoding Errors
- Specify encoding: `open(file, 'r', encoding='utf-8')`
- Handle binary files separately
- Validate file type before processing

## Example: Complete Application

```python
import google.generativeai as genai
import os
from pathlib import Path

class GeminiFileEditor:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def edit_file(self, filepath, instruction):
        """Edit a file based on instruction"""
        # Read current content
        content = Path(filepath).read_text()
        
        # Ask Gemini to edit
        prompt = f"""
You have access to edit {filepath}.

Current content:
```
{content}
```

Instruction: {instruction}

Please provide the updated file content. Return ONLY the new file content, nothing else.
        """
        
        response = self.model.generate_content(prompt)
        
        # Write new content
        Path(filepath).write_text(response.text)
        
        return f"Successfully updated {filepath}"

# Usage
editor = GeminiFileEditor(os.environ.get('GEMINI_API_KEY'))
result = editor.edit_file('example.txt', 'Add a copyright header')
print(result)
```

## Resources

- [Google AI Python SDK](https://github.com/google/generative-ai-python)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)
- [Best Practices](https://ai.google.dev/docs/best_practices)
