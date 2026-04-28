const { analyzeTrends } = require('./trend.service');

const generateRecommendations = async (insights) => {
  const trends = await analyzeTrends();
  
  return insights.map(insight => {
    const areaName = `Zone near [${parseFloat(insight.lat).toFixed(1)}, ${parseFloat(insight.lng).toFixed(1)}]`;
    const areaTrend = trends.find(t => t.area === areaName && t.category === insight.primaryNeed);
    
    let action = "Dispatch general assessment team";
    
    // Heuristic scaling based on severity
    const volunteersNeeded = Math.max(2, Math.ceil(insight.details.total_reports * (insight.avg_severity / 2)));
    
    if (insight.primaryNeed === 'health') {
      action = `Deploy ${volunteersNeeded} medical volunteers to ${areaName}`;
    } else if (insight.primaryNeed === 'water') {
      action = `Initiate water sanitation drive in ${areaName}`;
    } else if (insight.primaryNeed === 'food') {
      action = `Dispatch ${volunteersNeeded} food relief packages to ${areaName}`;
    } else if (insight.primaryNeed === 'shelter') {
      action = `Establish emergency shelter with ${volunteersNeeded * 5} capacity in ${areaName}`;
    }

    if (areaTrend && areaTrend.trend === 'increasing') {
      action = `URGENT: ${action} (Spike detected: ${areaTrend.change})`;
    }

    return {
      area: areaName,
      action
    };
  });
};

module.exports = { generateRecommendations };
