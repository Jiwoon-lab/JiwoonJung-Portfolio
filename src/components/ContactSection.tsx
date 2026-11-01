import React, { useState } from 'react';

interface ContactSectionProps {
  email: string;
  accentColor?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  email,
  accentColor = '#C8D88F',
}) => {
  const [name, setName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fromEmail.trim() || !message.trim()) return;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      `Portfolio inquiry from ${name}`
    )}&body=${encodeURIComponent(`${message}\n\nFrom: ${name} (${fromEmail})`)}`;

    try {
      window.location.href = mailtoUrl;
    } catch {
      // fallback
    }

    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 5000);
  };

  return (
    <section
      id="contact"
      style={{
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px clamp(24px, 3vw, 40px)',
        borderTop: '3px solid #8a8a8a',
        margin: '0 clamp(24px, 3vw, 40px)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
        {/* Left Information */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h2
            style={{
              margin: '0 0 28px 0',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: '#5f5f5f',
            }}
          >
            CONTACT
          </h2>
          <div
            className="font-tektur"
            style={{
              fontSize: 'clamp(28px, 4vw, 52px)',
              lineHeight: 1.1,
              fontWeight: 500,
              color: '#1a1a1a',
            }}
          >
            Let's talk about your project.
          </div>
          <p
            style={{
              margin: '20px 0 0 0',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#4a4a4a',
            }}
          >
            Questions about my work, a collaboration or a commission? Leave a
            message and I'll get back to you.
          </p>
          <p style={{ margin: '20px 0 0 0', fontSize: '14px', fontWeight: 700 }}>
            <a
              href={`mailto:${email}`}
              style={{ color: '#1a1a1a', textDecoration: 'underline' }}
              className="hover:opacity-75 transition-opacity"
            >
              {email}
            </a>
          </p>
        </div>

        {/* Right Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: '1 1 360px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="c-name"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#4a4a4a',
              }}
            >
              NAME
            </label>
            <input
              id="c-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '14px',
                border: '3px solid #000000',
                borderRadius: 0,
                backgroundColor: '#ffffff',
                fontFamily: 'inherit',
                fontSize: '15px',
                color: '#1a1a1a',
              }}
              placeholder="Your name"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="c-email"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#4a4a4a',
              }}
            >
              YOUR EMAIL
            </label>
            <input
              id="c-email"
              type="email"
              required
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              autoComplete="email"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '14px',
                border: '3px solid #000000',
                borderRadius: 0,
                backgroundColor: '#ffffff',
                fontFamily: 'inherit',
                fontSize: '15px',
                color: '#1a1a1a',
              }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="c-msg"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#4a4a4a',
              }}
            >
              MESSAGE
            </label>
            <textarea
              id="c-msg"
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '14px',
                border: '3px solid #000000',
                borderRadius: 0,
                backgroundColor: '#ffffff',
                fontFamily: 'inherit',
                fontSize: '15px',
                color: '#1a1a1a',
                resize: 'vertical',
              }}
              placeholder="Tell me about your project, ideas, or timeline..."
            />
          </div>

          {sentNotice && (
            <div className="p-3 bg-neutral-100 border-2 border-black text-xs font-bold text-neutral-800">
              Email client opened. If it didn't open automatically, you can directly email: {email}
            </div>
          )}

          <button
            type="submit"
            className="font-tektur transition-transform hover:scale-[1.02] active:scale-95"
            style={{
              alignSelf: 'flex-start',
              minHeight: '48px',
              padding: '0 36px',
              border: 0,
              backgroundColor: '#000000',
              color: accentColor,
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              cursor: 'pointer',
            }}
          >
            SEND
          </button>
        </form>
      </div>
    </section>
  );
};
