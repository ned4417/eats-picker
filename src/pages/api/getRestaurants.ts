// pages/api/getRandomRestaurant.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

// Initialize cache with 100 items and 5 minutes TTL
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Function to convert miles to meters
const milesToMeters = (miles: number) => {
  return miles * 1609; // 1 mile is approximately 1609.34 meters
};

// Function to generate cache key
const generateCacheKey = (address: string, radius: number) => {
  return `${address}-${radius}`;
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

  if (!address || !radius) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cacheKey = generateCacheKey(address, radius);
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }

  const radiusInMeters = milesToMeters(radius);

  try {
    // Fetch restaurants in parallel with place details
    const [restaurantsResponse, placeDetailsResponse] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+near+${encodeURIComponent(address)}&radius=${radiusInMeters}&key=${apiKey}`
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(address)}&fields=photos&key=${apiKey}`
      )
    ]);

    if (!restaurantsResponse.ok || !placeDetailsResponse.ok) {
      throw new Error('Failed to fetch data from Google Places API');
    }

    const [restaurantsData, placeDetailsData] = await Promise.all([
      restaurantsResponse.json(),
      placeDetailsResponse.json()
    ]);

    if (restaurantsData.results.length === 0) {
      return res.status(404).json({ error: 'No restaurants found near the address' });
    }

    const randomIndex = Math.floor(Math.random() * restaurantsData.results.length);
    const randomRestaurant = restaurantsData.results[randomIndex];

    // Extract photos from place details response
    const photos = placeDetailsData.result?.photos?.map((photo: any) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
    }) || [];

    // Fetch distance matrix
    const distanceResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(randomRestaurant.formatted_address)}&key=${apiKey}`
    );

    if (!distanceResponse.ok) {
      throw new Error('Failed to fetch distance matrix');
    }

    const distanceData = await distanceResponse.json();
    const distanceText = distanceData.rows?.[0]?.elements?.[0]?.distance?.text || 'N/A';

    // Combine all data
    const result = {
      ...randomRestaurant,
      photos,
      distance: distanceText,
    };

    // Cache the result
    cache.set(cacheKey, result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
