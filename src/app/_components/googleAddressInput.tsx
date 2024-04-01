// components/GoogleAddressAutocomplete.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface GoogleAddressAutocompleteProps {
    onSelect: (restaurant: any) => void; // Adjust the type according to your API response
  }

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({ onSelect }) => {
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutocompleteInput(event.target.value);
    if (event.target.value) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: event.target.value }, (predictions, status) => {
        if (status === 'OK' && predictions) {
          setPredictions(predictions);
        }
      });
    } else {
      setPredictions([]);
    }
  };

  // Handle the selection of a suggestion
  const handleSelectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    setAutocompleteInput(suggestion.description);
    setPredictions([]);
  
    // Call your backend API to get a random restaurant
    axios.get(`/api/getRestaurants?address=${encodeURIComponent(suggestion.description)}`)
      .then(response => {
        onSelect(response.data); // Pass the restaurant data to the onSelect function
      })
      .catch(error => {
        console.error('Error fetching restaurant:', error);
        // Handle error
      });
  };

  return (
    <>
      <input
         className="border-5 border-red input input-bordered w-full"
        type="text"
        value={autocompleteInput}
        onChange={handleInputChange}
        placeholder="Enter a location"
      />
      {predictions.map((prediction) => (
        <div className="font-sm py-1 px-2 cursor-pointer hover:bg-gray-100" key={prediction.place_id} onClick={() => handleSelectSuggestion(prediction)}>
          {prediction.description}
        </div>
      ))}
    </>
  );

};

export default GoogleAddressAutocomplete;
