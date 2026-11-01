import React from 'react';
import type { PhotoItem } from '../types';
import { cs } from '../utils/imageUtils';

interface AboutModalProps {
  photo: PhotoItem | null;
  intro: string;
  career: string;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  photo,
  intro,
  career,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About me"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        overflowY: 'auto',
        padding: 'clamp(24px, 5vw, 64px)',
      }}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Close about me"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 60,
          width: '48px',
          height: '48px',
          padding: 0,
          border: 0,
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
        className="flex items-center justify-center hover:opacity-75 transition-opacity"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M13 13 L35 35 M35 13 L13 35"
            stroke="#000000"
            strokeWidth="3"
            strokeLinecap="square"
            fill="none"
          />
        </svg>
      </button>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(24px, 4vw, 56px)',
          maxWidth: '1100px',
          margin: '0 auto',
          paddingTop: '32px',
        }}
      >
        {/* 2:3 Profile Photo */}
        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: 'min(335px, 100%)',
            alignSelf: 'flex-start',
            aspectRatio: '2 / 3',
            overflow: 'hidden',
            backgroundColor: '#e6e6e6',
            border: '2px solid #000000',
          }}
        >
          {photo && photo.src ? (
            <img
              src={photo.src}
              alt="Profile photo"
              draggable={false}
              style={cs(photo, 2 / 3)}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#5f5f5f',
              }}
            >
              PHOTO
            </div>
          )}
        </div>

        {/* Text Details */}
        <div
          style={{
            flex: '1 1 360px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '52px',
          }}
        >
          {/* Profile Section */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#111111',
              }}
            >
              프로필
            </div>
            <div
              aria-hidden="true"
              style={{
                width: '184px',
                height: '2px',
                margin: '14px 0 20px',
                backgroundColor: '#8a8a8a',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: 1.9,
                letterSpacing: '0.02em',
                whiteSpace: 'pre-line',
                color: '#2a2a2a',
              }}
            >
              {intro || '자기소개를 입력해 주세요.'}
            </p>
          </div>

          {/* Activities / Career Section */}
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#111111',
              }}
            >
              활동
            </div>
            <div
              aria-hidden="true"
              style={{
                width: '184px',
                height: '2px',
                margin: '14px 0 20px',
                backgroundColor: '#8a8a8a',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: 1.9,
                letterSpacing: '0.02em',
                whiteSpace: 'pre-line',
                color: '#2a2a2a',
              }}
            >
              {career || '경력을 입력해 주세요.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
