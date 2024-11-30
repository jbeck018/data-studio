import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';
import { WebSocketClient } from '~/utils/websocket.client';

jest.mock('~/utils/websocket.client');

describe('useWebSocket', () => {
  let mockClient: jest.Mocked<WebSocketClient>;
  const mockHandler = jest.fn();
  const channel = 'test-channel';

  beforeEach(() => {
    mockClient = {
      subscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      sendMessage: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    (WebSocketClient as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to channel on mount', async () => {
    renderHook(() => useWebSocket(channel, mockHandler));
    expect(mockClient.subscribe).toHaveBeenCalledWith(channel, mockHandler);
  });

  it('should unsubscribe from channel on unmount', async () => {
    const { unmount } = renderHook(() => useWebSocket(channel, mockHandler));
    unmount();
    expect(mockClient.unsubscribe).toHaveBeenCalledWith(channel, mockHandler);
  });

  it('should handle subscription errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockClient.subscribe.mockRejectedValue(new Error('Subscription error'));

    renderHook(() => useWebSocket(channel, mockHandler));
    
    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Error subscribing to test-channel:',
      expect.any(Error)
    );
    
    consoleError.mockRestore();
  });

  it('should handle unsubscription errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockClient.unsubscribe.mockRejectedValue(new Error('Unsubscription error'));

    const { unmount } = renderHook(() => useWebSocket(channel, mockHandler));
    unmount();

    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Error unsubscribing from test-channel:',
      expect.any(Error)
    );
    
    consoleError.mockRestore();
  });

  it('should provide sendNotification function', () => {
    const { result } = renderHook(() => useWebSocket(channel, mockHandler));
    
    act(() => {
      result.current.sendNotification({ data: 'test' });
    });

    expect(mockClient.sendMessage).toHaveBeenCalledWith({
      type: 'notification',
      channel,
      payload: { data: 'test' }
    });
  });

  it('should resubscribe when channel changes', async () => {
    const newChannel = 'new-channel';
    const { rerender } = renderHook(
      ({ ch }) => useWebSocket(ch, mockHandler),
      { initialProps: { ch: channel } }
    );

    rerender({ ch: newChannel });

    expect(mockClient.unsubscribe).toHaveBeenCalledWith(channel, mockHandler);
    expect(mockClient.subscribe).toHaveBeenCalledWith(newChannel, mockHandler);
  });

  it('should resubscribe when handler changes', async () => {
    const newHandler = jest.fn();
    const { rerender } = renderHook(
      ({ handler }) => useWebSocket(channel, handler),
      { initialProps: { handler: mockHandler } }
    );

    rerender({ handler: newHandler });

    expect(mockClient.unsubscribe).toHaveBeenCalledWith(channel, mockHandler);
    expect(mockClient.subscribe).toHaveBeenCalledWith(channel, newHandler);
  });
});
