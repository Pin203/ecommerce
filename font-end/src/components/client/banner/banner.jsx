import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link

const Banner = () => {
  
    const bannerData = [
        {
            url: "https://lambanner.com/wp-content/uploads/2022/10/MNT-DESIGN-BANNER-GIAY-11.jpg",
            productId: "33" 
        },
        {
            url: "https://mona.media/wp-content/uploads/2021/06/banner-giay.png",
            productId: "456" 
        },
        {
            url: "https://thietke6d.com/wp-content/uploads/2021/05/banner-quang-cao-giay-4.webp",
            productId: "789" 
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Effect for automatic sliding
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, [bannerData.length]);

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    const currentBanner = bannerData[currentIndex];

    return (
        <section className="hero-section position-relative d-flex align-items-center justify-content-center">
            <div className="container-fluid p-0">
                {/* Wrap the image in a Link component */}
                <Link to={`/product/${currentBanner.productId}`}>
                    <img
                        src={currentBanner.url}
                        className="img-fluid w-100"
                        alt={`Sale Banner ${currentIndex + 1}`}
                    />
                </Link>
                <div className="overlay-text position-absolute text-white">
                    {/* You can add text or other content here that overlays the banner */}
                </div>
                <div className="slider-dots position-absolute bottom-0 start-50 translate-middle-x pb-3">
                    {bannerData.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentIndex === index ? 'active' : ''}`}
                            onClick={() => handleDotClick(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Banner;