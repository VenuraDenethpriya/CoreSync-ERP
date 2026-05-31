// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = [];
//   }

//   connect(url) {
//     if (this.socket) return; 

//     this.socket = new WebSocket(url);

//     this.socket.onopen = () => {
//       console.log("Connected to WebSocket server:", url);
//     };

//     this.socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       this.listeners.forEach((listener) => listener(data));
//     };

//     this.socket.onclose = () => {
//       console.log("WebSocket connection closed. Trying to reconnect...");
//       this.socket = null;
//       setTimeout(() => this.connect(url), 3000); 
//     };
//   }

//   subscribe(listener) {
//     this.listeners.push(listener);
//   }

//   unsubscribe(listener) {
//     this.listeners = this.listeners.filter((l) => l !== listener);
//   }

//   send(data) {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify(data));
//     }
//   }
// }

// const wsService = new WebSocketService();
// export default wsService;

class WebSocketService {
  constructor() {
    // Change 1: Store multiple sockets and listeners, keyed by topic.
    this.sockets = {};
    this.listeners = {};
  }

  // Change 2: 'connect' now takes a topic and creates a specific connection for it.
  connect(topic) {
    // If a connection for this topic already exists, do nothing.
    if (this.sockets[topic]) return;

    // Construct the URL based on the topic.
    const url = `ws://localhost:8080/ws/${topic}`; // Adjust host/port as needed

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

  // Change 3: 'subscribe' and 'unsubscribe' now require a topic.
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

  // Optional: 'send' can also be made topic-specific if you need to send messages.
  send(topic, data) {
    const socket = this.sockets[topic];
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }
}

const wsService = new WebSocketService();
export default wsService;