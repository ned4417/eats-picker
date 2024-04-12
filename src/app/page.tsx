"use client"; // This is a client component 👈🏽
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import GoogleAddressAutocomplete from './_components/googleAddressInput';
const Carousel = dynamic(() => import('./_components/carousel'));
import axios from 'axios';

const Home: React.FC = () => {
  const [randomRestaurant, setRandomRestaurant] = useState<any>(null); // Adjust the type according to your API response
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDistance, setSelectedDistance] = useState<string>('5');
  const [originLat, setOriginLat] = useState<string>('');
  const [originLon, setOriginLon] = useState<string>('');
  const autocompleteRef = useRef<HTMLInputElement>(null);


  // const destLat = randomRestaurant.latitude; // Latitude of the destination (restaurant)
  // const destLon = randomRestaurant.longitude; // Longitude of the destination (restaurant)


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const google = window.google;
      if (!google) {
        console.error("Google API script not loaded.");
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current!);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          console.error("Invalid place");
          return;
        }
        const address = place.formatted_address;
      });
    }
  }, []);

 // Function to fetch and set random restaurant data
const fetchRandomRestaurant = (address: string, radius: string) => {
  axios.get(`/api/getRestaurants?address=${encodeURIComponent(address)}&radius=${radius}`)
    .then(response => {
      setRandomRestaurant(response.data); // Set randomRestaurant state with fetched data
    })
    .catch(error => {
      console.error('Error fetching restaurant:', error);
      // Handle error
    });
};


const handleSelectPlace = (place: google.maps.places.AutocompletePrediction) => {
  setSelectedAddress(place.description);
  fetchRandomRestaurant(place.description, selectedDistance);
};


  // Function to choose another restaurant
  const chooseAnotherRestaurant = () => {
    setRandomRestaurant(null); // Reset randomRestaurant state to trigger a new fetch
    fetchRandomRestaurant(selectedAddress, selectedDistance);
  };

  const handleSliderOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDistance(event.target.value);
  }




// Function to calculate driving distance using Google Maps Directions API
const calculateDrivingDistance = async (originLat: number, originLon: number, destLat: number, destLon: number) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: {
        origin: `${originLat},${originLon}`,
        destination: `${destLat},${destLon}`,
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
      },
    });

    const distance = response.data.routes[0].legs[0].distance.value; // Distance in meters
    return distance / 1000; // Convert meters to kilometers
  } catch (error) {
    console.error('Error calculating driving distance:', error);
    throw error;
  }
};

//const drivingDistance = await calculateDrivingDistance(Number(selectedAddress), Number(originLon), Number(randomRestaurant.latitude), Number(randomRestaurant.longitude));

  return (
    <main data-theme="dark" className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">Eats Picker!</h1>        
      </div>

      <div className="w-1/2">
      <GoogleAddressAutocomplete onSelect={handleSelectPlace} setSelectedAddress={setSelectedAddress} radius={selectedDistance} />
      </div>

      <div className="w-1/2">
        <label className="label">Distance from Address to search</label>
        <input type="range" min={5} max="30" value={selectedDistance} className="range range-accent" onChange={handleSliderOnChange} />
        <label className="label">Miles away from selected address: {selectedDistance}</label>
      </div>


      <div>
          {/* Conditionally render restaurant details */}
          {randomRestaurant && (
          <div className="p-6">
            <p className="text-lg mb-2">Name: {randomRestaurant.name}</p>
            <p className="text-lg">Address: {randomRestaurant.formatted_address}</p>
            <p className="text-lg">Photo: {randomRestaurant.photo}</p>
            {/* Add more restaurant details as needed */}
          </div>
          )}
      </div>

      <div>
          {/* Conditionally render the "Choose Another Restaurant" button */}
          {selectedAddress && randomRestaurant && (
          <button className="btn btn-primary" onClick={chooseAnotherRestaurant}>Roll the culinary dice again</button>
          )}
      </div>
      <div className="p-6">
            {randomRestaurant ? (
                <>
                    <Carousel photos={randomRestaurant.photos || null} />
                </>
            ) : (
                <>
                    <Carousel photos={null} />
                </>
            )}
        </div>
      
    </main>
  );
};

export default Home;
