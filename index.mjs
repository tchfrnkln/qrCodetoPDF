// Import required libraries
import fetch from 'node-fetch';
import { PDFDocument } from 'pdf-lib';
// import { PDFDocument } from 'pdfjs-dist/es5/build/pdf';

// URL of the PDF file
const pdfUrl = './example.pdf';

// Function to fetch and extract text from PDF
async function extractTextFromPDF(pdfUrl) {
    try {
        // Fetch the PDF file
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch PDF file');
        }

        // Read the PDF data
        const pdfData = await response.arrayBuffer();

        // Load the PDF document
        const pdfDocument = await PDFDocument.load(pdfData);

        // Extract text from each page
        let allText = '';
        const numPages = pdfDocument.getPageCount();
        for (let i = 0; i < numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => {
                allText += item.str + ' ';
            });
        }

        return allText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
}

// Call the function and log the extracted text
extractTextFromPDF(pdfUrl).then(text => {
    if (text) {
        console.log(text);
    }
});
