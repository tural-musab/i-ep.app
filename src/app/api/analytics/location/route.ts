/**
 * Anonymous Location Detection API for Demo Analytics
 * GDPR/KVKK compliant location detection using Vercel's geo headers
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/location
 * Get anonymous location data for demo analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Get geo information from Vercel's edge headers
    const country = request.geo?.country || request.headers.get('cf-ipcountry') || undefined;
    const region = request.geo?.region || undefined;
    const city = request.geo?.city || undefined;
    const timezone = request.headers.get('cf-timezone') || undefined;

    // Privacy-compliant location data (country level only)
    const locationData = {
      country: country || 'Unknown',
      region: region ? `${country}-${region}` : undefined,
      city: undefined, // Don't track city for privacy
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Add some useful but non-identifying data
      isEU: isEUCountry(country),
      continent: getContinent(country),
    };

    return NextResponse.json(locationData);

  } catch (error) {
    console.warn('Location detection error:', error);
    
    // Return minimal fallback data
    return NextResponse.json({
      country: 'Unknown',
      timezone: 'UTC',
      isEU: false,
      continent: 'Unknown',
    });
  }
}

/**
 * Check if country is in EU (for GDPR compliance)
 */
function isEUCountry(country?: string): boolean {
  if (!country) return false;
  
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  return euCountries.includes(country.toUpperCase());
}

/**
 * Get continent from country code
 */
function getContinent(country?: string): string {
  if (!country) return 'Unknown';
  
  const continentMap: Record<string, string> = {
    // Europe
    'AT': 'Europe', 'BE': 'Europe', 'BG': 'Europe', 'HR': 'Europe', 'CY': 'Europe',
    'CZ': 'Europe', 'DK': 'Europe', 'EE': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
    'DE': 'Europe', 'GR': 'Europe', 'HU': 'Europe', 'IE': 'Europe', 'IT': 'Europe',
    'LV': 'Europe', 'LT': 'Europe', 'LU': 'Europe', 'MT': 'Europe', 'NL': 'Europe',
    'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe', 'SK': 'Europe', 'SI': 'Europe',
    'ES': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'CH': 'Europe', 'GB': 'Europe',
    'TR': 'Europe', // Turkey is considered Europe for this purpose
    
    // Asia
    'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'IN': 'Asia', 'ID': 'Asia',
    'TH': 'Asia', 'VN': 'Asia', 'PH': 'Asia', 'MY': 'Asia', 'SG': 'Asia',
    'TW': 'Asia', 'HK': 'Asia', 'MO': 'Asia', 'MN': 'Asia', 'KH': 'Asia',
    'LA': 'Asia', 'MM': 'Asia', 'BN': 'Asia', 'BD': 'Asia', 'NP': 'Asia',
    'LK': 'Asia', 'MV': 'Asia', 'BT': 'Asia', 'PK': 'Asia', 'AF': 'Asia',
    'UZ': 'Asia', 'KZ': 'Asia', 'KG': 'Asia', 'TJ': 'Asia', 'TM': 'Asia',
    'AM': 'Asia', 'AZ': 'Asia', 'GE': 'Asia', 'IR': 'Asia', 'IQ': 'Asia',
    'SY': 'Asia', 'LB': 'Asia', 'JO': 'Asia', 'IL': 'Asia', 'PS': 'Asia',
    'SA': 'Asia', 'AE': 'Asia', 'OM': 'Asia', 'YE': 'Asia', 'QA': 'Asia',
    'BH': 'Asia', 'KW': 'Asia',
    
    // North America
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    'GT': 'North America', 'BZ': 'North America', 'SV': 'North America',
    'HN': 'North America', 'NI': 'North America', 'CR': 'North America',
    'PA': 'North America',
    
    // South America
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America',
    'PE': 'South America', 'CO': 'South America', 'VE': 'South America',
    'EC': 'South America', 'BO': 'South America', 'PY': 'South America',
    'UY': 'South America', 'GY': 'South America', 'SR': 'South America',
    'GF': 'South America',
    
    // Africa
    'EG': 'Africa', 'LY': 'Africa', 'SD': 'Africa', 'TN': 'Africa',
    'DZ': 'Africa', 'MA': 'Africa', 'ZA': 'Africa', 'NG': 'Africa',
    'KE': 'Africa', 'ET': 'Africa', 'UG': 'Africa', 'TZ': 'Africa',
    'GH': 'Africa', 'MZ': 'Africa', 'MG': 'Africa', 'CM': 'Africa',
    'CI': 'Africa', 'NE': 'Africa', 'BF': 'Africa', 'ML': 'Africa',
    'MW': 'Africa', 'ZM': 'Africa', 'SN': 'Africa', 'SO': 'Africa',
    'TD': 'Africa', 'SL': 'Africa', 'TG': 'Africa', 'LR': 'Africa',
    'LY': 'Africa', 'MR': 'Africa', 'GM': 'Africa', 'GW': 'Africa',
    'GQ': 'Africa', 'GA': 'Africa', 'ST': 'Africa', 'CV': 'Africa',
    
    // Oceania
    'AU': 'Oceania', 'NZ': 'Oceania', 'PG': 'Oceania', 'FJ': 'Oceania',
    'SB': 'Oceania', 'NC': 'Oceania', 'PF': 'Oceania', 'VU': 'Oceania',
    'WS': 'Oceania', 'KI': 'Oceania', 'TO': 'Oceania', 'MH': 'Oceania',
    'PW': 'Oceania', 'FM': 'Oceania', 'NR': 'Oceania', 'TV': 'Oceania',
  };
  
  return continentMap[country.toUpperCase()] || 'Unknown';
}