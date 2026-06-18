import React, { useState } from 'react';

interface VideoItem {
  type: 'file' | 'embed';
  url: string;
  embed_url?: string;
}

interface ProductGalleryProps {
  imageUrls?: string[];
  videoItems?: VideoItem[];
  alt: string;
  variant?: 'default' | 'detail';
}

export default function ProductGallery({ imageUrls = [], videoItems = [], alt, variant = 'default' }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const hasImages = imageUrls.length > 0;
  const hasVideos = videoItems.length > 0;

  const mainImageClass = variant === 'detail' ? 'h-[28rem] w-full object-cover' : 'h-80 w-full object-cover';
  const emptyClass = variant === 'detail' ? 'h-[28rem]' : 'h-64';

  if (!hasImages && !hasVideos) {
    return (
      <div className={`flex ${emptyClass} items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground`}>
        No media uploaded
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasImages && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border bg-muted/20">
            <img
              src={imageUrls[activeImage]}
              alt={alt}
              className={mainImageClass}
            />
          </div>
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imageUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${activeImage === index ? 'ring-2 ring-primary' : ''}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasVideos && (
        <div className="space-y-3">
          {videoItems.map((video, index) => (
            <div key={`${video.type}-${video.url}-${index}`} className="overflow-hidden rounded-lg border bg-black">
              {video.type === 'embed' && video.embed_url ? (
                <iframe
                  src={video.embed_url}
                  title={`${alt} video ${index + 1}`}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={video.url} controls className="aspect-video w-full" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
