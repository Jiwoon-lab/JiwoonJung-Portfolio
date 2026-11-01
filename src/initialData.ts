import type { PortfolioData } from './types';

export const INITIAL_DATA: PortfolioData = {
  adminEmail: 'jeawoon1215@gmail.com',
  aboutPhoto: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    w: 800,
    h: 1200,
    z: 1,
    x: 0,
    y: 0,
  },
  aboutIntro: `디지털 캐릭터 콘셉트와 3D 모델링, 시각적 스토리텔링을 탐구하는 아티스트 정재운(Ji Woon Jung)입니다.

형태의 독창적인 실루엣과 캐릭터 내면의 서사가 조화를 이루는 아트를 지향하며, 콘셉트 스케치부터 정교한 3D 하이폴리곤 조형 및 질감 표현까지 유기적으로 구현합니다.`,
  aboutCareer: `2024 - Character Design & 3D Form Artworks
2023 - 3D Character Modeling & Topology Study
2022 - Digital Concept Ideation & Creature Design
2021 - Visual Arts & Illustration Exhibition`,
  adminPassword: '961215',
  heroPhotos: [
    {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      w: 1600,
      h: 1067,
      z: 1,
      x: 0,
      y: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80',
      w: 1600,
      h: 1067,
      z: 1,
      x: 0,
      y: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1600&q=80',
      w: 1600,
      h: 1067,
      z: 1,
      x: 0,
      y: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
      w: 1600,
      h: 1067,
      z: 1,
      x: 0,
      y: 0,
    },
  ],
  proj: {
    ideation: [
      {
        id: 'ideation-1',
        title: 'CYBER ARCHETYPE - 01',
        desc: '사이버펑크 세계관 속 정찰형 특수 요원의 실루엣과 프로포션 연구.\n경량화된 기계 외골격과 인간적 감정선의 대조를 강조한 콘셉트 디자인.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
          {
            src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'ideation-2',
        title: 'ASTRAL NOMAD',
        desc: '성간 여행자의 유목민적 복식과 기능성 장비 아이디어 스케치.\n다양한 환경에 적응하는 모듈형 슈트와 텍스처 연구.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'ideation-3',
        title: 'GUARDIAN OF CHIMERA',
        desc: '동양적 신수 설화를 현대적으로 재해석한 유기체형 크리처 캐릭터.\n뿔의 곡선과 갑각의 패턴을 중심으로 한 조형미.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'ideation-4',
        title: 'VOID REVERIE',
        desc: '심해 생물의 발광 기관에서 영감을 얻은 섀도우 캐릭터.\n미지의 세계 속 비정형 형태와 명암의 극적인 대비를 표현.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
    ],
    modeling: [
      {
        id: 'mod-1',
        title: 'MECHA ENVOY SCULPT',
        desc: 'ZBrush와 Maya를 활용한 하이폴리곤 메카닉 슈트 조형.\n페이스 플레이트의 정밀 분할과 서피스 디테일링 작업.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'mod-2',
        title: 'HUMANOID HEAD STUDY',
        desc: '해부학적 근육 구조를 바탕으로 한 사실적인 인체 두상 모델링.\nSubstance Painter 기반의 섬세한 스킨 포어와 표정 텍스처링.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'mod-3',
        title: 'EXO-ARMOR TURNAROUND',
        desc: '게임 엔진 최적화를 고려한 리토폴로지 및 베이킹 프로세스.\n하드서피스 에지와 곡면의 유기적 결합.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
    ],
    etc2d: [
      {
        id: 'etc2d-1',
        title: 'ENVIRONMENT THUMBNAILS',
        desc: '캐릭터가 활동하는 디스토피아 도시 배경의 분위기와 조명 무드보드.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'etc2d-2',
        title: 'WEAPON & PROP DESIGNS',
        desc: '캐릭터 무기 및 소품의 디테일 턴어라운드 및 기능 구조도.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
    ],
    etc3d: [
      {
        id: 'etc3d-1',
        title: 'LIGHTING & SHADING PASSES',
        desc: 'Unreal Engine 5 및 Blender Cycles를 활용한 시네마틱 렌더링.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
      {
        id: 'etc3d-2',
        title: 'CREATURE RIG & POSING',
        desc: '자연스러운 관절 변형과 애니메이션 포징을 위한 커스텀 리깅 테스트.',
        photos: [
          {
            src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1000&q=80',
            w: 1000,
            h: 1000,
            z: 1,
            x: 0,
            y: 0,
          },
        ],
      },
    ],
  },
};
