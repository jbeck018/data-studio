import { json, redirect } from '@remix-run/node';
import { getSession, setActiveConnection } from '../lib/auth/session.server';
import { connectionManager } from '../lib/db/connection-manager.server';
import type { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  const formData = await request.formData();
  const connectionId = formData.get('connectionId');

  if (!connectionId || typeof connectionId !== 'string') {
    return json({ error: 'Connection ID is required' }, { status: 400 });
  }

  const organizationId = session.get('organizationId');
  if (!organizationId) {
    return redirect('/organizations/select');
  }

  try {
    await setActiveConnection(request, connectionId);
    return redirect('/query');
  } catch (error) {
    console.error('Error setting active connection:', error);
    return json({ error: 'Failed to set active connection' }, { status: 500 });
  }
}
