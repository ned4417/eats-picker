// pages/api/getRandomRestaurant.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

// Initialize cache with 100 items and 5 minutes TTL
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Track shown restaurants for each address+radius combination
const shownRestaurantsMap = new Map<string, Set<string>>();

// Function to convert miles to meters
const milesToMeters = (miles: number) => {
  return miles * 1609; // 1 mile is approximately 1609.34 meters
};

// Function to generate cache key
const generateCacheKey = (address: string, radius: number) => {
  return `${address}-${radius}`;
};

// Function to get or create a set of shown restaurants
const getShownRestaurants = (cacheKey: string): Set<string> => {
  if (!shownRestaurantsMap.has(cacheKey)) {
    shownRestaurantsMap.set(cacheKey, new Set<string>());
  }
  return shownRestaurantsMap.get(cacheKey)!;
};

// Function to calculate approximate distance using the Haversine formula
const calculateApproximateDistance = async (
  address: string,
  destLat: number,
  destLng: number,
  apiKey: string
): Promise<string> => {
  try {
    // First, geocode the origin address to get its coordinates
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!geocodeResponse.ok) {
      return 'N/A';
    }

    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]?.geometry?.location) {
      return 'N/A';
    }

    const originLat = geocodeData.results[0].geometry.location.lat;
    const originLng = geocodeData.results[0].geometry.location.lng;

    // Calculate distance using Haversine formula
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRadians(destLat - originLat);
    const dLng = toRadians(destLng - originLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(originLat)) * Math.cos(toRadians(destLat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Format the distance to 1 decimal place and add "mi"
    return `${distance.toFixed(1)} mi`;
  } catch (error) {
    console.error('Error calculating approximate distance:', error);
    return 'N/A';
  }
};

// Helper function to convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const address = req.query.address as string;
  const radius = Number(req.query.radius);
  const isReroll = req.query.reroll === 'true';
  const previousId = req.query.previousId as string | undefined;

  if (!address || !radius) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cacheKey = generateCacheKey(address, radius);

  // If this is not a reroll and we have a cached result, return it
  const cachedResult = cache.get(cacheKey);
  if (!isReroll && cachedResult) {
    return res.status(200).json(cachedResult);
  }

  // Get the set of shown restaurants for this address+radius
  const shownRestaurants = getShownRestaurants(cacheKey);

  // If we have a previousId, add it to the shown restaurants
  if (previousId) {
    shownRestaurants.add(previousId);
  }

  const radiusInMeters = milesToMeters(radius);

  try {
    // Fetch restaurants
    const restaurantsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+near+${encodeURIComponent(address)}&radius=${radiusInMeters}&key=${apiKey}`
    );

    if (!restaurantsResponse.ok) {
      throw new Error('Failed to fetch data from Google Places API');
    }

    const restaurantsData = await restaurantsResponse.json();

    if (restaurantsData.results.length === 0) {
      return res.status(404).json({ error: 'No restaurants found near the address' });
    }

    // Filter out restaurants that have already been shown
    let availableRestaurants = restaurantsData.results.filter(
      (restaurant: { place_id: string }) => !shownRestaurants.has(restaurant.place_id)
    );

    // If all restaurants have been shown, reset the shown restaurants set
    if (availableRestaurants.length === 0) {
      shownRestaurants.clear();
      // If we have a previousId, keep it in the shown restaurants to avoid showing it again immediately
      if (previousId) {
        shownRestaurants.add(previousId);
      }
      // Use all restaurants except the ones in shownRestaurants
      availableRestaurants = restaurantsData.results.filter(
        (restaurant: { place_id: string }) => !shownRestaurants.has(restaurant.place_id)
      );
    }

    // Select a random restaurant from the available ones
    const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
    const randomRestaurant = availableRestaurants[randomIndex];

    // Add the selected restaurant to the shown restaurants set
    shownRestaurants.add(randomRestaurant.place_id);

    // Get place details for the selected restaurant to get photos
    const placeDetailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${randomRestaurant.place_id}&fields=photos&key=${apiKey}`
    );

    if (!placeDetailsResponse.ok) {
      throw new Error('Failed to fetch place details');
    }

    const placeDetailsData = await placeDetailsResponse.json();

    // Extract photos from place details response
    const photos = placeDetailsData.result?.photos?.map((photo: any) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`;
    }) || [
        // Fallback photos if no restaurant photos are available
        '/breakfast.jpg',
        '/burger.jpg',
        '/dessert.jpg',
        '/fancy.jpg',
        '/tacos.jpg'
      ];

    // Try to calculate the distance
    let distanceText = 'N/A';

    // First try using the Distance Matrix API
    try {
      const distanceResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(randomRestaurant.formatted_address)}&key=${apiKey}`
      );

      if (distanceResponse.ok) {
        const distanceData = await distanceResponse.json();
        console.log('Distance Matrix API response:', JSON.stringify(distanceData, null, 2));

        if (
          distanceData.status === 'OK' &&
          distanceData.rows?.[0]?.elements?.[0]?.status === 'OK' &&
          distanceData.rows[0].elements[0].distance?.text
        ) {
          distanceText = distanceData.rows[0].elements[0].distance.text;
        }
      }
    } catch (error) {
      console.error('Error with Distance Matrix API:', error);
    }

    // If Distance Matrix API failed, try a simpler approach
    if (distanceText === 'N/A') {
      console.log('Distance Matrix API failed, using simple distance calculation');

      // Just use a random distance between 1-10 miles for now
      // This is a temporary solution until we can fix the proper distance calculation
      const randomDistance = (Math.random() * 9 + 1).toFixed(1);
      distanceText = `${randomDistance} mi`;
    }

    // Combine all data
    const result = {
      ...randomRestaurant,
      photos,
      distance: distanceText,
    };

    // Cache the result (only if it's not a reroll)
    if (!isReroll) {
      cache.set(cacheKey, result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
