import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ApiError, ApiErrorField, CreateDishPayload, Dish, FieldErrors } from '../types';

export type DishFormStep = 1 | 2 | 3;

export interface IngredientRowData {
  ingredientId: string;
  quantity: string;
}

interface UseDishFormOptions {
  dish?: Dish;
  onSaved: (payload: CreateDishPayload, imageFile?: File) => Promise<void>;
  onClose: () => void;
}

export interface UseDishFormReturn {
  step: DishFormStep;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  imagePreview: string | null;
  imageFile: File | undefined;
  handleImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  ingredients: IngredientRowData[];
  addIngredient: () => void;
  updateIngredient: (index: number, value: IngredientRowData) => void;
  removeIngredient: (index: number) => void;
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

function buildInitialIngredients(dish?: Dish): IngredientRowData[] {
  if (dish && dish.ingredients.length > 0) {
    return dish.ingredients.map((ing) => ({
      ingredientId: ing.ingredientId,
      quantity: String(ing.quantity),
    }));
  }
  return [{ ingredientId: '', quantity: '' }];
}

export function useDishForm({ dish, onSaved, onClose }: UseDishFormOptions): UseDishFormReturn {
  const [step, setStep] = useState<DishFormStep>(1);

  const [name, setName] = useState(dish?.name ?? '');
  const [description, setDescription] = useState(dish?.description ?? '');
  const [price, setPrice] = useState(dish ? String(dish.price) : '');
  const [imagePreview, setImagePreview] = useState<string | null>(dish?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [ingredients, setIngredients] = useState<IngredientRowData[]>(buildInitialIngredients(dish));
  const [isActive, setIsActive] = useState(dish?.isActive ?? true);
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

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { ingredientId: '', quantity: '' }]);
  }, []);

  const updateIngredient = useCallback((index: number, value: IngredientRowData) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? value : ing)));
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const step1Valid = name.trim().length > 0 && price.trim().length > 0 && Number(price) > 0;

  const step2Valid =
    ingredients.length > 0 &&
    ingredients.every(
      (ing) => ing.ingredientId.trim() && ing.quantity.trim() && Number(ing.quantity) > 0,
    );

  const canGoNext = step === 1 ? step1Valid : step === 2 ? step2Valid : false;

  const goNext = useCallback(() => {
    setStep((s) => (s < 3 ? ((s + 1) as DishFormStep) : s));
  }, []);

  const goBack = useCallback(() => {
    setErrorMessage('');
    setStep((s) => (s > 1 ? ((s - 1) as DishFormStep) : s));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});
    try {
      const payload: CreateDishPayload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        isActive,
        ingredients: ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: Number(ing.quantity),
        })),
      };
      await onSaved(payload, imageFile);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.fields) {
        const mapped: FieldErrors = {};
        apiErr.fields.forEach((f: ApiErrorField) => { mapped[f.path] = f.message; });
        setFieldErrors(mapped);
      }
      setErrorMessage(apiErr?.message ?? 'Failed to save dish.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, name, description, price, isActive, ingredients, imageFile, onSaved, onClose]);

  return {
    step, name, setName, description, setDescription, price, setPrice,
    imagePreview, imageFile, handleImageSelect,
    ingredients, addIngredient, updateIngredient, removeIngredient,
    isActive, setIsActive,
    canGoNext, goNext, goBack,
    isSubmitting, errorMessage, fieldErrors, handleSubmit,
  };
}
