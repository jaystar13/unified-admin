export interface Stadium {
  id: string;
  name: string;
  shortName: string;
  city: string;
  capacity: number;
  homeTeams: string[];
}

export const STADIUMS: Stadium[] = [
  {
    id: 'jamsil',
    name: '잠실야구장',
    shortName: '잠실',
    city: '서울',
    capacity: 25000,
    homeTeams: ['doosan', 'lg'],
  },
  {
    id: 'gocheok',
    name: '고척스카이돔',
    shortName: '고척',
    city: '서울',
    capacity: 16813,
    homeTeams: ['kiwoom'],
  },
  {
    id: 'incheon',
    name: '인천SSG랜더스필드',
    shortName: '문학',
    city: '인천',
    capacity: 23000,
    homeTeams: ['ssg'],
  },
  {
    id: 'suwon',
    name: '수원KT위즈파크',
    shortName: '수원',
    city: '수원',
    capacity: 20000,
    homeTeams: ['kt'],
  },
  {
    id: 'daegu',
    name: '대구삼성라이온즈파크',
    shortName: '대구',
    city: '대구',
    capacity: 24000,
    homeTeams: ['samsung'],
  },
  {
    id: 'gwangju',
    name: '광주기아챔피언스필드',
    shortName: '광주',
    city: '광주',
    capacity: 27000,
    homeTeams: ['kia'],
  },
  {
    id: 'daejeon',
    name: '한화생명이글스파크',
    shortName: '대전',
    city: '대전',
    capacity: 13000,
    homeTeams: ['hanwha'],
  },
  {
    id: 'changwon',
    name: '창원NC파크',
    shortName: '창원',
    city: '창원',
    capacity: 22000,
    homeTeams: ['nc'],
  },
  {
    id: 'sajik',
    name: '사직야구장',
    shortName: '사직',
    city: '부산',
    capacity: 24500,
    homeTeams: ['lotte'],
  },
];

export const getStadiumById = (id: string): Stadium | undefined => {
  return STADIUMS.find((stadium) => stadium.id === id);
};

export const getStadiumByName = (name: string): Stadium | undefined => {
  return STADIUMS.find(
    (stadium) => stadium.name === name || stadium.shortName === name
  );
};

export const getStadiumDisplayName = (stadiumId: string | null | undefined): string => {
  if (!stadiumId) return '미설정';
  const stadium = STADIUMS.find((s) => s.id === stadiumId);
  return stadium?.name ?? stadiumId;
};
