import type { ApiProject } from 'api/src/types/api';
import { Route, Routes } from 'react-router-dom';

import { ContentSidebar } from '../../../components/Content/Sidebar';
import type { RouteProject } from '../../../types/routes';

import { ProjectContentList } from './List';
import { DocumentShow } from './Show';
import cls from './index.module.scss';

export const ProjectContentIndex: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  return (
    <div className={cls.container}>
      <ContentSidebar proj={proj} params={params} />
      <div className={cls.presentation}>
        <Routes>
          <Route
            path="/"
            element={<ProjectContentList proj={proj} params={params} />}
          />
          <Route
            path="/:document_slug"
            element={<DocumentShow proj={proj} />}
          />
        </Routes>
      </div>
    </div>
  );
};