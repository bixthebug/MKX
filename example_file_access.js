/**
 * Example: How to Let Gemini Access and Edit Files (Node.js)
 * 
 * This example demonstrates the correct way to enable Gemini to modify files.
 * The key insight: You don't give Gemini direct access - you act as the intermediary.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;
const path = require('path');

async function setupGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error(
            "Please set GEMINI_API_KEY environment variable.\n" +
            "Get your key at: https://makersuite.google.com/app/apikey"
        );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-pro" });
}

/**
 * Edit a file using Gemini AI.
 * 
 * This is the answer to "How do I let Gemini access/edit files?":
 * 1. YOU read the file
 * 2. YOU send content to Gemini
 * 3. YOU write Gemini's response back
 * 
 * @param {string} filepath - Path to file to edit
 * @param {string} instruction - What you want Gemini to do with the file
 */
async function editFileWithGemini(filepath, instruction) {
    const model = await setupGemini();
    
    // Step 1: YOU read the file
    console.log(`Reading ${filepath}...`);
    const content = await fs.readFile(filepath, 'utf-8');
    
    // Step 2: YOU send to Gemini (Gemini doesn't access the file directly)
    console.log(`Sending to Gemini with instruction: ${instruction}`);
    const prompt = `
You are editing the file: ${filepath}

Current content:
\`\`\`
${content}
\`\`\`

Task: ${instruction}

Please provide the complete updated file content. Return ONLY the file content, no explanations.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const updatedContent = response.text();
    
    // Step 3: YOU write the response back
    console.log(`Writing updated content to ${filepath}...`);
    await fs.writeFile(filepath, updatedContent);
    
    console.log("✓ File updated successfully!");
    return updatedContent;
}

// Example Usage
async function main() {
    const sampleFile = "sample.txt";
    
    // Create a sample file
    await fs.writeFile(sampleFile, "Hello world\nThis is a test file.\n");
    
    console.log("=".repeat(60));
    console.log("HOW TO LET GEMINI ACCESS AND EDIT FILES");
    console.log("=".repeat(60));
    console.log();
    console.log("The answer is simple:");
    console.log("1. YOU read the file in your code");
    console.log("2. YOU send the content to Gemini via API");
    console.log("3. YOU write Gemini's response back to the file");
    console.log();
    console.log("Gemini NEVER has direct file access. You control everything.");
    console.log("=".repeat(60));
    console.log();
    
    try {
        // Edit the file
        const result = await editFileWithGemini(
            sampleFile,
            "Add a friendly header and make the text more professional"
        );
        
        console.log();
        console.log("Updated content:");
        console.log("-".repeat(60));
        console.log(result);
        console.log("-".repeat(60));
        
    } catch (error) {
        if (error.message.includes('GEMINI_API_KEY')) {
            console.log(`Error: ${error.message}`);
            console.log();
            console.log("To run this example:");
            console.log("1. Get API key: https://makersuite.google.com/app/apikey");
            console.log("2. Set it: export GEMINI_API_KEY='your-key'");
            console.log("3. Install SDK: npm install @google/generative-ai");
            console.log("4. Run: node example_file_access.js");
        } else {
            console.log(`Error: ${error.message}`);
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = { editFileWithGemini };
