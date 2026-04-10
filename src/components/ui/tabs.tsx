import { cn } from '@/lib/utils/cn';
import * as React from 'react';

const Tabs = ({ defaultValue, value, onValueChange, ...props }: any) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return React.createElement(
    'div',
    {
      className: 'space-y-4',
      ...props,
    },
    React.Children.map(props.children, (child: any) => {
      if (child.type.displayName === 'TabsList') {
        return React.cloneElement(child, {
          ...child.props,
          'data-value': currentValue,
          onClick: (value: string) => handleValueChange(value),
        });
      } else if (child.type.displayName === 'TabsContent') {
        if (child.props.value === currentValue) {
          return React.cloneElement(child, { ...child.props, hidden: false });
        } else {
          return React.cloneElement(child, { ...child.props, hidden: true });
        }
      }
      return child;
    })
  );
};

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, value, onClick, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    onClick={() => onClick?.(value)}
    role="tab"
    type="button"
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, value, hidden, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      hidden={hidden}
      {...props}
    />
  )
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
