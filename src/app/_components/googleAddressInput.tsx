// components/GoogleAddressAutocomplete.tsx
import React, { useState } from 'react';

interface GoogleAddressAutocompleteProps {
  onSelect: (place: google.maps.places.AutocompletePrediction) => void;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
  radius?: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({ onSelect, setSelectedAddress }) => {
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
    setSelectedAddress(suggestion.description); // Set the selected address in page.tsx state
    onSelect(suggestion); // Pass the selected suggestion back to page.tsx
    setPredictions([]);
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
