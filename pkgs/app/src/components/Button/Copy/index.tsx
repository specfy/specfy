import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import type { ButtonProps } from '../../Form/Button';
import { Button } from '../../Form/Button';

export const CopyButton: React.FC<{ value: string } & ButtonProps> = ({
  value,
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
      {copied ? <IconCheck /> : <IconCopy />}
    </Button>
  );
};
