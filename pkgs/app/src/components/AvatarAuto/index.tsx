import * as Avatar from '@radix-ui/react-avatar';
import { acronymize, stringToColor } from '@specfy/api/src/common/avatar';
import type { ApiOrgPublic } from '@specfy/api/src/types/api';
import classNames from 'classnames';

import cls from './index.module.scss';

interface PropsOrg {
  org: ApiOrgPublic;
}
interface PropsBase {
  name: string;
  shape?: 'square';
  src?: string | null;
}
type Props = {
  className?: string;
  size?: 'default' | 'large' | 'medium' | 'small' | 'xl';
  colored?: boolean;
  single?: boolean;
  icon?: React.ReactNode;
  style?: { color: string; backgroundColor: string };
} & (PropsBase | PropsOrg);

export const AvatarAuto: React.FC<Props> = ({
  className,
  size = 'default',
  ...props
}) => {
  let name: string;
  let acr: string;
  let style;
  let shape: PropsBase['shape'];
  let src: PropsBase['src'];

  if ('org' in props) {
    name = props.org.name;
    acr = props.org.acronym;
    shape = 'square';
    style = {
      backgroundColor: `var(--${props.org.color}6 )`,
      color: `var(--${props.org.color}11)`,
    };
    src = props.org.avatarUrl;
  } else {
    name = props.name;
    acr = acronymize(props.name);
    style =
      props.colored === false
        ? { backgroundColor: 'var(--bg5)', color: 'var(--textDark)' }
        : stringToColor(props.name);
    src = props.src;
    if (props.single) {
      acr = acr[0];
    }
  }

  return (
    <Avatar.Root
      className={classNames(
        cls.avatar,
        className,
        size && cls[size],
        shape && cls[shape],
        props.icon && cls.icon
      )}
    >
      {props.icon}
      <Avatar.Image className={cls.image} src={src!} alt={name!} />
      <Avatar.Fallback className={cls.fallback} delayMs={0} style={style}>
        {acr}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};

export const AvatarGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className={cls.group}>{children}</div>;
};
