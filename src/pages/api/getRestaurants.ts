// pages/api/getRandomRestaurant.ts

import { NextApiRequest, NextApiResponse } from 'next';

// Function to convert miles to meters
const milesToMeters = (miles: number) => {
  return miles * 1609; // 1 mile is approximately 1609.34 meters
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GOOGLE_API_KEY;; // Load your API key from environment variables
  const address = req.query.address as string; // Get the address from the query parameter
  const radiusInMeters = milesToMeters(Number(req.query.radius)); // Convert the radius from miles to meters
  console.log(radiusInMeters)


  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+near+${address}&radius=${radiusInMeters}&key=${apiKey}`
    );


    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();

    if (data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const randomRestaurant = data.results[randomIndex];

      // Fetch place details to get photos
      const placeDetailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${randomRestaurant.place_id}&fields=photos&key=${apiKey}`
      );

      if (!placeDetailsResponse.ok) {
        throw new Error('Failed to fetch place details');
      }

      const placeDetailsData = await placeDetailsResponse.json();

      // Extract photos from place details response
      const photos = placeDetailsData.result?.photos.map((photo: any) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
      });

      // Add photos to the random restaurant object
      randomRestaurant.photos = photos;


      console.log('Random restaurant:', randomRestaurant);
      res.status(200).json(randomRestaurant);
    } else {
      res.status(404).json({ error: 'No restaurants found near the address' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
