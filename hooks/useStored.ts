import { useState, useEffect, Dispatch, SetStateAction } from "react";

const hasLocalStorage = () =>
  typeof window !== "undefined" && window.localStorage && true;

const useStored = <T extends string | object | number>(
  id: string,
  defaultValue: T | (() => T),
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
  const [value, setValue] = useState<T>(() => {
    if (hasLocalStorage()) {
      const stored = localStorage.getItem(id);
      if (stored) return deserialize(stored);
    }
    if (typeof defaultValue === "function") return defaultValue();
    return defaultValue;
  });

  useEffect(() => {
    if (hasLocalStorage()) {
      localStorage.setItem(id, serialize(value));
    }
    if (saveToApi) saveToApi(value);
  }, [id, value, serialize, saveToApi]);

  return [value, setValue];
};

export default useStored;
