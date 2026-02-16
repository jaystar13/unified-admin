export interface KboTeam {
  id: string;
  name: string;
  shortName: string;
  englishName: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  city: string;
  stadium: string;
}

export const KBO_TEAMS: KboTeam[] = [
  {
    id: 'samsung',
    name: '삼성 라이온즈',
    shortName: '삼성',
    englishName: 'Samsung Lions',
    primaryColor: '#074CA1',
    secondaryColor: '#FFFFFF',
    city: '대구',
    stadium: '대구삼성라이온즈파크',
  },
  {
    id: 'doosan',
    name: '두산 베어스',
    shortName: '두산',
    englishName: 'Doosan Bears',
    primaryColor: '#131230',
    secondaryColor: '#ED1C24',
    city: '서울',
    stadium: '잠실야구장',
  },
  {
    id: 'lg',
    name: 'LG 트윈스',
    shortName: 'LG',
    englishName: 'LG Twins',
    primaryColor: '#C30452',
    secondaryColor: '#000000',
    city: '서울',
    stadium: '잠실야구장',
  },
  {
    id: 'kiwoom',
    name: '키움 히어로즈',
    shortName: '키움',
    englishName: 'Kiwoom Heroes',
    primaryColor: '#820024',
    secondaryColor: '#000000',
    city: '서울',
    stadium: '고척스카이돔',
  },
  {
    id: 'kia',
    name: 'KIA 타이거즈',
    shortName: 'KIA',
    englishName: 'KIA Tigers',
    primaryColor: '#EA0029',
    secondaryColor: '#000000',
    city: '광주',
    stadium: '광주기아챔피언스필드',
  },
  {
    id: 'kt',
    name: 'KT 위즈',
    shortName: 'KT',
    englishName: 'KT Wiz',
    primaryColor: '#000000',
    secondaryColor: '#EB1C2D',
    city: '수원',
    stadium: '수원KT위즈파크',
  },
  {
    id: 'ssg',
    name: 'SSG 랜더스',
    shortName: 'SSG',
    englishName: 'SSG Landers',
    primaryColor: '#CE0E2D',
    secondaryColor: '#FFD700',
    city: '인천',
    stadium: '인천SSG랜더스필드',
  },
  {
    id: 'nc',
    name: 'NC 다이노스',
    shortName: 'NC',
    englishName: 'NC Dinos',
    primaryColor: '#315288',
    secondaryColor: '#C6AA76',
    city: '창원',
    stadium: '창원NC파크',
  },
  {
    id: 'lotte',
    name: '롯데 자이언츠',
    shortName: '롯데',
    englishName: 'Lotte Giants',
    primaryColor: '#041E42',
    secondaryColor: '#D00F31',
    city: '부산',
    stadium: '사직야구장',
  },
  {
    id: 'hanwha',
    name: '한화 이글스',
    shortName: '한화',
    englishName: 'Hanwha Eagles',
    primaryColor: '#FF6600',
    secondaryColor: '#000000',
    city: '대전',
    stadium: '한화생명이글스파크',
  },
];

export const getTeamById = (id: string): KboTeam | undefined => {
  return KBO_TEAMS.find((team) => team.id === id);
};

export const getTeamByName = (name: string): KboTeam | undefined => {
  return KBO_TEAMS.find(
    (team) => team.name === name || team.shortName === name
  );
};
