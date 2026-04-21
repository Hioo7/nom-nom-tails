import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ApiError, ApiErrorField, CreateMealPlanPayload, FieldErrors, MealPlan } from '../types';
import { priceService } from '../services/price.service';

export type MealPlanFormStep = 1 | 2 | 3;

interface UseMealPlanFormOptions {
  mealPlan?: MealPlan;
  onSaved: (payload: CreateMealPlanPayload, imageFile?: File) => Promise<void>;
  onClose: () => void;
}

export interface UseMealPlanFormReturn {
  step: MealPlanFormStep;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  imagePreview: string | null;
  imageFile: File | undefined;
  handleImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedDishIds: string[];
  toggleDish: (dishId: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  canGoNext: boolean;
  goNext: () => void;
  goBack: () => void;
  isSubmitting: boolean;
  errorMessage: string;
  fieldErrors: FieldErrors;
  handleSubmit: () => Promise<void>;
}

export function useMealPlanForm({
  mealPlan,
  onSaved,
  onClose,
}: UseMealPlanFormOptions): UseMealPlanFormReturn {
  const [step, setStep] = useState<MealPlanFormStep>(1);
  const [name, setName] = useState(mealPlan?.name ?? '');
  const [description, setDescription] = useState(mealPlan?.description ?? '');
  const [price, setPrice] = useState(mealPlan ? priceService.formatPaiseInput(mealPlan.price) : '');
  const [imagePreview, setImagePreview] = useState<string | null>(
    mealPlan?.imageUrl || null,
  );
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>(
    mealPlan?.dishes.map((d) => d.dishId) ?? [],
  );
  const [isActive, setIsActive] = useState(mealPlan?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleImageSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const toggleDish = useCallback((dishId: string) => {
    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId],
    );
  }, []);

  const step1Valid = name.trim().length > 0 && priceService.isValidRupeeInput(price);
  const step2Valid = selectedDishIds.length > 0;
  const canGoNext = step === 1 ? step1Valid : step === 2 ? step2Valid : false;

  const goNext = useCallback(() => {
    setStep((s) => (s < 3 ? ((s + 1) as MealPlanFormStep) : s));
  }, []);

  const goBack = useCallback(() => {
    setErrorMessage('');
    setStep((s) => (s > 1 ? ((s - 1) as MealPlanFormStep) : s));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});
    try {
      const parsedPrice = priceService.parseRupeeInput(price);

      if (parsedPrice === null) {
        setFieldErrors({ price: 'Enter a valid price in rupees with up to 2 decimals.' });
        setErrorMessage('Please fix the highlighted fields.');
        return;
      }

      const payload: CreateMealPlanPayload = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        isActive,
        dishIds: selectedDishIds,
      };
      await onSaved(payload, imageFile);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.fields) {
        const mapped: FieldErrors = {};
        apiErr.fields.forEach((f: ApiErrorField) => {
          mapped[f.path] = f.message;
        });
        setFieldErrors(mapped);
      }
      setErrorMessage(apiErr?.message ?? 'Failed to save meal plan.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, name, description, price, isActive, selectedDishIds, imageFile, onSaved, onClose]);

  return {
    step,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    imagePreview,
    imageFile,
    handleImageSelect,
    selectedDishIds,
    toggleDish,
    isActive,
    setIsActive,
    canGoNext,
    goNext,
    goBack,
    isSubmitting,
    errorMessage,
    fieldErrors,
    handleSubmit,
  };
}
