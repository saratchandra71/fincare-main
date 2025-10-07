
'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

type SidebarState = 'expanded' | 'collapsed'

const SidebarContext = React.createContext<{ state: SidebarState; setState: (s: SidebarState)=>void } | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SidebarState>('expanded')
  return <SidebarContext.Provider value={{ state, setState }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

export function Sidebar({ className, collapsible = 'icon', ...props }: React.HTMLAttributes<HTMLDivElement> & { collapsible?: 'icon' | 'none' }) {
  return <div className={cn('border-r bg-sidebar text-sidebar-foreground', className)} {...props} />
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { state, setState } = useSidebar()
  return (
    <button
      aria-label='Toggle sidebar'
      onClick={() => setState(state === 'collapsed' ? 'expanded' : 'collapsed')}
      className={cn('rounded-md border p-1 text-sm hover:bg-secondary', className)}
      {...props}
    >
      ☰
    </button>
  )
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-2', className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-2', className)} {...props} />
}
export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-2 text-xs uppercase text-muted-foreground', className)} {...props} />
}
export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-1', className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('space-y-1', className)} {...props} />
}
export function SidebarMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />
}
export function SidebarMenuButton({ className, asChild, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const Comp: any = (asChild ? 'span' : 'button')
  return <Comp className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary', className)} {...props} />
}
