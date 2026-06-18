import React, { useMemo, useState } from 'react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { ImagePlus, Plus, Trash2, Video } from 'lucide-react';

export interface ProductVideoRecord {
  type: 'file' | 'embed';
  path?: string;
  url?: string;
}

interface ProductMediaFieldsProps {
  existingImages?: string[];
  existingImageUrls?: string[];
  existingVideos?: ProductVideoRecord[];
  imageUrls?: string[];
  videoItems?: Array<{ type: 'file' | 'embed'; url: string; embed_url?: string }>;
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
  onExistingImagesChange: (paths: string[]) => void;
  onExistingVideosChange: (videos: ProductVideoRecord[]) => void;
  onVideoUrlsChange: (urls: string[]) => void;
}

function previewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export default function ProductMediaFields({
  existingImages = [],
  existingImageUrls = [],
  existingVideos = [],
  onImagesChange,
  onVideosChange,
  onExistingImagesChange,
  onExistingVideosChange,
  onVideoUrlsChange,
}: ProductMediaFieldsProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);

  const newImagePreviews = useMemo(
    () => newImages.map(file => ({ file, url: previewUrl(file) })),
    [newImages],
  );

  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...newImages, ...Array.from(files)];
    setNewImages(next);
    onImagesChange(next);
  };

  const removeNewImage = (index: number) => {
    const next = newImages.filter((_, i) => i !== index);
    setNewImages(next);
    onImagesChange(next);
  };

  const removeExistingImage = (path: string) => {
    onExistingImagesChange(existingImages.filter(item => item !== path));
  };

  const addVideos = (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...newVideos, ...Array.from(files)];
    setNewVideos(next);
    onVideosChange(next);
  };

  const removeNewVideo = (index: number) => {
    const next = newVideos.filter((_, i) => i !== index);
    setNewVideos(next);
    onVideosChange(next);
  };

  const removeExistingVideo = (video: ProductVideoRecord) => {
    onExistingVideosChange(
      existingVideos.filter(item =>
        item.type === video.type
        && (item.type === 'file' ? item.path === video.path : item.url === video.url),
      ),
    );
  };

  const updateVideoUrl = (index: number, value: string) => {
    const next = [...videoUrls];
    next[index] = value;
    setVideoUrls(next);
    onVideoUrlsChange(next.filter(Boolean));
  };

  const addVideoUrlField = () => setVideoUrls(prev => [...prev, '']);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Product images</Label>
        <p className="text-sm text-muted-foreground">Upload one or more images (JPG, PNG, WebP — max 5 MB each).</p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {existingImages.map((path, index) => (
            <div key={path} className="relative overflow-hidden rounded-lg border bg-muted/30">
              <img
                src={existingImageUrls[index] ?? `/storage/${path}`}
                alt=""
                className="h-36 w-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => removeExistingImage(path)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {newImagePreviews.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="relative overflow-hidden rounded-lg border bg-muted/30">
              <img src={item.url} alt="" className="h-36 w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => removeNewImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm hover:bg-muted/50">
          <ImagePlus className="h-4 w-4" />
          Add images
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => addImages(e.target.files)} />
        </label>
      </div>

      <div className="space-y-3">
        <Label>Product videos</Label>
        <p className="text-sm text-muted-foreground">Upload a video file (MP4, WebM — max 50 MB) or paste a YouTube/Vimeo link.</p>

        <div className="space-y-3">
          {existingVideos.map(video => (
            <div key={video.type === 'file' ? video.path : video.url} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4" />
                <span>{video.type === 'file' ? 'Uploaded video' : video.url}</span>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeExistingVideo(video)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {newVideos.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeNewVideo(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm hover:bg-muted/50">
          <Video className="h-4 w-4" />
          Upload video file
          <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => addVideos(e.target.files)} />
        </label>

        <div className="space-y-2">
          <Label className="text-sm">Video links (YouTube or Vimeo)</Label>
          {videoUrls.map((url, index) => (
            <Input
              key={index}
              value={url}
              onChange={e => updateVideoUrl(index, e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVideoUrlField}>
            <Plus className="mr-2 h-4 w-4" />
            Add another link
          </Button>
        </div>
      </div>
    </div>
  );
}
