import type { ApiProject, ListDocuments } from '@specfy/models';
import {
  IconBooks,
  IconClipboardList,
  IconNotebook,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../../../api';
import { TYPE_TO_TEXT } from '../../../../common/document';
import { useDocumentsStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectContentList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const { deleted } = useDocumentsStore();

  const [pagination, setPagination] =
    useState<ListDocuments['Success']['pagination']>();
  const [list, setList] = useState<ListDocuments['Success']['data']>();
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
  });

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setList(res.data.data.filter((item) => !deleted.includes(item.id)));
    setPagination(res.data.pagination);
  }, [res.data]);

  if (!list || !pagination) {
    return null;
  }

  return (
    <Container noPadding>
      <Container.Left2Third>
        <Helmet title={`Content - ${proj.name} ${titleSuffix}`} />

        <Flex gap="xl" className={cls.categories}>
          <div className={cls.category}>
            <div className={cls.icon}>
              <IconNotebook />
            </div>
            <h3>Documentation</h3>
          </div>
          <div className={cls.category}>
            <div className={cls.icon}>
              <IconClipboardList />
            </div>
            <h3>RFCs</h3>
          </div>
          <div className={cls.category}>
            <div className={cls.icon}>
              <IconBooks />
            </div>
            <h3>Playbooks</h3>
          </div>
        </Flex>

        <div className={cls.list}>
          {list.map((item) => {
            return (
              <div key={item.id} className={cls.item}>
                <Link
                  to={`/${params.org_id}/${params.project_slug}/content/${item.id}-${item.slug}`}
                  relative="path"
                  className={cls.title}
                >
                  {item.type !== 'doc' &&
                    `${TYPE_TO_TEXT[item.type]}-${item.typeId} - `}
                  {item.name}
                </Link>
                <div className={cls.subtitle}>
                  Updated <Time time={item.updatedAt} />
                </div>
              </div>
            );
          })}
        </div>
      </Container.Left2Third>
    </Container>
  );
};
