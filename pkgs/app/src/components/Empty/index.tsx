import cls from './index.module.scss';
export const Empty: React.FC<{
  search?: string;
  title?: string;
  desc?: string;
  action?: React.ReactElement;
}> = ({ search, title, desc, action }) => {
  return (
    <div className={cls.empty}>
      <h3>{title || 'No Results Found'}</h3>
      {search && (
        <p>Your search for &quot;{search}&quot; did not return any results</p>
      )}
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
};
