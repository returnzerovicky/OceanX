import EventEmitter from 'events';

class OceanEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this.registerDiagnostics();
  }

  private registerDiagnostics() {
    // Monitor and log platform events
    this.on('error', (err) => {
      console.error('[Event Broker Error]: Failed executing listener callback', err);
    });

    const coreEvents = [
      'UserAuthenticated',
      'UserRegistered',
      'ProductCreated',
      'InventoryUpdated',
      'OrderCreated',
      'OrderCancelled',
      'PaymentSucceeded',
      'ShipmentCreated',
      'FraudReviewFlagged',
      'ReviewAdded',
      'DisputeOpened',
      'EscrowReleased'
    ];

    for (const event of coreEvents) {
      this.on(event, (payload) => {
        if (process.env.DEBUG_EVENTS === 'true' || true) {
          console.log(`[Event Dispatched] → "${event}" | Metadata Keys: ${Object.keys(payload || {})}`);
        }
      });
    }
  }
}

export const eventEmitter = new OceanEventEmitter();
export default eventEmitter;
