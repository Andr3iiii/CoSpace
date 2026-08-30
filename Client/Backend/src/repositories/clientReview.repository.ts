import { query } from '../database/connection';

export class ClientReviewRepository {
  async createReview(data: {
    client_id: string;
    workspace_id: string;
    booking_id?: string;
    rating: number;
    comment?: string;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO reviews (client_id, workspace_id, booking_id, rating, comment, is_published)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [data.client_id, data.workspace_id, data.booking_id || null, data.rating, data.comment || null]
    );
    return rows[0];
  }
}

export const clientReviewRepository = new ClientReviewRepository();
