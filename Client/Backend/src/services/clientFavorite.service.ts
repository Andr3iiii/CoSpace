import { clientFavoriteRepository } from '../repositories/clientFavorite.repository';

export class ClientFavoriteService {
  async getFavorites(clientId: string) {
    return clientFavoriteRepository.getFavorites(clientId);
  }

  async toggleFavorite(clientId: string, workspaceId: string) {
    return clientFavoriteRepository.toggleFavorite(clientId, workspaceId);
  }
}

export const clientFavoriteService = new ClientFavoriteService();
