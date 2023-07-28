import cls from './index.module.scss';
export const Empty: React.FC<{
  search?: string;
  title?: string;
  desc?: string;
  action?: React.ReactNode;
}> = ({ search, title, desc, action }) => {
  return (
    <div className={cls.empty}>
      <h4>{title || 'No Results Found'}</h4>
      {search && (
        <p>Your search for &quot;{search}&quot; did not return any results</p>
      )}
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
};
