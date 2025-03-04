"use client"; // This is a client component 👈🏽
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMediaQuery } from 'react-responsive';
import GoogleAddressAutocomplete from './_components/googleAddressInput';
import axios from 'axios';
import ImageCarousel from './_components/carousel';
import "react-multi-carousel/lib/styles.css";
import Image from 'next/image';
import grubGuideLogo from '../../public/grubguide_logo_bg-removebg-preview.png';
import breakfast from '../../public/breakfast.jpg';
import burger from '../../public/burger.jpg';
import dessert from '../../public/dessert.jpg';
import fancy from '../../public/fancy.jpg';
import tacos from '../../public/tacos.jpg';

const Home: React.FC = () => {
  const [randomRestaurant, setRandomRestaurant] = useState<any>(null); // Adjust the type according to your API response
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedDistance, setSelectedDistance] = useState<string>('10');
  const [originLat, setOriginLat] = useState<string>('');
  const [originLon, setOriginLon] = useState<string>('');
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([
    breakfast.src,
    burger.src,
    dessert.src,
    fancy.src,
    tacos.src
  ]);
  const [searchLabelText, setSearchLabelText] = useState("Search Radius from Address to search: ");
  const [distanceLabelText, setDistanceLabelText] = useState("Distance from selected address: ");
  const isSmallScreen = useMediaQuery({ maxWidth: 640 });

  // Update label texts based on screen size
  useEffect(() => {
    if (isSmallScreen) {
      setSearchLabelText("Search Radius: ");
      setDistanceLabelText("Distance: ");
    } else {
      setSearchLabelText("Search Radius from Address to search: ");
      setDistanceLabelText("Distance from selected address: ");
    }
  }, [isSmallScreen]);

  // Update photos when restaurant changes
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
    <main data-theme="dark" className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 md:p-12 lg:p-16">
      {/* Header with logo */}
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm mb-6 md:mb-8">
        <Image 
          src={grubGuideLogo} 
          alt="Grub Guide Logo" 
          className="w-full max-w-md mx-auto"
          priority
          width={800}
          height={200}
          quality={90}
        />
      </div>

      {/* Search section */}
      <div className="w-full max-w-xl px-2 space-y-4 mb-6">
        <div className="w-full">
          <GoogleAddressAutocomplete 
            onSelect={handleSelectPlace} 
            setSelectedAddress={setSelectedAddress} 
            radius={selectedDistance} 
          />
        </div>

        <div className="w-full">
          <label className="label text-sm md:text-base">
            {searchLabelText} <span className="font-medium">{selectedDistance} mi</span>
          </label>
          <input 
            type="range" 
            min={5} 
            max="30" 
            value={selectedDistance} 
            className="range range-accent w-full" 
            onChange={handleSliderOnChange} 
          />
          <div className="w-full flex justify-between text-xs px-1 mt-1">
            <span>5 mi</span>
            <span>30 mi</span>
          </div>
        </div>
      </div>

      {/* Restaurant details section */}
      <div className="w-full max-w-2xl">
        {randomRestaurant && (
          <div className="p-3 sm:p-4 md:p-6 text-center bg-base-200 rounded-lg shadow-md mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">{randomRestaurant.name}</h2>
            <p className="text-sm sm:text-base md:text-lg mb-1">{randomRestaurant.formatted_address}</p>
            <p className="text-xs sm:text-sm md:text-base pt-2 opacity-80">
              {distanceLabelText} <span className="font-medium">{randomRestaurant.distance}</span>
            </p>
          </div>
        )}
      </div>

      {/* Carousel section */}
      <div className="w-full max-w-4xl mx-auto aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] mb-6">
        <ImageCarousel photos={currentPhotos} />
      </div>

      {/* Action button section */}
      <div className="mb-8">
        {selectedAddress && randomRestaurant && (
          <button 
            className="btn btn-primary btn-lg shadow-lg" 
            onClick={chooseAnotherRestaurant}
          >
            Roll the culinary dice again
          </button>
        )}
      </div>      
    </main>
  );
};

export default Home;
