import React from 'react';
import { Pin, Box, Layers, Sparkles, Mail, User, Shield } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenAbout: () => void;
  onOpenAdmin: () => void;
  accentColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onOpenAbout,
  onOpenAdmin,
  accentColor = '#c2d88f',
}) => {
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Toggle Button outside the menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isOpen ? '332px' : '16px',
          width: '56px',
          zIndex: 40,
          pointerEvents: 'none',
          transition: 'left 0.35s ease',
        }}
      >
        <div style={{ position: 'sticky', top: '16px', pointerEvents: 'auto' }}>
          <button
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={onToggle}
            className="w-11 h-11 p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
              <path
                d={isOpen ? 'M31 8 L10 22 L31 36 Z' : 'M13 8 L34 22 L13 36 Z'}
                fill={accentColor}
                stroke="#2e3a14"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Left Navigation Menu */}
      <nav
        aria-label="Portfolio menu"
        style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          zIndex: 35,
          flex: '0 0 auto',
          width: isOpen ? '320px' : '0px',
          overflowX: 'hidden',
          overflowY: 'auto',
          transition: 'width 0.35s ease',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            width: '320px',
            minHeight: '100%',
            padding: '48px 32px',
            borderRight: '3px solid #8a8a8a',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              paddingTop: '12px',
              fontSize: '22px',
              lineHeight: '46px',
              fontWeight: 700,
              color: '#666666',
              letterSpacing: '0.01em',
            }}
          >
            JI WOON JUNG'S
            <br />
            PORTFOLIO
          </div>

          <div
            style={{
              margin: '28px 0 36px 0',
              height: '4px',
              backgroundColor: '#8a8a8a',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            <a
              href="#ideation"
              onClick={(e) => scrollTo(e, 'ideation')}
              className="flex items-center gap-3 py-2 text-[#666666] hover:text-black transition-colors group"
            >
              <Pin
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>CHARACTER IDEATION</span>
            </a>

            <a
              href="#modeling"
              onClick={(e) => scrollTo(e, 'modeling')}
              className="flex items-center gap-3 py-2 text-[#666666] hover:text-black transition-colors group"
            >
              <Box
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>CHARACTER MODELING</span>
            </a>

            <a
              href="#etc2d"
              onClick={(e) => scrollTo(e, 'etc2d')}
              className="flex items-center gap-3 py-2 text-[#666666] hover:text-black transition-colors group"
            >
              <Layers
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>ETC - 2D</span>
            </a>

            <a
              href="#etc3d"
              onClick={(e) => scrollTo(e, 'etc3d')}
              className="flex items-center gap-3 py-2 text-[#666666] hover:text-black transition-colors group"
            >
              <Sparkles
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>ETC - 3D</span>
            </a>

            <a
              href="#contact"
              onClick={(e) => scrollTo(e, 'contact')}
              className="flex items-center gap-3 py-2 text-[#666666] hover:text-black transition-colors group"
            >
              <Mail
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>CONTACT</span>
            </a>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenAbout();
              }}
              className="flex items-center gap-3 py-2 text-left border-0 bg-transparent font-bold text-[#666666] hover:text-black transition-colors cursor-pointer group w-full"
            >
              <User
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>ABOUT ME</span>
            </button>

            {/* Subtle Divider matching user screenshot */}
            <div
              style={{
                height: '1px',
                backgroundColor: '#e5e7eb',
                margin: '6px 0 6px 0',
              }}
            />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdmin();
              }}
              className="flex items-center gap-3 py-2 text-left border-0 bg-transparent font-bold text-[#666666] hover:text-black transition-colors cursor-pointer group w-full"
            >
              <Shield
                size={18}
                strokeWidth={2}
                className="text-[#666666] group-hover:text-black transition-colors flex-shrink-0"
              />
              <span>ADMIN PORTAL</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
