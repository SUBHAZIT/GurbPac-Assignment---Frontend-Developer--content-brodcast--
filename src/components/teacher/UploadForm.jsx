'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import { 
  Upload, 
  X, 
  Loader2, 
  Calendar,
  Clock,
  Type,
  BookOpen,
  FileText,
  Film,
  Image as ImageIcon,
  Music,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FILE_TYPE_MAP = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'pdf',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/mp4': 'audio',
};

function getFileCategory(mimeType) {
  return FILE_TYPE_MAP[mimeType] || 'other';
}

function getFileIcon(category) {
  switch (category) {
    case 'image': return <ImageIcon className="h-6 w-6" />;
    case 'video': return <Film className="h-6 w-6" />;
    case 'pdf': return <FileText className="h-6 w-6" />;
    case 'audio': return <Music className="h-6 w-6" />;
    default: return <File className="h-6 w-6" />;
  }
}

function getFileBadgeColor(category) {
  switch (category) {
    case 'image': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'video': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'pdf': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'audio': return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const uploadSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  rotationDuration: z.coerce.number().min(5, 'Min duration is 5s').max(3600, 'Max 1 hour'),
}).refine((data) => {
  return new Date(data.endTime) > new Date(data.startTime);
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export default function UploadForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [fileCategory, setFileCategory] = useState(null);

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      subject: '',
      description: '',
      startTime: '',
      endTime: '',
      rotationDuration: 10,
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size too large. Max 50MB allowed.');
      return;
    }

    const category = getFileCategory(selectedFile.type);
    setFile(selectedFile);
    setFileCategory(category);

    // Generate preview for images and videos
    if (category === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else if (category === 'video') {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setFileCategory(null);
  };

  async function onSubmit(values) {
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setIsLoading(true);
    try {
      await contentService.uploadContent({
        title: values.title,
        subject: values.subject,
        description: values.description || '',
        start_time: values.startTime,
        end_time: values.endTime,
        rotation_duration: values.rotationDuration,
        file_type: fileCategory || 'other',
        teacher_id: user.id,
      }, file);
      
      toast.success('Content uploaded successfully and pending approval!');
      navigate('/teacher/content');
    } catch (error) {
      toast.error(error.message || 'Failed to upload content');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Content</h1>
        <p className="text-slate-500 mt-1">Upload any media — images, videos, PDFs, audio — to schedule your broadcast.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white">
                  <CardTitle className="text-lg">General Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-slate-400" /> Title
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Introduction to Physics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" /> Subject
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide some context about this content..." 
                            className="min-h-[120px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white">
                  <CardTitle className="text-lg">Broadcast Schedule</CardTitle>
                  <CardDescription>Specify when and how long this content should be shown.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" /> Start Time
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" /> End Time
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rotationDuration"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Rotation Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>How long this content stays on screen during the rotation.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden sticky top-8">
                <CardHeader className="border-b border-slate-100 bg-white">
                  <CardTitle className="text-lg">Media Upload</CardTitle>
                  <CardDescription>Images, Videos, PDFs, Audio — up to 50MB</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {file ? (
                    <div className="space-y-3">
                      {/* Preview area */}
                      {preview && fileCategory === 'image' && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={clearFile} className="rounded-full">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {preview && fileCategory === 'video' && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                          <video src={preview} controls className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* File info card */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className={`p-2 rounded-lg border ${getFileBadgeColor(fileCategory)}`}>
                          {getFileIcon(fileCategory)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] capitalize">{fileCategory}</Badge>
                            <span className="text-[11px] text-slate-400">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500" onClick={clearFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <Upload className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">Click to upload</p>
                        <p className="text-xs text-slate-500">Any file type up to 50MB</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1 px-4">
                        {['JPG', 'PNG', 'MP4', 'PDF', 'MP3'].map(t => (
                          <span key={t} className="text-[9px] font-semibold bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={handleFileChange} 
                  />

                  <div className="mt-8 space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-teal-500 hover:bg-teal-600 py-6 font-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        'Submit for Approval'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full py-6"
                      onClick={() => navigate(-1)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
