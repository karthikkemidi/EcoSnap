export enum WasteCategory {
  PLASTIC = "PLASTIC",
  PAPER = "PAPER",
  METAL = "METAL",
  GLASS = "GLASS",
  ORGANIC = "ORGANIC",
  ELECTRONIC = "ELECTRONIC",
  TEXTILE = "TEXTILE",
  BATTERY = "BATTERY",
  GENERAL_WASTE = "GENERAL_WASTE",
  UNKNOWN = "UNKNOWN",
}

export interface Classification {
  id: string;
  imageUrl: string; // base64 data URL
  category: WasteCategory | string;
  confidence?: number;
  reasoning?: string;
  suggestions: string[];
  timestamp: number;
  userLocation?: { lat: number; lon: number };
}

export interface UserLocation {
  lat: number;
  lon: number;
}

// For Gemini response (if asking for structured JSON)
export interface GeminiWasteClassificationResponse {
  wasteType: WasteCategory | string;
  confidence?: number; // e.g. 0.85
  reasoning?: string; // Short explanation
}
