export interface CampaignCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CampaignBannerBuildOptions {
  fileName: string;
  mimeType?: string;
  quality?: number;
}

export interface CampaignBannerBuildResult {
  file: File;
  previewUrl: string;
}

export interface ICampaignBannerImageService {
  readFileAsDataUrl(file: File): Promise<string>;
  buildCroppedBanner(
    sourceUrl: string,
    cropArea: CampaignCropArea,
    options: CampaignBannerBuildOptions,
  ): Promise<CampaignBannerBuildResult>;
}

export class CampaignBannerImageService implements ICampaignBannerImageService {
  async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Failed to read image file.'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read image file.'));
      };

      reader.readAsDataURL(file);
    });
  }

  async buildCroppedBanner(
    sourceUrl: string,
    cropArea: CampaignCropArea,
    options: CampaignBannerBuildOptions,
  ): Promise<CampaignBannerBuildResult> {
    const image = await this.loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to prepare banner canvas.');
    }

    context.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height,
    );

    const mimeType = this.resolveMimeType(options.mimeType);
    const blob = await this.toBlob(canvas, mimeType, options.quality ?? 0.92);
    const file = new File([blob], options.fileName, {
      type: mimeType,
      lastModified: Date.now(),
    });

    return {
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  private loadImage(sourceUrl: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error('Failed to load banner image.'));
      };

      image.src = sourceUrl;
    });
  }

  private toBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Failed to prepare cropped banner.'));
      }, mimeType, quality);
    });
  }

  private resolveMimeType(mimeType?: string): string {
    if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/webp') {
      return mimeType;
    }

    return 'image/jpeg';
  }
}

