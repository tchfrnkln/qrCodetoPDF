// URL of the PDF file
const pdfUrl = '../example.pdf';

// Initialize PDF.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.253/pdf.worker.min.js');

// Fetch the PDF document
const loadingTask = pdfjsLib.getDocument(pdfUrl);

// Array to store text content of all pages
let allText = [];

// Render PDF pages and extract text
loadingTask.promise.then(pdf => {
    // Get number of pages in the PDF
    const numPages = pdf.numPages;

    // Fetch text content from each page
    const pagePromises = [];
    for (let i = 1; i <= numPages; i++) {
        pagePromises.push(pdf.getPage(i));
    }

    // Resolve all page promises
    return Promise.all(pagePromises);
}).then(pages => {
    // Extract text from each page
    const textPromises = pages.map(page => {
        return page.getTextContent().then(textContent => {
            return textContent.items.map(item => item.str).join(' ');
        });
    });

    // Resolve all text promises
    return Promise.all(textPromises);
}).then(texts => {
    // Concatenate text content from all pages
    allText = texts.join('\n');

    // Write out the entire text content
    console.log(allText);
    // If you want to write to a file, you can use Node.js File System (fs) module or any suitable method.
}).catch(error => {
    console.error('Error loading or parsing PDF:', error);
});
