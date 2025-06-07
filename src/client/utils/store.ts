type Subscriber<T> = (value: T) => void;

export class Store<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
    this.subscribers.forEach(subscriber => subscriber(newValue));
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}