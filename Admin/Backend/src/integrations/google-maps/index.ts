import { config } from '../../config';

export class GoogleMapsAdminIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.googleMaps.apiKey;
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    return { lat: 13.6218, lng: 123.1948 }; // 2nd Floor JH Bldg., Sta. Cruz, Naga City coordinates
  }
}

export const googleMapsAdmin = new GoogleMapsAdminIntegration();
