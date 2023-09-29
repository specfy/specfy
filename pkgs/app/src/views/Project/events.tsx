import { qcli, refreshProject } from '@/common/query';
import { Button } from '@/components/Form/Button';
import { useEventBus } from '@/hooks/useEventBus';
import { useToast } from '@/hooks/useToast';

export const ProjectEvents: React.FC = () => {
  const toast = useToast();

  useEventBus('job.start', (data) => {
    if (window.location.pathname.endsWith('/welcome')) {
      return;
    }

    const job = data.job;
    qcli.invalidateQueries(['listJobs', job.orgId, job.projectId]);
    qcli.invalidateQueries(['getJob', job.orgId, job.projectId, job.id]);
    toast.add({
      id: job.id,
      title: `Deploy #${job.typeId}`,
      loading: true,
      link: `/${job.orgId}/${data.project.slug}/deploys/${job.id}`,
    });
  });

  useEventBus('job.finish', (data) => {
    if (window.location.pathname.endsWith('/welcome')) {
      return;
    }
    if (data.job.type !== 'deploy') {
      return;
    }

    setTimeout(() => {
      const job = data.job;
      qcli.invalidateQueries(['listJobs', job.orgId, job.projectId]);
      qcli.invalidateQueries(['getJob', job.orgId, job.projectId, job.id]);
      toast.update({
        id: job.id,
        status: job.status === 'failed' ? 'error' : 'success',
        loading: false,
        closable: true,
        action:
          job.status === 'success' ? (
            <Button
              size="s"
              onClick={() => refreshProject(job.orgId, job.projectId!, true)}
            >
              Refresh project
            </Button>
          ) : null,
      });
    }, 1000);
  });

  return null;
};
