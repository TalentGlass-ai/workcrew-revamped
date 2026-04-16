import NodeGeocoder from 'node-geocoder'

const geocoder = NodeGeocoder({
  provider: 'openstreetmap', // Free alternative to Google Maps
  // You can also use 'google' with API key for better accuracy
  // apiKey: process.env.GOOGLE_MAPS_API_KEY,
})

export interface GeocodeResult {
  latitude: number
  longitude: number
  formattedAddress: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const results = await geocoder.geocode(address)

    if (results && results.length > 0) {
      const result = results[0]
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}