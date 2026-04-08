type LocalStorageArrayStoreOptions<Item> = {
  storageKey: string;
  isItem: (value: unknown) => value is Item;
  sortItems?: (items: Item[]) => Item[];
};

type LocalStorageArrayStore<Item> = {
  getSnapshot: () => Item[];
  getServerSnapshot: () => Item[];
  subscribe: (listener: () => void) => () => void;
  write: (items: Item[]) => void;
};

export function createLocalStorageArrayStore<Item>({
  storageKey,
  isItem,
  sortItems,
}: LocalStorageArrayStoreOptions<Item>): LocalStorageArrayStore<Item> {
  const listeners = new Set<() => void>();
  const emptyItems: Item[] = [];

  let cachedSerializedValue: string | null | undefined;
  let cachedItems: Item[] = emptyItems;

  function normalizeItems(items: Item[]) {
    return sortItems ? sortItems(items) : items;
  }

  function parseStoredItems(serializedItems: string | null) {
    if (!serializedItems) {
      return emptyItems;
    }

    try {
      const parsedItems = JSON.parse(serializedItems);

      if (!Array.isArray(parsedItems)) {
        return emptyItems;
      }

      return normalizeItems(parsedItems.filter(isItem));
    } catch {
      return emptyItems;
    }
  }

  function getSnapshot() {
    if (typeof window === "undefined") {
      return emptyItems;
    }

    const serializedItems = window.localStorage.getItem(storageKey);

    if (serializedItems === cachedSerializedValue) {
      return cachedItems;
    }

    cachedSerializedValue = serializedItems;
    cachedItems = parseStoredItems(serializedItems);

    return cachedItems;
  }

  function getServerSnapshot() {
    return emptyItems;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    function handleStorage(event: StorageEvent) {
      if (event.key === storageKey) {
        listener();
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      listeners.delete(listener);

      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }

  function write(items: Item[]) {
    if (typeof window === "undefined") {
      return;
    }

    const nextItems = normalizeItems(items);
    const serializedItems = JSON.stringify(nextItems);

    cachedSerializedValue = serializedItems;
    cachedItems = nextItems;

    window.localStorage.setItem(storageKey, serializedItems);
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    write,
  };
}
