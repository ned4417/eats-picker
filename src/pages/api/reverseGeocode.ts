// pages/api/reverseGeocode.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing required parameters: lat and lng' });
    }

    try {
        // Call Google's Geocoding API to convert coordinates to address
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Geocoding API');
        }

        const data = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            return res.status(404).json({ error: 'No address found for these coordinates' });
        }

        // Return the formatted address from the first result
        return res.status(200).json({
            address: data.results[0].formatted_address
        });
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
