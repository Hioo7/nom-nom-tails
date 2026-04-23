import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Area, Point } from 'react-easy-crop';
import { CampaignBannerImageService } from '../services/campaignBannerImage.service';
import { priceService } from '../services/price.service';
import type {
  ApiError,
  ApiErrorField,
  Campaign,
  CreateCampaignPayload,
  FieldErrors,
} from '../types';

const campaignBannerImageService = new CampaignBannerImageService();

export type CampaignFormStep = 1 | 2 | 3 | 4;

interface UseCampaignFormOptions {
  campaign?: Campaign;
  onSaved: (payload: CreateCampaignPayload, imageFile?: File) => Promise<void>;
  onClose: () => void;
}

export interface UseCampaignFormReturn {
  step: CampaignFormStep;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  cost: string;
  setCost: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  runForever: boolean;
  setRunForever: (value: boolean) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  editorImageUrl: string | null;
  imagePreview: string | null;
  crop: Point;
  handleCropChange: (value: Point) => void;
  zoom: number;
  handleZoomChange: (value: number) => void;
  handleCropComplete: (_croppedArea: Area, croppedAreaPixels: Area) => void;
  handleImageSelect: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  canGoNext: boolean;
  goNext: () => Promise<void>;
  goBack: () => void;
  isSubmitting: boolean;
  isPreparingImage: boolean;
  errorMessage: string;
  fieldErrors: FieldErrors;
  handleSubmit: () => Promise<void>;
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function buildImageFileName(sourceName?: string): string {
  const originalName = sourceName?.trim() || 'campaign-banner';
  const extensionIndex = originalName.lastIndexOf('.');

  if (extensionIndex < 1) {
    return `${originalName}.jpg`;
  }

  return originalName;
}

export function useCampaignForm({
  campaign,
  onSaved,
  onClose,
}: UseCampaignFormOptions): UseCampaignFormReturn {
  const [step, setStep] = useState<CampaignFormStep>(1);
  const [name, setName] = useState(campaign?.name ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [cost, setCost] = useState(
    campaign ? priceService.formatPaiseInput(campaign.costAmount) : '',
  );
  const [startDate, setStartDate] = useState(toDateInputValue(campaign?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(campaign?.endDate));
  const [runForever, setRunForever] = useState(campaign?.isOngoing ?? false);
  const [isActive, setIsActive] = useState(campaign?.status !== 'INACTIVE');
  const [editorImageUrl, setEditorImageUrl] = useState<string | null>(campaign?.imageUrl ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(campaign?.imageUrl ?? null);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [selectedImageFileName, setSelectedImageFileName] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [hasImageEdits, setHasImageEdits] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    return () => {
      if (generatedPreviewUrl) {
        URL.revokeObjectURL(generatedPreviewUrl);
      }
    };
  }, [generatedPreviewUrl]);

  const step1Valid = name.trim().length > 0;

  const step2Valid = useMemo(() => {
    if (!startDate) {
      return false;
    }

    if (!priceService.isValidRupeeInput(cost)) {
      return false;
    }

    if (!runForever && !endDate) {
      return false;
    }

    if (!runForever && endDate && endDate < startDate) {
      return false;
    }

    return true;
  }, [cost, endDate, runForever, startDate]);

  const canGoNext = step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3;

  const clearValidationState = useCallback(() => {
    setErrorMessage('');
    setFieldErrors({});
  }, []);

  const handleCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleImageSelect = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearValidationState();
    const nextImageUrl = await campaignBannerImageService.readFileAsDataUrl(file);

    if (generatedPreviewUrl) {
      URL.revokeObjectURL(generatedPreviewUrl);
      setGeneratedPreviewUrl(null);
    }

    setSelectedImageFileName(file.name);
    setEditorImageUrl(nextImageUrl);
    setImagePreview(nextImageUrl);
    setImageFile(undefined);
    setHasImageEdits(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [clearValidationState, generatedPreviewUrl]);

  const handleCropChange = useCallback((value: Point) => {
    setCrop(value);
    if (editorImageUrl) {
      setHasImageEdits(true);
    }
  }, [editorImageUrl]);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
    if (editorImageUrl) {
      setHasImageEdits(true);
    }
  }, [editorImageUrl]);

