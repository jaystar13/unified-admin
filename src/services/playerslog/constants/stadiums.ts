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
    homeTeams: ['두산 베어스', 'LG 트윈스'],
  },
  {
    id: 'gocheok',
    name: '고척스카이돔',
    shortName: '고척',
    city: '서울',
    capacity: 16813,
    homeTeams: ['키움 히어로즈'],
  },
  {
    id: 'incheon',
    name: '인천SSG랜더스필드',
    shortName: '문학',
    city: '인천',
    capacity: 23000,
    homeTeams: ['SSG 랜더스'],
  },
  {
    id: 'suwon',
    name: '수원KT위즈파크',
    shortName: '수원',
    city: '수원',
    capacity: 20000,
    homeTeams: ['KT 위즈'],
  },
  {
    id: 'daegu',
    name: '대구삼성라이온즈파크',
    shortName: '대구',
    city: '대구',
    capacity: 24000,
    homeTeams: ['삼성 라이온즈'],
  },
  {
    id: 'gwangju',
    name: '광주기아챔피언스필드',
    shortName: '광주',
    city: '광주',
    capacity: 27000,
    homeTeams: ['KIA 타이거즈'],
  },
  {
    id: 'daejeon',
    name: '한화생명이글스파크',
    shortName: '대전',
    city: '대전',
    capacity: 13000,
    homeTeams: ['한화 이글스'],
  },
  {
    id: 'changwon',
    name: '창원NC파크',
    shortName: '창원',
    city: '창원',
    capacity: 22000,
    homeTeams: ['NC 다이노스'],
  },
  {
    id: 'sajik',
    name: '사직야구장',
    shortName: '사직',
    city: '부산',
    capacity: 24500,
    homeTeams: ['롯데 자이언츠'],
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
