import type { ServerEvents } from '@specfy/socket';
import { useEffect } from 'react';

export type Names = keyof Events;
export type Events = {
  [TKey in keyof ServerEvents]: (t: Parameters<ServerEvents[TKey]>[0]) => void;
};

const eventBus = new Comment('event-bus');

function isCustomEvent(event: Event): event is CustomEvent {
  return 'detail' in event;
}

export function subscribe<TName extends keyof Events>(
  name: TName,
  listener: Events[TName]
) {
  const eventHandler = (event: Event) => {
    if (isCustomEvent(event)) {
      listener(event.detail);
    }
  };
  eventBus.addEventListener(name, eventHandler);

  return () => {
    eventBus.removeEventListener(name, eventHandler);
  };
}

export function publish<TName extends keyof Events>(
  name: TName,
  data: Events[TName]
) {
  const event = new CustomEvent(name, { detail: data });
  eventBus.dispatchEvent(event);
}

export const useEventBus = <TName extends keyof Events>(
  name: TName,
  cb: Events[TName],
  deps?: React.DependencyList | undefined
) => {
  useEffect(() => {
    const unsub = subscribe(name, cb);
    return () => {
      unsub();
    };
  }, deps);
};
