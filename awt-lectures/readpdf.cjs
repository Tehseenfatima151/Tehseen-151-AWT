const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../Lecture 15 React API & Redux.pdf');

pdf(dataBuffer).then(function(data) {
  fs.writeFileSync('../lecture15.txt', data.text);
  console.log("Extraction complete.");
}).catch(console.error);
