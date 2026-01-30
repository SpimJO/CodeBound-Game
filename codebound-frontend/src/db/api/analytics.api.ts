import xior from "@/http/xior";

export interface DownloadCountResponse {
  totalDownloads: number;
}

export interface PlayerStatsResponse {
  totalPlayers: number;
}

// Get download count (public)
export const getDownloadCount = async (): Promise<DownloadCountResponse> => {
  const { data } = await xior.get(`/api/v1/downloads/count`);
  return data.data;
};

// Increment download counter (public)
export const incrementDownload = async (): Promise<DownloadCountResponse> => {
  const { data } = await xior.post(`/api/v1/downloads/increment`);
  return data.data;
};

// Get total players (public)
export const getPlayerStats = async (): Promise<PlayerStatsResponse> => {
  const { data} = await xior.get(`/api/v1/stats/players`);
  return data.data;
};
