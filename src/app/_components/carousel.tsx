import { memo, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/outline";

interface CarouselProps {
  photos: string[];
}

const Modal = memo(({ isOpen, onClose, children, currentIndex, totalItems, onPrev, onNext, photos, setCurrentIndex }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  currentIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  photos: string[];
  setCurrentIndex: (index: number) => void;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onPrev, onNext]);
  
  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95"
    >
      {/* Top controls bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
        {/* Image counter */}
        <div className="text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm bg-black/30">
          {currentIndex + 1} / {totalItems}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-accent p-2 rounded-full backdrop-blur-sm bg-black/30"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <ArrowsPointingOutIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={onClose}
            className="text-white hover:text-accent p-2 rounded-full backdrop-blur-sm bg-black/30"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Navigation controls */}
      <button
        onClick={onPrev}
        className="absolute left-2 sm:left-4 md:left-8 z-10 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all transform hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-2 sm:right-4 md:right-8 z-10 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all transform hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
      
      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
        {children}
      </div>
      
      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 px-4 overflow-x-auto pb-2 z-10">
        {photos.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => {
              // Directly set the current index to the clicked thumbnail
              if (idx !== currentIndex) {
                setCurrentIndex(idx);
              }
            }}
            className={`relative h-16 w-24 rounded-md overflow-hidden transition-all duration-300 ${
              idx === currentIndex 
                ? 'ring-2 ring-accent scale-110' 
                : 'opacity-60 hover:opacity-100'
            }`}
            aria-label={`View image ${idx + 1}`}
          >
            <Image
              src={photo}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

const ModalImage = memo(({ src, index }: { src: string; index: number }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      )}
      <Image
        src={imageError ? `/fallback-${(index % 8) + 1}.jpg`.replace('fallback-1.jpg', 'breakfast.jpg')
                         .replace('fallback-2.jpg', 'burger.jpg')
                         .replace('fallback-3.jpg', 'dessert.jpg')
                         .replace('fallback-4.jpg', 'fancy.jpg')
                         .replace('fallback-5.jpg', 'tacos.jpg')
                         .replace('fallback-6.jpg', 'pizza.jpg')
                         .replace('fallback-7.jpg', 'sushi.jpg')
                         .replace('fallback-8.jpg', 'pasta.jpg') : src}
        alt={`Full size ${index + 1}`}
        fill
        className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        quality={100}
        priority
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 768px) 100vw, 80vw"
      />
    </div>
  );
});

ModalImage.displayName = 'ModalImage';

const ImageCarousel = memo(({ photos }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Simple navigation functions
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
    if (isModalOpen) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }
    
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [isModalOpen, nextSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  // Get the current photo
  const currentPhoto = photos[currentIndex];
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl group">
      {/* Main Image */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={openModal}
      >
        <Image
          src={imageError ? `/fallback-${(currentIndex % 8) + 1}.jpg`.replace('fallback-1.jpg', 'breakfast.jpg')
                           .replace('fallback-2.jpg', 'burger.jpg')
                           .replace('fallback-3.jpg', 'dessert.jpg')
                           .replace('fallback-4.jpg', 'fancy.jpg')
                           .replace('fallback-5.jpg', 'tacos.jpg')
                           .replace('fallback-6.jpg', 'pizza.jpg')
                           .replace('fallback-7.jpg', 'sushi.jpg')
                           .replace('fallback-8.jpg', 'pasta.jpg') : currentPhoto}
          alt={`Food item ${currentIndex + 1}`}
          fill
          className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
          priority
          quality={90}
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        
        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all transform hover:scale-110 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-70"
        aria-label="Previous image"
      >
        <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all transform hover:scale-110 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-70"
        aria-label="Next image"
      >
        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicator Pills */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`transition-all duration-300 ease-in-out rounded-full ${
              index === currentIndex 
                ? 'w-8 h-2 bg-accent' 
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to image ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
      
      {/* Fullscreen button */}
      <button
        onClick={openModal}
        className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50 transition-all transform hover:scale-110 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="View fullscreen"
      >
        <ArrowsPointingOutIcon className="w-5 h-5" />
      </button>

      {/* Modal View */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        currentIndex={currentIndex}
        totalItems={photos.length}
        onPrev={prevSlide}
        onNext={nextSlide}
        photos={photos}
        setCurrentIndex={setCurrentIndex}
      >
        <div className="relative w-full max-w-6xl h-full max-h-[90vh]">
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
