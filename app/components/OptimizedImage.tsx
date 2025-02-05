import Image from "next/image"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image src={src || "/placeholder.svg"} alt={alt} layout="fill" objectFit="cover" loading="lazy" />
    </div>
  )
}

