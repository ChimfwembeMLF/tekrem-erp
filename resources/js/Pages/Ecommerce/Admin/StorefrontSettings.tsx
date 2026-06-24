import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ArrowLeft, ImageIcon, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface HeroRequirements {
  min_width: number;
  min_height: number;
  max_width: number;
  max_height: number;
  recommended_width: number;
  recommended_height: number;
  recommended_aspect_ratio: string;
  max_file_size_kb: number;
  allowed_mimes: string[];
}

interface Props {
  hero: {
    background_url: string | null;
    requirements: HeroRequirements;
  };
}

export default function StorefrontSettings({ hero }: Props) {
  const route = useRoute();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const req = hero.requirements;

  const onFileChange = (selected: File | null) => {
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('hero_background', file);
    setProcessing(true);

    router.post(route('ecommerce.settings.hero-background'), formData, {
      forceFormData: true,
      onFinish: () => {
        setProcessing(false);
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      },
    });
  };

  const removeBackground = () => {
    if (!confirm('Remove the shop hero background image?')) return;
    router.delete(route('ecommerce.settings.hero-background.destroy'));
  };

  const displayUrl = previewUrl ?? hero.background_url;

  return (
    <AppLayout title="Storefront settings">
      <Head title="Storefront settings" />

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href={route('ecommerce.dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ecommerce
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Storefront settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure the public shop appearance.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Shop hero background
            </CardTitle>
            <CardDescription>
              Wide banner behind the featured products carousel on{' '}
              <Link href={route('shop.index')} className="text-primary hover:underline">
                /shop
              </Link>
              . Text and product slides appear on top of this image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription className="space-y-2 text-sm">
                <p className="font-medium text-foreground">Recommended size</p>
                <p>
                  <strong>{req.recommended_width} × {req.recommended_height} px</strong>{' '}
                  ({req.recommended_aspect_ratio} landscape banner)
                </p>
                <p className="text-muted-foreground">
                  Minimum {req.min_width} × {req.min_height} px · Maximum {req.max_width} × {req.max_height} px ·
                  Up to {req.max_file_size_kb} KB · {req.allowed_mimes.join(', ').toUpperCase()}
                </p>
                <p className="text-muted-foreground">
                  The hero displays at roughly 1280 × 280–420 px on screen (responsive). Use a wide image with
                  important content centered-left — edges may be cropped on smaller screens.
                </p>
              </AlertDescription>
            </Alert>

            <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
              <div className="relative aspect-[3/1] min-h-[160px] bg-muted">
                {displayUrl ? (
                  <img src={displayUrl} alt="Shop hero preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No hero background uploaded
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="pointer-events-none absolute bottom-4 left-4 text-white">
                  <p className="text-xs uppercase tracking-widest text-white/70">Preview</p>
                  <p className="text-lg font-semibold">Featured product headline</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_background">Upload new background</Label>
                <Input
                  id="hero_background"
                  type="file"
                  accept={req.allowed_mimes.map((m) => `.${m}`).join(',')}
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={!file || processing}>
                  {processing ? 'Uploading…' : 'Save background'}
                </Button>
                {hero.background_url && (
                  <Button type="button" variant="outline" onClick={removeBackground}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove current
                  </Button>
                )}
                <Button type="button" variant="ghost" asChild>
                  <Link href={route('shop.index')}>View shop</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
