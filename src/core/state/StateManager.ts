import { ContentState, StateObserver } from "./types";

export class StateManager {
  private state: ContentState;
  private observers: Set<StateObserver> = new Set();

  constructor(initialState: ContentState) {
    this.state = initialState;
  }

  getState(): ContentState {
    return { ...this.state };
  }

  setState(partial: Partial<ContentState>): void {
    const prevState = this.state;
    this.state = {
      ...prevState,
      ...partial,
    };
    this.notifyObservers();
  }

  subscribe(observer: StateObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    const state = this.getState();
    this.observers.forEach((observer) => observer(state));
  }
}
