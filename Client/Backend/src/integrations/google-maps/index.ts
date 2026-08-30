import { config } from '../../config';

export class GoogleMapsClientIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.googleMaps.apiKey;
  }

  getEmbedMapUrl(lat = 14.5547, lng = 121.0476): string {
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}`;
  }
}

export const googleMapsClient = new GoogleMapsClientIntegration();
