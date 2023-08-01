import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { IconChevronDown } from '@tabler/icons-react';
import cn from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const Item = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
Item.displayName = NavigationMenuPrimitive.Item.displayName;

const Link = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    className={cn(cls.link, className)}
    {...props}
  />
));
Link.displayName = NavigationMenuPrimitive.Link.displayName;

const Viewport = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn()}>
    <NavigationMenuPrimitive.Viewport
      className={cn(className)}
      ref={ref}
      {...props}
    />
  </div>
));
Viewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const Menu = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(cls.menu, className)}
    {...props}
  >
    {children}
    <Viewport />
  </NavigationMenuPrimitive.Root>
));
Menu.displayName = NavigationMenuPrimitive.Root.displayName;

const List = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(cls.list, className)}
    {...props}
  />
));
List.displayName = NavigationMenuPrimitive.List.displayName;

const Trigger = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(cls.trigger, className)}
    {...props}
  >
    {children} <IconChevronDown aria-hidden="true" />
  </NavigationMenuPrimitive.Trigger>
));
Trigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const Content = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
Content.displayName = NavigationMenuPrimitive.Content.displayName;

const Indicator = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(className)}
    {...props}
  >
    <div />
  </NavigationMenuPrimitive.Indicator>
));
Indicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export { Menu, List, Item, Content, Trigger, Link, Indicator, Viewport };
