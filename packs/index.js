const PDFExtract = require('pdf.js-extract').PDFExtract;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

const pdfExtract = new PDFExtract();
const options = {};

const outputPath = 'output.pdf';

const path = require('path');

async function extractFromPdf(directoryPath) {
    const extractedDataMap = {};

    try {
        // Read all files in the directory
        const files = fs.readdirSync(directoryPath);

        // Filter only PDF files
        const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

        // Process each PDF file
        for (const pdfFile of pdfFiles) {
            const filePath = path.join(directoryPath, pdfFile);

            const data = await new Promise((resolve, reject) => {
                pdfExtract.extract(filePath, options, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            });

            // Extract serial numbers and store in the extractedDataMap
            data.pages.forEach(page => {
                const serialNumber = page.content[3].str;
                if (!extractedDataMap[serialNumber]) {
                    extractedDataMap[serialNumber] = [];
                }
                extractedDataMap[serialNumber].push({ filePath: filePath });
            });
        }
    } catch (error) {
        console.error('Error extracting data:', error);
    }

    // Filter out duplicate serial numbers
    const uniqueDataArray = [];
    for (const serialNumber in extractedDataMap) {
        if (extractedDataMap.hasOwnProperty(serialNumber)) {
            const files = extractedDataMap[serialNumber];
            uniqueDataArray.push({
                serialNumber: serialNumber,
                // files: files
            });
        }
    }

    return uniqueDataArray;
}



// const fs = require('fs');
// const PDFDocument = require('pdfkit');
// const QRCode = require('qrcode');

async function generatePDFWithTextsAndQR(textAndSerialObjects, outputPath) {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const qrWidth = 17.4; // Initial width of the QR code
    const qrHeight = 25.4; // Initial height of the QR code
    const textWidth = 17.4; // Initial width of the serial number
    const textHeight = 2; // Height of the serial number
    const textMargin = 0.5; // Margin between QR code and serial number
    const startX = 1.5; // Starting x-coordinate
    let startY = 0; // Starting y-coordinate
    const qrPerRow = 35; // Number of QR codes per row
    const qrPerColumn = 100; // Number of QR codes per column
    const spacingX = 0.01; // Spacing between QR codes horizontally
    const spacingY = 0.01; // Smallest possible space between rows

    // Load the PNG image file into a buffer
    const pngImageBuffer = fs.readFileSync('./layout.png');
    const pngImageBuffer2 = fs.readFileSync('./photo2.png');

    for (let i = 0; i < textAndSerialObjects.length; i++) {
        const { serialNumber } = textAndSerialObjects[i];
        const qrText = `https://app.kepawastetrack.ng/nylon-collection?serialNumber=${serialNumber}`;

        // Generate QR code for the text
        const qrImageBuffer = await QRCode.toBuffer(qrText);

        // Calculate the position of the current QR code and serial number
        const currentX = startX + (qrWidth + spacingX) * (i % qrPerRow);
        const currentY = (startY + (qrHeight + textMargin + textHeight + textMargin) * 0.00001);

        // Add the PNG image to the current position
        doc.image(pngImageBuffer, currentX, currentY, { width: qrWidth, height: qrHeight });
        doc.image(pngImageBuffer2, currentX, currentY, { width: qrWidth, height: qrHeight });

        // Add the QR code to the current position
        doc.image(qrImageBuffer, currentX + 5, currentY + 9, { width: qrWidth - 10, height: qrWidth - 10 });

        // Calculate the maximum font size that fits the width of the QR code
        const fontSize = 1.2;

        // Add the text to the current position with the calculated font size
        doc.fontSize(fontSize).text(serialNumber, currentX + 5 + ((qrWidth - 10) - textWidth) / 2, currentY + 1 + (qrHeight - 11) + textMargin, { align: 'center', width: textWidth, height: textHeight });

        // Move to the next position
        if ((i + 1) % qrPerRow === 0) {
            startY += qrHeight + spacingY + 2 * textMargin; // Increase startY for the next row
        }
    }

    doc.end();
    console.log(`PDF file with ${textAndSerialObjects.length} QR codes generated successfully at ${outputPath}`);
}

















async function main() {
    try {

    const directoryPath = '../pdf/TOCHUKWU';
    // const directoryPath = '../pdf';
    extractFromPdf(directoryPath)
    .then(dataArray => {
        console.log(dataArray);
          const chunkSize = 1050;
          for (let i = 0; i < dataArray.length; i += chunkSize) {
              const chunk = dataArray.slice(i, i + chunkSize);
              generatePDFWithTextsAndQR(chunk, `output${i}.pdf`);
          }
    })
    .catch(error => {
        console.error('Error extracting data:', error);
    });


    } catch (error) {
        console.error('Error:', error);
    }
}

main();
