import { debounce } from './debounce';

export function useDebouncedChange<T>(onChange: ((data: T) => void) | undefined, delay = 500) {
  const debounced = onChange ? debounce(onChange, delay) : undefined;
  return (data: T) => {
    if (debounced) debounced(data);
  };
}