  const prepareEditedImage = useCallback(async (): Promise<void> => {
    if (!editorImageUrl) {
      return;
    }

    if (!hasImageEdits) {
      setImageFile(undefined);
      setImagePreview(editorImageUrl);
      return;
    }

    if (!croppedAreaPixels) {
      setImagePreview(editorImageUrl);
      return;
    }

    setIsPreparingImage(true);

    try {
      const result = await campaignBannerImageService.buildCroppedBanner(
        editorImageUrl,
        {
          x: Math.round(croppedAreaPixels.x),
          y: Math.round(croppedAreaPixels.y),
          width: Math.round(croppedAreaPixels.width),
          height: Math.round(croppedAreaPixels.height),
        },
        {
          fileName: buildImageFileName(selectedImageFileName),
          mimeType: selectedImageFileName?.toLowerCase().endsWith('.png')
            ? 'image/png'
            : 'image/jpeg',
        },
      );

      if (generatedPreviewUrl) {
        URL.revokeObjectURL(generatedPreviewUrl);
      }

      setGeneratedPreviewUrl(result.previewUrl);
      setImageFile(result.file);
      setImagePreview(result.previewUrl);
      setHasImageEdits(false);
    } finally {
      setIsPreparingImage(false);
    }
  }, [croppedAreaPixels, editorImageUrl, generatedPreviewUrl, hasImageEdits, selectedImageFileName]);

  const validateStep1 = useCallback((): boolean => {
    if (name.trim()) {
      return true;
    }

    setFieldErrors({ name: 'Campaign name is required.' });
    setErrorMessage('Please fix the highlighted fields.');
    return false;
  }, [name]);

  const validateStep2 = useCallback((): boolean => {
    const nextErrors: FieldErrors = {};
    const parsedCost = priceService.parseRupeeInput(cost);

    if (parsedCost === null) {
      nextErrors['cost'] = 'Enter a valid campaign cost in rupees with up to 2 decimals.';
    }

    if (!startDate) {
      nextErrors['startDate'] = 'Start date is required.';
    }

    if (!runForever && !endDate) {
      nextErrors['endDate'] = 'End date is required unless the campaign runs forever.';
    }

    if (!runForever && startDate && endDate && endDate < startDate) {
      nextErrors['endDate'] = 'End date cannot be earlier than start date.';
    }

    if (Object.keys(nextErrors).length === 0) {
      return true;
    }

    setFieldErrors(nextErrors);
    setErrorMessage('Please fix the highlighted fields.');
    return false;
  }, [cost, endDate, runForever, startDate]);

  const goNext = useCallback(async () => {
    clearValidationState();

    if (step === 1) {
      if (!validateStep1()) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) {
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      try {
        await prepareEditedImage();
        setStep(4);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to prepare banner preview.';
        setErrorMessage(message);
      }
    }
  }, [clearValidationState, prepareEditedImage, step, validateStep1, validateStep2]);

  const goBack = useCallback(() => {
    clearValidationState();
    setStep((currentStep) => (currentStep > 1 ? ((currentStep - 1) as CampaignFormStep) : currentStep));
  }, [clearValidationState]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    clearValidationState();

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editorImageUrl && !imageFile) {
        await prepareEditedImage();
      }

      const parsedCost = priceService.parseRupeeInput(cost);

      if (parsedCost === null) {
        setFieldErrors({ cost: 'Enter a valid campaign cost in rupees with up to 2 decimals.' });
        setErrorMessage('Please fix the highlighted fields.');
        return;
      }

      const payload: CreateCampaignPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        cost: parsedCost,
        startDate,
        endDate: runForever ? null : endDate || null,
        runForever,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
      };

      await onSaved(payload, imageFile);
      onClose();
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError?.fields) {
        const nextFieldErrors: FieldErrors = {};
        apiError.fields.forEach((field: ApiErrorField) => {
          nextFieldErrors[field.path] = field.message;
        });
        setFieldErrors(nextFieldErrors);
      }

      setErrorMessage(apiError?.message ?? 'Failed to save campaign.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    clearValidationState,
    cost,
    description,
    editorImageUrl,
    endDate,
    imageFile,
    isActive,
    isSubmitting,
    name,
    onClose,
    onSaved,
    prepareEditedImage,
    runForever,
    startDate,
    validateStep1,
    validateStep2,
  ]);

  return {
    step,
    name,
    setName,
    description,
    setDescription,
    cost,
    setCost,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    runForever,
    setRunForever,
    isActive,
    setIsActive,
    editorImageUrl,
    imagePreview,
    crop,
    handleCropChange,
    zoom,
    handleZoomChange,
    handleCropComplete,
    handleImageSelect,
    canGoNext,
    goNext,
    goBack,
    isSubmitting,
    isPreparingImage,
    errorMessage,
    fieldErrors,
    handleSubmit,
  };
}

