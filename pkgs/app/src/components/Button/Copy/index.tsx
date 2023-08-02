import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { Button } from '../../Form/Button';

export const CopyButton: React.FC<{ value: string }> = ({ value }) => {
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
    <Button display="ghost" onClick={onClick}>
      {copied ? <IconCheck /> : <IconCopy />}
    </Button>
  );
};
