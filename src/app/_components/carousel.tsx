import { memo, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CarouselProps {
  photos: string[];
}

const CarouselItem = memo(({ photo, index, onClick }: { photo: string; index: number; onClick: () => void }) => (
  <div 
    className="relative w-full h-full cursor-pointer group"
    onClick={onClick}
  >
    <Image
      src={photo}
      alt={`Item ${index + 1}`}
      fill
      className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
      loading={index === 0 ? "eager" : "lazy"}
      quality={85}
    />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
  </div>
));

CarouselItem.displayName = 'CarouselItem';

const Modal = memo(({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

const ImageCarousel = memo(({ photos }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Main Carousel */}
      <div className="relative w-full h-full">
        <div className="relative w-full h-full">
          <CarouselItem
            photo={photos[currentIndex]}
            index={currentIndex}
            onClick={openModal}
          />
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modal View */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="relative w-full max-w-4xl h-full max-h-[90vh]">
          <Image
            src={photos[currentIndex]}
            alt={`Full size ${currentIndex + 1}`}
            fill
            className="object-contain"
            quality={100}
            priority
          />
        </div>
      </Modal>
    </div>
  );
});

ImageCarousel.displayName = 'ImageCarousel';

export default ImageCarousel;
