import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const token = localStorage.getItem('rc_token');

    socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = localStorage.getItem('rc_token');
  if (token) {
    s.auth = { token };
    if (!s.connected) {
      s.connect();
    }
  }
  return s;
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
  socket = null;
}

