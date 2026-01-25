import React from 'react';

interface MediaItem {
  url: string;
  alt?: string;
}

interface Props {
  images: MediaItem[];
}

const GallerySection: React.FC<Props> = ({ images }) => (
  <section className="gallery-section py-16">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Gallery</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <img key={idx} src={img.url} alt={img.alt || ''} className="rounded shadow w-full h-48 object-cover" />
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
