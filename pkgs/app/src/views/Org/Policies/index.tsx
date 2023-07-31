import type { ApiOrg, ApiPolicy } from '@specfy/api/src/types/api';
import {
  IconCaretRight,
  IconCircleCheck,
  IconForbid,
  IconTemplate,
} from '@tabler/icons-react';
import { Button, Skeleton, Table } from 'antd';
import classnames from 'classnames';
import { useMemo, useState } from 'react';

import { useListPolicies } from '../../../api';
import { supportedIndexed } from '../../../common/techs';
import { AvatarAuto } from '../../../components/AvatarAuto';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { Time } from '../../../components/Time';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

const Title: React.FC<{ item: ApiPolicy }> = ({ item }) => {
  const tech = item.tech ? supportedIndexed[item.tech] : null;

  if (item.type === 'promote') {
    return (
      <h4 className={classnames(cls.title, cls.approved)}>
        <IconCircleCheck /> {tech?.name}
      </h4>
    );
  } else if (item.type === 'ban') {
    return (
      <h4 className={classnames(cls.title, cls.banned)}>
        <IconForbid />
        {tech?.name}
      </h4>
    );
  } else if (item.type === 'template_revision') {
    return (
      <h4 className={classnames(cls.title)}>
        <IconTemplate />
        Template for Revision
      </h4>
    );
  } else if (item.type === 'template_rfc') {
    return (
      <h4 className={classnames(cls.title)}>
        <IconTemplate />
        Template for RFC
      </h4>
    );
  }

  return null;
};

export const OrgPolicies: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  params,
}) => {
  const res = useListPolicies({
    org_id: params.org_id,
  });
  const [selected, setSelected] = useState<ApiPolicy>();

  const sorted = useMemo(() => {
    if (!res.data) {
      return [];
    }

    return res.data.data.sort((a, b) => {
      return (a.type === 'ban' || a.type === 'promote') &&
        b.type.startsWith('template')
        ? -1
        : 1;
    });
  }, [res.data]);

  const handleClick = (id: string) => {
    setSelected(res.data?.data.find((pol) => pol.id === id));
  };

  if (res.isLoading) {
    return (
      <Container.Center>
        <Skeleton />
      </Container.Center>
    );
  }

  return (
    <>
      <Container.Left>
        <Table
          rowKey="id"
          dataSource={sorted}
          size="small"
          pagination={false}
          showHeader={false}
        >
          <Table.Column
            dataIndex="name"
            key="name"
            render={(_, item: ApiPolicy) => {
              return (
                <div className={cls.rowTitle}>
                  <div>
                    <Title item={item} />
                    <div className={cls.subtitle}>
                      <div>
                        created <Time time={item.createdAt} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      type="text"
                      icon={<IconCaretRight />}
                      onClick={() => handleClick(item.id)}
                    />
                  </div>
                </div>
              );
            }}
          />
        </Table>
      </Container.Left>
      <Container.Right>
        {selected && (
          <Card padded>
            <Title item={selected} />
            <div className={cls.subtitle}>
              <AvatarAuto name="Samuel Bodin" size="small" /> Samuel Bodin
              <span>-</span>
              <div>
                created <Time time={selected.createdAt} />
              </div>
            </div>
            <div className={cls.content}>
              <ContentDoc doc={selected.content} />
            </div>
          </Card>
        )}
      </Container.Right>
    </>
  );
};
