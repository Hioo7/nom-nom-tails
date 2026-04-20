import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, RefObject } from 'react';

interface UseDeliveryProofCaptureReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  capturedFile: File | null;
  isStarting: boolean;
  cameraError: string;
  hasCameraSupport: boolean;
  capturePhoto: () => Promise<void>;
  retakePhoto: () => Promise<void>;
  openPicker: () => void;
  handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}

function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

function revokePreview(previewUrl: string | null): void {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not create photo'));
        return;
      }

      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

export function useDeliveryProofCapture(): UseDeliveryProofCaptureReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [cameraError, setCameraError] = useState('');

  const hasCameraSupport =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const setPreviewFile = useCallback((file: File) => {
    setCapturedFile(file);
    setPreviewUrl((current) => {
      revokePreview(current);
      return createFilePreview(file);
    });
  }, []);

  const startCamera = useCallback(async () => {
    if (!hasCameraSupport) {
      setCameraError('Phone camera is not ready here. Use the camera button below.');
      setIsStarting(false);
      return;
    }

    setIsStarting(true);
    setCameraError('');
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError('Phone camera did not open. Use the button below.');
    } finally {
      setIsStarting(false);
    }
  }, [hasCameraSupport, stopCamera]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void startCamera();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => () => revokePreview(previewUrl), [previewUrl]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Wait for the camera, then try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not take photo. Try again.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas);
    const file = new File([blob], `delivery-proof-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    stopCamera();
    setCameraError('');
    setPreviewFile(file);
  }, [setPreviewFile, stopCamera]);

  const retakePhoto = useCallback(async () => {
    setCapturedFile(null);
    setPreviewUrl((current) => {
      revokePreview(current);
      return null;
    });
    await startCamera();
  }, [startCamera]);

  const openPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      stopCamera();
      setCameraError('');
      setPreviewFile(file);
      event.target.value = '';
    },
    [setPreviewFile, stopCamera],
  );

  return {
    videoRef,
    fileInputRef,
    previewUrl,
    capturedFile,
    isStarting,
    cameraError,
    hasCameraSupport,
    capturePhoto,
    retakePhoto,
    openPicker,
    handleFileSelect,
  };
}
