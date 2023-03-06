import { IconPlus } from '@tabler/icons-react';
import { Button, Popover, Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TechInfo } from '../../../common/component';
import { supportedIndexed } from '../../../common/component';
import { useComponentsStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { getEmptyDoc } from '../../../components/Editor/helpers';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import { FakeInput } from '../../../components/Input';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';
import type { RouteComponent, RouteProject } from '../../../types/routes';

import { Line } from './Line';
import { Stack } from './Stack';
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

export const ComponentView: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const gref = useGraph();

  // TODO: filter RFC
  const [comp, setComp] = useState<ApiComponent>();
  const [info, setInfo] = useState<TechInfo>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();
  const route = useParams<Partial<RouteComponent>>();

  // Components
  const [components, setComponents] = useState<ApiComponent[]>();
  const [inComp, setInComp] = useState<ApiComponent>();
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [contains, setContains] = useState<ApiComponent[]>([]);
  const [read, setRead] = useState<ApiComponent[]>([]);
  const [write, setWrite] = useState<ApiComponent[]>([]);
  const [readwrite, setReadWrite] = useState<ApiComponent[]>([]);
  const [receive, setReceive] = useState<ApiComponent[]>([]);
  const [send, setSend] = useState<ApiComponent[]>([]);
  const [receiveSend, setReceiveSend] = useState<ApiComponent[]>([]);

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const storeComponents = useComponentsStore();

  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
    setComp(storeComponents.select(route.component_slug!));
  }, [route.component_slug, storeComponents]);

  useEffect(() => {
    if (!comp) {
      return;
    }

    const name = comp.name.toLocaleLowerCase();
    if (name in supportedIndexed) {
      setInfo(supportedIndexed[name]);
      setIcon(supportedIndexed[name].Icon);
    } else {
      setInfo(undefined);
      setIcon(undefined);
    }

    const list = new Map<string, ApiComponent>();
    for (const c of components!) {
      list.set(c.id, c);
    }

    const inVal = comp.inComponent;
    const _in = inVal && list.get(inVal);

    const _hosts: ApiComponent[] = [];
    const _read = new Map<string, ApiComponent>();
    const _write = new Map<string, ApiComponent>();
    const _readwrite = new Map<string, ApiComponent>();
    const _receive = new Map<string, ApiComponent>();
    const _send = new Map<string, ApiComponent>();
    const _receivesend = new Map<string, ApiComponent>();

    // Recursive find hosts
    if (_in) {
      let l = _in;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (l.type === 'hosting') _hosts.push(l);
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
    setContains(getAllChilds(components!, comp.id));

    for (const edge of comp.edges) {
      if (edge.read && edge.write) {
        _readwrite.set(edge.to, list.get(edge.to)!);
      } else if (edge.write) {
        _write.set(edge.to, list.get(edge.to)!);
      } else {
        _read.set(edge.to, list.get(edge.to)!);
      }
    }

    for (const other of components!) {
      if (other.id === comp.id) {
        continue;
      }

      for (const edge of other.edges) {
        if (edge.to !== comp.id) {
          continue;
        }

        if (edge.read && edge.write) {
          _receivesend.set(other.id, list.get(other.id)!);
        } else if (edge.write) {
          _receive.set(other.id, list.get(other.id)!);
        } else {
          _send.set(other.id, list.get(other.id)!);
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
  }, [comp]);

  useEffect(() => {
    if (!gref || !comp) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight();
      gref.setHighlight(comp!.id);
    }, 500);
  }, [comp]);

  const handlePickStack = (obj: ApiComponent | ApiProject | TechInfo) => {
    setOpenSearch(false);

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

        storeComponents.updateField(comp!.id, 'inComponent', exists.id);
        return;
      }

      if (obj.type === 'language' || obj.type === 'tool') {
        const techs = comp!.tech || [];
        if (techs.includes(obj.name)) {
          // Already added
          return;
        }

        storeComponents.updateField(comp!.id, 'tech', [...techs, obj.name]);
      }
    }
  };

  if (!comp) {
    return <div>not found</div>;
  }

  return (
    <>
      <Container.Left>
        <Card padded>
          {!isEditing && (
            <Typography.Title level={1}>
              {Icon && (
                <div className={cls.icon}>
                  <Icon size="1em" />
                </div>
              )}
              {comp.name}
            </Typography.Title>
          )}
          {isEditing && (
            <FakeInput.H1
              size="large"
              value={comp.name}
              className={cls.titleInput}
              placeholder="Title..."
              onChange={(e) => {
                storeComponents.updateField(comp!.id, 'name', e.target.value);
              }}
            />
          )}

          <Typography>
            {!isEditing && comp.description && (
              <ContentDoc doc={comp.description} />
            )}
            {!comp.description?.content.length && !isEditing && (
              <Typography.Text type="secondary">
                Write something...
              </Typography.Text>
            )}
            {isEditing && (
              <EditorMini
                key={comp.id}
                doc={comp.description}
                onUpdate={(doc) => {
                  storeComponents.updateField(comp!.id, 'description', doc);
                }}
              />
            )}
          </Typography>

          {(isEditing ||
            comp.tech ||
            hosts.length > 0 ||
            inComp ||
            contains.length > 0) && (
            <div className={cls.block}>
              <div className={cls.blockTitle}>
                <Typography.Title level={5}>Stack</Typography.Title>

                <Popover
                  content={
                    <Stack
                      comps={components!}
                      searchStack={['language', 'tool', 'hosting']}
                      searchProject={false}
                      searchComponents={['hosting', 'component']}
                      usedTech={comp.tech}
                      onPick={handlePickStack}
                    />
                  }
                  open={openSearch}
                  onOpenChange={setOpenSearch}
                  trigger="click"
                  placement="rightTop"
                  showArrow={false}
                  destroyTooltipOnHide={true}
                >
                  <Button
                    className={cls.add}
                    type="text"
                    size="small"
                    onClick={() => setOpenSearch(!openSearch)}
                  >
                    <IconPlus /> Add Stack
                  </Button>
                </Popover>
              </div>
              {(isEditing || comp.tech) && (
                <Line title="Build with" techs={comp.tech} params={params} />
              )}

              {(isEditing || hosts.length > 0) && (
                <Line title="Hosted on" comps={hosts} params={params} />
              )}

              {(isEditing || contains.length > 0) && (
                <Line title="Contains" comps={contains} params={params} />
              )}

              {(isEditing || inComp) && (
                <Line
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
              <Typography.Title level={5}>Data</Typography.Title>

              {(isEditing || readwrite.length > 0) && (
                <Line
                  title="Read and Write to"
                  comps={readwrite}
                  params={params}
                />
              )}

              {(isEditing || read.length > 0) && (
                <Line title="Read from" comps={read} params={params} />
              )}

              {(isEditing || receiveSend.length > 0) && (
                <Line
                  title="Receive and Send to"
                  comps={receiveSend}
                  params={params}
                />
              )}
              {(isEditing || receive.length > 0) && (
                <Line title="Receive from" comps={receive} params={params} />
              )}
              {(isEditing || send.length > 0) && (
                <Line title="Send to" comps={send} params={params} />
              )}

              {(isEditing || write.length > 0) && (
                <Line title="Write to" comps={write} params={params} />
              )}
            </div>
          )}
        </Card>
        <Card padded>
          <ListRFCs project={proj}></ListRFCs>
        </Card>
      </Container.Left>
      <Container.Right>
        <Card>
          <GraphContainer>
            <Graph readonly={true} components={components!} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>
      </Container.Right>
    </>
  );
};
