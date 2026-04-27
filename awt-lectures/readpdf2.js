import fs from 'fs';
import PDFParser from "pdf2json";

const pdfParser = new PDFParser(null, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("../lecture15.txt", pdfParser.getRawTextContent());
    console.log("Done");
});

pdfParser.loadPDF("../Lecture 15 React API & Redux.pdf");
