import { API_HOSTNAME } from './envs';

export interface Params {
  id: string;
  url: string;
  width?: number;
  height?: number;
  callbacks?: {
    onOpen?: () => void;
    onClose?: () => void;
    onBlocked?: () => void;
  };
}

export class Popup {
  id;
  url;
  width;
  height;
  callbacks;
  interval: NodeJS.Timeout | null = null;
  popup: Window | null = null;
  private cb: (event: MessageEvent<any>) => void;

  constructor({ id, url, width, height, callbacks }: Params) {
    this.id = id;
    this.url = url;
    this.width = width || 800;
    this.height = height || 600;
    this.callbacks = callbacks || {};
    this.cb = (evt) => this.receiveMessage(evt);
  }

  open() {
    if (this.popup && !this.popup.closed) {
      this.popup.focus();
      return;
    }

    const top = window.top;
    const size = {
      width: this.width,
      height: this.height,
      top: top ? top.outerHeight / 2 + top.screenY - this.height / 2 : 0,
      left: top ? top.outerWidth / 2 + top.screenX - this.width / 2 : 0,
    };

    this.popup = window.open(
      this.url,
      this.id,
      Object.entries(size)
        .map((t) => {
          const [e, n] = t;
          return `${e}=${n}`;
        })
        .join(',')
    );

    if (!this.popup || this.popup.closed) {
      if (this.callbacks.onBlocked) {
        this.callbacks.onBlocked();
      }
      this.cancelPolling();
      this.popup = null;
    } else {
      if (this.callbacks.onOpen) {
        this.callbacks.onOpen();
      }
      this.poll();
    }
  }

  close() {
    this.cancelPolling();
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }

    if (this.callbacks.onClose) {
      this.callbacks.onClose();
    }
  }

  poll() {
    window.addEventListener('message', this.cb, false);

    this.interval = setInterval(() => {
      try {
        if (!this.popup || this.popup.closed) {
          this.cancelPolling();
          if (this.callbacks.onClose) {
            this.callbacks.onClose();
          }
          return;
        }
      } catch (t) {
        // do nothing
      }
    }, 500);
  }

  cancelPolling() {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    window.removeEventListener('message', this.cb, false);
  }

  receiveMessage(event: MessageEvent<any>) {
    if (event.origin !== API_HOSTNAME) {
      return;
    }

    this.close();

    if (this.callbacks.onClose) {
      this.callbacks.onClose();
    }
  }
}
