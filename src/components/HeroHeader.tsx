import React, { useState, useEffect } from 'react';
import type { PhotoItem } from '../types';
import { cs, pad } from '../utils/imageUtils';

interface HeroHeaderProps {
  photos: PhotoItem[];
  accentColor?: string;
}

const TONES = [
  'radial-gradient(ellipse at 70% 30%, #1f2d26 0%, #000000 70%)',
  'radial-gradient(ellipse at 30% 40%, #1b2733 0%, #000000 70%)',
  'radial-gradient(ellipse at 65% 60%, #2b2230 0%, #000000 70%)',
  'radial-gradient(ellipse at 40% 30%, #2d2a1b 0%, #000000 70%)',
];

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  photos,
  accentColor = '#C8D88F',
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const slideCount = photos.length || 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slideCount);
    }, 10000);
    return () => clearInterval(timer);
  }, [slideCount]);

  return (
    <header
      aria-label="Featured work"
      style={{
        position: 'relative',
        aspectRatio: '300 / 278',
        containerType: 'inline-size',
        backgroundColor: '#000000',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Slides */}
      {Array.from({ length: slideCount }).map((_, i) => {
        const isActive = currentIdx === i;
        const hasImg = photos.length > 0 && !!photos[i];
        const photo = hasImg ? photos[i] : null;

        return (
          <div
            key={i}
            aria-hidden={!isActive}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              backgroundColor: hasImg ? '#000000' : undefined,
              backgroundImage: hasImg ? undefined : TONES[i % 4],
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1.2s ease',
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {hasImg && photo ? (
              <img
                src={photo.src}
                alt={`Featured work ${i + 1}`}
                draggable={false}
                style={cs(photo, 300 / 278)}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: '28px',
                  right: '32px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#8a8a8a',
                }}
              >
                WORK IMAGE {pad(i + 1)} · 3:2
              </div>
            )}
          </div>
        );
      })}

      {/* Signature Halftone Fade Effect at bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '26cqw',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.025cqw, rgba(255,255,255,0) 0.07cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.0375cqw, rgba(255,255,255,0) 0.0825cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.0531cqw, rgba(255,255,255,0) 0.0981cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.0719cqw, rgba(255,255,255,0) 0.1169cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.0938cqw, rgba(255,255,255,0) 0.1388cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.1188cqw, rgba(255,255,255,0) 0.1638cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.1438cqw, rgba(255,255,255,0) 0.1888cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.175cqw, rgba(255,255,255,0) 0.22cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.2063cqw, rgba(255,255,255,0) 0.2513cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.2375cqw, rgba(255,255,255,0) 0.2825cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.275cqw, rgba(255,255,255,0) 0.32cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.3125cqw, rgba(255,255,255,0) 0.3575cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
        <div style={{ height: '2cqw', backgroundImage: 'radial-gradient(circle at 0.25cqw 0.25cqw, #fff 0.3625cqw, rgba(255,255,255,0) 0.4075cqw)', backgroundSize: '0.5cqw 0.5cqw' }} />
      </div>

      {/* Typography Overlay */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(24px, 5vw, 72px)',
          bottom: 'calc(28.06% + 56px)',
          right: '24px',
          color: accentColor,
          textShadow: '0 2px 14px rgba(0,0,0,0.45)',
          pointerEvents: 'none',
        }}
      >
        <div
          className="font-tektur"
          style={{
            fontSize: 'clamp(36px, 7vw, 96px)',
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          JI WOON JUNG'S
        </div>
        <div
          className="font-tektur"
          style={{
            fontSize: 'clamp(40px, 8vw, 112px)',
            lineHeight: 1.05,
            fontWeight: 500,
          }}
        >
          Portfolio
        </div>
      </div>

      {/* Dot Indicators */}
      <div
        style={{
          position: 'absolute',
          right: '16px',
          bottom: 'calc(28.06% + 12px)',
          display: 'flex',
          zIndex: 10,
        }}
      >
        {Array.from({ length: slideCount }).map((_, i) => {
          const isActive = currentIdx === i;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Show work image ${i + 1}`}
              onClick={() => setCurrentIdx(i)}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                border: 0,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: isActive ? '22px' : '10px',
                  height: '4px',
                  backgroundColor: isActive ? accentColor : '#8a8a8a',
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
              />
            </button>
          );
        })}
      </div>
    </header>
  );
};
