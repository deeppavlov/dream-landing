import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";

type Value = string | object | number | null;
type DefaultValue<T extends Value, P extends Array<any> = []> =
  | T
  | ((...args: P) => T);

const hasLocalStorage = () =>
  typeof window !== "undefined" && window.localStorage && true;

const getVal = <T extends Value, P extends Array<any> = []>(
  value: DefaultValue<T, P>,
  ...args: P
): T => (typeof value === "function" ? value(...args) : value);

const useStored = <T extends Value>(
  id: string,
  defaultValue: DefaultValue<T>,
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    saveToApi,
  }: {
    serialize?: (value: T) => string;
    deserialize?: (stored: string) => T;
    saveToApi?: (value: T) => void;
  } = {}
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setStateValue] = useState<T>(() => getVal(defaultValue));

  // To avoid hydration errors, we get the value from the store after an initial
  // render.
  useEffect(() => {
    if (hasLocalStorage()) {
      const stored = localStorage.getItem(id);
      if (stored) setStateValue(deserialize(stored));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback(
    (val: SetStateAction<T>) =>
      setStateValue((prevValue) => {
        const newValue = getVal(val, prevValue);
        if (hasLocalStorage()) {
          localStorage.setItem(id, serialize(newValue));
        }
        if (saveToApi) saveToApi(newValue);
        return newValue;
      }),
    [id, serialize, saveToApi]
  );

  useEffect(() => {}, [id, value, serialize, saveToApi]);

  return [value, setValue];
};

export default useStored;
