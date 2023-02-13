import { CaretDownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { Change } from 'diff';
import { diffChars } from 'diff';
import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Link } from 'react-router-dom';

import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { isDiff, useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

interface Computed {
  id: string;
  couple: string;
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
          couple,
          name: key,
          old: originals[couple][key],
          new: value,
          diff: diffChars(
            renderToString(a).replaceAll('<!-- -->', ''),
            renderToString(b).replaceAll('<!-- -->', '')
          ),
        };
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
          const left = c.diff
            .map((d) => {
              if (d.added) return null;
              if (d.removed)
                return <span className={cls.removed}>{d.value}</span>;
              else return d.value;
            })
            .filter((e) => e);
          const type = 'type' in originals[c.couple] ? 'Components' : 'Project';
          let to = `/org/${params.org_id}/${params.project_slug}`;
          if (type === 'Components') to += `/c/${originals[c.couple].slug}`;

          return (
            <div key={i} className={cls.update}>
              <div className={cls.title}>
                <div className={cls.titleLeft}>
                  <div className={cls.toggle}>
                    <CaretDownOutlined />
                  </div>
                  <Link to={to}>
                    {type} / {originals[c.couple].name} [{c.name}]
                  </Link>
                </div>
                <div>
                  <Checkbox checked>Add</Checkbox>
                </div>
              </div>
              <div className={cls.diff}>
                <div className={cls.left}>
                  {left}
                  {!left.length && <span className={cls.empty}>Empty...</span>}
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
            <Editor
              content={description}
              onUpdate={setDescription}
              minHeight="100px"
            />
          </Form.Item>
          <Button type="primary" block>
            Propose changes
          </Button>
        </Card>
      </div>
    </div>
  );
};
