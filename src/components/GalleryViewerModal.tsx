import React, { useState, useEffect } from 'react';
import type { ProjectItem, SectionKey } from '../types';

interface GalleryViewerModalProps {
  project: ProjectItem;
  sectionKey: SectionKey;
  initialPhotoIndex?: number;
  onClose: () => void;
  onEditInAdmin: (sectionKey: SectionKey, projectId: string) => void;
  accentColor?: string;
}

export const GalleryViewerModal: React.FC<GalleryViewerModalProps> = ({
  project,
  sectionKey,
  initialPhotoIndex = 0,
  onClose,
  onEditInAdmin,
  accentColor = '#c2d88f',
}) => {
  const [photoIdx, setPhotoIdx] = useState(initialPhotoIndex);
  const [descOpen, setDescOpen] = useState(true);

  const photos = project.photos || [];
  const vCount = Math.max(1, photos.length);
  const curIdx = Math.min(photoIdx, vCount - 1);
  const curPhoto = photos[curIdx] || null;

  const step = (dir: number) => {
    setPhotoIdx((prev) => (prev + dir + vCount) % vCount);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vCount]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project gallery"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          padding: '24px 88px 16px 32px',
          flex: '0 0 auto',
        }}
      >
        <div
          className="font-tektur"
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            lineHeight: 1.1,
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {project.title || 'UNTITLED PROJECT'}
        </div>

        {/* Expandable/Collapsible Description */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: descOpen ? '240px' : '0px',
            opacity: descOpen ? 1 : 0,
            transition: 'max-height 0.45s ease, opacity 0.3s ease',
          }}
        >
          <p
            style={{
              margin: '14px 0 0 0',
              fontSize: '17px',
              lineHeight: 1.6,
              letterSpacing: '0.03em',
              whiteSpace: 'pre-line',
              color: '#f2f2f2',
            }}
          >
            {project.desc || 'No description provided.'}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          autoFocus
          aria-label="Close gallery"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '48px',
            height: '48px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M13 13 L35 35 M35 13 L13 35"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="square"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{ flex: '0 0 auto', height: '5px', backgroundColor: '#8a8a8a' }}
      />

      {/* Description toggle icon */}
      <div style={{ flex: '0 0 auto', padding: '4px 24px' }}>
        <button
          type="button"
          aria-label={descOpen ? 'Collapse description' : 'Expand description'}
          aria-expanded={descOpen}
          onClick={() => setDescOpen(!descOpen)}
          style={{
            width: '44px',
            height: '44px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          className="flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
            <path
              d={descOpen ? 'M22 12 L33 31 L11 31 Z' : 'M22 32 L33 13 L11 13 Z'}
              fill={accentColor}
              stroke="#2e3a14"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        style={{
          position: 'relative',
          flex: '1 1 0',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'calc(100% - 160px)',
            height: 'calc(100% - 24px)',
            maxWidth: '1200px',
            maxHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            overflow: 'hidden',
          }}
        >
          {curPhoto ? (
            <img
              src={curPhoto.src}
              alt={project.title}
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                userSelect: 'none',
              }}
            />
          ) : (
            <div
              className="font-tektur"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                letterSpacing: '0.1em',
                color: '#6f6f6f',
                backgroundColor: '#1b1b1b',
              }}
            >
              NO PHOTO
            </div>
          )}
        </div>

        {/* Previous Button */}
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => step(-1)}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '56px',
            height: '64px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            zIndex: 10,
          }}
          className="hover:scale-110 active:scale-95 transition-transform"
        >
          <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
            <path
              d="M38 16 L16 32 L38 48 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => step(1)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '56px',
            height: '64px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            zIndex: 10,
          }}
          className="hover:scale-110 active:scale-95 transition-transform"
        >
          <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
            <path
              d="M18 16 L40 32 L18 48 Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Bar: Counter and Admin Quick Edit */}
      <div
        style={{
          position: 'relative',
          flex: '0 0 auto',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '160px',
            height: '34px',
            backgroundColor: '#4d4d4d',
            color: '#ffffff',
            fontSize: '18px',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          {curIdx + 1} / {vCount}
        </div>

        {/* Quick shortcut to edit this project in Admin */}
        <button
          type="button"
          aria-label="Edit this gallery (admin)"
          title="Edit project in Admin"
          onClick={() => onEditInAdmin(sectionKey, project.id)}
          style={{
            position: 'absolute',
            right: '16px',
            bottom: '12px',
            width: '48px',
            height: '48px',
            padding: 0,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          className="hover:scale-110 transition-transform"
        >
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
            <path
              d="M25 9 H10 V35 H34 V20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M20 26 L21.5 20 L33 8.5 L37.5 13 L26 24.5 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
