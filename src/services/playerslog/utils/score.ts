export const formatScore = (homeScore: number, awayScore: number): string => {
  return `${homeScore} : ${awayScore}`;
};

export const getWinner = (
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): string | null => {
  if (homeScore > awayScore) return homeTeam;
  if (awayScore > homeScore) return awayTeam;
  return null; // 무승부
};

export const getScoreDiff = (homeScore: number, awayScore: number): number => {
  return Math.abs(homeScore - awayScore);
};

export const isCloseGame = (homeScore: number, awayScore: number): boolean => {
  return getScoreDiff(homeScore, awayScore) <= 2;
};

export const formatScoreWithTeams = (
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): string => {
  return `${awayTeam} ${awayScore} @ ${homeTeam} ${homeScore}`;
};
