import { WasteCategory, UserLocation } from '../types';
import { DEFAULT_SUGGESTIONS, MOCK_RECYCLING_CENTERS } from '../constants';

// Helper function to calculate distance (simplified Haversine)
const calculateDistance = (loc1: UserLocation, loc2: { lat: number, lon: number }): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const getDisposalSuggestions = async (
  category: WasteCategory | string,
  userLocation?: UserLocation
): Promise<string[]> => {
  let suggestions: string[] = [];

  const suggestionsDb: Partial<Record<WasteCategory | string, string[]>> = {
    [WasteCategory.PLASTIC]: ["Rinse and check local guidelines for plastic type (e.g., #1-7).", "Many supermarkets offer collection for soft plastics.", "Avoid putting plastic bags in curbside recycling unless specified."],
    [WasteCategory.PAPER]: ["Flatten cardboard boxes.", "Keep paper clean and dry.", "Remove plastic wrapping or windows from envelopes if possible.", "Shredded paper might need special handling (e.g., in a paper bag)."],
    [WasteCategory.METAL]: ["Clean food residue from cans.", "Empty and rinse aerosol cans if accepted.", "Be cautious with sharp metal objects."],
    [WasteCategory.GLASS]: ["Rinse bottles and jars.", "Check if lids should be on or off.", "Some areas separate glass by color."],
    [WasteCategory.ORGANIC]: ["Use a compost bin for fruit/vegetable scraps, coffee grounds, and yard waste.", "Check local rules for meat, dairy, or oily foods in compost.", "Some municipalities offer green bin programs."],
    [WasteCategory.ELECTRONIC]: ["E-waste (computers, phones, TVs) often requires special drop-off locations due to hazardous materials.", "Look for local e-waste recycling events or certified recyclers.", "Data security: wipe personal data before recycling devices."],
    [WasteCategory.TEXTILE]: ["Donate clean, usable clothing and textiles.", "Some areas have textile recycling bins for worn-out items.", "Consider repair or repurposing before disposal."],
    [WasteCategory.BATTERY]: ["Batteries (especially lithium-ion) are hazardous and should NOT go in regular trash or recycling.", "Find designated battery drop-off points (e.g., retail stores, municipal sites).", "Tape terminals of some battery types to prevent shorts."],
    [WasteCategory.GENERAL_WASTE]: ["Items that cannot be recycled or composted.", "Ensure waste is properly bagged.", "Check local restrictions on bulky items or hazardous household waste."],
    [WasteCategory.UNKNOWN]: ["Could not identify the waste type. Please ensure the image is clear or try a different item.", "Consult your local waste management authority for guidance."],
  };

  suggestions = suggestionsDb[category] || [...DEFAULT_SUGGESTIONS];
  
  if (category === WasteCategory.UNKNOWN) {
     return Promise.resolve(suggestions);
  }

  if (userLocation) {
    const relevantCenters = MOCK_RECYCLING_CENTERS.filter(center => 
      center.types.includes(category as WasteCategory)
    ).map(center => ({
      ...center,
      distance: calculateDistance(userLocation, center)
    })).sort((a,b) => a.distance - b.distance);

    if (relevantCenters.length > 0) {
      suggestions.push("Nearby facilities (mocked data):");
      relevantCenters.slice(0, 2).forEach(center => { // Show top 2
        suggestions.push(`- ${center.name} at ${center.address} (approx. ${center.distance.toFixed(1)} km away).`);
      });
    } else {
      suggestions.push("No specific partner facilities found nearby for this category via our mock database. Please check your municipal website for official local options.");
    }
  } else {
    suggestions.push("Enable location services for nearby facility suggestions.");
  }
  
  return Promise.resolve(suggestions);
};
