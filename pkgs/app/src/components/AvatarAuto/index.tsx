import * as Avatar from '@radix-ui/react-avatar';
import { acronymize, stringToColor } from '@specfy/core/src/avatar';
import type { ApiOrgPublic, ApiUser } from '@specfy/models';
import classNames from 'classnames';

import cls from './index.module.scss';

interface PropsOrg {
  org: ApiOrgPublic;
}
interface PropsUser {
  user: Pick<ApiUser, 'name' | 'avatarUrl'>;
}
interface PropsBase {
  name: string;
  src?: string | null;
}
type Props = {
  className?: string;
  size?: 'd' | 'l' | 'm' | 's' | 'xs' | 'xl';
  colored?: boolean;
  single?: boolean;
  icon?: React.ReactNode;
  shape?: 'square' | 'circle';
  style?: { color: string; backgroundColor: string };
} & (PropsBase | PropsOrg | PropsUser);

export const AvatarAuto: React.FC<Props> = ({
  className,
  size = 'd',
  ...props
}) => {
  let name: string;
  let acr: string;
  let style;
  let shape: Props['shape'] = props.shape;
  let src: PropsBase['src'];

  if ('org' in props) {
    name = props.org.name;
    acr = props.org.acronym;
    shape = 'square';
    style = {
      backgroundColor: `var(--${props.org.color}-6 )`,
      color: `var(--${props.org.color}-11)`,
    };
    src = props.org.avatarUrl;
  } else if ('user' in props) {
    shape = 'circle';
    name = props.user.name;
    src = props.user.avatarUrl;
    acr = acronymize(props.user.name);
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
      data-avatar
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
