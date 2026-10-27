
class WebSocketService {
  constructor() {
    // Store multiple sockets and listeners, keyed by topic.
    this.sockets = {};
    this.listeners = {};
  }

  // 'connect' now takes a topic and creates a specific connection for it.
  connect(topic) {
    // If a connection for this topic already exists, do nothing.
    if (this.sockets[topic]) return;

    // Construct the URL based on the topic.
    const apiUrl = import.meta.env.VITE_WS_URL;
    const url = (`${apiUrl}/topic`);

    const socket = new WebSocket(url);
    this.sockets[topic] = socket;

    socket.onopen = () => {
      console.log(`✅ Connected to WebSocket for topic: ${topic}`);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Notify only the listeners for this specific topic.
      if (this.listeners[topic]) {
        this.listeners[topic].forEach((listener) => listener(data));
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket for topic "${topic}" closed. Reconnecting...`);
      this.sockets[topic] = null;
      setTimeout(() => this.connect(topic), 3000);
    };
  }

  // 'subscribe' and 'unsubscribe' now require a topic.
  subscribe(topic, listener) {
    // Ensure the connection for this topic exists.
    this.connect(topic);

    // Initialize the listener array for the topic if it's the first one.
    if (!this.listeners[topic]) {
      this.listeners[topic] = [];
    }
    this.listeners[topic].push(listener);
  }

  unsubscribe(topic, listener) {
    if (this.listeners[topic]) {
      this.listeners[topic] = this.listeners[topic].filter((l) => l !== listener);
    }
  }

  // 'send' can also be made topic-specific if you need to send messages.
  send(topic, data) {
    const socket = this.sockets[topic];
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }
}

const wsService = new WebSocketService();
export default wsService;