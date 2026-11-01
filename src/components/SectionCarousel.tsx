import React, { useState } from 'react';
import type { ProjectItem, SectionKey } from '../types';
import { cs, pad } from '../utils/imageUtils';

interface SectionCarouselProps {
  id: SectionKey;
  title: string;
  projects: ProjectItem[];
  onOpenViewer: (projectIndex: number) => void;
}

export const SectionCarousel: React.FC<SectionCarouselProps> = ({
  id,
  title,
  projects,
  onOpenViewer,
}) => {
  // If no projects in section, use 5 placeholders like original
  const effProjects: ProjectItem[] =
    projects && projects.length > 0
      ? projects
      : Array.from({ length: 5 }).map((_, i) => ({
          id: `ph-${id}-${i}`,
          ph: true,
          title: 'TITLE',
          desc: 'Please enter a description of the portfolio in Admin.',
          photos: [],
        }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const n = effProjects.length;
  const cur = Math.min(currentIndex, n - 1);
  const half = Math.floor(n / 2);

  const step = (dir: number) => {
    setCurrentIndex((prev) => (prev + dir + n) % n);
  };

  const curProject = effProjects[cur];

  return (
    <section
      id={id}
      style={{
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px clamp(24px, 3vw, 40px) 32px',
      }}
    >
      <h2
        style={{
          margin: '0 0 28px 0',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: '#5f5f5f',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          position: 'relative',
          height: 'clamp(280px, calc(100vh - 220px), 680px)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {effProjects.map((p, i) => {
          const thumbnail = p.photos && p.photos[0] && p.photos[0].src ? p.photos[0] : null;
          const d = ((i - cur + n + half) % n) - half;
          const a = Math.abs(d);
          const scale = a === 0 ? 1 : a === 1 ? 0.64 : 0.5;
          const opacity = a === 0 ? 1 : a === 1 ? 0.5 : 0;
          const blur = a === 0 ? 0 : 2;
          const border = a === 0 ? '#000000' : '#c4c4c4';
          const tone =
            i % 2 === 0
              ? 'linear-gradient(135deg, #f1f2f4, #d9dde1)'
              : 'linear-gradient(135deg, #e6e9ec, #cfd4d9)';

          return (
            <button
              key={p.id || i}
              type="button"
              aria-label={`${title} project ${i + 1} of ${n}${a === 0 ? ' (open gallery)' : ''}`}
              aria-current={a === 0 ? 'true' : 'false'}
              onClick={() => {
                if (a === 0) {
                  onOpenViewer(i);
                } else {
                  setCurrentIndex(i);
                }
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                height: '86%',
                aspectRatio: '1 / 1',
                boxSizing: 'border-box',
                padding: 0,
                border: 0,
                backgroundColor: 'transparent',
                overflow: 'hidden',
                cursor: 'pointer',
                transform: `translate(-50%, -50%) translateX(${d * 74}%) scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
                zIndex: 10 - a,
                pointerEvents: a > 1 ? 'none' : 'auto',
                transition: 'transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease',
              }}
            >
              {/* Inner frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  background: thumbnail ? '#e9eaec' : tone,
                }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail.src}
                    alt={p.title || `Artwork ${i + 1}`}
                    draggable={false}
                    style={cs(thumbnail, 1)}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    <span
                      className="font-tektur"
                      style={{
                        fontSize: 'clamp(18px, 3vw, 40px)',
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        color: '#7a7f85',
                      }}
                    >
                      IMAGE {pad(i + 1)}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        color: '#6b7076',
                      }}
                    >
                      YOUR ARTWORK HERE
                    </span>
                  </div>
                )}
              </div>

              {/* Border overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  border: `3px solid ${border}`,
                  transition: 'border-color 0.5s ease',
                }}
              />
            </button>
          );
        })}

        {/* Previous Navigation Button */}
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => step(-1)}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '48px',
            height: '64px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg width="48" height="64" viewBox="0 0 48 64" aria-hidden="true">
            <path
              d="M36 12 L10 32 L36 52 Z"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Next Navigation Button */}
        <button
          type="button"
          aria-label="Next image"
          onClick={() => step(1)}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '48px',
            height: '64px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg width="48" height="64" viewBox="0 0 48 64" aria-hidden="true">
            <path
              d="M12 12 L38 32 L12 52 Z"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Counter & Title */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#5f5f5f',
        }}
      >
        {pad(cur + 1)} / {pad(n)}
        {curProject && !curProject.ph ? ` · ${curProject.title}` : ''}
      </div>
    </section>
  );
};
