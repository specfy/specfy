import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const Table = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={cls.wrapper}>
    <table ref={ref} className={classNames(cls.table, className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const Header = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={classNames(className)} {...props} />
));
Header.displayName = 'Header';

const Body = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={classNames(className)} {...props} />
));
Body.displayName = 'Body';

const Footer = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={classNames(className)} {...props} />
));
Footer.displayName = 'Footer';

const Row = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={classNames(cls.row, className)} {...props} />
));
Row.displayName = 'Row';

const Head = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={classNames(cls.th, className)} {...props} />
));
Head.displayName = 'Head';

const Cell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={classNames(cls.td, className)} {...props} />
));
Cell.displayName = 'Cell';

const Caption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={classNames(className)} {...props} />
));
Caption.displayName = 'Caption';

export { Table, Header, Body, Footer, Head, Row, Cell, Caption };
