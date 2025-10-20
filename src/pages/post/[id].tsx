import { GetServerSideProps } from "next";
import { parse } from "cookie";
import { verifyToken } from "../../lib/auth";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Home, Forest } from "@mui/icons-material";
import MenuBar from "../../components/MenuBar";
import TreePost from "../../components/TreePost";
import { forestBackgrounds } from "../../lib/theme";
import prisma from "../../lib/prisma";
import Link from "next/link";
import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
  replies: Comment[];
  imageUrl?: string | null;
  deletedAt?: string | null;
};

type Post = {
  id: string;
  content: string;
  author: { id: string; name: string | null };
  comments: Comment[];
  forest: { id: string; name: string } | null;
  createdAt: string;
  imageUrl?: string | null;
};

type Props = {
  post: Post;
  isLoggedIn: boolean;
  currentUser: { id: string; name: string | null; avatar?: string } | null;
  setDarkMode: (value: boolean) => void;
};

export default function PostPage({
  post,
  isLoggedIn,
  currentUser,
  setDarkMode,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [currentPost, setCurrentPost] = useState<Post>(post);

  const handleReplySubmit = async (
    postId: string,
    parentId: string | null,
    content: string,
    imageUrl?: string | null
  ) => {
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content, parentId, imageUrl }),
      });

      if (res.ok) {
        // Reload page to show new comment
        window.location.reload();
      } else {
        console.error("Comment creation failed:", await res.json());
        alert("Failed to add comment. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    // TODO: Implement comment editing
    console.log("Edit comment:", commentId, newContent);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/comments/delete?commentId=${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the comment from the UI optimistically
        setCurrentPost(prevPost => ({
          ...prevPost,
          comments: removeCommentFromTree(prevPost.comments, commentId),
        }));
      } else {
        const error = await response.json();
        console.error("Delete comment error:", error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      // You could show a toast notification here
    }
  };

  // Helper function to remove a comment from the comment tree
  const removeCommentFromTree = (
    comments: Comment[],
    commentId: string
  ): Comment[] => {
    return comments
      .filter(comment => comment.id !== commentId)
      .map(comment => ({
        ...comment,
        replies: comment.replies
          ? removeCommentFromTree(comment.replies, commentId)
          : [],
      }));
  };

  return (
    <>
      <MenuBar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        currentForestId={post.forest?.id || null}
        currentForestName={post.forest?.name || null}
      />

      {/* Forest Background */}
      <Box
        className="forest-background"
        sx={{
          minHeight: "100vh",
          background: isDark
            ? forestBackgrounds.deepWoods
            : forestBackgrounds.sunnyMeadow,
          backgroundAttachment: "fixed",
          position: "relative",
          "&::before": isDark
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
              radial-gradient(ellipse at 20% 80%, rgba(0, 0, 0, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)
            `,
                pointerEvents: "none",
              }
            : {},
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            py: 4,
            position: "relative",
            zIndex: 1,
            pl: { xs: 2, md: 4, lg: 6 }, // Small left margin, left-aligned
            pr: { xs: 2, md: 4 },
            maxWidth: "1400px", // Limit max width but allow left alignment
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs
            sx={{
              mb: 3,
              color: isDark ? "#B8D4B8" : "#558B2F",
              "& .MuiBreadcrumbs-separator": {
                color: isDark ? "#B8D4B8" : "#558B2F",
              },
            }}
          >
            <MuiLink
              component={Link}
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: isDark ? "#B8D4B8" : "#558B2F",
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": {
                  color: isDark ? "#E8F5E8" : "#2E7D32",
                },
              }}
            >
              <Home fontSize="small" />
              Home
            </MuiLink>
            {post.forest && (
              <MuiLink
                component={Link}
                href={`/?forest=${encodeURIComponent(post.forest.name)}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: isDark ? "#B8D4B8" : "#558B2F",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    color: isDark ? "#E8F5E8" : "#2E7D32",
                  },
                }}
              >
                <Forest fontSize="small" />
                {post.forest.name}
              </MuiLink>
            )}
            <Typography
              sx={{
                color: isDark ? "#E8F5E8" : "#1B5E20",
                fontWeight: 600,
              }}
            >
              Tree
            </Typography>
          </Breadcrumbs>

          {/* Post */}
          <TreePost
            id={currentPost.id}
            content={currentPost.content}
            author={currentPost.author}
            comments={currentPost.comments}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUser?.id}
            imageUrl={currentPost.imageUrl}
            createdAt={currentPost.createdAt}
            onReply={handleReplySubmit}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            initialCollapsed={false}
            disableTreeCollapse={true}
          />
        </Container>

        {/* Tagline - Bottom Right */}
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 100,
            maxWidth: "300px",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isDark ? "#B8D4B8" : "#558B2F",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 400,
              fontStyle: "italic",
              textAlign: "right",
              textShadow: isDark
                ? "1px 1px 3px rgba(0, 0, 0, 0.8)"
                : "1px 1px 2px rgba(255, 255, 255, 0.8)",
              opacity: 0.8,
            }}
          >
            Where thoughts grow like mighty trees and conversations branch
            outward
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Omit<Props, "setDarkMode">
> = async context => {
  const postId = context.params?.id as string;

  if (!postId || typeof postId !== "string" || postId.trim().length === 0) {
    return { notFound: true };
  }

  const cookies = parse(context.req.headers.cookie || "");
  const token = cookies.authToken;
  const decodedUser = token ? verifyToken(token) : null;

  // Fetch current user details if logged in
  let currentUser = null;
  if (decodedUser) {
    const userRecord = await prisma.user.findUnique({
      where: { id: decodedUser.userId },
      select: { id: true, name: true, avatar: true },
    });
    currentUser = userRecord;
  }

  try {
    // Fetch the post with all comments
    const post: any = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        imageUrl: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
        forest: {
          select: { id: true, name: true },
        },
        comments: {
          where: { deletedAt: null },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            // @ts-ignore
            parentId: true,
            createdAt: true,
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      return { notFound: true };
    }

    // Recursive function to build nested comment tree
    const buildCommentTree = (comments: any[]): Comment[] => {
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comment objects
      comments.forEach(comment => {
        commentMap.set(comment.id, {
          id: comment.id,
          content: comment.content,
          author: comment.author,
          replies: [],
          imageUrl: comment.imageUrl || null,
        });
      });

      // Second pass: build the tree
      comments.forEach(comment => {
        const commentNode = commentMap.get(comment.id)!;
        if (comment.parentId === null) {
          rootComments.push(commentNode);
        } else {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentNode);
          } else {
            // If parent not found, treat as root
            rootComments.push(commentNode);
          }
        }
      });

      return rootComments;
    };

    const postWithComments = {
      ...post,
      comments: buildCommentTree(post.comments),
    };

    return {
      props: {
        post: JSON.parse(JSON.stringify(postWithComments)),
        isLoggedIn: !!decodedUser,
        currentUser: currentUser
          ? JSON.parse(JSON.stringify(currentUser))
          : null,
        isDark: false,
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { notFound: true };
  }
};
