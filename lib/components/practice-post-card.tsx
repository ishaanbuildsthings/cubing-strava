"use client";

import { useState } from "react";
import { type IPracticePost } from "@/lib/transforms/post";
import { EVENT_MAP, type CubeEvent } from "@/lib/cubing/events";
import { EventIcon } from "@/lib/components/event-icon";
import { UserAvatar } from "@/lib/components/user-avatar";
import { formatTime, timeAgo } from "@/lib/cubing/format";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";

interface PracticePostCardProps {
  post: IPracticePost & { liked: boolean };
}

export function PracticePostCard({ post }: PracticePostCardProps) {
  const eventConfig = EVENT_MAP[post.eventName as CubeEvent];

  const highlights: { label: string; value: number }[] = [];
  if (post.bestSingle !== null) highlights.push({ label: "Single", value: post.bestSingle });
  if (post.bestAo5 !== null) highlights.push({ label: "Ao5", value: post.bestAo5 });
  if (post.bestAo12 !== null) highlights.push({ label: "Ao12", value: post.bestAo12 });
  if (post.bestAo100 !== null) highlights.push({ label: "Ao100", value: post.bestAo100 });
  if (post.sessionMean !== null) highlights.push({ label: "Mean", value: post.sessionMean });

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Header — user + event + timestamp */}
      <div className="flex items-center gap-3 px-5 py-4">
        <UserAvatar user={post.user} size="sm" rounded="full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{post.user.username}</span>
            <span className="text-muted-foreground text-xs shrink-0">{timeAgo(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {eventConfig && <EventIcon event={eventConfig} size={16} />}
            <span>{eventConfig?.name ?? post.eventName}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{post.numSolves} solve{post.numSolves !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Stat highlights */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-px bg-border mx-5 mb-4 rounded-lg overflow-hidden">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex flex-col items-center gap-1 bg-muted/50 px-3 py-3"
            >
              <span className="font-mono tabular-nums text-base font-bold">
                {formatTime(h.value)}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {h.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Footer — like + comment buttons */}
      <LikeButton postId={post.id} liked={post.liked} numLikes={post.numLikes} />
    </div>
  );
}

function LikeButton({ postId, liked, numLikes }: { postId: string; liked: boolean; numLikes: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(numLikes);

  const invalidateFeed = () =>
    queryClient.invalidateQueries({ queryKey: trpc.post.getFeed.queryKey() });

  const like = useMutation(trpc.post.likePost.mutationOptions({
    onMutate: () => { setOptimisticLiked(true); setOptimisticCount((c) => c + 1); },
    onError: () => { setOptimisticLiked(false); setOptimisticCount((c) => c - 1); },
    onSuccess: invalidateFeed,
  }));
  const unlike = useMutation(trpc.post.unlikePost.mutationOptions({
    onMutate: () => { setOptimisticLiked(false); setOptimisticCount((c) => c - 1); },
    onError: () => { setOptimisticLiked(true); setOptimisticCount((c) => c + 1); },
    onSuccess: invalidateFeed,
  }));

  const isPending = like.isPending || unlike.isPending;

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-t border-border">
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          optimisticLiked
            ? "text-red-500"
            : "text-muted-foreground hover:text-red-500 hover:bg-muted"
        }`}
        disabled={isPending}
        onClick={() => optimisticLiked ? unlike.mutate({ postId }) : like.mutate({ postId })}
      >
        <Heart className={`w-4 h-4 ${optimisticLiked ? "fill-current" : ""}`} />
        <span>{optimisticCount}</span>
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <MessageCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
