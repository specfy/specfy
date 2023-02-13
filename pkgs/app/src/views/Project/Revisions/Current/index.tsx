import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import type { Change } from 'diff';
import { diffJson, diffChars } from 'diff';
import { useEffect, useMemo, useState } from 'react';

import { Container } from '../../../../components/Container';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { isDiff, useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

interface Computed {
  a: any;
  b: any;
}

export const ProjectRevisionCurrent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const edit = useEdit();
  const edits = useMemo(() => {
    return Object.entries(edit.edits);
  }, [edit.edits]);
  const originals = useMemo(() => {
    return edit.getOriginals();
  }, [edit.edits]);

  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<EditContextInterface['edits']>();

  useEffect(() => {
    console.log('1');
    if (!edits || !originals) {
      return;
    }
    console.log('2', lastComputed, edit.lastUpdate);
    if (lastComputed && edit.lastUpdate < lastComputed) {
      return;
    }
    console.log('3', lastComputed);

    const cleaned: EditContextInterface['edits'] = {};
    const tmps: Computed[] = [];
    for (const [couple, obj] of edits) {
      cleaned[couple] = {};
      const tmp: Record<string, { diff: Change[] }> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (!isDiff(originals[couple][key], value)) {
          continue;
        }

        cleaned[couple][key] = value;
        tmp[key] = {
          diff: diffJson(originals[couple][key], value),
        };
      }
      console.log(tmp);
    }

    const now = Date.now();
    // setComputed(cleaned);
    setLastComputed(now);
    edit.setEdits(cleaned);
  }, [edits, originals]);

  if (!computed) {
    return <LoadingOutlined />;
  }

  return (
    <Container>
      <Typography.Title level={3}>
        <>Updates ({edits.length})</>
      </Typography.Title>
      {edits.map(([key, type], i) => {
        return (
          <div key={i} className={cls.update}>
            <div className={cls.title}>
              <div className={cls.toggle}>
                <DownOutlined />
              </div>
              {originals[key].name}
            </div>
            {JSON.stringify(type)}
          </div>
        );
      })}
    </Container>
  );
};
