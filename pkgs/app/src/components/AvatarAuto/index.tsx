import type { AvatarProps } from 'antd';
import { Avatar } from 'antd';

import { acronymize, stringToColor } from '../../common/string';

export const AvatarAuto: React.FC<
  AvatarProps & { className?: string; name: string }
> = ({ className, name, ...rest }) => {
  const acr = acronymize(name);
  const style = stringToColor(acr);
  return (
    <Avatar
      className={className}
      style={{ ...style, border: 'none' }}
      {...rest}
    >
      {acr}
    </Avatar>
  );
};
