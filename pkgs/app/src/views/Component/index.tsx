import { Breadcrumb, Card, Divider, Skeleton, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { ListRFCs } from '../../components/ListRFCs';
import imgUrl from '../../static/component.png';

import cls from './index.module.scss';

const tmp = {
  id: 'public-api',
  name: 'Public API',
  type: 'service',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra eros vel felis scelerisque pretium. Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const ComponentView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<typeof tmp>();
  const { orgId, projectSlug } = useParams();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 250);
  });

  if (loading || !item) {
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

  return (
    <Container className={cls.grid}>
      <div className={cls.left}>
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/org/${orgId}/${projectSlug}`}>Crawler</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <BigHeading title={item.name}>
            <Tag>{item.type}</Tag>
          </BigHeading>
        </div>
        <div>
          <Card>
            <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
            <Divider />
            <div className={cls.line}>
              <div>Written with</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-nodejs-plain`}></i> NodeJS
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-typescript-plain`}></i> Typescript
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-python-plain`}></i> Python
                </Link>
              </div>
            </div>
            <div className={cls.line}>
              <div>Build with</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-docker-plain`}></i> Docker
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-webpack-plain`}></i> Webpack
                </Link>
              </div>
            </div>
            <div className={cls.line}>
              <div>Hosted on</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-gcp-plain`}></i> GCP
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-kubernetes-plain`}></i> Kubernetes
                </Link>
              </div>
            </div>
            <div className={cls.line}>
              <div>Read and Write to</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-postgresql-plain`}></i> Postgresql
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-redis-plain`}></i> Redis
                </Link>
              </div>
            </div>
            <div className={cls.line}>
              <div>Read from</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-elasticsearch-plain`}></i>{' '}
                  Elasticsearch
                </Link>
              </div>
            </div>
            <div className={cls.line}>
              <div>Write to</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-datadog-plain`}></i> Datadog
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  <i className={`devicon-sentry-plain`}></i> Sentry
                </Link>
              </div>
            </div>
            <Divider />
            <div className={cls.line}>
              <div>Read from</div>
              <div>
                <Link to="/t/nodejs" className={cls.language}>
                  Dashboard API
                </Link>
                <Link to="/t/nodejs" className={cls.language}>
                  Analytics API
                </Link>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <ListRFCs orgId={orgId!}></ListRFCs>
          </Card>
        </div>
      </div>
      <div className={cls.right}>
        <img src={imgUrl} alt="" />
      </div>
    </Container>
  );
};
