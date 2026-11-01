import React, { useState } from 'react';
import type { PortfolioData, SectionKey, PhotoItem } from '../types';
import { cs, loadFile } from '../utils/imageUtils';

interface AdminPortalModalProps {
  data: PortfolioData;
  onUpdate: (updated: Partial<PortfolioData>) => void;
  onClose: () => void;
  onOpenCrop: (
    mode: 'new' | 'edit',
    target: { key: 'hero' | 'about' | SectionKey; pid?: string },
    idx: number,
    queue: PhotoItem[],
    photo: PhotoItem,
    title?: string,
    desc?: string
  ) => void;
  initialOpenSection?: SectionKey | 'hero' | 'about' | null;
  initialOpenProjectId?: string | null;
  accentColor?: string;
}

const SECTION_DEFS: { key: SectionKey; title: string }[] = [
  { key: 'ideation', title: 'CHARACTER IDEATION' },
  { key: 'modeling', title: 'CHARACTER MODELING' },
  { key: 'etc2d', title: 'ETC - 2D' },
  { key: 'etc3d', title: 'ETC - 3D' },
];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  data,
  onUpdate,
  onClose,
  onOpenCrop,
  initialOpenSection = null,
  initialOpenProjectId = null,
  accentColor = '#c2d88f',
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pwError, setPwError] = useState(false);

  // Accordion open states
  const [openSecs, setOpenSecs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      about: initialOpenSection === 'about',
      hero: initialOpenSection === 'hero',
    };
    SECTION_DEFS.forEach((s) => {
      initial[s.key] = initialOpenSection === s.key;
    });
    return initial;
  });

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    initialOpenProjectId || null
  );

  // In-UI project delete confirmation state (prevents iframe window.confirm blocking)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const correctPassword = data.adminPassword || '961215';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setPwError(false);
      setPassword('');
    } else {
      setPwError(true);
      setPassword('');
    }
  };

  const toggleSection = (key: string) => {
    setOpenSecs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper for adding photos from file select
  const handleAddFiles = async (
    target: { key: 'hero' | 'about' | SectionKey; pid?: string },
    files: File[]
  ) => {
    const imageFiles = files.filter((f) => /^image\//.test(f.type));
    if (!imageFiles.length) return;

    const loaded = (await Promise.all(imageFiles.map((f) => loadFile(f)))).filter(
      Boolean
    ) as PhotoItem[];
    if (!loaded.length) return;

    if (target.key === 'about') {
      onOpenCrop('new', target, -1, [], loaded[0]);
    } else if (target.key === 'hero') {
      onOpenCrop('new', target, -1, loaded.slice(1), loaded[0]);
    } else {
      // For project
      const proj = data.proj[target.key as SectionKey]?.find((p) => p.id === target.pid);
      if (proj && proj.photos.length > 0) {
        // already has thumbnail, directly append
        const updatedProj = { ...data.proj };
        updatedProj[target.key as SectionKey] = updatedProj[target.key as SectionKey].map((p) =>
          p.id === target.pid ? { ...p, photos: [...p.photos, ...loaded] } : p
        );
        onUpdate({ proj: updatedProj });
      } else {
        // first photo of project -> start crop
        onOpenCrop('new', target, -1, loaded.slice(1), loaded[0], proj?.title, proj?.desc);
      }
    }
  };

  const moveProjectPhoto = (
    secKey: SectionKey,
    pid: string,
    idx: number,
    dir: number
  ) => {
    const proj = data.proj[secKey].find((p) => p.id === pid);
    if (!proj) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= proj.photos.length) return;

    const list = [...proj.photos];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedProj = { ...data.proj };
    updatedProj[secKey] = updatedProj[secKey].map((p) =>
      p.id === pid ? { ...p, photos: list } : p
    );
    onUpdate({ proj: updatedProj });
  };

  const removeProjectPhoto = (secKey: SectionKey, pid: string, idx: number) => {
    const proj = data.proj[secKey].find((p) => p.id === pid);
    if (!proj) return;
    const list = proj.photos.filter((_, i) => i !== idx);
    const updatedProj = { ...data.proj };
    updatedProj[secKey] = updatedProj[secKey].map((p) =>
      p.id === pid ? { ...p, photos: list } : p
    );
    onUpdate({ proj: updatedProj });
  };

  const addProject = (secKey: SectionKey) => {
    const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newProject = {
      id,
      title: 'NEW PROJECT',
      desc: '',
      photos: [],
    };
    const updatedProj = { ...data.proj };
    updatedProj[secKey] = [...updatedProj[secKey], newProject];
    onUpdate({ proj: updatedProj });
    setExpandedProjectId(id);
  };

  const confirmDeleteProject = (secKey: SectionKey, pid: string) => {
    const updatedProj = { ...data.proj };
    updatedProj[secKey] = (updatedProj[secKey] || []).filter((p) => p.id !== pid);
    onUpdate({ proj: updatedProj });
    if (expandedProjectId === pid) setExpandedProjectId(null);
    setDeletingProjectId(null);
    setSaveStatus('Project deleted successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const updateProjectFields = (
    secKey: SectionKey,
    pid: string,
    fields: { title?: string; desc?: string }
  ) => {
    const updatedProj = { ...data.proj };
    updatedProj[secKey] = updatedProj[secKey].map((p) =>
      p.id === pid ? { ...p, ...fields } : p
    );
    onUpdate({ proj: updatedProj });
  };

  // Export & Import features for reliability
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jiwoonjung-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSaveStatus('Portfolio backup downloaded successfully.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteJsonText, setPasteJsonText] = useState('');

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.proj) {
          onUpdate(parsed);
          setSaveStatus('✅ JSON 데이터가 서버 디스크(public/portfolio-data.json)와 영구 스토리지에 성공적으로 등록되었습니다!');
          setTimeout(() => setSaveStatus(null), 5000);
        } else {
          alert('올바른 포트폴리오 백업 JSON 형식이 아닙니다.');
        }
      } catch {
        alert('JSON 파일을 파싱하는 데 실패했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyPastedJson = () => {
    if (!pasteJsonText.trim()) return;
    try {
      const parsed = JSON.parse(pasteJsonText.trim());
      if (parsed && parsed.proj) {
        onUpdate(parsed);
        setShowPasteModal(false);
        setPasteJsonText('');
        setSaveStatus('✅ 붙여넣은 JSON 데이터가 서버 디스크(public/portfolio-data.json)와 영구 스토리지에 등록되었습니다!');
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        alert('올바른 포트폴리오 데이터 형식이 아닙니다. (proj 객체가 필요합니다)');
      }
    } catch (err: any) {
      alert(`JSON 문법 오류: ${err.message}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        boxSizing: 'border-box',
        padding: '24px',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Close Button */}
      <button
        type="button"
        aria-label="Close admin"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '48px',
          height: '48px',
          padding: 0,
          border: '2px solid #ffffff',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          zIndex: 60,
        }}
        className="flex items-center justify-center hover:opacity-80"
      >
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
          <path
            d="M14 14 L30 30 M30 14 L14 30"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="square"
            fill="none"
          />
        </svg>
      </button>

      {/* Main Container */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '980px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          padding: 'clamp(24px, 4vw, 48px)',
        }}
      >
        {!isAuthenticated ? (
          /* Login Screen */
          <form
            onSubmit={handleLogin}
            style={{
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              margin: '32px auto',
            }}
          >
            <div
              className="font-tektur"
              style={{
                fontSize: '32px',
                lineHeight: 1.1,
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            >
              Admin Portal access
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="a-pw"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: '#4a4a4a',
                }}
              >
                PASSWORD
              </label>
              <input
                id="a-pw"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPwError(false);
                }}
                autoComplete="current-password"
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
                placeholder="Enter admin password"
              />
            </div>

            {pwError && (
              <div
                role="alert"
                style={{ fontSize: '14px', fontWeight: 700, color: '#b3261e' }}
              >
                Incorrect password. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="font-tektur hover:opacity-90 active:scale-95 transition-all"
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
              ENTER
            </button>
          </form>
        ) : (
          /* Logged In Dashboard */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div
                className="font-tektur"
                style={{
                  fontSize: '32px',
                  lineHeight: 1.1,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Edit portfolio
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="min-h-[44px] px-4 border-2 border-neutral-700 bg-white text-xs font-bold tracking-wider hover:bg-neutral-50 transition-colors"
                >
                  EXPORT JSON
                </button>
                <label className="min-h-[44px] px-4 border-2 border-neutral-700 bg-white text-xs font-bold tracking-wider hover:bg-neutral-50 transition-colors flex items-center cursor-pointer">
                  IMPORT JSON (파일)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="min-h-[44px] px-4 border-2 border-black bg-black text-[#c2d88f] text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
                >
                  JSON 직접 붙여넣기
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(false)}
                  style={{
                    minHeight: '44px',
                    padding: '0 24px',
                    border: '3px solid #000000',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    cursor: 'pointer',
                  }}
                  className="hover:bg-neutral-100"
                >
                  LOG OUT
                </button>
              </div>
            </div>

            {/* Permanent Storage Status Banner */}
            <div className="p-3 bg-neutral-100 border-2 border-neutral-800 text-xs text-neutral-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span>
                <strong>영구 보관 활성화:</strong> 모든 변경사항 및 업로드 이미지는 서버 디스크 파일(<code>public/portfolio-data.json</code>)과 브라우저 IndexedDB에 자동 영구 저장되어 사이트를 나갔다 들어와도 유지됩니다.
              </span>
            </div>

            {/* Paste JSON Modal */}
            {showPasteModal && (
              <div
                style={{
                  boxSizing: 'border-box',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  border: '3px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-black">
                    갖고 계신 JSON 텍스트를 여기에 붙여넣어 영구 등록하세요
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-black"
                  >
                    닫기
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={pasteJsonText}
                  onChange={(e) => setPasteJsonText(e.target.value)}
                  placeholder='{"adminEmail":"...","heroPhotos":[...],"proj":{...}}'
                  className="w-full p-3 font-mono text-xs border-2 border-black bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="px-4 py-2 border-2 border-neutral-400 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyPastedJson}
                    className="px-5 py-2 bg-black text-[#c2d88f] text-xs font-bold tracking-wider"
                  >
                    서버 및 브라우저에 영구 등록 적용
                  </button>
                </div>
              </div>
            )}

            <p
              style={{
                margin: 0,
                maxWidth: '720px',
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#4a4a4a',
              }}
            >
              사진을 추가하면 <strong>미디어 수정</strong> 창이 열립니다: 원하는 위치로 드래그하고 확대/축소한 후 [적용]을 누르세요.
              헤더는 3:2 비율, 프로젝트 갤러리는 1:1 정사각형 비율을 사용합니다.
            </p>

            {saveStatus && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-bold">
                {saveStatus}
              </div>
            )}

            {/* Contact Email setting */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '420px' }}>
              <label
                htmlFor="a-email"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: '#4a4a4a',
                }}
              >
                CONTACT EMAIL
              </label>
              <input
                id="a-email"
                type="email"
                value={data.adminEmail}
                onChange={(e) => onUpdate({ adminEmail: e.target.value })}
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
              />
            </div>

            {/* Change Password Collapsible */}
            <div className="text-xs">
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-neutral-600 underline font-semibold cursor-pointer hover:text-black"
              >
                {showPasswordChange ? 'Cancel Password Change' : 'Change Admin Password'}
              </button>
              {showPasswordChange && (
                <div className="mt-2 flex items-center gap-2 max-w-sm">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    className="p-2 border-2 border-black text-sm w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPasswordVal.trim()) {
                        onUpdate({ adminPassword: newPasswordVal.trim() });
                        setNewPasswordVal('');
                        setShowPasswordChange(false);
                        setSaveStatus('Admin password updated successfully.');
                        setTimeout(() => setSaveStatus(null), 3000);
                      }
                    }}
                    className="px-3 py-2 bg-black text-white text-xs font-bold whitespace-nowrap"
                  >
                    SAVE
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 1: ABOUT ME */}
            <div
              style={{
                boxSizing: 'border-box',
                padding: '24px',
                border: '3px solid #c4c4c4',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <button
                type="button"
                aria-expanded={openSecs.about}
                onClick={() => toggleSection('about')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  width: '100%',
                  minHeight: '44px',
                  padding: 0,
                  border: 0,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#1a1a1a',
                }}
              >
                <span>
                  ABOUT ME <span style={{ color: '#5f5f5f' }}>· 2:3 photo</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d={openSecs.about ? 'M4 7 L10 13 L16 7' : 'M7 4 L13 10 L7 16'}
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {openSecs.about && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '140px' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '140px',
                          height: '210px',
                          overflow: 'hidden',
                          backgroundColor: '#eeeeee',
                          border: '2px solid #000000',
                        }}
                      >
                        {data.aboutPhoto ? (
                          <img
                            src={data.aboutPhoto.src}
                            alt="Profile preview"
                            draggable={false}
                            style={cs(data.aboutPhoto, 2 / 3)}
                          />
                        ) : (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.1em',
                              color: '#6b7076',
                            }}
                          >
                            NO PHOTO
                          </div>
                        )}
                      </div>

                      {data.aboutPhoto && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenCrop('edit', { key: 'about' }, 0, [], data.aboutPhoto!)
                            }
                            style={{
                              minHeight: '44px',
                              border: '2px solid #000000',
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            구간 수정
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate({ aboutPhoto: null })}
                            style={{
                              minHeight: '44px',
                              border: '2px solid #000000',
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.1em',
                              cursor: 'pointer',
                            }}
                          >
                            REMOVE
                          </button>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        flex: '1 1 320px',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Clean styled "파일 선택" button without browser "선택된 파일 없음" */}
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          minHeight: '44px',
                          width: 'fit-content',
                          padding: '0 24px',
                          border: '2px solid #000000',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                        className="hover:opacity-90 active:scale-95 transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>파일 선택</span>
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Upload profile photo"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleAddFiles({ key: 'about' }, files);
                            e.target.value = '';
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label
                      htmlFor="ab-intro"
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color: '#4a4a4a',
                      }}
                    >
                      프로필 · 자기소개
                    </label>
                    <textarea
                      id="ab-intro"
                      rows={6}
                      value={data.aboutIntro}
                      onChange={(e) => onUpdate({ aboutIntro: e.target.value })}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: '12px 14px',
                        border: '3px solid #000000',
                        borderRadius: 0,
                        backgroundColor: '#ffffff',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: '#1a1a1a',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label
                      htmlFor="ab-career"
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color: '#4a4a4a',
                      }}
                    >
                      활동 · 경력 (한 줄에 하나씩)
                    </label>
                    <textarea
                      id="ab-career"
                      rows={6}
                      value={data.aboutCareer}
                      onChange={(e) => onUpdate({ aboutCareer: e.target.value })}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: '12px 14px',
                        border: '3px solid #000000',
                        borderRadius: 0,
                        backgroundColor: '#ffffff',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: '#1a1a1a',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: HEADER PHOTOS */}
            <div
              style={{
                boxSizing: 'border-box',
                padding: '24px',
                border: '3px solid #c4c4c4',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <button
                type="button"
                aria-expanded={openSecs.hero}
                onClick={() => toggleSection('hero')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  width: '100%',
                  minHeight: '44px',
                  padding: 0,
                  border: 0,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#1a1a1a',
                }}
              >
                <span>
                  HEADER{' '}
                  <span style={{ color: '#5f5f5f' }}>
                    · 3:2 · {data.heroPhotos.length} photo{data.heroPhotos.length === 1 ? '' : 's'}
                  </span>
                </span>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d={openSecs.hero ? 'M4 7 L10 13 L16 7' : 'M7 4 L13 10 L7 16'}
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {openSecs.hero && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                    {data.heroPhotos.map((hp, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          width: '168px',
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '168px',
                            height: '156px',
                            overflow: 'hidden',
                            backgroundColor: '#eeeeee',
                            border: '2px solid #000000',
                          }}
                        >
                          <img
                            src={hp.src}
                            alt={`Header ${i + 1}`}
                            draggable={false}
                            style={cs(hp, 300 / 278)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCrop('edit', { key: 'hero' }, i, [], hp)
                          }
                          style={{
                            minHeight: '44px',
                            border: '2px solid #000000',
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          구간 수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.heroPhotos.filter((_, idx) => idx !== i);
                            onUpdate({ heroPhotos: updated });
                          }}
                          style={{
                            minHeight: '44px',
                            border: '2px solid #000000',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                          }}
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Clean styled "파일 선택" button without browser "선택된 파일 없음" and no URL input */}
                  <div>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minHeight: '44px',
                        padding: '0 24px',
                        border: '2px solid #000000',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      className="hover:opacity-90 active:scale-95 transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>파일 선택</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        aria-label="Upload header photos"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          handleAddFiles({ key: 'hero' }, files);
                          e.target.value = '';
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* SECTIONS 3-6: PROJECT CATEGORIES */}
            {SECTION_DEFS.map((s) => {
              const projects = data.proj[s.key] || [];
              const isOpen = !!openSecs[s.key];

              return (
                <div
                  key={s.key}
                  style={{
                    boxSizing: 'border-box',
                    padding: '24px',
                    border: '3px solid #c4c4c4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleSection(s.key)}
                      style={{
                        flex: '1 1 240px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        minHeight: '44px',
                        padding: 0,
                        border: 0,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: '#1a1a1a',
                      }}
                    >
                      <span>
                        {s.title}{' '}
                        <span style={{ color: '#5f5f5f' }}>
                          · 1:1 · {projects.length} project{projects.length === 1 ? '' : 's'}
                        </span>
                      </span>
                      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d={isOpen ? 'M4 7 L10 13 L16 7' : 'M7 4 L13 10 L7 16'}
                          fill="none"
                          stroke="#1a1a1a"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => addProject(s.key)}
                        style={{
                          minHeight: '44px',
                          padding: '0 20px',
                          border: 0,
                          backgroundColor: '#000000',
                          color: accentColor,
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          cursor: 'pointer',
                        }}
                      >
                        + NEW PROJECT
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {projects.map((p) => {
                        const thumbnail = p.photos[0];
                        const isExpanded = expandedProjectId === p.id;
                        const target = { key: s.key, pid: p.id };
                        const isDeletingThis = deletingProjectId === p.id;

                        return (
                          <div
                            key={p.id}
                            style={{
                              boxSizing: 'border-box',
                              padding: '18px',
                              border: '2px solid #000000',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                            }}
                          >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                              {/* 1:1 Thumbnail Box */}
                              <div
                                style={{
                                  position: 'relative',
                                  width: '112px',
                                  height: '112px',
                                  flex: '0 0 auto',
                                  overflow: 'hidden',
                                  backgroundColor: '#e6e9ec',
                                  border: '2px solid #000000',
                                }}
                              >
                                {thumbnail ? (
                                  <img
                                    src={thumbnail.src}
                                    alt={p.title}
                                    draggable={false}
                                    style={cs(thumbnail, 1)}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      letterSpacing: '0.1em',
                                      color: '#6b7076',
                                    }}
                                  >
                                    NO PHOTO
                                  </div>
                                )}
                              </div>

                              {/* Title & Description inputs */}
                              <div
                                style={{
                                  flex: '1 1 280px',
                                  minWidth: 0,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                }}
                              >
                                <input
                                  type="text"
                                  aria-label="Project title"
                                  value={p.title}
                                  onChange={(e) =>
                                    updateProjectFields(s.key, p.id, { title: e.target.value })
                                  }
                                  placeholder="Project Title"
                                  style={{
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '3px solid #000000',
                                    borderRadius: 0,
                                    backgroundColor: '#ffffff',
                                    fontFamily: 'inherit',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#1a1a1a',
                                  }}
                                />
                                <textarea
                                  rows={3}
                                  aria-label="Project description"
                                  placeholder="Description..."
                                  value={p.desc}
                                  onChange={(e) =>
                                    updateProjectFields(s.key, p.id, { desc: e.target.value })
                                  }
                                  style={{
                                    boxSizing: 'border-box',
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '3px solid #000000',
                                    borderRadius: 0,
                                    backgroundColor: '#ffffff',
                                    fontFamily: 'inherit',
                                    fontSize: '14px',
                                    color: '#1a1a1a',
                                    resize: 'vertical',
                                  }}
                                />
                              </div>
                            </div>

                            {/* Controls: Expand photos, Photo count, and DELETE PROJECT */}
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                alignItems: 'center',
                              }}
                            >
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                onClick={() =>
                                  setExpandedProjectId(isExpanded ? null : p.id)
                                }
                                style={{
                                  minHeight: '44px',
                                  padding: '0 20px',
                                  border: '2px solid #000000',
                                  backgroundColor: '#000000',
                                  color: '#ffffff',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                {isExpanded ? '접기' : '사진 순서 / 추가'}
                              </button>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  letterSpacing: '0.1em',
                                  color: '#5f5f5f',
                                }}
                              >
                                {p.photos.length} photo{p.photos.length === 1 ? '' : 's'}
                              </span>

                              {/* DELETE PROJECT with fail-safe in-UI confirmation (No window.confirm!) */}
                              {isDeletingThis ? (
                                <div
                                  style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#fef2f2',
                                    padding: '4px 10px',
                                    border: '2px solid #b3261e',
                                  }}
                                >
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#b3261e' }}>
                                    정말 삭제할까요?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => confirmDeleteProject(s.key, p.id)}
                                    style={{
                                      minHeight: '36px',
                                      padding: '0 14px',
                                      border: 0,
                                      backgroundColor: '#b3261e',
                                      color: '#ffffff',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingProjectId(null)}
                                    style={{
                                      minHeight: '36px',
                                      padding: '0 12px',
                                      border: '1px solid #000000',
                                      backgroundColor: '#ffffff',
                                      color: '#000000',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingProjectId(p.id)}
                                  style={{
                                    marginLeft: 'auto',
                                    minHeight: '44px',
                                    padding: '0 20px',
                                    border: '2px solid #b3261e',
                                    backgroundColor: '#ffffff',
                                    color: '#b3261e',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    cursor: 'pointer',
                                  }}
                                  className="hover:bg-red-50 transition-colors"
                                >
                                  DELETE PROJECT
                                </button>
                              )}
                            </div>

                            {/* Expanded Photos Grid & File Intake */}
                            {isExpanded && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '16px',
                                  paddingTop: '6px',
                                }}
                              >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                                  {p.photos.map((ph, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        width: '132px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          position: 'relative',
                                          width: '132px',
                                          height: '132px',
                                          overflow: 'hidden',
                                          backgroundColor: '#eeeeee',
                                          border: '2px solid #000000',
                                        }}
                                      >
                                        <img
                                          src={ph.src}
                                          alt={`Photo ${idx + 1}`}
                                          draggable={false}
                                          style={
                                            idx === 0
                                              ? cs(ph, 1)
                                              : {
                                                  position: 'absolute',
                                                  inset: 0,
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'contain',
                                                  display: 'block',
                                                }
                                          }
                                        />
                                      </div>
                                      <div
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          letterSpacing: '0.1em',
                                          color: '#4a4a4a',
                                        }}
                                      >
                                        {idx === 0 ? 'THUMBNAIL · 1:1' : `PHOTO ${idx + 1}`}
                                      </div>

                                      {/* Thumbnail has crop button */}
                                      {idx === 0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onOpenCrop('edit', target, idx, [], ph, p.title, p.desc)
                                          }
                                          style={{
                                            minHeight: '40px',
                                            border: '2px solid #000000',
                                            backgroundColor: '#000000',
                                            color: '#ffffff',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          구간 수정
                                        </button>
                                      )}

                                      {/* Reorder arrows */}
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          type="button"
                                          aria-label="Move left"
                                          disabled={idx === 0}
                                          onClick={() =>
                                            moveProjectPhoto(s.key, p.id, idx, -1)
                                          }
                                          style={{
                                            flex: 1,
                                            minHeight: '40px',
                                            border: '2px solid #000000',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                            opacity: idx === 0 ? 0.3 : 1,
                                          }}
                                        >
                                          ←
                                        </button>
                                        <button
                                          type="button"
                                          aria-label="Move right"
                                          disabled={idx === p.photos.length - 1}
                                          onClick={() =>
                                            moveProjectPhoto(s.key, p.id, idx, 1)
                                          }
                                          style={{
                                            flex: 1,
                                            minHeight: '40px',
                                            border: '2px solid #000000',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            cursor:
                                              idx === p.photos.length - 1
                                                ? 'not-allowed'
                                                : 'pointer',
                                            opacity: idx === p.photos.length - 1 ? 0.3 : 1,
                                          }}
                                        >
                                          →
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeProjectPhoto(s.key, p.id, idx)
                                        }
                                        style={{
                                          minHeight: '40px',
                                          border: '2px solid #000000',
                                          backgroundColor: '#ffffff',
                                          color: '#000000',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          letterSpacing: '0.1em',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        REMOVE
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Clean styled "파일 선택" button without browser "선택된 파일 없음" and no URL input */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <label
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      minHeight: '44px',
                                      padding: '0 24px',
                                      border: '2px solid #000000',
                                      backgroundColor: '#000000',
                                      color: '#ffffff',
                                      fontSize: '13px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                    }}
                                    className="hover:opacity-90 active:scale-95 transition-all"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <polyline points="17 8 12 3 7 8" />
                                      <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span>파일 선택</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      aria-label={`Upload photos for ${p.title}`}
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        handleAddFiles(target, files);
                                        e.target.value = '';
                                      }}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
