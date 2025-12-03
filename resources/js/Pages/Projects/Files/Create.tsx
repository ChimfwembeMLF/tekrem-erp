import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Project } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
  project: Project;
  milestones: { id: number; name: string }[];
}

export default function Create({ project, milestones }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const route = useRoute();
  const { data, setData, post, processing, errors, progress } = useForm({
    file: null as File | null,
    name: '',
    description: '',
    category: 'document',
    milestone_id: '',
    access_level: 'team',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setData('file', file);
      // Auto-fill name if empty
      if (!data.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setData('name', nameWithoutExt);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setData('file', null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('projects.files.store', project.id), {
      forceFormData: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <AppLayout title={`Upload File - ${project.name}`} >

      <div className="py-12">
        <div className="mx-auto w-full sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href={route('projects.files.index', project.id)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Files
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Upload a new file to {project.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">
                    File <span className="text-red-500">*</span>
                  </Label>
                  
                  {!selectedFile ? (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Maximum file size: 10MB
                          </p>
                        </div>
                        <input
                          id="file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {errors.file && (
                    <p className="text-sm text-red-600">{errors.file}</p>
                  )}
                </div>

                {/* File Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">File Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter file name (optional)"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to use the original filename
                  </p>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.category}
                    onValueChange={(value) => setData('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Milestone */}
                <div className="space-y-2">
                  <Label htmlFor="milestone_id">Milestone (Optional)</Label>
                  <Select
                    value={data.milestone_id}
                    onValueChange={(value) => setData('milestone_id', value)}
                  >
                    <SelectTrigger id="milestone_id">
                      <SelectValue placeholder="Select milestone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No milestone</SelectItem>
                      {milestones.map((milestone) => (
                        <SelectItem key={milestone.id} value={milestone.id.toString()}>
                          {milestone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.milestone_id && (
                    <p className="text-sm text-red-600">{errors.milestone_id}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the file contents..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Access Level */}
                <div className="space-y-2">
                  <Label htmlFor="access_level">
                    Access Level <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.access_level}
                    onValueChange={(value) => setData('access_level', value)}
                  >
                    <SelectTrigger id="access_level">
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Public - Anyone can view
                      </SelectItem>
                      <SelectItem value="team">
                        Team - Only team members
                      </SelectItem>
                      <SelectItem value="managers">
                        Managers - Only project managers
                      </SelectItem>
                      <SelectItem value="private">
                        Private - Only you
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.access_level && (
                    <p className="text-sm text-red-600">{errors.access_level}</p>
                  )}
                </div>

                {/* Upload Progress */}
                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Link href={route('projects.files.index', project.id)}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing || !selectedFile}>
                    {processing ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
