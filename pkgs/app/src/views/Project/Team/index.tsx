import { PlusOutlined } from '@ant-design/icons';
import { Card, Typography, Form, Space, Input } from 'antd';
import type { ApiProject, ApiPerm } from 'api/src/types/api';
import { useState, useEffect } from 'react';

import { useListPermsProject } from '../../../api/perms';
import { AvatarAuto } from '../../../components/AvatarAuto';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectTeam: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const team = useListPermsProject({ org_id: proj.orgId, project_id: proj.id });
  const [owners, setOwners] = useState<ApiPerm[]>([]);
  const [reviewers, setReviewers] = useState<ApiPerm[]>([]);
  const [contributors, setContributors] = useState<ApiPerm[]>([]);
  const [viewers, setViewers] = useState<ApiPerm[]>([]);
  const [add, setAdd] = useState<boolean>(false);

  useEffect(() => {
    if (!team.data) return;

    const tmp: Record<ApiPerm['role'], ApiPerm[]> = {
      reviewer: [],
      owner: [],
      contributor: [],
      viewer: [],
    };
    for (const perm of team.data.data) {
      tmp[perm.role].push(perm);
    }
    setOwners(tmp.owner);
    setReviewers(tmp.reviewer);
    setContributors(tmp.contributor);
    setViewers(tmp.viewer);
  }, [team.isLoading]);

  const handleClickAdd = () => {
    setAdd(true);
  };

  return (
    <Card>
      <Typography.Title level={4}>Team</Typography.Title>

      <Form name="basic" layout="vertical">
        <div>
          <Typography.Title level={5}>Owners</Typography.Title>
          {owners.map((perm) => {
            return (
              <div key={perm.id} className={cls.line}>
                <Space>
                  <AvatarAuto name={perm.user.name} />
                  {perm.user.name}
                </Space>
              </div>
            );
          })}
          <div className={cls.add} onClick={handleClickAdd}>
            <div className={cls.emptyAvatar}>
              <PlusOutlined />{' '}
            </div>
            {add ? (
              <Input size="small" style={{ width: '250px' }} />
            ) : (
              'Add member'
            )}
          </div>
        </div>
        <br />

        <div>
          <Typography.Title level={5}>Reviewers</Typography.Title>
          {reviewers.map((perm) => {
            return (
              <div key={perm.id} className={cls.line}>
                <Space>
                  <AvatarAuto name={perm.user.name} />
                  {perm.user.name}
                </Space>
              </div>
            );
          })}
          <div className={cls.add}>
            <div className={cls.emptyAvatar}>
              <PlusOutlined />{' '}
            </div>
            Add member
          </div>
        </div>
        <br />

        <div>
          <Typography.Title level={5}>Contributors</Typography.Title>
          {contributors.map((perm) => {
            return (
              <div key={perm.id} className={cls.line}>
                <Space>
                  <AvatarAuto name={perm.user.name} />
                  {perm.user.name}
                </Space>
              </div>
            );
          })}
          <div className={cls.add}>
            <div className={cls.emptyAvatar}>
              <PlusOutlined />{' '}
            </div>
            Add member
          </div>
        </div>
        <br />

        <div>
          <Typography.Title level={5}>Viewers</Typography.Title>
          {viewers.map((perm) => {
            return (
              <div key={perm.id} className={cls.line}>
                <Space>
                  <AvatarAuto name={perm.user.name} />
                  {perm.user.name}
                </Space>
              </div>
            );
          })}
          <div className={cls.add}>
            <div className={cls.emptyAvatar}>
              <PlusOutlined />{' '}
            </div>
            Add member
          </div>
        </div>
      </Form>
    </Card>
  );
};
