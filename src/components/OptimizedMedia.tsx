'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  lazy?: boolean;
  threshold?: number;
  fadeInDuration?: number;
  placeholderSrc?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function OptimizedImage({
  lazy = true,
  threshold = 0.1,
  fadeInDuration = 300,
  placeholderSrc,
  onLoad,
  onError,
  src,
  alt,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStartTime = useRef<number>(0);

  // Performance monitoring
  const performanceMonitor = typeof window !== 'undefined' ? getPerformanceMonitor() : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px 0px', // Start loading 50px before coming into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, threshold, isInView]);

  // Track image load performance
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const loadEndTime = performance.now();
    const loadTime = loadStartTime.current ? loadEndTime - loadStartTime.current : 0;
    
    setIsLoaded(true);
    setHasError(false);
    
    // Track performance
    if (performanceMonitor && loadTime > 0) {
      performanceMonitor.addEntry('imageLoad', loadTime, {
        src,
        alt,
        width: props.width,
        height: props.height,
      });
    }
    
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(false);
    
    // Track errors
    if (performanceMonitor) {
      performanceMonitor.addEntry('imageError', 1, {
        src,
        alt,
        error: 'Image failed to load',
      });
    }
    
    onError?.(event);
  };

  // Start timing when image starts loading
  const handleLoadStart = () => {
    loadStartTime.current = performance.now();
  };

  // Generate placeholder if needed
  const getPlaceholderSrc = () => {
    if (placeholderSrc) return placeholderSrc;
    
    // Generate a simple SVG placeholder
    const width = typeof props.width === 'number' ? props.width : 300;
    const height = typeof props.height === 'number' ? props.height : 200;
    
    return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ELoading...%3C/text%3E%3C/svg%3E`;
  };

  // Generate blur data URL for better loading experience
  const getBlurDataURL = (width: number, height: number) => {
    return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' fill='%23f3f4f6'/%3E%3C/svg%3E`;
  };

  if (!isInView && lazy) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{
          width: props.width,
          height: props.height,
          backgroundColor: '#f3f4f6',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const imageProps: ImageProps = {
    ...props,
    src,
    alt,
    className: `
      transition-opacity duration-${fadeInDuration}
      ${isLoaded ? 'opacity-100' : 'opacity-0'}
      ${hasError ? 'hidden' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' '),
    onLoad: handleLoad,
    onError: handleError,
    onLoadStart: handleLoadStart,
    placeholder: props.placeholder || 'blur',
    blurDataURL: props.blurDataURL || getBlurDataURL(
      typeof props.width === 'number' ? props.width : 300,
      typeof props.height === 'number' ? props.height : 200
    ),
  };

  return (
    <div className="relative">
      {/* Main image */}
      <Image {...imageProps} />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{
            width: props.width,
            height: props.height,
          }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div
          className="flex items-center justify-center bg-gray-100 text-gray-500"
          style={{
            width: props.width,
            height: props.height,
          }}
        >
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Video component with lazy loading
interface OptimizedVideoProps {
  src: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  lazy?: boolean;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedVideo({
  src,
  poster,
  width,
  height,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  playsInline = true,
  lazy = true,
  threshold = 0.1,
  onLoad,
  onError,
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performanceMonitor = typeof window !== 'undefined' ? getPerformanceMonitor() : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, threshold, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    
    if (performanceMonitor) {
      performanceMonitor.addEntry('videoError', 1, {
        src,
        error: 'Video failed to load',
      });
    }
    
    onError?.();
  };

  const handleCanPlay = () => {
    if (performanceMonitor) {
      performanceMonitor.addEntry('videoCanPlay', 1, {
        src,
        autoPlay,
        muted,
        loop,
      });
    }
  };

  if (!isInView && lazy) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        {poster && (
          <img
            src={poster}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={isInView ? src : undefined}
        poster={poster}
        width={width}
        height={height}
        className={`block ${className}`}
        autoPlay={autoPlay && isInView}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        onLoadStart={handleLoad}
        onError={handleError}
        onCanPlay={handleCanPlay}
      />
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load video</p>
          </div>
        </div>
      )}
    </div>
  );
}