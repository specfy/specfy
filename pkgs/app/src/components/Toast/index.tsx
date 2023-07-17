import {
  ToastProvider as RadixToastProvider,
  Viewport,
} from '@radix-ui/react-toast';
import * as RadixToast from '@radix-ui/react-toast';
import { nanoid } from '@specfy/api/src/common/id';
import {
  IconCircleCheck,
  IconExclamationCircle,
  IconX,
} from '@tabler/icons-react';
import { Button } from 'antd';
import classNames from 'classnames';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import type { RequireAtLeastOne } from 'type-fest';

import { Flex } from '../Flex';
import { Loading } from '../Loading';

import cls from './index.module.scss';

export type ToastProps = {
  message?: string;
  id?: string;
  title: string;
  status?: 'error' | 'success';
  loading?: boolean;
  link?: string;
  closable?: boolean;
  action?: React.ReactNode;
};

type PropsWithId = RequireAtLeastOne<ToastProps, 'id'>;

interface ToastContextData {
  add: (props: ToastProps) => void;
  update: (props: Partial<ToastProps> & { id: string }) => void;
}

export const Toast: React.FC<
  PropsWithId & { onClose: (id: string) => void }
> = ({
  message,
  id,
  status,
  title,
  link,
  loading = false,
  closable = true,
  action = false,
  onClose,
}) => {
  const close = () => {
    onClose(id);
  };

  // Auto hideout is broken
  // https://github.com/radix-ui/primitives/issues/2233
  useEffect(() => {
    if (loading) {
      return;
    }
    const expires = loading || !closable ? 999_999 : 3000;
    const timeout = setTimeout(close, expires);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <RadixToast.Root
      className={classNames(cls.toast, status && cls[status])}
      data-id={id}
      duration={999_999}
      onOpenChange={close}
      onClick={close}
    >
      <Flex gap="l" align="flex-start" justify="space-between">
        <Flex gap="l" align="flex-start">
          {(loading || status) && (
            <div className={cls.icon}>
              {loading && <Loading />}
              {status === 'success' && <IconCircleCheck />}
              {status === 'error' && <IconExclamationCircle />}
            </div>
          )}
          <div>
            {title && <RadixToast.Title>{title}</RadixToast.Title>}
            {message && (
              <RadixToast.Description>{message}</RadixToast.Description>
            )}
            {link && (
              <div className={cls.show}>
                <Link to={link} onClick={close}>
                  <Button size="small">Show</Button>
                </Link>
              </div>
            )}
            {action && <div className={cls.show}>{action}</div>}
          </div>
        </Flex>
        <RadixToast.Close>
          <span>
            <IconX />
          </span>
        </RadixToast.Close>
      </Flex>
    </RadixToast.Root>
  );
};

export const ToastContext = createContext<ToastContextData>(
  {} as ToastContextData
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<PropsWithId[]>([]);
  const onClose = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [setToasts]
  );

  const value = useMemo<ToastContextData>(() => {
    return {
      add: (props: ToastProps) => {
        setToasts((prev) => {
          return [...prev, { ...props, id: props.id || nanoid() }];
        });
      },
      update: (props) => {
        setToasts((prev) => {
          const list: PropsWithId[] = [];
          for (const toast of prev) {
            if (toast.id !== props.id) {
              list.push(toast);
              continue;
            }
            list.push({
              ...toast,
              ...props,
            });
          }

          return list;
        });
      },
    };
  }, []);

  return (
    <RadixToastProvider>
      <ToastContext.Provider value={value}>
        {children}
        {toasts.map((toast) => {
          return <Toast key={`${toast.id}`} {...toast} onClose={onClose} />;
        })}
        <Viewport className={cls.portal} />
      </ToastContext.Provider>
    </RadixToastProvider>
  );
};
