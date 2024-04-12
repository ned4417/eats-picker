"use client"; // This is a client component 👈🏽
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import GoogleAddressAutocomplete from './_components/googleAddressInput';
const Carousel = dynamic(() => import('./_components/carousel'));
import axios from 'axios';
import ImageCarousel from './_components/carousel';
import "react-multi-carousel/lib/styles.css";

const Home: React.FC = () => {
  const [randomRestaurant, setRandomRestaurant] = useState<any>(null); // Adjust the type according to your API response
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDistance, setSelectedDistance] = useState<string>('10');
  const [originLat, setOriginLat] = useState<string>('');
  const [originLon, setOriginLon] = useState<string>('');
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([
    "https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg",
    "https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg",
    "https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg",
    "https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg",
    "https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg",
    "https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg",
    "https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg"
  ]);

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

  useEffect(() => {
    if (randomRestaurant && randomRestaurant.photos) {
      setCurrentPhotos(randomRestaurant.photos);
    }
  }, [randomRestaurant]);

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




  return (
    <main data-theme="dark" className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">Eats Picker!</h1>        
      </div>

      <div className="w-1/2">
      <GoogleAddressAutocomplete onSelect={handleSelectPlace} setSelectedAddress={setSelectedAddress} radius={selectedDistance} />
      </div>

      <div className="w-1/2">
        <label className="label">Search Radius from Address to search: {selectedDistance} mi</label>
        <input type="range" min={5} max="30" value={selectedDistance} className="range range-accent" onChange={handleSliderOnChange} />
      </div>


      <div>
  {/* Conditionally render restaurant details */}
  {randomRestaurant && (
    <div className="p-6 text-center">
      <p className="text-3xl mb-2 font-bold">{randomRestaurant.name}</p>
      <p className="text-2xl">{randomRestaurant.formatted_address}</p>
      <p className="text-lg pt-3">Distance from selected address: {randomRestaurant.distance}</p>
      {/* Add more restaurant details as needed */}
    </div>
  )}
</div>
      <div className="p-6 w-3/4 h-96 overflow-hidden rounded-md">
        <ImageCarousel photos={currentPhotos} />
      </div>
      <div>
          {/* Conditionally render the "Choose Another Restaurant" button */}
          {selectedAddress && randomRestaurant && (
          <button className="btn btn-primary" onClick={chooseAnotherRestaurant}>Roll the culinary dice again</button>
          )}
      </div>      
    </main>
  );
};

export default Home;
