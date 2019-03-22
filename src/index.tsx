import { Context, createContext, useContext, createElement, Dispatch, FunctionComponent, StatelessComponent, useReducer } from 'react';

export interface Action<T extends string> {
  type: T,
  payload?: any
}

export interface BaseState<T extends string> extends Object {
  dispatchQueue?: Action<T>[];
}

export interface Reducer<S> {
  (state: S, payload?: any): S;
}

export class ActionMap<T extends string, S extends BaseState<T>> {
  constructor(private _map: Map<T, Reducer<S>> = new Map<T, Reducer<S>>()) { }
  public set(action: T, reducer: Reducer<S>) {
    this._map.set(action, reducer);
  }
  public reduce(state: S, action: Action<T>): S {
    const reducer = this._map.get(action.type);
    return !reducer ? state : reducer(state, action.payload);
  }
}
export const createFlux = <
  T extends string,
  S extends BaseState<T>
>(
  initialState: S,
  reducers: ActionMap<T, BaseState<T>>
): [
    Context<{
      state: S,
      dispatch: Dispatch<Action<T>>
    }>,
    StatelessComponent
  ] => {
  const context = createContext<{
    state: S,
    dispatch: Dispatch<Action<T>>
  }>({ state: initialState, dispatch: () => { } });
  const reducer = (state: S, action: Action<T>) => {
    let next: Action<T> | undefined = { type: action.type, payload: action.payload };
    while (next) {
      state = reducers.reduce(state, next) as S;
      if (state.dispatchQueue) {
        [next, ...state.dispatchQueue] = state.dispatchQueue;
      } else {
        next = undefined;
      }
    }
    return state;
  };
  const provider: FunctionComponent = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const contextState = {
      state,
      dispatch
    };
    return (
      createElement(context.Provider, { value: contextState } as any, props.children)
    );
  };
  return [context, provider];
};

export const useFlux = <S, T extends string>(context: Context<{
  state: S;
  dispatch: Dispatch<Action<T>>;
}>) => {
  return useContext(context);
}