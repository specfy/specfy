import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { Change } from 'diff';
import { diffJson, diffChars } from 'diff';
import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';

import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { isDiff, useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

interface Computed {
  id: string;
  name: string;
  old: any;
  new: any;
  diff: Change[];
}

export const ProjectRevisionCurrent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const edit = useEdit();
  const [edits, originals] = useMemo(() => {
    return [Object.entries(edit.edits), edit.getOriginals()];
  }, [edit.edits]);

  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<Computed[]>([]);
  const [description, setDescription] = useState<BlockLevelZero>({
    type: 'doc',
    content: [],
  });

  useEffect(() => {
    if (!edits || !originals) {
      return;
    }
    if (lastComputed && edit.lastUpdate <= lastComputed) {
      return;
    }

    const cleaned: EditContextInterface['edits'] = {};
    const tmps: Computed[] = [];

    for (const [couple, obj] of edits) {
      cleaned[couple] = {};

      for (const [key, value] of Object.entries(obj)) {
        if (!isDiff(originals[couple][key], value)) {
          continue;
        }

        cleaned[couple][key] = value;
        const a = <ContentDoc doc={originals[couple][key]} />;
        const b = <ContentDoc doc={value} />;
        const tmp: Computed = {
          id: `${couple}-${key}`,
          name: key,
          old: originals[couple][key],
          new: value,
          diff: diffChars(
            renderToString(a).replaceAll('<!-- -->', ''),
            renderToString(b).replaceAll('<!-- -->', '')
          ),
        };
        console.log(diffJson(originals[couple][key], value));
        tmps.push(tmp);
      }
    }

    const now = Date.now();
    setComputed(tmps);
    setLastComputed(now);
    setTimeout(() => edit.setEdits(cleaned), 1);
  }, [edits, originals]);

  if (!computed) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Typography.Title level={3}>
        <>Updates ({edits.length})</>
      </Typography.Title>
      <div className={cls.staged}>
        {computed.map((c, i) => {
          return (
            <div key={i} className={cls.update}>
              <div className={cls.title}>
                <div className={cls.toggle}>
                  <DownOutlined />
                </div>
                {c.name}
              </div>
              <div className={cls.diff}>
                <div className={cls.left}>
                  {c.diff.map((d) => {
                    if (d.added) return null;
                    if (d.removed)
                      return <span className={cls.removed}>{d.value}</span>;
                    else return d.value;
                  })}
                </div>
                <div className={cls.right}>
                  {c.diff.map((d) => {
                    if (d.removed) return null;
                    if (d.added)
                      return <span className={cls.added}>{d.value}</span>;
                    else return d.value;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={cls.propose}>
        <Card>
          <Typography.Title level={4}>Propose changes</Typography.Title>
          <Form.Item required>
            <Editor content={description} onUpdate={setDescription} />
          </Form.Item>
          <Button type="primary" block>
            Propose changes
          </Button>
        </Card>
      </div>
    </div>
  );
};
