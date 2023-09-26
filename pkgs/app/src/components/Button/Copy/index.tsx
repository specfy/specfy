import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import type { ButtonProps } from '@/components/Form/Button';
import { Button } from '@/components/Form/Button';

export const CopyButton: React.FC<{ value: string } & ButtonProps> = ({
  value,
  children,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(async () => {
    let timeout: any;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // do nothing
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [value]);

  return (
    <Button display="ghost" onClick={onClick} {...props}>
      {copied ? <IconCheck /> : <IconCopy />} {children}
    </Button>
  );
};
