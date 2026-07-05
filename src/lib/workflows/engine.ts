import { prisma } from '@/lib/db/prisma';
import { eventBus, EVENTS } from '../events/bus';
import type { WorkflowStatus } from '@/types';

export interface WorkflowActionConfig {
  type: string;
  label: string;
  params?: Record<string, any>;
  order?: number;
}

export interface WorkflowConfig {
  title: string;
  description: string;
  domain: string;
  priority?: string;
  triggeredById: string;
  actions: WorkflowActionConfig[];
}

export async function createWorkflow(config: WorkflowConfig) {
  // 1. Create workflow in DB
  const workflow = await prisma.workflow.create({
    data: {
      title: config.title,
      description: config.description,
      domain: config.domain,
      status: 'pending',
      priority: config.priority || 'medium',
      triggeredById: config.triggeredById,
      actions: {
        create: config.actions.map((act, idx) => ({
          type: act.type,
          label: act.label,
          params: JSON.stringify(act.params || {}),
          status: 'pending',
          order: act.order ?? idx,
        })),
      },
    },
    include: {
      actions: true,
      triggeredBy: true,
    },
  });

  // 2. Emit event
  eventBus.emit(EVENTS.WORKFLOW_CREATED, workflow);
  return workflow;
}

export async function approveWorkflow(workflowId: string, approverId: string) {
  // 1. Check if workflow exists
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { actions: true },
  });

  if (!workflow) {
    throw new Error(`Workflow with ID ${workflowId} not found`);
  }

  if (workflow.status !== 'pending') {
    throw new Error(`Workflow is already in ${workflow.status} state`);
  }

  // 2. Update to approved and start executing
  const updatedWorkflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: 'approved',
      approverId,
    },
    include: { actions: true },
  });

  eventBus.emit(EVENTS.WORKFLOW_STATUS_CHANGED, { workflowId, status: 'approved' });

  // 3. Trigger asynchronous simulated execution in background
  executeWorkflowBackground(workflowId).catch(console.error);

  return updatedWorkflow;
}

export async function rejectWorkflow(workflowId: string, approverId: string, reason?: string) {
  const updatedWorkflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: 'rejected',
      approverId,
      notes: reason,
    },
    include: { actions: true },
  });

  eventBus.emit(EVENTS.WORKFLOW_STATUS_CHANGED, { workflowId, status: 'rejected' });
  return updatedWorkflow;
}

export async function executeWorkflowBackground(workflowId: string) {
  // 1. Update workflow status to executing
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: 'executing' },
  });
  eventBus.emit(EVENTS.WORKFLOW_STATUS_CHANGED, { workflowId, status: 'executing' });

  // 2. Load actions ordered
  const actions = await prisma.workflowAction.findMany({
    where: { workflowId },
    orderBy: { order: 'asc' },
  });

  let failed = false;

  for (const action of actions) {
    if (failed) {
      // Mark remaining actions as skipped
      await prisma.workflowAction.update({
        where: { id: action.id },
        data: { status: 'skipped' },
      });
      continue;
    }

    // A. Mark action as running
    await prisma.workflowAction.update({
      where: { id: action.id },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    // B. Simulate action execution delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // C. Perform simulated action completion
      const executionResult = {
        executed: true,
        timestamp: new Date().toISOString(),
        details: `Successfully completed action ${action.label}`,
      };

      await prisma.workflowAction.update({
        where: { id: action.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: JSON.stringify(executionResult),
        },
      });
    } catch (err: any) {
      failed = true;
      await prisma.workflowAction.update({
        where: { id: action.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: err.message || 'Unknown execution error',
        },
      });
    }
  }

  // 3. Finalize workflow status
  const finalStatus: WorkflowStatus = failed ? 'failed' : 'completed';
  const finishedWorkflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
    },
    include: { actions: true },
  });

  eventBus.emit(EVENTS.WORKFLOW_STATUS_CHANGED, { workflowId, status: finalStatus });
  eventBus.emit(EVENTS.WORKFLOW_COMPLETED, finishedWorkflow);
}
