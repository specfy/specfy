import {
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import {
  Row,
  Col,
  Skeleton,
  Card,
  Typography,
  Space,
  Breadcrumb,
  Divider,
  Button,
} from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiContent } from 'api/src/types/api/contents';
import clsn from 'classnames';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import { getContent } from '../../api/contents';
import { slugify } from '../../common/string';
import { AvatarAuto } from '../../components/AvatarAuto';
import { Container } from '../../components/Container';
import { HeadingTree } from '../../components/HeadingTree';
import { RFCStatusTag } from '../../components/RFCStatusTag';
import type { Blocks } from 'api/src/types/api/content';

import cls from './index.module.scss';

export const Content: React.FC<{ block: Blocks }> = ({ block }) => {
  if (block.type === 'heading') {
    const id = `h-${slugify(block.content)}`;
    if (block.level === 1) return <h1 id={id}>{block.content}</h1>;
    else if (block.level === 2) return <h2 id={id}>{block.content}</h2>;
    else if (block.level === 3) return <h3 id={id}>{block.content}</h3>;
    else if (block.level === 4) return <h4 id={id}>{block.content}</h4>;
    else if (block.level === 5) return <h5 id={id}>{block.content}</h5>;
    else return <h6 id={id}>{block.content}</h6>;
  } else if (block.type === 'content') {
    return (
      <p>
        {block.content.map((blk, i) => {
          return <Content block={blk} key={i} />;
        })}
      </p>
    );
  } else if (block.type === 'bulletList') {
    return (
      <ul>
        {block.content.map((blk, i) => {
          return <Content block={blk} key={i} />;
        })}
      </ul>
    );
  } else if (block.type === 'item') {
    return (
      <li>
        {block.content.map((blk, i) => {
          return <Content block={blk} key={i} />;
        })}
      </li>
    );
  } else if (block.type === 'text') {
    let text = <>{block.content} </>;
    if (block.style) {
      if (block.style.bold) text = <strong>{text}</strong>;
      if (block.style.italic) text = <em>{text}</em>;
      if (block.style.code) text = <code>{text}</code>;
    }
    if (block.link) text = <Link to={block.link}>{text}</Link>;
    return text;
  }

  return <></>;
};

export const RFC: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [, setContentId] = useState<string>();
  const [item, setItem] = useState<ApiContent>();
  const { orgId, projectId, cId } = useParams();

  useMount(() => {
    const cID = cId!.split('-')[0];
    setContentId(cID);

    setTimeout(async () => {
      setLoading(false);
      const content = await getContent(cID);
      if (!content) {
        return;
      }
      setItem(content);
    }, 250);
  });

  function onClickMenu() {
    setMenu(menu ? false : true);
  }

  if (!loading && !item) {
    return <div>not found</div>;
  }

  if (loading || !item) {
    return (
      <Container className={cls.container}>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} className={cls.skeletonTitle} />
          </Col>

          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className={clsn(cls.container, menu ? cls.withMenu : null)}>
      <Breadcrumb style={{ margin: '0 0 0 4px' }}>
        <Breadcrumb.Item>
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/org/${orgId}/${projectId}`}>Crawler</Link>
          <Button
            size="small"
            icon={<MenuUnfoldOutlined />}
            type="ghost"
            onClick={onClickMenu}
          ></Button>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Title level={2} className={cls.title}>
            {item.name}{' '}
            <Typography.Text type="secondary" className={cls.subtitle}>
              RFC-{item.typeId}
            </Typography.Text>
          </Title>
          <Space>
            <RFCStatusTag status={item.status} locked={item.locked} />
            <div className={cls.lastUpdate}>Last update 5 hours ago</div>
          </Space>
        </Col>
        <Col span={18}>
          <Card>
            <Typography className={cls.content}>
              {item.tldr && <p>{item.tldr}</p>}

              <ul className={cls.tldrList}>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Creates{' '}
                  <Link to="/">Public API</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Updates{' '}
                  <Link to="/">Postgres</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Introduces{' '}
                  <Link to="/">NodeJS</Link>
                </li>
                <li>
                  <MinusOutlined style={{ color: '#fa541c' }} /> Removes{' '}
                  <Link to="/">Golang</Link>
                </li>
              </ul>

              <Divider />

              {item.blocks.map((blk, i) => {
                return <Content block={blk} key={i} />;
              })}
            </Typography>
            {menu && (
              <div className={cls.headings}>
                <HeadingTree blocks={item.blocks}></HeadingTree>
              </div>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <div className={cls.infoBlock}>
            <div className={cls.infoHeader}>Authors</div>
            <ul className={cls.userList}>
              {item.authors.map((id) => {
                return (
                  <li key={id}>
                    <Space>
                      <AvatarAuto name="samuel bodin" />
                      Samuel Bodin
                    </Space>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={cls.infoBlock}>
            <div className={cls.infoHeader}>Reviewers</div>
            <ul className={cls.userList}>
              {item.reviewers.map((id) => {
                return (
                  <li key={id}>
                    <Space>
                      <AvatarAuto name="Nicola Torres" />
                      Nicolas Torres <CheckCircleOutlined />
                    </Space>
                  </li>
                );
              })}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
