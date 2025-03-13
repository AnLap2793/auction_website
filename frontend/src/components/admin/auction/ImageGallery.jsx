import React, { useState } from 'react';
import { Image, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './ImageGallery.less';

const ImageGallery = ({ images = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    // Use placeholder if no images
    const displayImages = images.length > 0 ? images : ['/placeholder.png'];

    const handleThumbnailClick = (index) => {
        setActiveIndex(index);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className='image-gallery-container'>
            <div className='main-image-container'>
                <Image
                    className='main-image'
                    src={displayImages[activeIndex]}
                    alt={`Product image ${activeIndex + 1}`}
                    preview={{
                        visible: false,
                        onVisibleChange: (vis) => setVisible(vis),
                        getContainer: () => document.body
                    }}
                    onClick={() => setVisible(true)}
                />

                {displayImages.length > 1 && (
                    <>
                        <div className='gallery-nav prev' onClick={handlePrev}>
                            <LeftOutlined />
                        </div>
                        <div className='gallery-nav next' onClick={handleNext}>
                            <RightOutlined />
                        </div>
                    </>
                )}
            </div>

            {displayImages.length > 1 && (
                <div className='thumbnails-container'>
                    {displayImages.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${
                                index === activeIndex ? 'active' : ''
                            }`}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <img src={image} alt={`Thumbnail ${index + 1}`} />
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'none' }}>
                <Image.PreviewGroup
                    preview={{
                        visible,
                        onVisibleChange: (vis) => setVisible(vis),
                        current: activeIndex
                    }}
                >
                    {displayImages.map((image, index) => (
                        <Image key={index} src={image} />
                    ))}
                </Image.PreviewGroup>
            </div>
        </div>
    );
};

export default ImageGallery;
