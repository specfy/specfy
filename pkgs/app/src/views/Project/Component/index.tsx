import { Avatar, Card, Col, Row, Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { supported } from '../../../common/component';
import { ListRFCs } from '../../../components/ListRFCs';
import type { RouteComponent, RouteProject } from '../../../types/routes';

import { Line } from './Line';
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
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  // TODO: filter RFC
  const [comp, setComp] = useState<ApiComponent>();
  const [icon, setIcon] = useState<React.ReactNode>();
  const route = useParams<Partial<RouteComponent>>();

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

  useEffect(() => {
    setComp(
      comps.find((c) => {
        return c.slug === route.component_slug!;
      })
    );
  }, [route.component_slug]);

  useEffect(() => {
    if (!comp) {
      return;
    }

    const name = comp.name.toLocaleLowerCase();
    setIcon(
      name in supported ? (
        <Avatar icon={<i className={`devicon-${name}-plain colored`}></i>} />
      ) : undefined
    );

    const list = new Map<string, ApiComponent>();
    for (const c of comps) {
      list.set(c.id, c);
    }

    const _in = comp.inComponent && list.get(comp.inComponent);

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
    setContains(getAllChilds(comps, comp.id));

    for (const edge of comp.edges) {
      if (edge.read && edge.write) {
        _readwrite.set(edge.to, list.get(edge.to)!);
      } else if (edge.write) {
        _write.set(edge.to, list.get(edge.to)!);
      } else {
        _read.set(edge.to, list.get(edge.to)!);
      }
    }

    for (const other of comps) {
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

  if (!comp) {
    return <div>not found</div>;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <Typography.Title level={4}>{comp.name}</Typography.Title>
          {comp.description ? (
            <div dangerouslySetInnerHTML={{ __html: comp.description }}></div>
          ) : (
            <Typography.Text type="secondary">No description.</Typography.Text>
          )}

          {(comp.tech || hosts.length > 0 || inComp || contains.length > 0) && (
            <div className={cls.block}>
              <Typography.Title level={5}>Stack</Typography.Title>
              {comp.tech && (
                <div className={cls.line}>
                  <div>Build with</div>
                  <div>
                    {comp.tech.map((tech) => {
                      const name = tech.toLocaleLowerCase();
                      return (
                        <Link
                          key={tech}
                          to={`/org/${params.org_id}/${params.project_slug}/t/${name}`}
                          className={cls.language}
                        >
                          <i className={`devicon-${name}-plain`}></i> {tech}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {hosts.length > 0 && (
                <Line title="Hosted on" list={hosts} params={params} />
              )}

              {contains.length > 0 && (
                <Line title="Contains" list={contains} params={params} />
              )}

              {inComp && (
                <Line title="Run inside" list={[inComp]} params={params} />
              )}
            </div>
          )}

          {(readwrite.length > 0 ||
            read.length > 0 ||
            write.length > 0 ||
            receive.length > 0 ||
            send.length > 0 ||
            receiveSend.length > 0) && (
            <div className={cls.block}>
              <Typography.Title level={5}>Data</Typography.Title>

              {readwrite.length > 0 && (
                <Line
                  title="Read and Write to"
                  list={readwrite}
                  params={params}
                />
              )}

              {read.length > 0 && (
                <Line title="Read from" list={read} params={params} />
              )}

              {receiveSend.length > 0 && (
                <Line
                  title="Receive and Send to"
                  list={receiveSend}
                  params={params}
                />
              )}
              {receive.length > 0 && (
                <Line title="Receive from" list={receive} params={params} />
              )}
              {send.length > 0 && (
                <Line title="Send to" list={send} params={params} />
              )}

              {write.length > 0 && (
                <Line title="Write to" list={write} params={params} />
              )}
            </div>
          )}
        </Card>
      </Col>
      <Col span={24}>
        <Card>
          <ListRFCs project={proj}></ListRFCs>
        </Card>
      </Col>
    </Row>
  );
};
