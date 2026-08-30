import { clientProfileRepository } from '../repositories/clientProfile.repository';

export class ClientProfileService {
  async getProfile(clientId: string) {
    const profile = await clientProfileRepository.getFullProfile(clientId);
    if (!profile) {
      throw new Error('Profile not found.');
    }
    return profile;
  }

  async updateProfile(clientId: string, data: any) {
    return clientProfileRepository.updateProfile(clientId, data);
  }

  async updatePreferences(clientId: string, preferences: any) {
    return clientProfileRepository.updatePreferences(clientId, preferences);
  }
}

export const clientProfileService = new ClientProfileService();
