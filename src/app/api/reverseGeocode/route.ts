// app/api/reverseGeocode/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    console.log('Request URL:', url.toString());
    console.log('Search params:', Object.fromEntries(url.searchParams.entries()));

    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Missing required parameters: lat and lng' }, { status: 400 });
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
        console.log('Google Geocoding API response:', JSON.stringify(data, null, 2));

        // Check if we got a REQUEST_DENIED error
        if (data.status === 'REQUEST_DENIED') {
            console.log('Geocoding API access denied, using fallback address for testing');

            // For testing purposes, generate a location name based on the coordinates
            // This allows the app to function while the API key issues are being resolved
            return NextResponse.json({
                address: `Location at ${lat}, ${lng}`,
                note: "Using approximate location. API key needs Geocoding API enabled."
            });
        }

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            return NextResponse.json({ error: 'No address found for these coordinates' }, { status: 404 });
        }

        // Return the formatted address from the first result
        return NextResponse.json({
            address: data.results[0].formatted_address
        });
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
