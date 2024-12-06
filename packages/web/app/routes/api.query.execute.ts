import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { requireUser } from '../lib/auth/auth.server';
import { connectionManager } from '../lib/db/connection-manager.server';
import { auditLogger } from '../lib/audit/audit-logger.server';

export async function action({ request }: ActionFunctionArgs) {
  const { user, organizationId } = await requireUser(request);
  const formData = await request.formData();
  const query = formData.get('query') as string;
  const connectionId = formData.get('connectionId') as string;

  if (!query || !connectionId) {
    return json(
      { message: 'Query and connectionId are required' },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();
    const connection = await connectionManager.getConnection(
      connectionId,
      user.id,
      organizationId
    );

    const result = await connectionManager.validateAndExecuteQuery(
      connection,
      query,
      user.id,
      organizationId,
      connectionId
    );

    const executionTime = Date.now() - startTime;

    // Format the result for the client
    const formattedResult = {
      columns: Array.isArray(result) && result.length > 0 
        ? Object.keys(result[0])
        : [],
      rows: result,
      rowCount: Array.isArray(result) ? result.length : 0,
      executionTime,
    };

    return json(formattedResult);
  } catch (error) {
    await auditLogger.logQueryExecution(
      user.id,
      organizationId,
      connectionId,
      query,
      'FAILURE',
      {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }
    );

    return json(
      { message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
