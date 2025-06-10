import { useSyncExternalStore } from "hono/jsx";

export namespace Store {
  type Subscriber<T> = (value: T) => void;

  class Store<T> {
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
      this.subscribers.forEach((subscriber) => subscriber(newValue));
    }

    subscribe(subscriber: Subscriber<T>): () => void {
      this.subscribers.add(subscriber);
      return () => {
        this.subscribers.delete(subscriber);
      };
    }
  }

  export const create = <T>(initialValue: T) => new Store<T>(initialValue);

  export const use = <T>(store: Store<T>) => {
    return useSyncExternalStore((cb) => store.subscribe(cb), () => store.get());
  };
}
