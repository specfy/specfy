import cls from './index.module.scss';

export const EditorMenu: React.FC<{
  children: React.ReactElement;
  show: boolean;
}> = ({ show, children }) => {
  if (!show) {
    return null;
  }
  return (
    <div className={cls.wrapper}>
      <div className={cls.menu}>{children}</div>
    </div>
  );
};
