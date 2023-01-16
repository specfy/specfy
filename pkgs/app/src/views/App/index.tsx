import { UserOutlined, BellOutlined, DownOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import type React from 'react';
import { Link, Route, Routes } from 'react-router-dom';

import { NotFound } from '../../components/NotFound';
import Logo from '../../static/logo.svg';
import Logo1 from '../../static/specfy1.svg';
import { Home } from '../Home';
import { Project } from '../Project';
import { RFC } from '../RFC';

import cls from './index.module.scss';

const { Header, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'home',
    label: <Link to="/">Home</Link>,
  },
];

const App: React.FC = () => {
  return (
    <Layout className={cls.app}>
      <Layout>
        <Header className={cls.header}>
          <div className={cls.logo}>
            <img src={Logo} />
            <img src={Logo1} />
          </div>

          <div>
            <Button
              type="primary"
              icon={<DownOutlined />}
              className={cls.orgSelect}
            />
          </div>

          <div>
            <Menu
              className={cls.menu}
              items={menuItems}
              selectedKeys={['home']}
              mode="horizontal"
            ></Menu>
          </div>

          <div className={cls.headerRight}>
            <div>
              <Badge count={1}>
                <Avatar
                  shape="square"
                  icon={<BellOutlined />}
                  className={cls.avatar}
                />
              </Badge>
            </div>
            <div>
              <Avatar
                shape="square"
                icon={<UserOutlined />}
                className={cls.avatar}
              />
            </div>
          </div>
        </Header>
        <Content>
          <Routes>
            <Route path="/">
              <Route index element={<Home />} />
              <Route path="/p/:projectId" element={<Project />} />
              <Route path="/p/:projectId/rfc/:rfcId" element={<RFC />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
