import { useEffect, useRef, useState } from 'react'

interface UseLazyImageProps {
  src?: string
  placeholder?: string
}

export function useLazyImage({ src, placeholder }: UseLazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder)

  useEffect(() => {
    if (!src) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const img = new Image()
          img.onload = () => {
            setImageSrc(src)
            setIsLoaded(true)
          }
          img.onerror = () => {
            setImageSrc(placeholder)
            setIsLoaded(true)
          }
          img.src = src
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src, placeholder])

  return {
    imgRef,
    src: imageSrc,
    isLoaded,
  }
}
