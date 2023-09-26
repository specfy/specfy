import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-log';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism.css';
import { useEffect } from 'react';

import cls from './index.module.scss';

export const CodeHighlighter: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <div className={cls.code}>
      <pre>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: code }}
        ></code>
      </pre>
    </div>
  );
};
