const Report = require('../models/Report');

const getClusterKey = (lat, lng) => {
  return `Zone near [${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}]`;
};

const analyzeTrends = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const reports = await Report.find({ timestamp: { $gte: sevenDaysAgo } });

  const stats = {};

  reports.forEach(r => {
    const area = getClusterKey(r.location.lat, r.location.lng);
    const key = `${area}_${r.category}`;
    if (!stats[key]) {
      stats[key] = { area, category: r.category, last24h: 0, last7d: 0 };
    }
    stats[key].last7d++;
    if (r.timestamp >= oneDayAgo) {
      stats[key].last24h++;
    }
  });

  return Object.values(stats).map(stat => {
    // Basic daily average from the previous 6 days
    const avgDailyPastWeek = (stat.last7d - stat.last24h) / 6 || 0.1; 
    const changeRatio = stat.last24h / avgDailyPastWeek;
    
    let trend = "stable";
    let changePercentage = Math.round((changeRatio - 1) * 100);
    
    if (changeRatio > 1.2) trend = "increasing";
    else if (changeRatio < 0.8) trend = "decreasing";

    // Cap extreme percentages for small sample sizes
    if (changePercentage > 500) changePercentage = 500;

    return {
      area: stat.area,
      category: stat.category,
      change: `${changePercentage > 0 ? '+' : ''}${changePercentage}%`,
      trend
    };
  }).filter(t => t.area);
};

module.exports = { analyzeTrends };
