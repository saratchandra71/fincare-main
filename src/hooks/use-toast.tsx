
// src/hooks/use-toast.tsx
import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

/**
 * Compatibility wrapper: lets you call `toast({ title, description, variant })`
 * (shadcn/ui style) while rendering via sonner under the hood.
 */
export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export interface ShadToastOptions extends Record<string, any> {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
}

function adaptToast(arg: ShadToastOptions | React.ReactNode | string | number) {
  // Sonner native usage: toast('message') / toast(<JSX/>)
  if (
    typeof arg === 'string' ||
    typeof arg === 'number' ||
    React.isValidElement(arg)
  ) {
    return sonnerToast(arg as any)
  }

  // shadcn-style object: { title, description, variant }
  const { title, description, variant = 'default', ...rest } =
    (arg || {}) as ShadToastOptions

  const content = (
    <div className="flex flex-col">
      {title ? <div className="font-medium">{title}</div> : null}
      {description ? (
        <div className="text-sm opacity-90">{description}</div>
      ) : null}
    </div>
  )

  const fn =
    variant === 'destructive'
      ? sonnerToast.error
      : variant === 'success'
      ? sonnerToast.success
      : variant === 'warning'
      ? (sonnerToast as any).warning ?? sonnerToast
      : sonnerToast

  return fn(content as any, rest as any)
}

export function useToast() {
  return {
    toast: adaptToast,
  }
}
