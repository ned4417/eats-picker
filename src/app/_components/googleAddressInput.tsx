// components/GoogleAddressAutocomplete.tsx
import React, { useState, useRef, useEffect } from 'react';

interface GoogleAddressAutocompleteProps {
  onSelect: (place: google.maps.places.AutocompletePrediction) => void;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
  radius?: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({ onSelect, setSelectedAddress }) => {
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);

  // Close predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current && 
        !predictionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setPredictions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          className="input input-bordered w-full shadow-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
          type="text"
          value={autocompleteInput}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Enter a location"
          aria-label="Location search"
        />
        {autocompleteInput && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setAutocompleteInput('');
              setPredictions([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
      </div>
      
      {predictions.length > 0 && (
        <div 
          ref={predictionsRef}
          className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-md border border-base-300 max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction) => (
            <div 
              className="py-2 px-3 cursor-pointer hover:bg-base-200 text-sm border-b border-base-200 last:border-b-0" 
              key={prediction.place_id} 
              onClick={() => handleSelectSuggestion(prediction)}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleAddressAutocomplete;
