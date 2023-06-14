export interface Params {
  id: string;
  url: string;
  width?: number;
  height?: number;
  callbacks?: {
    onPoll?: (popup: Window) => void;
    onOpen?: () => void;
    onAbort?: () => void;
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

  constructor({ id, url, width, height, callbacks }: Params) {
    this.id = id;
    this.url = url;
    this.width = width || 800;
    this.height = height || 600;
    this.callbacks = callbacks || {};
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
    this.interval = setInterval(() => {
      try {
        if (!this.popup || this.popup.closed) {
          this.cancelPolling();
          if (this.callbacks.onAbort) {
            this.callbacks.onAbort();
          }
          return;
        }

        if (this.callbacks.onPoll) {
          this.callbacks.onPoll(this.popup);
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
  }
}
