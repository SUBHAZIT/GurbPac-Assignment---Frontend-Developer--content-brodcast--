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
  Image as ImageIcon, 
  X, 
  Loader2, 
  Calendar,
  Clock,
  Type,
  BookOpen
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
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

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

    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Only JPG, PNG, GIF allowed.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size too large. Max 10MB allowed.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  async function onSubmit(values) {
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    setIsLoading(true);
    try {
      await contentService.uploadContent({
        ...values,
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
        <p className="text-slate-500 mt-1">Fill in the details to schedule your broadcast.</p>
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
                </CardHeader>
                <CardContent className="pt-6">
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => {setPreview(null); setFile(null);}}
                          className="rounded-full"
                        >
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
                        <Upload className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">Click to upload</p>
                        <p className="text-xs text-slate-500">JPG, PNG or GIF (Max 10MB)</p>
                      </div>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange} 
                      />
                    </div>
                  )}

                  <div className="mt-8 space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 font-bold"
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
