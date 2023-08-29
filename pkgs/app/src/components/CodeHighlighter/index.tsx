import Prism from 'prismjs';
import { useEffect } from 'react';
import 'prismjs/themes/prism.css';

import 'prismjs/components/prism-go';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-log';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';

import cls from './index.module.scss';

export const CodeHighlighter: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className={cls.code}>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
