const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const csvParser = require('csv-parser');
const Report = require('../models/Report');
const { extractStructuredData } = require('../services/aiService');
const { getCoordinatesFromLocation } = require('../services/geocode.service');

const ingestUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filePath = req.file.path;
    let recordsProcessed = 0;

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const text = data.text;

      if (!text || text.trim() === '') {
         fs.unlinkSync(filePath);
         return res.status(400).json({ error: 'No text extracted from PDF' });
      }

      const structured = await extractStructuredData(text);
      
      if (!structured.location && structured.locationName) {
        const coords = await getCoordinatesFromLocation(structured.locationName);
        if (coords) {
          structured.location = coords;
        } else {
          console.warn(`Geocoding failed for ${structured.locationName}, using default.`);
          structured.location = { lat: 20.5937, lng: 78.9629 };
        }
      } else if (!structured.location) {
        structured.location = { lat: 20.5937, lng: 78.9629 };
      }
      
      const newReport = new Report(structured);
      await newReport.save();
      recordsProcessed = 1;

    } else if (ext === '.csv') {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      const savedReports = [];
      for (const row of results) {
        const text = Object.values(row).join(' ');
        if (!text.trim()) continue;
        
        const structured = await extractStructuredData(text);
        
        if (!structured.location && structured.locationName) {
          const coords = await getCoordinatesFromLocation(structured.locationName);
          if (coords) {
            structured.location = coords;
          } else {
            console.warn(`Geocoding failed for ${structured.locationName}, using default.`);
            structured.location = { lat: 20.5937, lng: 78.9629 };
          }
        } else if (!structured.location) {
          structured.location = { lat: 20.5937, lng: 78.9629 };
        }
        
        const newReport = new Report(structured);
        const saved = await newReport.save();
        savedReports.push(saved);
      }

      recordsProcessed = savedReports.length;
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type. Use PDF or CSV.' });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({ 
      message: 'Ingestion successful', 
      recordsProcessed 
    });

  } catch (error) {
    console.error('Error during data ingestion:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process bulk data' });
  }
};

module.exports = { ingestUpload };
