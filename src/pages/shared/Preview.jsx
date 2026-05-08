import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Film, Image as ImageIcon, FileText, Music, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const type = searchParams.get('type') || 'other';

  if (!url) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Content URL Provided</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          We could not load the preview because no URL was found in the link.
        </p>
        <Button variant="secondary" onClick={() => window.close()}>
          Close Tab
        </Button>
      </div>
    );
  }

  const renderContent = () => {
    switch (type) {
      case 'video':
        return (
          <video 
            src={url} 
            controls 
            autoPlay 
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-slate-800"
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'image':
        return (
          <img 
            src={url} 
            alt="Content Preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        );
      case 'audio':
        return (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center min-w-[300px]">
            <Music className="h-16 w-16 text-teal-500 mb-6" />
            <audio src={url} controls className="w-full" />
          </div>
        );
      case 'pdf':
        return (
          <iframe 
            src={url} 
            className="w-full h-[85vh] rounded-xl shadow-2xl border border-slate-800 bg-white"
            title="PDF Preview"
          />
        );
      default:
        return (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center text-center max-w-sm">
            <FileText className="h-16 w-16 text-slate-500 mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">File Preview</h2>
            <p className="text-sm text-slate-400 mb-6">
              This file type might not be previewable in the browser. You may need to download it to view.
            </p>
            <Button asChild className="bg-teal-500 hover:bg-teal-600">
              <a href={url} target="_blank" rel="noopener noreferrer">Download File</a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => window.close()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
              <Film className="h-4 w-4 text-teal-400" />
            </span>
            <span className="text-sm font-semibold text-slate-200">Content Preview</span>
          </div>
        </div>
        <Badge variant="outline" className="border-slate-700 text-slate-400 capitalize">
          {type}
        </Badge>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {renderContent()}
      </main>
    </div>
  );
}

function Badge({ className, variant, children, ...props }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
