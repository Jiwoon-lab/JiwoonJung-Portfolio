export type SectionKey = 'ideation' | 'modeling' | 'etc2d' | 'etc3d';

export interface PhotoItem {
  src: string;
  w?: number;
  h?: number;
  z?: number; // zoom factor (1.0 to 4.0)
  x?: number; // offset x
  y?: number; // offset y
  alt?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  desc: string;
  photos: PhotoItem[];
  ph?: boolean; // placeholder flag
}

export interface PortfolioData {
  heroPhotos: PhotoItem[];
  proj: Record<SectionKey, ProjectItem[]>;
  adminEmail: string;
  aboutPhoto: PhotoItem | null;
  aboutIntro: string;
  aboutCareer: string;
  adminPassword?: string;
}

export interface CropState {
  mode: 'new' | 'edit';
  target: {
    key: 'hero' | 'about' | SectionKey;
    pid?: string; // project ID if editing project photo
  };
  idx: number;
  queue: PhotoItem[];
  photo: PhotoItem;
  title?: string;
  desc?: string;
}

export interface ViewerState {
  key: SectionKey;
  pi: number; // project index
  i: number; // photo index within project
}
