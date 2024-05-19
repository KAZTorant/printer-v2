// index.js
const express = require("express");
const fileUpload = require("express-fileupload");
const escpos = require("escpos");
const escposUSB = require("escpos-usb");

const app = express();
const port = process.env.PORT || 3000; // Read port from environment variable

// Initialize the express-fileupload middleware
app.use(fileUpload());


const replacements = {
  'Ü': 'U',
  'Ö': 'O',
  'Ğ': 'G',
  'I': 'I',
  'Ç': 'C',
  'Ş': 'S',
  'Ə': 'E',
  'ü': 'u',
  'ö': 'o',
  'ğ': 'g',
  'ı': 'i',
  'ç': 'c',
  'ş': 's',
  'ə': 'e'
};

// Function to replace symbols in the input string
function replaceSymbols(text) {
  return text.replace(/[ÜÖĞIÇŞƏüöğıçşə]/g, match => replacements[match] || match);
}

// API to accept and print text files
app.post("/print", (req, res) => {
  // Ensure a file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Extract the uploaded file
  const uploadedFile = req.files.textFile;

  // Check if the uploaded file is a text file
  if (uploadedFile.mimetype !== "text/plain") {
    return res.status(400).json({ error: "Invalid file format. Please upload a .txt file" });
  }

  // Convert the file content to a string in UTF-8 encoding
  const data = uploadedFile.data.toString("utf8");

  const dataModified = replaceSymbols(data);

  // Set up your thermal printer with USB connection
  const device = new escposUSB();
  const printer = new escpos.Printer(device);

  // Send the text to the printer using the configured encoding
  device.open((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not connect to printer" });
    }

    printer
      .font('b') // Use smaller font
      .align('lt') // Left-aligned
      .style('IU') // Normal style
      .text(dataModified)
      .cut()
      .close();
      
    res.json({ message: "Printing started successfully" });
  });
});

// API to accept and print text files line by line
app.post("/print-line-by-line", (req, res) => {
  // Ensure a file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Extract the uploaded file
  const uploadedFile = req.files.textFile;

  // Check if the uploaded file is a text file
  if (uploadedFile.mimetype !== "text/plain") {
    return res.status(400).json({ error: "Invalid file format. Please upload a .txt file" });
  }

  // Convert the file content to a string in UTF-8 encoding
  const data = uploadedFile.data.toString("utf8");

  const dataModified = replaceSymbols(data);
  const lines = dataModified.split('\n');

  // Set up your thermal printer with USB connection
  const device = new escposUSB();
  const printer = new escpos.Printer(device);
  
  // Send the text to the printer line by line with styling
  device.open((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not connect to printer" });
    }

    lines.forEach(line => {
      printer
        .font('a') // Use normal font for each line
        .align('lt') // Left-aligned for each line
        .style('normal') // Normal style for each line
        .text(line)
        .feed(1); // Add space after each line
    });

    printer
      .cut()
      .close();

    res.json({ message: "Printing line by line started successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
