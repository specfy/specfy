import { Breadcrumb, Card, Divider, Skeleton, Tag, Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useGetProject } from '../../api/projects';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { ListRFCs } from '../../components/ListRFCs';
import imgUrl from '../../static/component.png';
import type { RouteComponent } from '../../types/routes';

import { Line } from './Line';
import cls from './index.module.scss';

export const ComponentView: React.FC = () => {
  // TODO: filter RFC
  const [proj, setProj] = useState<ApiProject>();
  const [comp, setComp] = useState<ApiComponent>();
  const tmpParams = useParams<Partial<RouteComponent>>();
  const params = tmpParams as RouteComponent;

  // Data fetch
  const res = useGetProject(params);
  const comps = useListComponents(params.projectSlug, {
    org_id: params.orgId,
    project_id: proj?.id,
  });

  // Components
  const [inComp, setInComp] = useState<ApiComponent>();
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [contains, setContains] = useState<ApiComponent[]>([]);
  const [read, setRead] = useState<ApiComponent[]>([]);
  const [write, setWrite] = useState<ApiComponent[]>([]);
  const [readwrite, setReadWrite] = useState<ApiComponent[]>([]);

  useEffect(() => {
    setProj(res.data?.data);
  }, [res.isLoading]);

  useEffect(() => {
    if (!comps.data?.data) return;

    setComp(
      comps.data.data.find((c) => {
        return c.slug === params.componentSlug!;
      })
    );
  }, [comps.isLoading, tmpParams]);

  useEffect(() => {
    if (!comp) {
      return;
    }

    const list = new Map<string, ApiComponent>();
    for (const c of comps.data!.data) {
      list.set(c.id, c);
    }

    const _in = comp.inComponent && list.get(comp.inComponent);

    const _hosts: ApiComponent[] = [];
    const _read = new Map<string, ApiComponent>();
    const _write = new Map<string, ApiComponent>();
    const _readwrite = new Map<string, ApiComponent>();

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
    function getAllChilds(id: string): ApiComponent[] {
      const tmp = [];
      for (const c of comps.data!.data) {
        if (c.inComponent === id) {
          tmp.push(c);
          tmp.push(...getAllChilds(c.id));
        }
      }
      return tmp;
    }
    setContains(getAllChilds(comp.id));

    // Find data exchange
    for (const c of comps.data!.data) {
      if (c.id !== comp.id) {
        const to = c.fromComponents.includes(comp.id);
        const from = c.toComponents.includes(comp.id);
        if (to && !from) _write.set(c.id, c);
        else if (!to && from) _read.set(c.id, c);
        else if (to && from) _readwrite.set(c.id, c);
      }
    }

    // TODO: fix receive data from instead of write

    // Dedup read / write
    for (const id of comp.toComponents) {
      _write.set(id, list.get(id)!);
    }
    for (const id of comp.fromComponents) {
      _read.set(id, list.get(id)!);
    }
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
          <Breadcrumb style={{ margin: '0 0 4px 4px' }}>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/org/${params.orgId}/${params.projectSlug}`}>
                Crawler
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <BigHeading title={comp.name}>
            <Tag>{comp.type}</Tag>
          </BigHeading>
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
              <Divider plain orientation="left">
                Stack
              </Divider>
            )}
            {comp.tech && (
              <div className={cls.line}>
                <div>Build with</div>
                <div>
                  {comp.tech.map((tech) => {
                    const name = tech.toLocaleLowerCase();
                    return (
                      <Link
                        key={tech}
                        to={`/org/${params.orgId}/t/${name}`}
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

            {(readwrite.length > 0 || read.length > 0 || write.length > 0) && (
              <Divider plain orientation="left">
                Data
              </Divider>
            )}

            {readwrite.length > 0 && (
              <Line title="Read and Write" list={readwrite} params={params} />
            )}

            {read.length > 0 && (
              <Line title="Read" list={read} params={params} />
            )}

            {write.length > 0 && (
              <Line title="Write" list={write} params={params} />
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
        <img src={imgUrl} alt="" />
      </div>
    </Container>
  );
};
