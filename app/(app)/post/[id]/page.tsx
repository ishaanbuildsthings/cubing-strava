"use client";

import { useParams } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PracticePostCard } from "@/lib/components/practice-post-card";
import { CubeLoader } from "@/lib/components/cube-loader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();

  const { data: post, isLoading, error } = useQuery(
    trpc.post.getPost.queryOptions({ postId: id })
  );

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <CubeLoader message="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl border-x border-border bg-card min-h-full">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <Link href="/home" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-semibold">Post</span>
        </div>
        <div className="border-b border-border">
          <PracticePostCard post={post} />
        </div>
      </div>
    </div>
  );
}
