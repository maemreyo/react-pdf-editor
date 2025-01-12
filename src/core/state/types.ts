import { ContentData } from "../../types/_content";

export interface ContentState {
  isLoading: boolean;
  error: string | null;
  data: ContentData;
}

export interface StateChangeEvent {
  type: string;
  payload: Partial<ContentState>;
}

export type StateObserver = (state: ContentState) => void;
