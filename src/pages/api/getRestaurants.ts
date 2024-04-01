// pages/api/getRandomRestaurant.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GOOGLE_API_KEY;; // Load your API key from environment variables
  const address = req.query.address as string; // Get the address from the query parameter

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+near+${address}&key=${apiKey}`
    );


    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();

    if (data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      const randomRestaurant = data.results[randomIndex];
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
