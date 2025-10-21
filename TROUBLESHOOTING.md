# Troubleshooting Guide

Common issues when working with Gemini and files.

## Setup Issues

### "ModuleNotFoundError: No module named 'google.generativeai'"

**Problem**: SDK not installed

**Solution**:
```bash
pip install google-generativeai
```

For Node.js:
```bash
npm install @google/generative-ai
```

### "API key not found"

**Problem**: API key not configured

**Solution**:
```bash
# Set environment variable
export GEMINI_API_KEY="your-api-key-here"

# Or in Python
import os
os.environ['GEMINI_API_KEY'] = "your-api-key"

# Or in Node.js
process.env.GEMINI_API_KEY = "your-api-key";
```

Get your API key: https://makersuite.google.com/app/apikey

### "Invalid API key"

**Problem**: Wrong or expired API key

**Solutions**:
1. Verify key at Google AI Studio
2. Generate a new key
3. Check for extra spaces/characters when copying
4. Ensure you're using the Gemini API key (not other Google API keys)

## File Access Issues

### "Gemini isn't seeing my file changes"

**Problem**: Misunderstanding how it works

**Solution**: Gemini doesn't see your files. You must:
1. Read the file again after changes
2. Send the new content to Gemini
3. Each interaction is independent

```python
# Wrong assumption: Gemini remembers file state
response1 = model.generate_content("Edit file.txt")
# Change file.txt externally
response2 = model.generate_content("What's in file.txt?")  # Won't know!

# Correct approach: Send current content each time
content = open('file.txt').read()
response = model.generate_content(f"Edit this: {content}")
```

### "FileNotFoundError: No such file or directory"

**Problem**: File path is incorrect

**Solutions**:
1. Use absolute paths:
   ```python
   import os
   filepath = os.path.abspath('myfile.txt')
   ```

2. Check current directory:
   ```python
   import os
   print(os.getcwd())  # Where am I?
   ```

3. Verify file exists:
   ```python
   import os
   if os.path.exists('myfile.txt'):
       content = open('myfile.txt').read()
   ```

### "PermissionError: [Errno 13] Permission denied"

**Problem**: No permission to read/write file

**Solutions**:
1. Check file permissions:
   ```bash
   ls -l myfile.txt
   chmod 644 myfile.txt  # Make readable/writable
   ```

2. Run with appropriate user permissions

3. On Windows, check file isn't locked by another program

### "UnicodeDecodeError"

**Problem**: File encoding issues

**Solution**: Specify encoding:
```python
# Instead of:
content = open('file.txt').read()

# Use:
content = open('file.txt', 'r', encoding='utf-8').read()

# For unknown encoding:
content = open('file.txt', 'r', encoding='utf-8', errors='ignore').read()
```

## API Issues

### "Rate limit exceeded"

**Problem**: Too many requests

**Solutions**:
1. Add delays between requests:
   ```python
   import time
   time.sleep(1)  # Wait 1 second
   ```

2. Implement exponential backoff:
   ```python
   import time
   from google.api_core import retry
   
   @retry.Retry(initial=1.0, maximum=60.0, multiplier=2.0)
   def call_gemini(prompt):
       return model.generate_content(prompt)
   ```

3. Upgrade your API quota

### "Request too large"

**Problem**: Sending too much content

**Solutions**:
1. Check token limits (Gemini Pro: ~30,000 tokens)
2. Summarize large files first:
   ```python
   if len(content) > 100000:  # ~100KB
       # Process in chunks or summarize
       content = content[:100000]  # Or implement chunking
   ```

3. Use file splitting for large documents

### "Safety settings blocked response"

**Problem**: Content triggered safety filters

**Solutions**:
1. Review content for policy violations
2. Adjust safety settings (not recommended for production):
   ```python
   from google.generativeai.types import HarmCategory, HarmBlockThreshold
   
   model = genai.GenerativeModel(
       'gemini-pro',
       safety_settings={
           HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
       }
   )
   ```

3. Rephrase prompts to be clearer

## Output Issues

### "Gemini's output has formatting I don't want"

**Problem**: Response includes markdown, explanations, etc.

**Solution**: Be explicit in prompt:
```python
prompt = f"""
Return ONLY the modified file content.
Do NOT include explanations, markdown code blocks, or any other text.
Just the raw content.

File content:
{content}
"""
```

### "Gemini didn't change what I asked"

**Problem**: Unclear instructions

**Solution**: Be specific:
```python
# Vague
"Improve this file"

# Specific
"Add a copyright header with year 2024, author name 'John Doe', and MIT license"
```

### "Output is truncated"

**Problem**: Response cut off

**Solutions**:
1. Check max_output_tokens:
   ```python
   response = model.generate_content(
       prompt,
       generation_config=genai.types.GenerationConfig(
           max_output_tokens=8192,
       )
   )
   ```

2. Ask for shorter output
3. Process file in smaller chunks

## Integration Issues

### "How do I process multiple files?"

**Solution**:
```python
import os
import google.generativeai as genai

genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel('gemini-pro')

for filename in os.listdir('my_folder'):
    if filename.endswith('.txt'):
        filepath = os.path.join('my_folder', filename)
        
        # Read
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Process
        response = model.generate_content(f"Add header to: {content}")
        
        # Write
        with open(filepath, 'w') as f:
            f.write(response.text)
        
        print(f"Processed {filename}")
```

### "How do I preserve file metadata?"

**Solution**:
```python
import os
import shutil

# Save metadata
stat_info = os.stat('file.txt')

# Modify file
content = open('file.txt').read()
response = model.generate_content(f"Edit: {content}")
open('file.txt', 'w').write(response.text)

# Restore timestamps
os.utime('file.txt', (stat_info.st_atime, stat_info.st_mtime))
```

### "How do I handle binary files?"

**Solution**: Use File API for images/media:
```python
# Upload file
uploaded_file = genai.upload_file('image.png')

# Process
model = genai.GenerativeModel('gemini-pro-vision')
response = model.generate_content([
    "Describe this image",
    uploaded_file
])
```

For other binary files, convert to text representation first.

## Still Having Issues?

1. **Check the examples**: [example_file_access.py](example_file_access.py)
2. **Read the FAQ**: [FAQ.md](FAQ.md)
3. **Review Gemini docs**: https://ai.google.dev/docs
4. **Check API status**: https://status.cloud.google.com/

## Debug Checklist

When something doesn't work:

- [ ] API key is set and valid
- [ ] SDK is installed (`pip list | grep google-generativeai`)
- [ ] File path is correct and file exists
- [ ] File has read/write permissions
- [ ] Content isn't too large (check token count)
- [ ] Prompt is clear and specific
- [ ] Not hitting rate limits
- [ ] Internet connection is working
- [ ] Latest SDK version (`pip install --upgrade google-generativeai`)

## Getting Help

If you're still stuck:

1. Check error message carefully
2. Search Gemini API documentation
3. Look for similar issues in GitHub repos
4. Ask on Stack Overflow with tag `google-gemini`
5. Review Google AI Studio documentation

Remember: The most common issue is misunderstanding that Gemini doesn't have direct file access. You always need to read files, send content, and write responses yourself.
