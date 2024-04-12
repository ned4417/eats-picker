// export default function Carousel() {
//     return (
//         <div className="carousel rounded-box">
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" alt="Burger" />
//         </div> 
//         <div className="carousel-item">
//           <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" alt="Burger" />
//         </div>
//       </div>
//     );
//   }


export default function Carousel({ photos }: { photos: string[] | null }) {
  if (!photos || photos.length === 0) {
      return (
        <div className="carousel rounded-box">
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" alt="Burger" />
        </div> 
        <div className="carousel-item">
          <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" alt="Burger" />
        </div>
      </div>
      )
  }

  return (
    <div className="carousel rounded-box">
        {photos.map((photo, index) => (
            <div className="carousel-item" key={index}>
                <img src={photo} alt={`Restaurant ${index}`} className="object-cover w-full h-full" />
            </div>
        ))}
    </div>
  );
}
