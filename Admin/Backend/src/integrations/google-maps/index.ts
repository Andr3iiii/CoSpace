import { config } from '../../config';

export class GoogleMapsAdminIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.googleMaps.apiKey;
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    return { lat: 14.5547, lng: 121.0476 }; // BGC Bonifacio Global City coordinates
  }
}

export const googleMapsAdmin = new GoogleMapsAdminIntegration();
