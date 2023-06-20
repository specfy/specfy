interface FlexProps {
  children?: any;
  className?: string;
  child?: boolean;
  /****** Container Props ********/
  direction?: 'column' | 'row';
  justifyContent?:
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'inherit'
    | 'initial'
    | 'space-around'
    | 'space-between';
  wrap?: 'nowrap' | 'wrap-reverse' | 'wrap';
  alignItems?:
    | 'baseline'
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'inherit'
    | 'initial'
    | 'stretch';
  gap?: 'l' | 'm' | 's' | 'xl';
  /****** Child Props ********/
  grow?: number;
  shrink?: number;
  basis?: number;
  flex?: string;
}

const gap = { s: '4px', m: '8px', l: '12px', xl: '16px' };

export const Flex: React.FC<FlexProps> = (props) => {
  return (
    <div
      className={props.className}
      style={{
        display: props.child ? 'block' : 'flex',
        justifyContent: props.justifyContent || 'flex-start',
        flexDirection: props.direction || 'row',
        flexGrow: props.grow || 0,
        flexBasis: props.basis || 'auto',
        flexShrink: props.shrink || 1,
        flexWrap: props.wrap || 'nowrap',
        alignItems: props.alignItems || 'center',
        gap: props.gap ? gap[props.gap] : '',
      }}
    >
      {props.children}
    </div>
  );
};
