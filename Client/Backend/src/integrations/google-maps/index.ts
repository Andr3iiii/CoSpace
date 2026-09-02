import { config } from '../../config';

export class GoogleMapsClientIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.googleMaps.apiKey;
  }

  getEmbedMapUrl(lat = 13.6218, lng = 123.1948): string {
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}`;
  }
}

export const googleMapsClient = new GoogleMapsClientIntegration();
