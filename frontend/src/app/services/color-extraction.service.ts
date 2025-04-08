import { Injectable } from '@angular/core';
// @ts-ignore
import ColorThief from 'color-thief-browser';

export interface ColorData {
  dominant?: string;
  palette?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ColorExtractionService {
  private colorThief: any;
  private initialized = false;
  
  constructor() {
    this.initColorThief();
  }
  
  /**
   * Initialize ColorThief library with error handling
   */
  private initColorThief(): void {
    if (this.initialized) return;
    
    try {
      this.colorThief = new ColorThief();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ColorThief:', error);
      this.colorThief = null;
    }
  }
  
  /**
   * Extract colors from an image element
   * @param img HTML Image element with a loaded image
   * @returns ColorData object with dominant color and palette, or undefined if extraction fails
   */
  extractColors(img: HTMLImageElement): ColorData | undefined {
    if (!this.colorThief || !img || !img.complete || img.naturalWidth === 0) {
      return undefined;
    }
    
    try {
      // Extract dominant color
      const dominantRgb = this.safeGetColor(img);
      if (!dominantRgb) return undefined;
      
      const dominant = this.rgbToHex(dominantRgb);
      
      // Extract color palette (5 colors)
      const paletteRgb = this.safeGetPalette(img, 5);
      const palette = paletteRgb?.map(rgb => this.rgbToHex(rgb)) || [];
      
      return { dominant, palette };
    } catch (error) {
      console.error('Error extracting colors:', error);
      return undefined;
    }
  }
  
  /**
   * Safely get dominant color with error handling
   */
  private safeGetColor(img: HTMLImageElement): number[] | undefined {
    try {
      // Check if the image is valid for color extraction
      if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        return undefined;
      }
      
      // Ensure the image has been loaded properly
      if (!(img instanceof HTMLImageElement) || !img.src) {
        return undefined;
      }
      
      // Try to get color with additional error handling
      const result = this.colorThief.getColor(img);
      
      // Verify result is a valid RGB array
      if (!Array.isArray(result) || result.length < 3) {
        return undefined;
      }
      
      return result;
    } catch (error) {
      console.warn('Could not extract dominant color:', error);
      return undefined;
    }
  }
  
  /**
   * Safely get color palette with error handling
   */
  private safeGetPalette(img: HTMLImageElement, colorCount: number): number[][] | undefined {
    try {
      // Add the same validation as in safeGetColor
      if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        return undefined;
      }
      
      if (!(img instanceof HTMLImageElement) || !img.src) {
        return undefined;
      }
      
      return this.colorThief.getPalette(img, colorCount);
    } catch (error) {
      console.warn('Could not extract color palette:', error);
      return undefined;
    }
  }
  
  /**
   * Convert RGB array to hex color string
   */
  private rgbToHex(rgb: number[]): string {
    if (!rgb || rgb.length < 3) return '#000000';
    
    return '#' + rgb.map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
} 