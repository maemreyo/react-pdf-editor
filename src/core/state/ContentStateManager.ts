// src/core/state/ContentStateManager.ts
import { StateManager } from "./StateManager";
import { ContentData } from "../../types/_content";
import { ContentState } from "./types";

export class ContentStateManager extends StateManager {
  constructor(initialState: ContentState) {
    super(initialState);
  }
  setLoading(loading: boolean): void {
    this.setState({ isLoading: loading });
  }

  setError(error: string | null): void {
    this.setState({ error });
  }

  updateData(data: Partial<ContentData>): void {
    this.setState({
      data: {
        ...this.getState().data,
        ...data,
      },
    });
  }
}
