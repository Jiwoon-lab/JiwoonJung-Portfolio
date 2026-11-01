import React, { useState, useRef } from 'react';
import type { PhotoItem, CropState } from '../types';
import { dims, cs, ratioOf } from '../utils/imageUtils';

interface MediaCropModalProps {
  crop: CropState;
  onApply: (updatedPhoto: PhotoItem, title?: string, desc?: string) => void;
  onCancel: () => void;
  accentColor?: string;
}

export const MediaCropModal: React.FC<MediaCropModalProps> = ({
  crop,
  onApply,
  onCancel,
  accentColor = '#c2d88f',
}) => {
  const [photo, setPhoto] = useState<PhotoItem>({ ...crop.photo });
  const [title, setTitle] = useState(crop.title ?? '');
  const [desc, setDesc] = useState(crop.desc ?? '');
  const isDragging = useRef(false);
  const dragData = useRef({ sx: 0, sy: 0, x0: 0, y0: 0, w: 1, h: 1 });

  const r = ratioOf(crop.target.key);
  const isHero = crop.target.key === 'hero';
  const isProj = crop.target.key !== 'hero' && crop.target.key !== 'about';

  const updatePhoto = (fields: Partial<PhotoItem>) => {
    setPhoto((prev) => {
      const merged = { ...prev, ...fields };
      const d = dims(merged, r);
      return {
        ...merged,
        z: d.z,
        x: d.x,
        y: d.y,
      };
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    dragData.current = {
      sx: e.clientX,
      sy: e.clientY,
      x0: photo.x || 0,
      y0: photo.y || 0,
      w: rect.width || 1,
      h: rect.height || 1,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const { sx, sy, x0, y0, w, h } = dragData.current;
    const dx = (e.clientX - sx) / w;
    const dy = (e.clientY - sy) / h;
    updatePhoto({ x: x0 + dx, y: y0 + dy });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const zoomFactor = photo.z || 1;
  const zoomPercent = `${Math.round(zoomFactor * 100)}%`;

  const ratioLabel =
    r === 1
      ? '1:1 THUMBNAIL'
      : r < 1
      ? '2:3 PROFILE'
      : '3:2 HEADER + FADE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="미디어 수정"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        boxSizing: 'border-box',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '94vh',
          overflowY: 'auto',
          backgroundColor: '#101010',
          color: '#ffffff',
          padding: '20px 24px 24px',
          border: '1px solid #333333',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            aria-label="Cancel"
            onClick={onCancel}
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
              <path
                d="M13 13 L31 31 M31 13 L13 31"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="square"
                fill="none"
              />
            </svg>
          </button>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>미디어 수정</div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#b5b5b5',
            }}
          >
            {ratioLabel}
          </div>
        </div>

        {/* Stage / Interactive Crop Box */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: 'relative',
            margin: '0 auto',
            overflow: 'hidden',
            backgroundColor: '#000000',
            touchAction: 'none',
            cursor: 'grab',
            userSelect: 'none',
            width: `min(100%, calc((100vh - 320px) * ${r}))`,
            minWidth: '220px',
            aspectRatio: r === 1 ? '1 / 1' : r < 1 ? '2 / 3' : '300 / 278',
          }}
        >
          <img
            src={photo.src}
            alt="Photo being edited"
            draggable={false}
            style={cs(photo, r)}
          />

          {/* Guide border */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              border: `3px solid ${accentColor}`,
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          />

          {/* Halftone simulation fade for hero */}
          {isHero && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '28.06%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.65))',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => updatePhoto({ z: zoomFactor - 0.25 })}
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            className="flex items-center justify-center hover:opacity-80"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="19" cy="19" r="8" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path
                d="M25 25 L33 33 M15 19 H23"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            aria-label="Zoom"
            value={zoomFactor}
            onChange={(e) => updatePhoto({ z: parseFloat(e.target.value) || 1 })}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              height: '44px',
              accentColor: accentColor,
              cursor: 'pointer',
            }}
          />

          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => updatePhoto({ z: zoomFactor + 0.25 })}
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            className="flex items-center justify-center hover:opacity-80"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="19" cy="19" r="8" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path
                d="M25 25 L33 33 M15 19 H23 M19 15 V23"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div
            style={{
              width: '56px',
              textAlign: 'right',
              fontSize: '13px',
              fontWeight: 700,
              color: '#d6d6d6',
            }}
          >
            {zoomPercent}
          </div>
        </div>

        {/* Project fields if editing project */}
        {isProj && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '20px',
              paddingTop: '18px',
              borderTop: '1px solid #333333',
            }}
          >
            <label
              htmlFor="m-title"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#b5b5b5',
              }}
            >
              작품 제목
            </label>
            <input
              id="m-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Title"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '12px 14px',
                border: `2px solid ${accentColor}`,
                borderRadius: 0,
                backgroundColor: '#1b1b1b',
                fontFamily: 'inherit',
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
              }}
            />

            <label
              htmlFor="m-desc"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#b5b5b5',
              }}
            >
              작품 설명
            </label>
            <textarea
              id="m-desc"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description of this artwork, tools used, concept..."
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '12px 14px',
                border: `2px solid ${accentColor}`,
                borderRadius: 0,
                backgroundColor: '#1b1b1b',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#ffffff',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => onApply(photo, title, desc)}
            style={{
              minHeight: '48px',
              padding: '0 40px',
              border: 0,
              backgroundColor: accentColor,
              color: '#000000',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            className="hover:brightness-105 active:scale-95 transition-all"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};
