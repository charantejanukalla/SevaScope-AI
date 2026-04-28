const { analyzeTrends } = require('./trend.service');

const generateExplanations = async (insights) => {
  const trends = await analyzeTrends();
  
  return insights.map(insight => {
    const areaName = `Zone near [${parseFloat(insight.lat).toFixed(1)}, ${parseFloat(insight.lng).toFixed(1)}]`;
    
    const areaTrend = trends.find(t => t.area === areaName && t.category === insight.primaryNeed);
    const trendText = areaTrend ? `and an ${areaTrend.trend} trend (${areaTrend.change})` : `with a stable baseline`;
    
    return {
      area: areaName,
      priority: insight.priorityLevel,
      explanation: `${areaName} is critical due to ${insight.details.total_reports} recent reports averaging ${insight.avg_severity.toFixed(1)} severity in ${insight.primaryNeed}, ${trendText}.`
    };
  });
};

module.exports = { generateExplanations };
