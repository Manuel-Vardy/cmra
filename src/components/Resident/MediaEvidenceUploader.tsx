'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  FolderOpen,
  UploadCloud,
  X,
  Video,
  Image as ImageIcon,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  SwitchCamera,
} from 'lucide-react';
import { ReportMedia } from '@/lib/types';

interface MediaEvidenceUploaderProps {
  mediaList: ReportMedia[];
  onMediaChange: (media: ReportMedia[]) => void;
}

const SAMPLE_MEDIA_OPTIONS = [
  {
    name: 'Pothole Hazard Photo.jpg',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    size: '1.8 MB',
    type: 'image' as const,
  },
  {
    name: 'Drainage Overflow Photo.jpg',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    size: '2.4 MB',
    type: 'image' as const,
  },
  {
    name: 'Downed Power Lines.jpg',
    url: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80',
    size: '3.1 MB',
    type: 'image' as const,
  },
];

export default function MediaEvidenceUploader({
  mediaList,
  onMediaChange,
}: MediaEvidenceUploaderProps) {
  // Input references
  const fileFolderInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Viewfinder Modal State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedFlash, setCapturedFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

  // Stop camera stream on unmount or modal close
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  // Open Live Camera Viewfinder modal
  const startLiveCamera = async (facing: 'user' | 'environment' = 'environment') => {
    setCameraError('');
    setIsLiveCameraOpen(true);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Live webcam stream could not be started:', err);
      setCameraError(
        'Unable to open live webcam stream directly (permission or device unavailable). You can still capture via native camera below!'
      );
      // Fallback: trigger native camera input
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      }
    }
  };

  const switchCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture photo from live video stream
  const capturePhotoFromStream = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Trigger visual shutter flash
    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 200);

    const newMedia: ReportMedia = {
      id: 'cam-' + Date.now(),
      type: 'image',
      name: `Camera_Capture_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.jpg`,
      url: dataUrl,
      size: `${(dataUrl.length / (1024 * 1024) * 0.75).toFixed(1)} MB`,
    };

    onMediaChange([...mediaList, newMedia]);

    // Close camera after capturing photo
    setTimeout(() => {
      stopCameraStream();
      setIsLiveCameraOpen(false);
    }, 400);
  };

  // Handle files selected from folder dialog or drag-and-drop
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: ReportMedia[] = [];

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) return;

      const objectUrl = URL.createObjectURL(file);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

      newItems.push({
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        type: isVideo ? 'video' : 'image',
        name: file.name,
        url: objectUrl,
        size: `${fileSizeMB} MB`,
      });
    });

    if (newItems.length > 0) {
      onMediaChange([...mediaList, ...newItems]);
    }
  };

  const handleFolderBrowse = () => {
    if (fileFolderInputRef.current) {
      fileFolderInputRef.current.value = '';
      fileFolderInputRef.current.click();
    }
  };

  const handleNativeCameraClick = () => {
    // Attempt live camera first, else fallback to native camera input
    startLiveCamera(facingMode);
  };

  const handleRemoveMedia = (id: string) => {
    onMediaChange(mediaList.filter((m) => m.id !== id));
  };

  const handleAddSample = (sample: (typeof SAMPLE_MEDIA_OPTIONS)[0]) => {
    onMediaChange([
      ...mediaList,
      {
        id: 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        type: sample.type,
        name: sample.name,
        url: sample.url,
        size: sample.size,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      {/* 1. Folder Browser: Multiple files (Images and Videos) */}
      <input
        ref={fileFolderInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => processFiles(e.target.files)}
        className="hidden"
      />

      {/* 2. Direct Camera Capture Input (HTML5 Camera trigger) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => processFiles(e.target.files)}
        className="hidden"
      />

      {/* Dual Big Action Buttons: Open Camera vs Browse Folders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BUTTON 1: OPEN CAMERA */}
        <button
          type="button"
          onClick={handleNativeCameraClick}
          className="group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 hover:border-blue-600 transition-all text-center shadow-xs cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Open Camera & Take Photo
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Capture live photo of the issue directly with device camera
          </span>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700 shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Live Camera Shutter</span>
          </div>
        </button>

        {/* BUTTON 2: OPEN FOLDERS / BROWSE FILES */}
        <button
          type="button"
          onClick={handleFolderBrowse}
          className="group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 hover:border-indigo-600 transition-all text-center shadow-xs cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-110 transition-transform mb-3">
            <FolderOpen className="w-7 h-7" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Browse Folders (Images & Videos)
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Select files from your phone gallery or desktop folders
          </span>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700 shadow-2xs">
            <UploadCloud className="w-3 h-3 text-indigo-500" />
            <span>Select Multiple Files</span>
          </div>
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={handleFolderBrowse}
        className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer ${
          isDragging
            ? 'border-blue-600 bg-blue-100/50 dark:bg-blue-900/30 ring-4 ring-blue-500/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-slate-400'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Or drag and drop image and video files here from your file explorer
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Supports JPG, PNG, WEBP, MP4, MOV up to 50MB
        </p>
      </div>

      {/* Attached Media Previews */}
      {mediaList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Attached Evidence ({mediaList.length} files)
            </span>
            <span className="text-[11px] text-slate-400">
              Click photo to enlarge • remove anytime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="relative h-40 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {item.type === 'video' ? (
                        <>
                          <Video className="w-3 h-3 text-purple-400" /> Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-cyan-400" /> Photo
                        </>
                      )}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMedia(item.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition shadow-md"
                    title="Remove this media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Media Details */}
                <div className="p-3 bg-white dark:bg-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[170px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    {item.size && (
                      <div className="text-[10px] text-slate-400">{item.size}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Demo Presets */}
      <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
          Or Quickly Attach Demo Evidence:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MEDIA_OPTIONS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => handleAddSample(sample)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              + {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* LIVE CAMERA VIEWFINDER MODAL */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col relative">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-sm">Live Camera Viewfinder</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsLiveCameraOpen(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Video Viewfinder */}
            <div className="relative w-full h-80 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Shutter flash effect */}
              {capturedFlash && (
                <div className="absolute inset-0 bg-white opacity-90 transition-opacity duration-200 z-30" />
              )}

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border border-white/50 rounded-full" />
              </div>

              {cameraError && (
                <div className="absolute inset-4 bg-slate-900/90 p-4 rounded-2xl text-center flex flex-col items-center justify-center text-xs space-y-2 text-red-300">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (nativeCameraInputRef.current) nativeCameraInputRef.current.click();
                      setIsLiveCameraOpen(false);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    Open System Camera App
                  </button>
                </div>
              )}
            </div>

            {/* Hidden canvas for snapshot rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls Bar */}
            <div className="p-4 bg-slate-950 flex items-center justify-around border-t border-slate-800">
              {/* Switch Camera (Front/Back) */}
              <button
                type="button"
                onClick={switchCameraFacing}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition"
                title="Switch Camera Facing"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Main Shutter Button */}
              <button
                type="button"
                onClick={capturePhotoFromStream}
                className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                title="Take Photo"
              >
                <div className="w-12 h-12 rounded-full bg-white/20" />
              </button>

              {/* Fallback to Native Camera button */}
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsLiveCameraOpen(false);
                  if (nativeCameraInputRef.current) nativeCameraInputRef.current.click();
                }}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition text-xs"
                title="System Camera"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
