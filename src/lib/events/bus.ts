import { EventEmitter } from 'events';

// In-memory event bus to handle pub/sub workflows.
// ⚠️ ARCHITECTURAL LIMITATION WARNING:
// This implementation uses Node's in-memory EventEmitter, which is confined to the active Node process.
// If deployed in a multi-instance, serverless (e.g. Vercel, AWS Lambda), or containerized load-balanced cluster:
// - Events emitted on Instance A will not be received by listeners on Instance B.
// - Background workflows triggered on one instance will not be synchronized across other instances.
//
// RECOMMENDATION FOR PRODUCTION/MULTI-INSTANCE HOSTS:
// 1. Redis Pub/Sub or RabbitMQ: Migrate to a centralized external event broker.
// 2. Database-backed Polling Fallback (Lite): Instead of in-memory events, poll the SQLite database 
//    (e.g., query the `ActivityLog` or `Workflow` tables) at regular intervals from client pages to stay synchronized.
class SmartCityEventBus extends EventEmitter {
  private static instance: SmartCityEventBus;

  private constructor() {
    super();
    // Allow up to 100 listeners to avoid warnings in hot-reload
    this.setMaxListeners(100);
  }

  public static getInstance(): SmartCityEventBus {
    if (!SmartCityEventBus.instance) {
      SmartCityEventBus.instance = new SmartCityEventBus();
    }
    return SmartCityEventBus.instance;
  }
}

export const eventBus = SmartCityEventBus.getInstance();

export const EVENTS = {
  ALERT_CREATED: 'alert:created',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  ALERT_RESOLVED: 'alert:resolved',
  ALERT_ESCALATED: 'alert:escalated',
  
  WORKFLOW_CREATED: 'workflow:created',
  WORKFLOW_STATUS_CHANGED: 'workflow:status_changed',
  WORKFLOW_COMPLETED: 'workflow:completed',
  
  REPORT_SUBMITTED: 'report:submitted',
  REPORT_STATUS_CHANGED: 'report:status_changed',
  
  METRIC_UPDATED: 'metric:updated',
  NOTIFICATION_SENT: 'notification:sent',
};
