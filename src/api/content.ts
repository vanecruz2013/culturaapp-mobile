import { api } from './client';

export type ContentType = 'MOVIE' | 'BOOK' | 'SERIES' | 'MUSIC_ARTIST' | 'MUSIC_ALBUM' | 'MUSIC_TRACK';
export type ContentStatus =
  | 'WATCHED' | 'WANT_TO_WATCH'
  | 'READ' | 'READING' | 'WANT_TO_READ'
  | 'WATCHING' | 'FAVORITE';

export interface ContentItem {
  externalId: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  creator?: string;
  year?: number;
  genre?: string;
  coverUrl?: string;
  synopsis?: string;
  rating?: number;
  runtime?: number;
  pageCount?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}

export interface UserContentEntry {
  id: string;
  contentId: string;
  status: ContentStatus;
  rating?: number;
  review?: string;
  isFavorite: boolean;
  progressValue?: number;
  progressTotal?: number;
  dateStarted?: string;
  dateFinished?: string;
  content: ContentItem & { id: string };
}

export const contentApi = {
  search: (q: string, type?: string, page = 1) =>
    api.get('/content/search', { params: { q, type, page } }).then((r) => r.data),

  getDetail: (type: string, externalId: string) =>
    api.get(`/content/${type}/${externalId}`).then((r) => r.data),
};

export const userContentApi = {
  getMyList: (params?: { type?: ContentType; status?: ContentStatus; page?: number }) =>
    api.get<{ items: UserContentEntry[]; total: number; totalPages: number }>('/user-content', { params }).then((r) => r.data),

  upsert: (payload: {
    contentId: string;
    status: ContentStatus;
    rating?: number;
    review?: string;
    isFavorite?: boolean;
    progressValue?: number;
    progressTotal?: number;
    dateStarted?: string;
    dateFinished?: string;
  }) => api.post<UserContentEntry>('/user-content', payload).then((r) => r.data),

  remove: (contentId: string) =>
    api.delete(`/user-content/${contentId}`).then((r) => r.data),
};
