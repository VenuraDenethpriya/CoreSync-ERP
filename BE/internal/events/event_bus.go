package events

import (
	"log"
	"sync"
)

type Event struct {
	Type string
	Data interface{}
}

type Subscriber chan Event

type EventBus struct {
	subscribers map[string][]Subscriber
	mu          sync.RWMutex
}

func NewEventBus() *EventBus {
	return &EventBus{
		subscribers: make(map[string][]Subscriber),
	}
}

func (b *EventBus) Subscribe(topic string) Subscriber {
	ch := make(Subscriber, 10)
	b.mu.Lock()
	defer b.mu.Unlock()

	b.subscribers[topic] = append(b.subscribers[topic], ch)

	log.Printf("New subscriber added to topic '%s', total for topic: %d", topic, len(b.subscribers[topic]))
	return ch
}

func (b *EventBus) Publish(topic string, event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if subscribers, ok := b.subscribers[topic]; ok {
		log.Printf("Publishing event: %s to %d subscribers on topic '%s'", event.Type, len(subscribers), topic)
		for _, sub := range subscribers {
			select {
			case sub <- event:
			default:
				log.Printf("Subscriber channel full. Dropping event for one subscriber on topic '%s'.", topic)
			}
		}
	}
}

func (b *EventBus) Unsubscribe(topic string, sub Subscriber) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if subscribers, ok := b.subscribers[topic]; ok {
		for i, s := range subscribers {
			if s == sub {
				b.subscribers[topic] = append(subscribers[:i], subscribers[i+1:]...)
				log.Printf("Unsubscribed from topic '%s'. Remaining: %d", topic, len(b.subscribers[topic]))
				break
			}
		}
	}
}
