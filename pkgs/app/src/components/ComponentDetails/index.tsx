import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Modal, Select, Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import type React from 'react';
import { useEffect, useState } from 'react';

import type { TechInfo } from '../../common/component';
import { useComponentsStore } from '../../common/store';
import {
  ComponentLine,
  ComponentLineTech,
} from '../../components/ComponentLine';
import { getEmptyDoc } from '../../components/Editor/helpers';
import { LanguageSelect, StackSearch } from '../../components/StackSearch';
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
  const [send, setSend] = useState<ApiComponent[]>([]);
  const [receiveSend, setReceiveSend] = useState<ApiComponent[]>([]);
  const [all, setAll] = useState<AllComponent[]>([]);

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const storeComponents = useComponentsStore();

  const [openStack, setOpenStack] = useState(false);
  const [openHost, setOpenHost] = useState(false);
  const [openSearchData, setOpenSearchData] = useState(false);

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
    const _send = new Map<string, ApiComponent>();
    const _receivesend = new Map<string, ApiComponent>();
    const _all: AllComponent[] = [];

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
        _all.push({ category: 'push', component: list.get(edge.to)! });
      } else if (edge.write) {
        _write.set(edge.to, list.get(edge.to)!);
        _all.push({ category: 'write', component: list.get(edge.to)! });
      } else {
        _read.set(edge.to, list.get(edge.to)!);
        _all.push({ category: 'read', component: list.get(edge.to)! });
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
          _receivesend.set(other.id, list.get(other.id)!);
          _all.push({ category: 'receivesend', component: list.get(edge.to)! });
        } else if (edge.write) {
          _receive.set(other.id, list.get(other.id)!);
          _all.push({ category: 'receive', component: list.get(edge.to)! });
        } else {
          _send.set(other.id, list.get(other.id)!);
          _all.push({ category: 'send', component: list.get(edge.to)! });
        }
      }
    }

    setHosts(_hosts);
    setRead(Array.from(_read.values()));
    setWrite(Array.from(_write.values()));
    setReadWrite(Array.from(_readwrite.values()));
    setReceive(Array.from(_receive.values()));
    setSend(Array.from(_send.values()));
    setReceiveSend(Array.from(_receivesend.values()));
    setAll(_all);
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

  const handlePickData = (obj: ApiComponent | ApiProject | TechInfo) => {
    console.log(obj);
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
        send.length > 0 ||
        receiveSend.length > 0) && (
        <div className={cls.block}>
          <div className={cls.blockTitle}>
            <Typography.Title level={5}>Data</Typography.Title>

            <Button
              className={cls.add}
              type="text"
              size="small"
              onClick={() => setOpenSearchData(!openSearchData)}
            >
              <IconPlus /> Edit
            </Button>
          </div>

          {(isEditing || readwrite.length > 0) && (
            <ComponentLine
              title="Read and Write to"
              comps={readwrite}
              params={params}
            />
          )}

          {(isEditing || read.length > 0) && (
            <ComponentLine title="Read from" comps={read} params={params} />
          )}

          {(isEditing || receiveSend.length > 0) && (
            <ComponentLine
              title="Receive and Send to"
              comps={receiveSend}
              params={params}
            />
          )}
          {(isEditing || receive.length > 0) && (
            <ComponentLine
              title="Receive from"
              comps={receive}
              params={params}
            />
          )}
          {(isEditing || send.length > 0) && (
            <ComponentLine title="Send to" comps={send} params={params} />
          )}

          {(isEditing || write.length > 0) && (
            <ComponentLine title="Write to" comps={write} params={params} />
          )}
        </div>
      )}

      <Modal
        title=""
        open={openStack}
        onCancel={() => setOpenStack(!openStack)}
        bodyStyle={{ minHeight: '200px' }}
        closable={false}
        footer={[
          <Button
            key="back"
            type="text"
            onClick={() => setOpenStack(!openStack)}
          >
            cancel
          </Button>,
        ]}
      >
        <StackSearch
          comps={components!}
          searchStack={['language']}
          searchProject={false}
          searchComponents={false}
          usedTech={component.tech}
          defaultResults={true}
          onPick={(obj) => {
            handlePickStack(obj);
            setOpenStack(!openStack);
          }}
        />
      </Modal>

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
