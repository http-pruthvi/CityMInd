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
          create: (flow.actions || []).map((act, index) => ({
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
