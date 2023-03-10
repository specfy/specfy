import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Modal, Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import type { GraphEdge } from 'api/src/types/db';
import type React from 'react';
import { useEffect, useState } from 'react';

import type { TechInfo } from '../../common/component';
import { useComponentsStore } from '../../common/store';
import {
  ComponentLine,
  ComponentLineTech,
} from '../../components/ComponentLine';
import { getEmptyDoc } from '../../components/Editor/helpers';
import {
  ComponentSelect,
  LanguageSelect,
  StackSearch,
} from '../../components/StackSearch';
import { useEdit } from '../../hooks/useEdit';
import type { RouteComponent } from '../../types/routes';

import cls from './index.module.scss';

function getAllChilds(list: ApiComponent[], id: string): ApiComponent[] {
  const tmp = [];
  for (const c of list) {
    if (c.inComponent === id) {
      tmp.push(c);
      tmp.push(...getAllChilds(list, c.id));
    }
  }
  return tmp;
}

interface AllComponent {
  category: string;
  component: ApiComponent;
}

export const ComponentDetails: React.FC<{
  proj: ApiProject;
  params: RouteComponent;
  component: ApiComponent;
  components: ApiComponent[];
}> = ({ proj, params, component, components }) => {
  // Components
  const [inComp, setInComp] = useState<ApiComponent>();
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [contains, setContains] = useState<ApiComponent[]>([]);
  const [read, setRead] = useState<ApiComponent[]>([]);
  const [write, setWrite] = useState<ApiComponent[]>([]);
  const [readwrite, setReadWrite] = useState<ApiComponent[]>([]);
  const [receive, setReceive] = useState<ApiComponent[]>([]);
  const [answer, setAnswer] = useState<ApiComponent[]>([]);
  const [receiveAnswer, setReceiveAnswer] = useState<ApiComponent[]>([]);
  const [all, setAll] = useState<AllComponent[]>([]);

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const storeComponents = useComponentsStore();

  const [openHost, setOpenHost] = useState(false);

  useEffect(() => {
    const list = new Map<string, ApiComponent>();
    for (const c of components!) {
      list.set(c.id, c);
    }

    const inVal = component.inComponent;
    const _in = inVal && list.get(inVal);

    const _hosts: ApiComponent[] = [];
    const _read = new Map<string, ApiComponent>();
    const _write = new Map<string, ApiComponent>();
    const _readwrite = new Map<string, ApiComponent>();
    const _receive = new Map<string, ApiComponent>();
    const _answer = new Map<string, ApiComponent>();
    const _receiveanswer = new Map<string, ApiComponent>();

    // Recursive find hosts
    if (_in) {
      let l = _in;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (l.type === 'hosting') {
          _hosts.push(l);
        }
        if (!l.inComponent) {
          break;
        }
        l = list.get(l.inComponent)!;
      }

      if (_in.type !== 'hosting') {
        setInComp(_in);
      }
    }

    // Find contains
    // First find direct ascendant then register all childs
    setContains(getAllChilds(components!, component.id));

    for (const edge of component.edges) {
      if (edge.read && edge.write) {
        _readwrite.set(edge.to, list.get(edge.to)!);
      } else if (edge.write) {
        _write.set(edge.to, list.get(edge.to)!);
      } else {
        _read.set(edge.to, list.get(edge.to)!);
      }
    }

    for (const other of components!) {
      if (other.id === component.id) {
        continue;
      }

      for (const edge of other.edges) {
        if (edge.to !== component.id) {
          continue;
        }

        if (edge.read && edge.write) {
          _receiveanswer.set(other.id, list.get(other.id)!);
        } else if (edge.write) {
          _receive.set(other.id, list.get(other.id)!);
        } else {
          _answer.set(other.id, list.get(other.id)!);
        }
      }
    }

    setHosts(_hosts);
    setRead(Array.from(_read.values()));
    setWrite(Array.from(_write.values()));
    setReadWrite(Array.from(_readwrite.values()));
    setReceive(Array.from(_receive.values()));
    setAnswer(Array.from(_answer.values()));
    setReceiveAnswer(Array.from(_receiveanswer.values()));
  }, [component]);

  const handlePickStack = (obj: ApiComponent | ApiProject | TechInfo) => {
    setOpenStack(false);

    if ('key' in obj) {
      if (obj.type === 'hosting') {
        let exists = components!.find((c) => c.name === obj.name);
        if (!exists) {
          exists = {
            id: 'ere',
            orgId: proj.orgId,
            projectId: proj.id,
            type: 'hosting',
            typeId: null,
            name: obj.name,
            slug: obj.key,
            description: getEmptyDoc(),
            tech: null,
            display: { pos: { x: 0, y: 0, width: 100, height: 32 } },
            edges: [],
            blobId: '',
            inComponent: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          storeComponents.create(exists);
        }

        if (hosts.find((host) => host.name === exists!.name)) {
          // Already added
          return;
        }

        storeComponents.updateField(component.id, 'inComponent', exists.id);
        return;
      }

      if (obj.type === 'language' || obj.type === 'tool') {
        const techs = component.tech || [];
        if (techs.includes(obj.name)) {
          // Already added
          return;
        }

        storeComponents.updateField(component.id, 'tech', [...techs, obj.name]);
      }
    }
  };

  const handleStackChange = (values: string[]) => {
    storeComponents.updateField(component.id, 'tech', [...values]);
  };

  const handlePickData = (
    obj: string[],
    category: 'read' | 'readwrite' | 'write',
    original: ApiComponent[]
  ) => {
    const isRemove = original.length > obj.length;
    const isFrom =
      category === 'readwrite' || category === 'read' || category === 'write';

    // Remove edge
    if (isRemove) {
      const diff = original.filter((x) => !obj.includes(x.id))[0];

      if (isFrom) {
        const tmp: GraphEdge[] = [];
        for (const edge of component.edges) {
          if (edge.to === diff.id) {
            continue;
          }
          tmp.push(edge);
        }

        storeComponents.updateField(component.id, 'edges', tmp);
      }
      return;
    }

    // Add edges
    const diff = obj.filter((x) => !original.find((o) => o.id === x))[0];
    const add = components.find((c) => c.id === diff)!;

    if (isFrom) {
      const tmp: GraphEdge[] = [];
      let exists: GraphEdge | false = false;
      for (const edge of component.edges) {
        if (edge.to === diff) {
          const copy = JSON.parse(JSON.stringify(edge));
          exists = copy;
          continue;
        }

        tmp.push(edge);
      }
      const isCurrentAbove =
        component.display.pos.y + component.display.pos.height <
        add.display.pos.y;
      const isCurrentBelow =
        component.display.pos.y > add.display.pos.y + add.display.pos.height;
      const isCurrentRight =
        component.display.pos.x > add.display.pos.x + add.display.pos.width;
      const isCurrentLeft =
        component.display.pos.x + component.display.pos.x < add.display.pos.x;

      let source: GraphEdge['portSource'] = 'left';
      let target: GraphEdge['portTarget'] = 'right';
      if (isCurrentLeft) {
        source = 'right';
        target = 'left';
      } else if (isCurrentAbove && !isCurrentRight) {
        source = 'bottom';
        target = 'top';
      } else if (isCurrentBelow) {
        source = 'top';
        target = 'bottom';
      }

      const edge: GraphEdge =
        exists !== false
          ? exists
          : {
              to: diff,
              portSource: 'left',
              portTarget: 'left',
              read: false,
              write: false,
              vertices: [],
            };
      edge.portSource = source;
      edge.portTarget = target;
      edge.read = category !== 'write';
      edge.write = category !== 'read';
      tmp.push(edge);

      storeComponents.updateField(component.id, 'edges', tmp);
    }
  };

  return (
    <div>
      {(isEditing || component.tech) && (
        <div className={cls.block}>
          <div className={cls.blockTitle}>
            <Typography.Title level={5}>Stack</Typography.Title>

            {/* <Button
              className={cls.add}
              type="text"
              size="small"
              onClick={() => setOpenStack(!openStack)}
            >
              <IconPlus /> Add
            </Button> */}
          </div>

          {(isEditing || component.tech) && (
            <ComponentLineTech
              title="Build with"
              techs={component.tech}
              params={params}
              editing={isEditing}
            >
              <LanguageSelect
                values={component.tech}
                onChange={handleStackChange}
              />
            </ComponentLineTech>
          )}
        </div>
      )}

      {(isEditing || hosts.length > 0 || inComp || contains.length > 0) && (
        <div className={cls.block}>
          <div className={cls.blockTitle}>
            <Typography.Title level={5}>Hosting</Typography.Title>

            <Button
              className={cls.add}
              type="text"
              size="small"
              onClick={() => setOpenHost(!openHost)}
            >
              <IconPlus /> Edit
            </Button>
          </div>

          {(isEditing || hosts.length > 0) && (
            <ComponentLine title="Hosted on" comps={hosts} params={params} />
          )}

          {(isEditing || contains.length > 0) && (
            <ComponentLine title="Contains" comps={contains} params={params} />
          )}

          {(isEditing || inComp) && (
            <ComponentLine
              title="Run inside"
              comps={inComp && [inComp]}
              params={params}
            />
          )}
        </div>
      )}

      {(isEditing ||
        readwrite.length > 0 ||
        read.length > 0 ||
        write.length > 0 ||
        receive.length > 0 ||
        answer.length > 0 ||
        receiveAnswer.length > 0) && (
        <div className={cls.block}>
          <div className={cls.blockTitle}>
            <Typography.Title level={5}>Data</Typography.Title>
          </div>

          {(isEditing || readwrite.length > 0) && (
            <ComponentLine
              title="Read and Write to"
              comps={readwrite}
              params={params}
              editing={isEditing}
            >
              <ComponentSelect
                current={component}
                components={components}
                values={readwrite}
                onChange={(res) => handlePickData(res, 'readwrite', readwrite)}
              />
            </ComponentLine>
          )}

          {(isEditing || read.length > 0) && (
            <ComponentLine
              title="Read from"
              comps={read}
              params={params}
              editing={isEditing}
            >
              <ComponentSelect
                current={component}
                components={components}
                values={read}
                onChange={(res) => handlePickData(res, 'read', read)}
              />
            </ComponentLine>
          )}

          {(isEditing || write.length > 0) && (
            <ComponentLine
              title="Write to"
              comps={write}
              params={params}
              editing={isEditing}
            >
              <ComponentSelect
                current={component}
                components={components}
                values={write}
                onChange={(res) => handlePickData(res, 'write', write)}
              />
            </ComponentLine>
          )}

          {(isEditing || receiveAnswer.length > 0) && (
            <ComponentLine
              title="Receive and Answer to"
              comps={receiveAnswer}
              params={params}
              editing={isEditing}
            />
          )}
          {(isEditing || receive.length > 0) && (
            <ComponentLine
              title="Receive from"
              comps={receive}
              params={params}
              editing={isEditing}
            />
          )}
          {(isEditing || answer.length > 0) && (
            <ComponentLine
              title="Answer to"
              comps={answer}
              params={params}
              editing={isEditing}
            />
          )}
        </div>
      )}

      <Modal
        title=""
        open={openHost}
        onCancel={() => {
          setOpenHost(!openHost);
        }}
        bodyStyle={{ minHeight: '200px' }}
        closable={false}
        footer={[
          <Button
            key="back"
            type="text"
            onClick={() => {
              setOpenHost(!openHost);
            }}
          >
            close
          </Button>,
        ]}
      >
        <Form name="basic" layout="vertical">
          <Form.Item label="Hosted on">
            <StackSearch
              comps={components!}
              searchStack={['hosting']}
              searchProject={false}
              searchComponents={['hosting']}
              defaultResults={false}
              onPick={(obj) => {
                // TODO:
              }}
            />
            {hosts.length > 0 && <div>{hosts[0].name}</div>}
          </Form.Item>
          <Form.Item label="Contains"></Form.Item>
          <Form.Item label="Run Inside"></Form.Item>
        </Form>
        {/* <StackSearch
          comps={components!}
          searchStack={['hosting']}
          searchProject={false}
          searchComponents={['hosting']}
          usedTech={component.tech}
          onPick={(obj) => {
            handlePickStack(obj);
          }}
        /> */}
      </Modal>
    </div>
  );
};
