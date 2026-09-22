/**
 * Store Location Defaults & Map Embed Helpers (Admin)
 */
export const LOCATION_DEFAULTS = {
  store_maps_url: "https://maps.app.goo.gl/EaQbHNijNE7EHgmFA?g_st=ic",
  store_maps_embed_url: "",
  store_address_km:
    "ផ្លូវចាក់សំរាម ស្ទឹងមានជ័យ, ភូមិដំណាក់ធំ, សង្កាត់ស្ទឹងមានជ័យទី២, ខណ្ឌមានជ័យ, រាជធានីភ្នំពេញ",
  store_address_en:
    "Stoeung Meanchey, Damnak Thum, Sangkat Stung Meanchey 2, Khan Meanchey, Phnom Penh, Cambodia",
  store_hours_km: "៨:០០ ព្រឹក - ៨:៣០ យប់ (រៀងរាល់ថ្ងៃ)",
  store_hours_en: "8:00 AM - 8:30 PM (Everyday)",
};

export const DEFAULT_MAP_PREVIEW =
  "https://www.openstreetmap.org/export/embed.html?bbox=104.884,11.533,104.897,11.544&layer=mapnik&marker=11.5385935,104.8904647";

/**
 * Safely extract embed URL if user pasted an entire <iframe src="..." ...> snippet
 */
export function extractMapEmbedUrl(raw) {
  if (!raw) return "";
  const str = String(raw).trim();
  if (!str) return "";
  const match = str.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }
  return str;
}
