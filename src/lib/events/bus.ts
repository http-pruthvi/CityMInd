import { EventEmitter } from 'events';

// In-memory event bus to handle pub/sub workflows
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
