/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { PortfolioData, SectionKey, PhotoItem, ViewerState, CropState } from './types';
import { INITIAL_DATA } from './initialData';
import { Sidebar } from './components/Sidebar';
import { HeroHeader } from './components/HeroHeader';
import { SectionCarousel } from './components/SectionCarousel';
import { ContactSection } from './components/ContactSection';
import { GalleryViewerModal } from './components/GalleryViewerModal';
import { AboutModal } from './components/AboutModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { MediaCropModal } from './components/MediaCropModal';
import { idbGet, idbSet } from './utils/idb';

const STORAGE_KEY = 'jwj-portfolio-v1';

export default function App() {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTargetSec, setAdminTargetSec] = useState<SectionKey | 'hero' | 'about' | null>(null);
  const [adminTargetPid, setAdminTargetPid] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropState | null>(null);

  const accentColor = '#c2d88f';

  // Load persistent data on mount (Server disk -> Static public file -> IndexedDB -> LocalStorage)
  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      // 1. Try server API (/api/portfolio)
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data && isMounted) {
            setData(json.data);
            idbSet(STORAGE_KEY, json.data);
            return;
          }
        }
      } catch {
        // server API fallback
      }

      // 2. Try static /portfolio-data.json
      try {
        const staticRes = await fetch('/portfolio-data.json');
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          if (staticData && staticData.proj && isMounted) {
            setData(staticData);
            idbSet(STORAGE_KEY, staticData);
            return;
          }
        }
      } catch {
        // static fetch fallback
      }

      // 3. Try IndexedDB
      try {
        const idbData = await idbGet<PortfolioData>(STORAGE_KEY);
        if (idbData && idbData.proj && isMounted) {
          setData(idbData);
          return;
        }
      } catch {
        // idb fallback
      }

      // 4. Try localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.proj && isMounted) {
            setData({
              ...INITIAL_DATA,
              ...parsed,
            });
            idbSet(STORAGE_KEY, parsed);
          }
        }
      } catch {
        // fallback
      }
    }

    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

  // Automatically close viewer if viewed project was deleted
  useEffect(() => {
    if (viewer) {
      const list = data.proj[viewer.key];
      if (!list || !list[viewer.pi]) {
        setViewer(null);
      }
    }
  }, [data.proj, viewer]);

  // Multi-tier persistent save: React state -> IndexedDB -> Server Disk -> LocalStorage
  const updateData = (patch: Partial<PortfolioData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };

      // 1. Save to IndexedDB (eliminates 5MB quota errors completely)
      idbSet(STORAGE_KEY, next);

      // 2. Save directly to Server Disk (/public/portfolio-data.json)
      fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch((err) => {
        console.warn('Server disk save notice:', err);
      });

      // 3. Fallback to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // If quota exceeded, IndexedDB & Server disk already safely stored it
      }

      return next;
    });
  };

  // Open Gallery Viewer from carousel
  const handleOpenViewer = (secKey: SectionKey, projectIndex: number) => {
    setViewer({
      key: secKey,
      pi: projectIndex,
      i: 0,
    });
  };

  // Quick edit from Gallery Viewer to Admin
  const handleEditInAdmin = (secKey: SectionKey, projectId: string) => {
    setViewer(null);
    setAdminTargetSec(secKey);
    setAdminTargetPid(projectId);
    setIsAdminOpen(true);
  };

  // Open Crop Modal
  const handleOpenCrop = (
    mode: 'new' | 'edit',
    target: { key: 'hero' | 'about' | SectionKey; pid?: string },
    idx: number,
    queue: PhotoItem[],
    photo: PhotoItem,
    title?: string,
    desc?: string
  ) => {
    setCrop({
      mode,
      target,
      idx,
      queue,
      photo: { ...photo, z: photo.z || 1, x: photo.x || 0, y: photo.y || 0 },
      title,
      desc,
    });
  };

  // Apply Crop Modal result
  const handleApplyCrop = (
    updatedPhoto: PhotoItem,
    updatedTitle?: string,
    updatedDesc?: string
  ) => {
    if (!crop) return;
    const { target, mode, idx, queue } = crop;

    if (target.key === 'about') {
      updateData({ aboutPhoto: updatedPhoto });
      setCrop(null);
    } else if (target.key === 'hero') {
      const list = [...data.heroPhotos];
      if (mode === 'new') {
        list.push(updatedPhoto);
      } else {
        list[idx] = updatedPhoto;
      }
      updateData({ heroPhotos: list });

      if (queue.length > 0) {
        setCrop({
          mode: 'new',
          target,
          idx: -1,
          queue: queue.slice(1),
          photo: { ...queue[0], z: 1, x: 0, y: 0 },
        });
      } else {
        setCrop(null);
      }
    } else {
      // Target is project in a section
      const secKey = target.key as SectionKey;
      const projList = [...(data.proj[secKey] || [])];
      const projectIdx = projList.findIndex((p) => p.id === target.pid);

      if (projectIdx >= 0) {
        const proj = { ...projList[projectIdx] };
        const photos = [...proj.photos];

        if (mode === 'new') {
          photos.push(updatedPhoto);
          // append remaining queue items as un-cropped photos
          queue.forEach((q) => photos.push({ ...q, z: 1, x: 0, y: 0 }));
        } else {
          photos[idx] = updatedPhoto;
        }

        proj.photos = photos;
        if (updatedTitle !== undefined) proj.title = updatedTitle;
        if (updatedDesc !== undefined) proj.desc = updatedDesc;

        projList[projectIdx] = proj;
        const updatedProj = { ...data.proj, [secKey]: projList };
        updateData({ proj: updatedProj });
      }

      setCrop(null);
    }
  };

  // Find active project for viewer
  const viewerProject =
    viewer && data.proj[viewer.key] && data.proj[viewer.key][viewer.pi]
      ? data.proj[viewer.key][viewer.pi]
      : null;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Sidebar with toggle button */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAdmin={() => {
          setAdminTargetSec(null);
          setAdminTargetPid(null);
          setIsAdminOpen(true);
        }}
        accentColor={accentColor}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: '999 1 560px',
          minWidth: 0,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Header with 3:2 rotating images and halftone fade */}
        <HeroHeader photos={data.heroPhotos} accentColor={accentColor} />

        {/* 1. Character Ideation */}
        <SectionCarousel
          id="ideation"
          title="CHARACTER IDEATION"
          projects={data.proj.ideation}
          onOpenViewer={(idx) => handleOpenViewer('ideation', idx)}
        />

        {/* 2. Character Modeling */}
        <SectionCarousel
          id="modeling"
          title="CHARACTER MODELING"
          projects={data.proj.modeling}
          onOpenViewer={(idx) => handleOpenViewer('modeling', idx)}
        />

        {/* 3. Etc - 2D */}
        <SectionCarousel
          id="etc2d"
          title="ETC - 2D"
          projects={data.proj.etc2d}
          onOpenViewer={(idx) => handleOpenViewer('etc2d', idx)}
        />

        {/* 4. Etc - 3D */}
        <SectionCarousel
          id="etc3d"
          title="ETC - 3D"
          projects={data.proj.etc3d}
          onOpenViewer={(idx) => handleOpenViewer('etc3d', idx)}
        />

        {/* Contact Section */}
        <ContactSection email={data.adminEmail} accentColor={accentColor} />
      </main>

      {/* Gallery Viewer Modal */}
      {viewer && viewerProject && (
        <GalleryViewerModal
          project={viewerProject}
          sectionKey={viewer.key}
          initialPhotoIndex={viewer.i}
          onClose={() => setViewer(null)}
          onEditInAdmin={handleEditInAdmin}
          accentColor={accentColor}
        />
      )}

      {/* About Me Modal */}
      {isAboutOpen && (
        <AboutModal
          photo={data.aboutPhoto}
          intro={data.aboutIntro}
          career={data.aboutCareer}
          onClose={() => setIsAboutOpen(false)}
        />
      )}

      {/* Admin Portal Modal */}
      {isAdminOpen && (
        <AdminPortalModal
          data={data}
          onUpdate={updateData}
          onClose={() => {
            setIsAdminOpen(false);
            setAdminTargetSec(null);
            setAdminTargetPid(null);
          }}
          onOpenCrop={handleOpenCrop}
          initialOpenSection={adminTargetSec}
          initialOpenProjectId={adminTargetPid}
          accentColor={accentColor}
        />
      )}

      {/* Media Crop & Zoom Modal */}
      {crop && (
        <MediaCropModal
          crop={crop}
          onApply={handleApplyCrop}
          onCancel={() => setCrop(null)}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
