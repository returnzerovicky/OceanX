import { Order, OrderItem, OrderTimelineEvent } from '../../types';
import { db } from '../db';

export interface Dispute {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  details: string;
  status: 'Opened' | 'Under-Investigation' | 'Resolved' | 'Closed';
  resolution?: string;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  status: 'Held' | 'Released' | 'Refunded';
  heldAt: string;
  releasedAt?: string;
}

export class OrderRepository {
  private disputes: Dispute[] = [];
  private escrows: EscrowTransaction[] = [];

  /**
   * Find order by ID
   */
  public findById(id: string): Order | null {
    const orders = db.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  /**
   * Find all orders belonging to a User ID
   */
  public findByUserId(userId: string): Order[] {
    const orders = db.getOrders();
    return orders.filter(o => o.userId === userId);
  }

  /**
   * Get all orders
   */
  public getAll(): Order[] {
    return db.getOrders();
  }

  /**
   * Save (Insert/Update) order details
   */
  public save(order: Order): void {
    db.addOrder(order);
  }

  /**
   * Update order status and append a new timeline event
   */
  public updateStatus(id: string, status: Order['status'] | string, description: string): Order | null {
    db.updateOrderStatus(id, status as any, description);
    return this.findById(id);
  }

  // ---------------------------------------------------------
  // DISPUTES AND ESCROW ENGINE (MULTI-VENDOR COMPLIANT)
  // ---------------------------------------------------------

  public createDispute(dispute: Dispute): void {
    this.disputes.push(dispute);
  }

  public getDisputes(): Dispute[] {
    return this.disputes;
  }

  public findDisputeById(id: string): Dispute | null {
    return this.disputes.find(d => d.id === id) || null;
  }

  public updateDispute(id: string, updates: Partial<Dispute>): Dispute | null {
    const dispute = this.findDisputeById(id);
    if (dispute) {
      Object.assign(dispute, updates);
      return dispute;
    }
    return null;
  }

  public createEscrow(escrow: EscrowTransaction): void {
    this.escrows.push(escrow);
  }

  public getEscrows(): EscrowTransaction[] {
    return this.escrows;
  }

  public findEscrowByOrderId(orderId: string): EscrowTransaction[] {
    return this.escrows.filter(e => e.orderId === orderId);
  }

  public updateEscrowStatus(id: string, status: EscrowTransaction['status']): EscrowTransaction | null {
    const esc = this.escrows.find(e => e.id === id);
    if (esc) {
      esc.status = status;
      if (status === 'Released') {
        esc.releasedAt = new Date().toISOString();
      }
      return esc;
    }
    return null;
  }
}

export const orderRepository = new OrderRepository();
