import type { WebSocket, WebSocketServer } from 'ws';
import { getUserSession } from '~/lib/auth/session.server';
import type { IncomingMessage } from 'http';
import { parse } from 'cookie';
import type { AuthenticatedWebSocket } from '~/types/websocket';

export async function authenticateWebSocket(
  wss: WebSocketServer,
  request: IncomingMessage
): Promise<boolean> {
  try {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return false;
    }

    const cookies = parse(cookieHeader);
    const sessionCookie = cookies['__session'];
    
    if (!sessionCookie) {
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
      return false;
    }

    // Store userId in the WebSocket server's auth context
    wss.once('connection', (ws: WebSocket) => {
      const authWs = ws as AuthenticatedWebSocket;
      authWs.userId = userId;
      authWs.isAlive = true;
      authWs.channels = new Set();
    });

    return true;
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    return false;
  }
}
