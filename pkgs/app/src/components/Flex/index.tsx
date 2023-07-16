import type { CSSProperties } from 'react';

interface FlexProps {
  children?: any;
  className?: string;
  child?: boolean;

  /****** Container Props ********/
  column?: true;
  justify?:
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'inherit'
    | 'initial'
    | 'space-around'
    | 'space-between';
  wrap?: 'nowrap' | 'wrap-reverse' | 'wrap';
  align?:
    | 'baseline'
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'inherit'
    | 'initial'
    | 'stretch';
  gap?: '2xl' | 'l' | 'm' | 's' | 'xl';

  /****** Child Props ********/
  grow?: number | true;
  shrink?: number;
  basis?: number;
  flex?: string;

  /* other */
  style?: CSSProperties;
}

const gap: Record<Exclude<FlexProps['gap'], undefined>, string> = {
  s: '4px',
  m: '8px',
  l: '12px',
  xl: '32px',
  '2xl': '48px',
};

export const Flex: React.FC<FlexProps> = (props) => {
  return (
    <div
      className={props.className}
      style={{
        display: props.child ? 'block' : 'flex',
        justifyContent: props.justify || 'flex-start',
        flexDirection: props.column ? 'column' : 'row',
        flexGrow: props.grow === true ? 1 : props.grow || 0,
        flexBasis: props.basis || 'auto',
        flexShrink: props.shrink || 1,
        flexWrap: props.wrap || 'nowrap',
        alignItems: props.align || 'center',
        gap: props.gap ? gap[props.gap] : '',
        width: props.grow === 1 || props.grow === true ? '100%' : undefined,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};
