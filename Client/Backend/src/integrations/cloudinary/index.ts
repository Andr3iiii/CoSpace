import { config } from '../../config';

export class CloudinaryClientIntegration {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = config.cloudinary.cloudName;
    this.apiKey = config.cloudinary.apiKey;
    this.apiSecret = config.cloudinary.apiSecret;
  }

  async uploadAvatar(fileBuffer: Buffer, fileName: string): Promise<string> {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/avatars/${fileName}`;
  }
}

export const cloudinaryClient = new CloudinaryClientIntegration();
