import { createAction, createReducer } from 'redux-act';

import { ArticleContentJSON } from '@ridi/ridi-prosemirror-editor/dist/esm/article';

import { FetchStatusFlag } from 'app/constants';
import { ArticleResponse, AuthorResponse } from 'app/services/article/requests';
import { ArticleRequestQueries, DateDTO } from 'app/types';
import { getArticleKeyFromData } from 'app/utils/utils';
import { Method } from 'axios';

export const Actions = {
  loadArticleRequest: createAction<{
    channelName: string;
    contentIndex: number;
    requestQueries?: ArticleRequestQueries;
  }>('loadArticleDetailRequest'),
  loadArticleSuccess: createAction<{
    channelName: string;
    contentIndex: number;
    articleResponse: Article;
  }>('loadArticleDetailSuccess'),
  loadArticleFailure: createAction<{
    channelName: string;
    contentIndex: number;
  }>('loadArticleDetailFailure'),
  updateArticleContent: createAction<{
    channelName: string;
    contentIndex: number;
    content?: ArticleContent;
  }>('updateArticleContent'),
  updateArticles: createAction<{
    articles: ArticleResponse[];
  }>('updateArticles'),
  updateFavoriteArticleStatus: createAction<{
    channelName: string;
    contentIndex: number;
    isFavorite: boolean;
  }>('updateFavoriteArticleStatus'),
  favoriteArticleActionRequest: createAction<{
    articleId: number;
    method: Method;
  }>('favoriteArticleActionRequest'),
};

export interface ArticleContent {
  json: ArticleContentJSON;
}

export interface Article {
  id: number;
  title: string;
  regDate: DateDTO;
  publishDate: DateDTO;
  lastModified: DateDTO;
  channelId: number;
  channelName: string;
  contentId: number;
  url: string;
  thumbnailUrl: string;
  isTeaser?: boolean;
  authorId?: number;
  authors?: AuthorResponse[];
  isFavorite?: boolean;
  isEnabled?: boolean;
  favoritesCount?: number;
}

export interface ArticleItemState {
  article?: Article;
  content?: ArticleContent;
  recommendedArticles?: Article[];
  contentFetchStatus: FetchStatusFlag;
}

export interface ArticlesState {
  [contentKey: string]: ArticleItemState;
}

export const INITIAL_ARTICLE_STATE: ArticlesState = {};

export const articleReducer = createReducer<typeof INITIAL_ARTICLE_STATE>(
  {},
  INITIAL_ARTICLE_STATE,
);

articleReducer.on(Actions.loadArticleRequest, (state, action) => {
  const { channelName, contentIndex } = action;
  const contentKey = `@${channelName}/${contentIndex}`;

  return {
    ...state,
    [contentKey]: {
      ...state[contentKey],
      contentFetchStatus: FetchStatusFlag.FETCHING,
    },
  };
});

articleReducer.on(Actions.loadArticleSuccess, (state, action) => {
  const { channelName, contentIndex, articleResponse } = action;
  const contentKey = `@${channelName}/${contentIndex}`;

  return {
    ...state,
    [contentKey]: {
      ...state[contentKey],
      article: state[contentKey]
        ? { ...state[contentKey].article, ...articleResponse }
        : articleResponse,
      contentFetchStatus: FetchStatusFlag.IDLE,
    },
  };
});

articleReducer.on(Actions.loadArticleFailure, (state, action) => {
  const { channelName, contentIndex } = action;
  const contentKey = `@${channelName}/${contentIndex}`;

  return {
    ...state,
    [contentKey]: {
      ...state[contentKey],
      contentFetchStatus: FetchStatusFlag.FETCH_ERROR,
    },
  };
});

articleReducer.on(Actions.updateArticleContent, (state, action) => {
  const { channelName, contentIndex, content } = action;
  const contentKey = `@${channelName}/${contentIndex}`;

  return {
    ...state,
    [contentKey]: {
      ...state[contentKey],
      contentFetchStatus: FetchStatusFlag.IDLE,
      content,
    },
  };
});

articleReducer.on(Actions.updateArticles, (state, action) => {
  const { articles = [] } = action;
  const newState: ArticlesState = articles.reduce((prev, article) => {
    const contentKey = getArticleKeyFromData(article);
    const { channel, content, ...restData } = article;
    prev[contentKey] = {
      ...state[contentKey],
      article: state[contentKey] ? { ...state[contentKey].article, ...restData } : restData,
    };
    return prev;
  }, state);
  return newState;
});

articleReducer.on(Actions.updateFavoriteArticleStatus, (state, action) => {
  const { channelName, contentIndex, isFavorite } = action;
  const contentKey = `@${channelName}/${contentIndex}`;
  let favoritesCount;

  if (typeof state[contentKey].article!.favoritesCount === 'number') {
    favoritesCount = isFavorite
      ? state[contentKey].article!.favoritesCount! + 1
      : state[contentKey].article!.favoritesCount! - 1;
  }

  return {
    ...state,
    [contentKey]: {
      ...state[contentKey],
      article: {
        ...state[contentKey].article!,
        isFavorite,
        favoritesCount,
      },
    },
  };
});
