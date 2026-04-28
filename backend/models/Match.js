const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  areaLat: { type: Number, required: true },
  areaLng: { type: Number, required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['notified', 'accepted', 'declined'], default: 'notified' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Match', matchSchema);
