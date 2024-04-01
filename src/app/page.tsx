"use client"; // This is a client component 👈🏽
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import GoogleAddressAutocomplete from './_components/googleAddressInput';
const Carousel = dynamic(() => import('./_components/carousel'));
import axios from 'axios';

const Home: React.FC = () => {
  const [randomRestaurant, setRandomRestaurant] = useState<any>(null); // Adjust the type according to your API response
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const autocompleteRef = useRef<HTMLInputElement>(null);


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
        console.log("Selected address:", address);
      });
    }
  }, []);

   // Function to fetch and set random restaurant data
   const fetchRandomRestaurant = (address: string) => {
    axios.get(`/api/getRestaurants?address=${encodeURIComponent(address)}`)
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
    console.log('Selected Place TTTTTTTTTTTTTTTTTTTTTTTTT: ', place);
    fetchRandomRestaurant(place.description);
  };


  // Function to choose another restaurant
  const chooseAnotherRestaurant = () => {
    setRandomRestaurant(null); // Reset randomRestaurant state to trigger a new fetch
    fetchRandomRestaurant(selectedAddress);
  };

  return (
    <main data-theme="dark" className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">Eats Picker!</h1>        
      </div>

      <div className="w-1/2">
      <GoogleAddressAutocomplete onSelect={handleSelectPlace} setSelectedAddress={setSelectedAddress} />
      </div>


      <div>
          {/* Conditionally render restaurant details */}
          {randomRestaurant && (
          <div className="p-6">
            <p className="text-lg mb-2">Name: {randomRestaurant.name}</p>
            <p className="text-lg">Address: {randomRestaurant.formatted_address}</p>
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
      <div>
      <Carousel/>
      </div>
      
    </main>
  );
};

export default Home;
