const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['health', 'food', 'water', 'shelter', 'other'], 
    default: 'other' 
  },
  severity: { type: Number, min: 1, max: 5, default: 3 },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  locationName: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
