import type { Node } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import type { ApiComponent } from 'api/src/types/api/components';
import classnames from 'classnames';

import cls from './index.module.scss';

interface NodeData {
  type: ApiComponent['type'];
}

const CustomNode: React.FC<{ node: Node }> = ({ node }) => {
  const label = node.getProp().label;
  const data = node.getData<NodeData>();
  // console.log(label, node.getProp().position);

  return (
    <div className={classnames(cls.node, cls[data?.type])}>
      <span className={cls.label}>{label}</span>
      <span className="status"></span>
    </div>
  );
};

const circle = {
  r: 4,
  magnet: true,
  stroke: '#C2C8D5',
  strokeWidth: 1,
  fill: '#fff',
  style: {
    visibility: 'hidden',
  },
};
register({
  shape: 'custom-node',
  width: 180,
  height: 36,
  component: CustomNode,
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle,
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle,
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle,
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle,
        },
      },
    },
  },
});
