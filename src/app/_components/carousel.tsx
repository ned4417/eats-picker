import MultiCarousel from "react-multi-carousel";
import Image from "next/image";
import { memo } from "react";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
    slidesToSlide: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

const CarouselItem = memo(({ photo, index }: { photo: string; index: number }) => (
  <div className="multi-carousel-item flex items-center justify-center h-full shadow-md rounded-md p-1">
    <Image
      src={photo}
      alt={`Item ${index + 1}`}
      width={300}
      height={300}
      className="h-full rounded-md object-cover"
      loading={index === 0 ? "eager" : "lazy"}
      quality={85}
    />
  </div>
));

CarouselItem.displayName = 'CarouselItem';

const ImageCarousel = memo(({ photos }: { photos: string[] }) => {
  return (
    <div className="carousel-container w-full rounded-md overflow-hidden">
      <MultiCarousel
        swipeable={true}
        draggable={false}
        showDots={true}
        responsive={responsive}
        ssr={true}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={10000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={1500}
        removeArrowOnDeviceType={["tablet", "mobile"]}
      >
        {photos.map((photo, index) => (
          <CarouselItem key={index} photo={photo} index={index} />
        ))}
      </MultiCarousel>
    </div>
  );
});

ImageCarousel.displayName = 'ImageCarousel';

export default ImageCarousel;
