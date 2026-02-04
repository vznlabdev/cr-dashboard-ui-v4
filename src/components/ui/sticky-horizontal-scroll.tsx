"use client"

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StickyHorizontalScrollProps {
  children: ReactNode
  className?: string
}

export function StickyHorizontalScroll({ children, className }: StickyHorizontalScrollProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const phantomRef = useRef<HTMLDivElement>(null)
  const [needsScroll, setNeedsScroll] = useState(false)
  const [scrollWidth, setScrollWidth] = useState(0)
  const syncingRef = useRef(false)

  // Check if horizontal scrolling is needed
  const checkScrollNeeded = useCallback(() => {
    if (!contentRef.current) return

    const content = contentRef.current
    const needed = content.scrollWidth > content.clientWidth
    setNeedsScroll(needed)
    setScrollWidth(content.scrollWidth)
  }, [])

  // Sync scroll from content to phantom
  const handleContentScroll = useCallback(() => {
    if (syncingRef.current || !contentRef.current || !phantomRef.current) return
    
    syncingRef.current = true
    requestAnimationFrame(() => {
      if (contentRef.current && phantomRef.current) {
        phantomRef.current.scrollLeft = contentRef.current.scrollLeft
      }
      syncingRef.current = false
    })
  }, [])

  // Sync scroll from phantom to content
  const handlePhantomScroll = useCallback(() => {
    if (syncingRef.current || !contentRef.current || !phantomRef.current) return
    
    syncingRef.current = true
    requestAnimationFrame(() => {
      if (contentRef.current && phantomRef.current) {
        contentRef.current.scrollLeft = phantomRef.current.scrollLeft
      }
      syncingRef.current = false
    })
  }, [])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    // Initial check
    checkScrollNeeded()

    // Set up ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollNeeded()
    })

    resizeObserver.observe(content)

    // Also check on window resize
    const handleResize = () => checkScrollNeeded()
    window.addEventListener("resize", handleResize)

    // Add scroll listener
    content.addEventListener("scroll", handleContentScroll)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
      content.removeEventListener("scroll", handleContentScroll)
    }
  }, [checkScrollNeeded, handleContentScroll])

  return (
    <div className={cn("relative", className)}>
      {/* Content wrapper with overflow */}
      <div ref={contentRef} className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {children}
      </div>

      {/* Phantom scrollbar that sticks to viewport bottom */}
      {needsScroll && (
        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t">
          <div
            ref={phantomRef}
            className="overflow-x-auto overflow-y-hidden"
            onScroll={handlePhantomScroll}
          >
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>
        </div>
      )}
    </div>
  )
}
