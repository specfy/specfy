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
import clsn from 'classnames';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { slugify } from '../../common/string';
import { AvatarAuto } from '../../components/AvatarAuto';
import { Container } from '../../components/Container';
import { HeadingTree } from '../../components/HeadingTree';
import { RFCStatusTag } from '../../components/RFCStatusTag';
import type { BlockLevelOne, Blocks } from '../../types/api/content';

import cls from './index.module.scss';

interface RFCInterface {
  id: string;
  type: 'rfc';
  typeId: string;
  name: string;
  slug: string;
  create: string;
  update: string[];
  use: string[];
  remove: string[];
  tldr: string;
  blocks: BlockLevelOne[];
  authors: string[];
  reviewers: string[];
  approvedBy: string[];
  status: 'approved' | 'draft' | 'rejected';
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

const tmp: RFCInterface = {
  id: '5',
  type: 'rfc',
  typeId: '1',
  name: 'API definition',
  slug: 'api-definition',
  create: '3',
  update: ['2'],
  use: ['4', '6'],
  remove: ['1'],
  tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
  blocks: [
    { type: 'heading', content: 'Overview', level: 1 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam.',
        },
        {
          type: 'text',
          content: 'A link to a documentation',
          link: 'https://google.com',
        },
      ],
    },
    { type: 'heading', content: 'Goals and Non-Goals', level: 1 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            'Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. ',
        },
        {
          type: 'text',
          content:
            'Aliquam nunc ante, sodales eget egestas id, elementum et dui.',
          style: { code: true },
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'item',
          content: [
            {
              type: 'content',
              content: [
                {
                  type: 'text',
                  content: 'lorem ipsum',
                },
              ],
            },
          ],
        },
        {
          type: 'item',
          content: [
            {
              type: 'content',
              content: [
                {
                  type: 'text',
                  content: 'dolor',
                  style: { bold: true },
                },
                {
                  type: 'text',
                  content: 'sit',
                  style: { bold: true, italic: true },
                },
                {
                  type: 'text',
                  content: 'amet',
                  style: { italic: true },
                },
              ],
            },
          ],
        },
      ],
    },
    { type: 'heading', content: 'Background & Motivation', level: 1 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
        },
      ],
    },
    { type: 'heading', content: 'Implementations', level: 1 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
        },
      ],
    },
    { type: 'heading', content: 'Solutions', level: 2 },
    { type: 'heading', content: '#1 Naive one', level: 3 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
        },
      ],
    },
    { type: 'heading', content: 'FAQ', level: 1 },
    { type: 'heading', content: 'What is this awesome website?', level: 2 },
    {
      type: 'content',
      content: [
        {
          type: 'text',
          content:
            ' Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. ',
        },
      ],
    },
    { type: 'heading', content: 'Thanks', level: 4 },
  ],
  authors: ['1'],
  reviewers: ['2'],
  approvedBy: ['3'],
  status: 'approved',
  locked: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

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
  const [item, setItem] = useState<RFCInterface>();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 1000);
  });

  function onClickMenu() {
    setMenu(menu ? false : true);
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
          <Link to="/p/3hjfe8SUHer-crawler/">Crawler</Link>
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
