import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CarouselProps {
  photos: string[];
}

const CarouselItem = memo(({ photo, index, onClick }: { photo: string; index: number; onClick: () => void }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div 
      className="relative w-full h-full cursor-pointer group"
      onClick={onClick}
    >
      <Image
        src={imageError ? `/fallback-${(index % 5) + 1}.jpg`.replace('fallback-1.jpg', 'breakfast.jpg')
                         .replace('fallback-2.jpg', 'burger.jpg')
                         .replace('fallback-3.jpg', 'dessert.jpg')
                         .replace('fallback-4.jpg', 'fancy.jpg')
                         .replace('fallback-5.jpg', 'tacos.jpg') : photo}
        alt={`Item ${index + 1}`}
        fill
        className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        loading={index === 0 ? "eager" : "lazy"}
        quality={85}
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
    </div>
  );
});

CarouselItem.displayName = 'CarouselItem';

const Modal = memo(({ isOpen, onClose, children, currentIndex, totalItems, onPrev, onNext }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  currentIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      
      {/* Navigation controls */}
      <button
        onClick={onPrev}
        className="absolute left-2 sm:left-4 md:left-8 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-2 sm:right-4 md:right-8 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
      
      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        {children}
      </div>
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {totalItems}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

const ModalImage = memo(({ src, index }: { src: string; index: number }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Image
      src={imageError ? `/fallback-${(index % 5) + 1}.jpg`.replace('fallback-1.jpg', 'breakfast.jpg')
                       .replace('fallback-2.jpg', 'burger.jpg')
                       .replace('fallback-3.jpg', 'dessert.jpg')
                       .replace('fallback-4.jpg', 'fancy.jpg')
                       .replace('fallback-5.jpg', 'tacos.jpg') : src}
      alt={`Full size ${index + 1}`}
      fill
      className="object-contain"
      quality={100}
      priority
      onError={() => setImageError(true)}
    />
  );
});

ModalImage.displayName = 'ModalImage';

const ImageCarousel = memo(({ photos }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  // Auto-advance slides every 5 seconds if not in modal view
  useEffect(() => {
    if (isModalOpen) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isModalOpen, nextSlide]);

  // Touch event handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden shadow-md"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Carousel */}
      <div className="relative w-full h-full">
        <div className="relative w-full h-full">
          <CarouselItem
            photo={photos[currentIndex]}
            index={currentIndex}
            onClick={openModal}
          />
        </div>
        
        {/* Navigation Arrows - hidden on small screens (use swipe instead) */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity hidden sm:block"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity hidden sm:block"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Swipe indicator for mobile - only shown briefly */}
        <div className="absolute inset-x-0 bottom-16 flex justify-center sm:hidden pointer-events-none">
          <div className="bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full">
            Swipe to navigate
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal View */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        currentIndex={currentIndex}
        totalItems={photos.length}
        onPrev={prevSlide}
        onNext={nextSlide}
      >
        <div className="relative w-full max-w-5xl h-full max-h-[90vh]">
          <ModalImage 
            src={photos[currentIndex]} 
            index={currentIndex} 
          />
        </div>
      </Modal>
    </div>
  );
});

ImageCarousel.displayName = 'ImageCarousel';

export default ImageCarousel;
