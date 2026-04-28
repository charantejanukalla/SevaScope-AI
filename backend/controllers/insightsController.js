const Report = require('../models/Report');
const { analyzeTrends } = require('../services/trend.service');
const { generateExplanations } = require('../services/explanation.service');
const { generateRecommendations } = require('../services/recommendation.service');

const getClusterKey = (lat, lng) => {
  const roundedLat = parseFloat(lat).toFixed(2);
  const roundedLng = parseFloat(lng).toFixed(2);
  return `${roundedLat},${roundedLng}`;
};

const calculateInsights = async () => {
  const reports = await Report.find();
  const clusters = {};

  reports.forEach(report => {
    const key = getClusterKey(report.location.lat, report.location.lng);
    if (!clusters[key]) {
      clusters[key] = {
        lat: parseFloat(parseFloat(report.location.lat).toFixed(2)),
        lng: parseFloat(parseFloat(report.location.lng).toFixed(2)),
        health_count: 0,
        food_count: 0,
        water_count: 0,
        shelter_count: 0,
        other_count: 0,
        total_severity: 0,
        total_reports: 0
      };
    }
    
    const c = clusters[key];
    c.total_reports++;
    c.total_severity += report.severity;
    
    if (report.category === 'health') c.health_count++;
    else if (report.category === 'food') c.food_count++;
    else if (report.category === 'water') c.water_count++;
    else if (report.category === 'shelter') c.shelter_count++;
    else c.other_count++;
  });

  const insights = Object.keys(clusters).map(key => {
    const c = clusters[key];
    const avg_severity = c.total_severity / c.total_reports;
    
    const baseScore = (c.health_count * 0.5) + (c.food_count * 0.3) + (c.water_count * 0.2);
    let score = baseScore === 0 ? (c.total_reports * 0.1) * avg_severity : baseScore * avg_severity;
    
    let priorityLevel = 'LOW';
    if (score >= 5) priorityLevel = 'HIGH';
    else if (score >= 2) priorityLevel = 'MEDIUM';

    // Figure out the biggest need
    let primaryNeed = 'general aid';
    let maxCount = -1;
    ['health', 'food', 'water', 'shelter'].forEach(need => {
      if (c[`${need}_count`] > maxCount) {
        maxCount = c[`${need}_count`];
        primaryNeed = need;
      }
    });

    return {
      lat: c.lat,
      lng: c.lng,
      score: parseFloat(score.toFixed(2)),
      priorityLevel,
      primaryNeed,
      avg_severity,
      details: c
    };
  });

  return insights.sort((a, b) => b.score - a.score);
};

const getPriorityInsights = async (req, res) => {
  try {
    const insights = await calculateInsights();
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error fetching priority insights:', error);
    res.status(500).json({ error: 'Failed to fetch priority insights' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const insights = await calculateInsights();
    const recommendations = await generateRecommendations(insights);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

const getTrends = async (req, res) => {
  try {
    const trends = await analyzeTrends();
    res.status(200).json(trends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

const getExplanations = async (req, res) => {
  try {
    const insights = await calculateInsights();
    const explanations = await generateExplanations(insights);
    res.status(200).json(explanations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch explanations' });
  }
};

module.exports = { getPriorityInsights, getRecommendations, getTrends, getExplanations };
