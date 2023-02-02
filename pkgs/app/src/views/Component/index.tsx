import { Avatar, Breadcrumb, Card, Skeleton, Tag, Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useGetProject } from '../../api/projects';
import { supported } from '../../common/component';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { Graph } from '../../components/Graph';
import { ListRFCs } from '../../components/ListRFCs';
import imgUrl from '../../static/component.png';
import type { RouteComponent } from '../../types/routes';

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

export const ComponentView: React.FC = () => {
  // TODO: filter RFC
  const [proj, setProj] = useState<ApiProject>();
  const [comp, setComp] = useState<ApiComponent>();
  const [icon, setIcon] = useState<React.ReactNode>();
  const tmpParams = useParams<Partial<RouteComponent>>();
  const params = tmpParams as RouteComponent;

  // Data fetch
  const res = useGetProject(params);
  const comps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });

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
    setProj(res.data?.data);
  }, [res.isLoading]);

  useEffect(() => {
    if (!comps.data?.data) return;

    setComp(
      comps.data.data.find((c) => {
        return c.slug === params.component_slug!;
      })
    );
  }, [comps.isLoading, tmpParams]);

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
    for (const c of comps.data!.data) {
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
    setContains(getAllChilds(comps.data!.data, comp.id));

    // Find data exchange
    for (const c of comps.data!.data) {
      if (c.id === comp.id) {
        continue;
      }

      const to = c.fromComponents.includes(comp.id);
      const from = c.toComponents.includes(comp.id);
      if (to && !from) _send.set(c.id, c);
      else if (!to && from) _receive.set(c.id, c);
      else if (to && from) _receivesend.set(c.id, c);
    }

    // Push this component read/write
    for (const id of comp.toComponents) {
      _write.set(id, list.get(id)!);
    }
    for (const id of comp.fromComponents) {
      _read.set(id, list.get(id)!);
    }

    // Dedup read/write after everything is computed
    for (const [id] of _read) {
      if (!_write.has(id)) {
        continue;
      }
      _read.delete(id);
      _write.delete(id);
      _readwrite.set(id, list.get(id)!);
    }

    setHosts(_hosts);
    setRead(Array.from(_read.values()));
    setWrite(Array.from(_write.values()));
    setReadWrite(Array.from(_readwrite.values()));
    setReceive(Array.from(_receive.values()));
    setSend(Array.from(_send.values()));
    setReceiveSend(Array.from(_receivesend.values()));
  }, [comp]);

  if (res.isLoading || comps.isLoading) {
    return (
      <Container className={cls.grid}>
        <div className={cls.left}>
          <Skeleton active paragraph={false} />
          <Card>
            <Skeleton active paragraph={{ rows: 5 }}></Skeleton>
          </Card>
        </div>
      </Container>
    );
  }

  if (!comp || !proj) {
    return <div>not found</div>;
  }

  return (
    <Container className={cls.grid}>
      <div className={cls.left}>
        <div>
          <BigHeading
            title={comp.name}
            avatar={icon}
            subtitle={<Tag>{comp.type}</Tag>}
            breadcrumb={
              <Breadcrumb.Item>
                <Link to={`/org/${params.org_id}/${params.project_slug}`}>
                  Crawler
                </Link>
              </Breadcrumb.Item>
            }
          ></BigHeading>
        </div>
        <div>
          <Card>
            {comp.description ? (
              <div dangerouslySetInnerHTML={{ __html: comp.description }}></div>
            ) : (
              <Typography.Text type="secondary">
                No description.
              </Typography.Text>
            )}

            {(comp.tech ||
              hosts.length > 0 ||
              inComp ||
              contains.length > 0) && (
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
        </div>
        <div>
          <Card>
            <ListRFCs project={proj}></ListRFCs>
          </Card>
        </div>
      </div>
      <div className={cls.right}>
        <Card bordered={false} size="small">
          <Graph components={comps.data!.data} height={500}></Graph>
        </Card>
      </div>
    </Container>
  );
};
