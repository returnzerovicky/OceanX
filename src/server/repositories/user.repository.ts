import { UserSession } from '../../types';
import { db } from '../db';

export class UserRepository {
  /**
   * Find user by ID
   */
  public findById(id: string): UserSession | null {
    const sessions = db.getUserSessions();
    return sessions.find(s => s.id === id) || null;
  }

  /**
   * Find user by Email
   */
  public findByEmail(email: string): UserSession | null {
    const sessions = db.getUserSessions();
    return sessions.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Get all available user sessions/profiles
   */
  public getAll(): UserSession[] {
    return db.getUserSessions();
  }

  /**
   * Update wallet and coins balance for a specific user
   */
  public updateWallet(id: string, balanceChange: number, rewardCoinsChange: number): UserSession | null {
    db.updateUserWallet(id, balanceChange, rewardCoinsChange);
    return this.findById(id);
  }

  /**
   * Saves/Updates user session profile details
   */
  public save(user: UserSession): void {
    const sessions = db.getUserSessions();
    const idx = sessions.findIndex(s => s.id === user.id);
    if (idx !== -1) {
      sessions[idx] = user;
    } else {
      sessions.push(user);
    }
    // Force persistence to memory store
    db.save();
  }
}

export const userRepository = new UserRepository();
