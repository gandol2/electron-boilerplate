import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { cn } from '@/utils/index';

/**
 * 커스텀 툴팁 구현 (Radix UI 대체)
 * Portal을 사용하여 부모 요소의 overflow에 영향받지 않도록 구현
 */

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip components must be used within a Tooltip');
  }
  return context;
};

// TooltipProvider는 호환성을 위해 유지 (실제로는 아무것도 하지 않음)
const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Tooltip Root
interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      <span className="inline-block">{children}</span>
    </TooltipContext.Provider>
  );
};

// TooltipTrigger
interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, asChild = true }, _ref) => {
    const { setOpen, triggerRef } = useTooltipContext();
    const internalRef = React.useRef<HTMLElement | null>(null);

    // 외부 ref와 내부 ref 병합
    const mergedRef = React.useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node;
        triggerRef.current = node;
      },
      [triggerRef],
    );

    const handleMouseEnter = () => {
      setOpen(true);
    };

    const handleMouseLeave = () => {
      setOpen(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ref: mergedRef,
      });
    }

    return (
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={mergedRef as any}>
        {children}
      </span>
    );
  },
);
TooltipTrigger.displayName = 'TooltipTrigger';

// TooltipContent
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, sideOffset = 4, side = 'top', ...props }, ref) => {
    const { open, triggerRef } = useTooltipContext();
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useLayoutEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (side) {
          case 'top':
            top = rect.top - sideOffset;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + sideOffset;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - sideOffset;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + sideOffset;
            break;
        }

        setPosition({ top, left });
      }
    }, [open, side, sideOffset, triggerRef]);

    if (!open) return null;

    const tooltipContent = (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          'fixed z-[9999] overflow-hidden rounded-md border bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md',
          'animate-in fade-in-0 zoom-in-95',
          side === 'top' && '-translate-x-1/2 -translate-y-full',
          side === 'bottom' && '-translate-x-1/2',
          side === 'left' && '-translate-x-full -translate-y-1/2',
          side === 'right' && '-translate-y-1/2',
          className,
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
        {...props}
      >
        {children}
      </div>
    );

    // Portal을 사용하여 body에 렌더링
    return ReactDOM.createPortal(tooltipContent, document.body);
  },
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
