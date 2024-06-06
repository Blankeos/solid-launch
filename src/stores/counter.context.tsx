import {
  createContext,
  createSignal,
  FlowComponent,
  useContext,
  type Accessor,
  type Setter
} from 'solid-js';

// ===========================================================================
// Context
// ===========================================================================
export const CounterContext = createContext({
  count: 0 as unknown as Accessor<number>,
  setCount: ((newCount: number) => {}) as Setter<number>
});

// ===========================================================================
// Hook
// ===========================================================================
export const useCounterContext = () => useContext(CounterContext);

// ===========================================================================
// Provider
// ===========================================================================

/** This is an example context paradigm you can use. */
export const CounterContextProvider: FlowComponent = (props) => {
  const [count, setCount] = createSignal(0);

  return (
    <CounterContext.Provider
      value={{
        count: count,
        setCount: setCount
      }}
    >
      {props.children}
    </CounterContext.Provider>
  );
};
