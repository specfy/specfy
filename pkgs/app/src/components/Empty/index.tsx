import cls from './index.module.scss';
export const Empty: React.FC<{
  search?: string;
  icon?: React.ReactNode;
  title?: string;
  desc?: string;
  action?: React.ReactNode;
}> = ({ icon, search, title, desc, action }) => {
  return (
    <div className={cls.empty}>
      {icon && <div className={cls.icon}>{icon}</div>}
      <h4>{title || 'No Results Found'}</h4>
      {search && (
        <p>Your search for &quot;{search}&quot; did not return any results</p>
      )}
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
};
