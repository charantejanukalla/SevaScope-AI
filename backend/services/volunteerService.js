const Volunteer = require('../models/Volunteer');
const Match = require('../models/Match');
const nodemailer = require('nodemailer');
const { rerankVolunteers } = require('./aiService');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify()
  .then(() => console.log("SMTP server ready"))
  .catch(err => console.error("SMTP config error:", err.message));

const calculateScore = (urgency, skillMatch, proximityMeters, availability) => {
  const maxDist = 50000;
  const normalizedProximity = Math.max(0, 1 - (proximityMeters / maxDist));
  
  return (urgency * 0.4) + (skillMatch * 0.3) + (normalizedProximity * 0.2) + (availability * 0.1);
};

const findAndNotifyVolunteers = async (areaContext, assignedBy) => {
  const { lat, lng, avg_severity, primaryNeed, priorityLevel } = areaContext;
  
  const nearbyVolunteers = await Volunteer.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 50000
      }
    }
  });

  const scoredVolunteers = nearbyVolunteers.map(vol => {
    let skillMatch = 0;
    if (vol.skills && vol.skills.includes(primaryNeed)) {
      skillMatch = 1;
    } else if (vol.skills && vol.skills.length > 0) {
      skillMatch = 0.5;
    }

    const dx = lng - vol.location.coordinates[0];
    const dy = lat - vol.location.coordinates[1];
    const distanceEstimate = Math.sqrt(dx*dx + dy*dy) * 111000;
    
    const normalizedUrgency = avg_severity / 5;

    const score = calculateScore(normalizedUrgency, skillMatch, distanceEstimate, vol.availability);
    
    return { ...vol.toObject(), score };
  });

  scoredVolunteers.sort((a, b) => b.score - a.score);
  const top10 = scoredVolunteers.slice(0, 10);

  const reranked = await rerankVolunteers(top10, areaContext);

  const top3 = reranked.slice(0, 3);
  
  for (const vol of top3) {
    const match = new Match({
      areaLat: lat,
      areaLng: lng,
      volunteerId: vol._id,
      score: vol.score,
      assignedBy: assignedBy,
      status: 'notified'
    });
    await match.save();

    try {
      await transporter.sendMail({
        from: '"SevaScope AI" <no-reply@sevascope.ai>',
        to: vol.email,
        subject: `URGENT: Volunteer Assistance Required near you`,
        text: `High priority need for ${primaryNeed} at coordinates [${lat}, ${lng}]. Urgency: ${priorityLevel}.`
      });
    } catch (error) {
      console.error("Email sending failed:", error.message);
    }
  }

  return top3;
};

module.exports = { findAndNotifyVolunteers };
