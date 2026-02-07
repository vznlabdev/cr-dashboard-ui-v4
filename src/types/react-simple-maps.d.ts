declare module "react-simple-maps" {
  import { ComponentType, ReactNode, CSSProperties } from "react"

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    width?: number
    height?: number
    style?: CSSProperties
    className?: string
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string | Record<string, unknown>
    children: (data: { geographies: Geography[] }) => ReactNode
  }

  interface Geography {
    rpiKey: string
    id: string
    properties: Record<string, unknown>
    geometry: Record<string, unknown>
  }

  interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: CSSProperties & { outline?: string; opacity?: number; cursor?: string }
      hover?: CSSProperties & { outline?: string; opacity?: number; cursor?: string }
      pressed?: CSSProperties & { outline?: string; opacity?: number; cursor?: string }
    }
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    onClick?: (event: React.MouseEvent) => void
    className?: string
  }

  interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    translateExtent?: [[number, number], [number, number]]
    children?: ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
}
