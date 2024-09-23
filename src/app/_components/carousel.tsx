import MultiCarousel from "react-multi-carousel";
import Image from "next/image";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
    slidesToSlide: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 4,
    slidesToSlide: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

 const ImageCarousel = ({ photos }: { photos: string[] }) => {
  return (
    <div className="carousel-container w-full rounded-md overflow-hidden">
        <MultiCarousel
          swipeable={false}
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
            <div key={index} className="multi-carousel-item flex items-center justify-center h-full shadow-md rounded-md p-1 ">
              <Image
                src={photo}
                alt={`Item ${index + 1}`}
                width={300} // Specify one dimension
                height={300} // Specify the other dimension
                className="h-full rounded-md object-cover"
              />
            </div>
          ))}
        </MultiCarousel>
    </div>
  );
};

export default ImageCarousel;
