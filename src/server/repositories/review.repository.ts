import { Review } from '../../types';
import { db } from '../db';

export class ReviewRepository {
  /**
   * Find reviews by Product ID
   */
  public findByProductId(productId: string): Review[] {
    const reviews = db.getReviews();
    return reviews.filter(r => r.productId === productId);
  }

  /**
   * Add a customer review
   */
  public save(review: Review): void {
    db.addReview(review);
  }

  /**
   * Get all reviews in the system
   */
  public getAll(): Review[] {
    return db.getReviews();
  }
}

export const reviewRepository = new ReviewRepository();
