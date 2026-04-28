const Volunteer = require('../models/Volunteer');
const { findAndNotifyVolunteers } = require('../services/volunteerService');

const createVolunteer = async (req, res) => {
  try {
    const { name, email, skills, lat, lng, availability } = req.body;
    
    if (!name || !email || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const v = new Volunteer({
      name,
      email,
      skills: skills || [],
      location: { type: 'Point', coordinates: [lng, lat] },
      availability: availability || 1,
      userId: req.user.userId
    });
    await v.save();
    res.status(201).json(v);
  } catch (err) {
    console.error('Error creating volunteer:', err);
    res.status(500).json({ error: 'Failed to create volunteer' });
  }
};

const triggerSyncForArea = async (req, res) => {
  try {
    const { lat, lng, avg_severity, primaryNeed, priorityLevel } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Coordinates missing' });
    }

    const assignedBy = req.user.userId;

    const top3 = await findAndNotifyVolunteers({ lat, lng, avg_severity, primaryNeed, priorityLevel }, assignedBy);
    res.status(200).json({ message: 'Sync complete. Volunteers notified.', matched: top3 });
  } catch (err) {
    console.error('Sync failed:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
};

module.exports = { createVolunteer, triggerSyncForArea };
