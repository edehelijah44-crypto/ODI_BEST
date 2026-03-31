import { useQueryClient } from "@tanstack/react-query";
import { 
  useListPosts as useRealListPosts,
  useCreatePost as useRealCreatePost,
  useUpdatePost as useRealUpdatePost,
  useDeletePost as useRealDeletePost,
  usePublishPost as useRealPublishPost,
  useListPlatforms as useRealListPlatforms,
  useConnectPlatform as useRealConnectPlatform,
  useDisconnectPlatform as useRealDisconnectPlatform,
  useGetAnalytics as useRealGetAnalytics,
  useGetPostAnalytics as useRealGetPostAnalytics,
  useGetProfile as useRealGetProfile,
  useUpdateProfile as useRealUpdateProfile,
  getListPostsQueryKey,
  getListPlatformsQueryKey,
  getGetAnalyticsQueryKey,
  getGetProfileQueryKey,
  type ListPostsParams,
  type GetAnalyticsParams,
  type GetPostAnalyticsParams
} from "@workspace/api-client-react";
import { useAuth } from "./use-auth";
import { 
  MOCK_POSTS, 
  MOCK_PLATFORMS, 
  MOCK_ANALYTICS, 
  MOCK_POST_ANALYTICS, 
  MOCK_PROFILE 
} from "@/lib/mock-data";

// === POSTS ===
export function usePosts(params?: ListPostsParams) {
  const { demoMode } = useAuth();
  const realQuery = useRealListPosts(params, { query: { enabled: !demoMode } });
  
  if (demoMode) {
    let filtered = MOCK_POSTS;
    if (params?.status) filtered = filtered.filter(p => p.status === params.status);
    return { data: { posts: filtered, total: filtered.length }, isLoading: false, isError: false };
  }
  return realQuery;
}

export function useCreatePost() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealCreatePost({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPostsQueryKey() }) }});
  
  if (demoMode) {
    return {
      mutate: (data: any, options: any) => {
        setTimeout(() => options?.onSuccess?.(data.data), 500);
      },
      isPending: false
    } as any;
  }
  return realMut;
}

export function useUpdatePost() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealUpdatePost({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPostsQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 500), isPending: false } as any;
  return realMut;
}

export function useDeletePost() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealDeletePost({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPostsQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 500), isPending: false } as any;
  return realMut;
}

export function usePublishPost() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealPublishPost({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPostsQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 1000), isPending: false } as any;
  return realMut;
}

// === PLATFORMS ===
export function usePlatforms() {
  const { demoMode } = useAuth();
  const realQuery = useRealListPlatforms({ query: { enabled: !demoMode } });
  if (demoMode) return { data: MOCK_PLATFORMS, isLoading: false, isError: false };
  return realQuery;
}

export function useConnectPlatform() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealConnectPlatform({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPlatformsQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 500), isPending: false } as any;
  return realMut;
}

export function useDisconnectPlatform() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealDisconnectPlatform({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPlatformsQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 500), isPending: false } as any;
  return realMut;
}

// === ANALYTICS ===
export function useAnalytics(params?: GetAnalyticsParams) {
  const { demoMode } = useAuth();
  const realQuery = useRealGetAnalytics(params, { query: { enabled: !demoMode } });
  if (demoMode) return { data: MOCK_ANALYTICS, isLoading: false, isError: false };
  return realQuery;
}

export function usePostAnalytics(params?: GetPostAnalyticsParams) {
  const { demoMode } = useAuth();
  const realQuery = useRealGetPostAnalytics(params, { query: { enabled: !demoMode } });
  if (demoMode) return { data: MOCK_POST_ANALYTICS, isLoading: false, isError: false };
  return realQuery;
}

// === PROFILE ===
export function useProfile() {
  const { demoMode } = useAuth();
  const realQuery = useRealGetProfile({ query: { enabled: !demoMode } });
  if (demoMode) return { data: MOCK_PROFILE, isLoading: false, isError: false };
  return realQuery;
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { demoMode } = useAuth();
  const realMut = useRealUpdateProfile({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetProfileQueryKey() }) }});
  if (demoMode) return { mutate: (data: any, opts: any) => setTimeout(() => opts?.onSuccess?.(), 500), isPending: false } as any;
  return realMut;
}
