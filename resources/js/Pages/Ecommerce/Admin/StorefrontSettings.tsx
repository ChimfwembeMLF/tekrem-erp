import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ImageIcon, Loader2, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import { ModuleFormSection, ModuleFormField, ModuleFormHint } from '@/Components/Module/moduleFormWrappers';

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
    <ModuleDashboardShell
      title="Storefront settings"
      description="Configure the public shop appearance"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
      actions={
        <Button variant="outline" asChild>
          <Link href={route('shop.index')}>View shop</Link>
        </Button>
      }
    >
      <Head title="Storefront settings" />

      <ModuleFormSection
        title="Shop hero background"
        description="Wide banner behind the featured products carousel on the shop home page."
        icon={<ImageIcon className="h-5 w-5" />}
      >
        <Alert className="mb-6">
          <AlertDescription className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Recommended size</p>
            <p>
              <strong>{req.recommended_width} × {req.recommended_height} px</strong> ({req.recommended_aspect_ratio})
            </p>
            <p className="text-muted-foreground">
              Min {req.min_width}×{req.min_height} · Max {req.max_width}×{req.max_height} · {req.max_file_size_kb} KB · {req.allowed_mimes.join(', ').toUpperCase()}
            </p>
          </AlertDescription>
        </Alert>

        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-muted/40">
          <div className="relative aspect-[3/1] min-h-[160px] bg-muted">
            {displayUrl ? (
              <img src={displayUrl} alt="Shop hero preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hero background uploaded
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <ModuleFormField label="Upload new background" htmlFor="hero_background">
            <Input
              id="hero_background"
              type="file"
              accept={req.allowed_mimes.map((m) => `.${m}`).join(',')}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </ModuleFormField>

          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-4">
            <Button type="submit" disabled={!file || processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                'Save background'
              )}
            </Button>
            {hero.background_url && (
              <Button type="button" variant="outline" onClick={removeBackground}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove current
              </Button>
            )}
          </div>
        </form>

        <div className="mt-4">
          <ModuleFormHint>
            Product slides and text appear on top of this image. Keep important content centered-left.
          </ModuleFormHint>
        </div>
      </ModuleFormSection>
    </ModuleDashboardShell>
  );
}
