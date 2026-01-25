import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';

interface Company {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    primary_color: string;
    secondary_color: string;
    timezone: string;
    locale: string;
    owner_id: number | null;
    package_id: number | null;
    email: string;
    phone: string;
    address: string;
}

interface Props {
    company: Company;
}

export default function CompanySettings({ company }: Props) {
    const [form, setForm] = useState<Company>({ ...company });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const route = useRoute();

    const timezones = [
        'Africa/Lusaka',
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
    ];

    const locales = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
    ];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null) data.append(key, String(value));
        });

        if (logoFile) {
            data.append('logo', logoFile);
        }

        data.append('_method', 'PUT');

        router.post(route('admin.settings.company.update', company.id), data, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout title="Company Settings">
            <Head title="Company Settings" />

            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    {/* Landing Page Link Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Public Landing Page</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/company/${company.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-all"
                                >
                                    {typeof window !== 'undefined' ? window.location.origin + `/company/${company.slug}` : `/company/${company.slug}`}
                                </a>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        if (typeof window !== 'undefined') {
                                            navigator.clipboard.writeText(window.location.origin + `/company/${company.slug}`);
                                        }
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Company Information</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                encType="multipart/form-data"
                            >
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" value={form.name} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" name="slug" value={form.slug} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label htmlFor="logo">Logo</Label>
                                    <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                                    {form.logo && (
                                        <img src={form.logo} alt="Current Logo" className="h-12 mt-2" />
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label htmlFor="primary_color" className="min-w-[140px]">
                                        Primary Color
                                    </Label>
                                    <Input
                                        id="primary_color"
                                        name="primary_color"
                                        type="color"
                                        value={form.primary_color}
                                        onChange={handleChange}
                                        className="w-12 h-8 p-0 border cursor-pointer"
                                    />
                                </div>


                                <div className="flex items-center gap-3">
                                    <Label htmlFor="secondary_color" className="min-w-[140px]">
                                        Secondary Color
                                    </Label>
                                    <Input
                                        id="secondary_color"
                                        name="secondary_color"
                                        type="color"
                                        value={form.secondary_color}
                                        onChange={handleChange}
                                        className="w-12 h-8 p-0 border cursor-pointer"
                                    />
                                </div>


                                <div>
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <select
                                        id="timezone"
                                        name="timezone"
                                        value={form.timezone}
                                        onChange={handleChange}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="locale">Locale</Label>
                                    <select
                                        id="locale"
                                        name="locale"
                                        value={form.locale}
                                        onChange={handleChange}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        {locales.map(loc => (
                                            <option key={loc.value} value={loc.value}>
                                                {loc.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" value={form.email} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={form.address} onChange={handleChange} />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit">Update Company</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
