import { Route, Routes } from 'react-router-dom';

import type { ApiProject } from '@specfy/models';

import type { RouteProject } from '@/types/routes';

import { ProjectContentList } from './List';
import { DocumentShow } from './Show';

export const ProjectContentIndex: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<ProjectContentList proj={proj} params={params} />}
        />
        <Route path="/:document_slug" element={<DocumentShow proj={proj} />} />
      </Routes>
    </div>
  );
};
