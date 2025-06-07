import { WasteCategory } from './types';

export const APP_TITLE = "EcoSnap";
export const GEMINI_MODEL_VISION = "gemini-2.5-flash-preview-04-17";

export const DEFAULT_SUGGESTIONS = ["Please check with your local municipality for the most accurate disposal information."];

export const MOCK_RECYCLING_CENTERS = [
  { name: "City Central Recycling Hub", address: "123 Green Way, Eco City", types: [WasteCategory.PLASTIC, WasteCategory.PAPER, WasteCategory.GLASS, WasteCategory.METAL], lat: 34.0522, lon: -118.2437 },
  { name: "Suburb Waste Transfer Station", address: "456 Recycle Rd, Suburbia", types: [WasteCategory.GENERAL_WASTE, WasteCategory.ORGANIC, WasteCategory.METAL], lat: 34.0522, lon: -118.2437 },
  { name: "TechRecycle Inc.", address: "789 Circuit Board Ave, Tech Park", types: [WasteCategory.ELECTRONIC, WasteCategory.BATTERY], lat: 34.0522, lon: -118.2437 },
  { name: "Green Textile Recovery", address: "101 Fabric Ln, Weaver Ville", types: [WasteCategory.TEXTILE], lat: 34.0522, lon: -118.2437 },
];

export const WASTE_CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  [WasteCategory.PLASTIC]: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-500", icon: "fas fa-recycle" },
  [WasteCategory.PAPER]: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-500", icon: "fas fa-newspaper" },
  [WasteCategory.METAL]: { bg: "bg-gray-200", text: "text-gray-700", border: "border-gray-500", icon: "fas fa-cogs" },
  [WasteCategory.GLASS]: { bg: "bg-green-100", text: "text-green-700", border: "border-green-500", icon: "fas fa-wine-bottle" },
  [WasteCategory.ORGANIC]: { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-500", icon: "fas fa-leaf" },
  [WasteCategory.ELECTRONIC]: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-500", icon: "fas fa-microchip" },
  [WasteCategory.TEXTILE]: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-500", icon: "fas fa-tshirt" },
  [WasteCategory.BATTERY]: { bg: "bg-red-100", text: "text-red-700", border: "border-red-500", icon: "fas fa-battery-full" },
  [WasteCategory.GENERAL_WASTE]: { bg: "bg-slate-200", text: "text-slate-700", border: "border-slate-500", icon: "fas fa-trash-alt" },
  [WasteCategory.UNKNOWN]: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-500", icon: "fas fa-question-circle" },
  DEFAULT: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-400", icon: "fas fa-cube" },
};

export const getWasteCategoryStyle = (category: WasteCategory | string) => {
  return WASTE_CATEGORY_STYLES[category] || WASTE_CATEGORY_STYLES.DEFAULT;
};
