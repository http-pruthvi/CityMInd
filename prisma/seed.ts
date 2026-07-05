import { PrismaClient } from '@prisma/client';
import { 
  DOMAIN_CONFIGS, 
  MOCK_ALERTS, 
  MOCK_WORKFLOWS 
} from '../src/lib/mock/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Smart City database...');

  // 1. Clear database
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.citizenReport.deleteMany({});
  await prisma.workflowAction.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.domainConfig.deleteMany({});
  await prisma.metric.deleteMany({});

  // 2. Create seed users
  const admin = await prisma.user.create({
    data: {
      name: 'Vijay Prasad',
      email: 'commissioner@citymind.gov.in',
      password: 'pbkdf2:sha256:commissioner_pass_hash', // Simulated hash
      role: 'admin',
      avatar: 'VP',
      department: 'Municipal Commission',
    },
  });

  const operator = await prisma.user.create({
    data: {
      name: 'Arun Kumar',
      email: 'arun@citymind.gov.in',
      password: 'pbkdf2:sha256:operator_pass_hash',
      role: 'operator',
      avatar: 'AK',
      department: 'Operations',
    },
  });

  const citizen = await prisma.user.create({
    data: {
      name: 'Pruthvi Raj',
      email: 'citizen@gmail.com',
      password: 'pbkdf2:sha256:citizen_pass_hash',
      role: 'citizen',
      avatar: 'PR',
    },
  });

  console.log('Created seed users.');

  // 3. Create Domain Configs
  for (const config of DOMAIN_CONFIGS) {
    await prisma.domainConfig.create({
      data: {
        id: config.id,
        name: config.name,
        description: config.description,
        icon: config.icon,
        color: config.color,
        enabled: true,
        metrics: JSON.stringify(config.metrics || []),
      },
    });
  }
  console.log('Created domain configs.');

  // 4. Create Alerts
  for (const alert of MOCK_ALERTS) {
    await prisma.alert.create({
      data: {
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        domain: alert.domain,
        locationName: alert.locationName || (alert.location && alert.location.name) || 'Central Sector',
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
        assigneeId: operator.id,
      },
    });
  }
  console.log('Created alert tickets.');

  // 5. Create Workflows
  for (const flow of MOCK_WORKFLOWS) {
    await prisma.workflow.create({
      data: {
        title: flow.title,
        description: flow.description,
        domain: flow.domain,
        status: flow.status,
        triggeredById: operator.id,
        actions: {
          create: (flow.actions || flow.steps || []).map((act, index) => ({
            type: 'script',
            label: act.label,
            status: act.status || 'pending',
            order: index,
          })),
        },
      },
    });
  }
  console.log('Created workflows.');

  // 6. Create Telemetry Metrics with deliberate anomalies for demo presentation
  console.log('Seeding telemetry metrics in database with deliberate anomalies...');
  const { MOCK_METRICS } = require('../src/lib/mock/data');
  for (const [domainId, values] of Object.entries(MOCK_METRICS)) {
    for (const m of values as any[]) {
      let seedValue = m.value;
      let seedTrend = m.changeDirection === 'up' ? 'up' : m.changeDirection === 'down' ? 'down' : 'stable';
      let seedChangePercent = m.change;

      // Inject anomalous outliers to catch during demo
      if (domainId === 'environment' && m.label === 'AQI') {
        seedValue = 284; // Spiked toxic level
        seedTrend = 'up';
        seedChangePercent = 226.4;
      } else if (domainId === 'mobility' && m.label === 'Avg Commute Time') {
        seedValue = 58; // Critical delay
        seedTrend = 'up';
        seedChangePercent = 107.1;
      } else if (domainId === 'safety' && m.label === 'Active Incidents') {
        seedValue = 48; // Critical mass of events
        seedTrend = 'up';
        seedChangePercent = 108.6;
      } else if (domainId === 'energy' && m.label === 'Grid Load') {
        seedValue = 4980; // High load grid failure risk
        seedTrend = 'up';
        seedChangePercent = 45.6;
      }

      await prisma.metric.create({
        data: {
          metricId: m.label,
          domain: domainId,
          value: seedValue,
          previousValue: m.value,
          change: seedValue - m.value,
          changePercent: seedChangePercent,
          trend: seedTrend,
          unit: m.unit || '',
          recordedAt: new Date(),
        },
      });
    }
  }
  console.log('Created telemetry metrics.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
