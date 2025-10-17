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
import { Home, Forest } from "@mui/icons-material";
import MenuBar from "../../components/MenuBar";
import TreePost from "../../components/TreePost";
import { forestBackgrounds } from "../../lib/theme";
import prisma from "../../lib/prisma";
import Link from "next/link";
import { useState } from "react";

type Comment = {
  id: number;
  content: string;
  author: { id: number; name: string | null };
  replies: Comment[];
};

type Post = {
  id: number;
  content: string;
  author: { id: number; name: string | null };
  comments: Comment[];
  forest: { id: number; name: string } | null;
  createdAt: string;
};

type Props = {
  post: Post;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string | null } | null;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export default function PostPage({
  post,
  isLoggedIn,
  currentUser,
  darkMode,
  setDarkMode,
}: Props) {
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});

  const handleReplySubmit = async (
    postId: number,
    parentId: number | null,
    content: string
  ) => {
    if (!content.trim()) return;

    try {
      const res = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content, parentId }),
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

  return (
    <>
      <MenuBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
      />

      {/* Forest Background */}
      <Box
        className="forest-background"
        sx={{
          minHeight: "100vh",
          background: darkMode
            ? forestBackgrounds.deepWoods
            : forestBackgrounds.sunnyMeadow,
          backgroundAttachment: "fixed",
          position: "relative",
          "&::before": darkMode
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
              color: darkMode ? "#B8D4B8" : "#558B2F",
              "& .MuiBreadcrumbs-separator": {
                color: darkMode ? "#B8D4B8" : "#558B2F",
              },
            }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <MuiLink
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: darkMode ? "#B8D4B8" : "#558B2F",
                  cursor: "pointer",
                  "&:hover": {
                    color: darkMode ? "#E8F5E8" : "#2E7D32",
                  },
                }}
              >
                <Home fontSize="small" />
                Home
              </MuiLink>
            </Link>
            {post.forest && (
              <Link
                href={`/?forest=${post.forest.id}`}
                style={{ textDecoration: "none" }}
              >
                <MuiLink
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: darkMode ? "#B8D4B8" : "#558B2F",
                    cursor: "pointer",
                    "&:hover": {
                      color: darkMode ? "#E8F5E8" : "#2E7D32",
                    },
                  }}
                >
                  <Forest fontSize="small" />
                  {post.forest.name}
                </MuiLink>
              </Link>
            )}
            <Typography
              sx={{
                color: darkMode ? "#E8F5E8" : "#1B5E20",
                fontWeight: 600,
              }}
            >
              Tree #{post.id}
            </Typography>
          </Breadcrumbs>

          {/* Post */}
          <TreePost
            id={post.id}
            content={post.content}
            author={post.author}
            comments={post.comments}
            isLoggedIn={isLoggedIn}
            onReply={handleReplySubmit}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
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
              color: darkMode ? "#B8D4B8" : "#558B2F",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 400,
              fontStyle: "italic",
              textAlign: "right",
              textShadow: darkMode
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
> = async (context) => {
  const postId = Number(context.params?.id);

  if (!postId || isNaN(postId)) {
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
      select: { id: true, name: true },
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
        author: {
          select: { id: true, name: true },
        },
        forest: {
          select: { id: true, name: true },
        },
        comments: {
          select: {
            id: true,
            content: true,
            // @ts-ignore
            parentId: true,
            createdAt: true,
            author: {
              select: { id: true, name: true },
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
      const commentMap = new Map<number, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comment objects
      comments.forEach((comment) => {
        commentMap.set(comment.id, {
          id: comment.id,
          content: comment.content,
          author: comment.author,
          replies: [],
        });
      });

      // Second pass: build the tree
      comments.forEach((comment) => {
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
        darkMode: false,
      },
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { notFound: true };
  }
};
