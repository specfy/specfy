import type { AvatarProps } from 'antd';
import { Avatar } from 'antd';

import { acronymize } from '../../common/acronymize';
import { stringToColor } from '../../common/stringToColor';

export const AvatarAuto: React.FC<
  AvatarProps & { className?: string; name: string }
> = ({ className, name, ...rest }) => {
  const acr = acronymize(name);
  const color = stringToColor(acr);
  return (
    <Avatar className={className} style={{ backgroundColor: color }} {...rest}>
      {acr}
    </Avatar>
  );
};
