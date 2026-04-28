const Report = require('../models/Report');
const { analyzeReport } = require('../services/aiService');
const { getCoordinatesFromLocation } = require('../services/geocode.service');

const createReport = async (req, res) => {
  try {
    const { description, location, locationName } = req.body;

    let finalLocation = location;

    if ((!finalLocation || typeof finalLocation.lat !== 'number' || typeof finalLocation.lng !== 'number') && locationName) {
      const coords = await getCoordinatesFromLocation(locationName);
      if (coords) {
        finalLocation = coords;
      } else {
        // Fallback to default
        finalLocation = { lat: 20.5937, lng: 78.9629 };
      }
    }

    if (!description || !finalLocation || typeof finalLocation.lat !== 'number' || typeof finalLocation.lng !== 'number') {
      return res.status(400).json({ error: 'Description and either a valid location {lat, lng} or locationName are required.' });
    }

    const { category, severity } = await analyzeReport(description);

    const newReport = new Report({
      description,
      location: finalLocation,
      locationName: locationName || undefined,
      category,
      severity
    });

    await newReport.save();

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};
const getHeatmapData = async (req, res) => {
  try {
    const reports = await Report.find({}, 'location severity category timestamp -_id').lean();
    
    const heatmapReports = reports.map(r => ({
      latitude: r.location.lat,
      longitude: r.location.lng,
      severity: r.severity,
      category: r.category,
      timestamp: r.timestamp
    }));

    res.status(200).json(heatmapReports);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};

module.exports = { createReport, getReports, getHeatmapData };
