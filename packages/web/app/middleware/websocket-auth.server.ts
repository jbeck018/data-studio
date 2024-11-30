import type { WebSocket } from 'ws';
import { getUserSession } from '~/lib/auth/session.server';
import type { IncomingMessage } from 'http';
import { parse } from 'cookie';

export async function authenticateWebSocket(
  ws: WebSocket,
  request: IncomingMessage
): Promise<boolean> {
  try {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      ws.close(1008, 'Authentication required');
      return false;
    }

    const cookies = parse(cookieHeader);
    const sessionCookie = cookies['__session'];
    
    if (!sessionCookie) {
      ws.close(1008, 'Session not found');
      return false;
    }

    // Create a mock request object for session validation
    const mockRequest = new Request('http://localhost', {
      headers: new Headers({
        Cookie: `__session=${sessionCookie}`,
      }),
    });

    const session = await getUserSession(mockRequest);
    const userId = await session.get('userId');
    
    if (!userId) {
      ws.close(1008, 'Invalid session');
      return false;
    }

    // Add userId to WebSocket instance for future reference
    (ws as any).userId = userId;

    return true;
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    ws.close(1011, 'Authentication error');
    return false;
  }
}
