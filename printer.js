// index.js
const express = require("express");
const fileUpload = require("express-fileupload");
const escpos = require("escpos");
const escposUSB = require("escpos-usb");

const app = express();
const port = 3000;

// Initialize the express-fileupload middleware
app.use(fileUpload());

// Set up your thermal printer with USB connection
const device = new escposUSB();
const printer = new escpos.Printer(device);

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

  const dataModified = replaceSymbols(data)
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
      .size(1,1)
      .cut()
      .close();
      
    res.json({ message: "Printing started successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
