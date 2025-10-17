import { GetServerSideProps } from "next";
import { parse } from "cookie";
import { verifyToken } from "../lib/auth";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { Send, Forest, Nature } from "@mui/icons-material";
import MenuBar from "../components/MenuBar";
import TreePost from "../components/TreePost";
import { forestBackgrounds } from "../lib/theme";
import prisma from "../lib/prisma";

type Comment = {
  id: number;
  content: string;
  author: { id: number; name: string | null };
  replies?: Comment[];
};

type Post = {
  id: number;
  content: string;
  author: { id: number; name: string | null };
  comments: Comment[];
  location?: { lat: number; lon: number };
};

type Props = {
  isLoggedIn: boolean;
  currentUser: { id: number; name: string | null } | null;
  nearbyPosts: Post[];
  allPosts: Post[];
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  initialCity: string;
  initialLat: number;
  initialLon: number;
};

export default function Home({
  isLoggedIn,
  currentUser,
  nearbyPosts,
  allPosts,
  darkMode,
  setDarkMode,
  initialCity,
  initialLat,
  initialLon,
}: Props) {
  const [newPost, setNewPost] = useState("");
  const [userCity, setUserCity] = useState(initialCity);
  const [currentForestId, setCurrentForestId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>(allPosts);
  // Location-specific posting is temporarily disabled; we'll re-introduce later
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({}); // Reply input per post

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address.city || data.address.town || "Unknown";
            setUserCity(city);
          } catch (error) {
            console.error("Geolocation fetch error:", error);
          }
        },
        (error) => {
          console.log("Geolocation denied:", error.message);
        }
      );
    }
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPost,
          location: null,
          forestId: currentForestId,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Post creation failed:", await res.json());
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    }
    setNewPost("");
  };

  const handleReplySubmit = async (
    postId: number,
    parentId: number | null,
    content: string
  ) => {
    if (!content.trim()) return;

    // Optimistic update - add comment immediately
    const tempComment: Comment = {
      id: Date.now(), // Temporary ID
      content,
      author: {
        id: currentUser?.id || 0,
        name: currentUser?.name || "You",
      },
      replies: [],
    };

    // Helper function to add comment to tree
    const addCommentToTree = (
      comments: Comment[],
      parentId: number | null
    ): Comment[] => {
      if (parentId === null) {
        // Top-level comment
        return [...comments, tempComment];
      }
      // Find parent and add as reply
      return comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), tempComment],
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addCommentToTree(comment.replies, parentId),
          };
        }
        return comment;
      });
    };

    // Update UI immediately
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: addCommentToTree(post.comments, parentId) }
          : post
      )
    );

    // Clear the input
    if (!parentId) {
      setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
    }

    // Send to server
    try {
      const res = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content, parentId }),
      });

      if (res.ok) {
        const newComment = await res.json();

        // Helper function to recursively replace temp comment with real one
        const replaceComment = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === tempComment.id) {
              return {
                ...newComment,
                replies: comment.replies || [],
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: replaceComment(comment.replies),
              };
            }
            return comment;
          });
        };

        // Update with real comment data
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: replaceComment(post.comments),
                }
              : post
          )
        );
      } else {
        console.error("Comment creation failed:", await res.json());
        // Revert optimistic update
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Revert optimistic update
      window.location.reload();
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
        {/* Floating Forest Particles */}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            className="forest-particle"
            sx={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}

        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            position: "relative",
            zIndex: 1,
            pl: { xs: 2, md: "8%", lg: "12%" }, // Position halfway between left and middle
            pr: { xs: 2, md: 3 },
          }}
        >
          {/* Tree Grove (Posts) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mx: "auto",
              maxWidth: "800px",
            }}
          >
            {posts.length > 0 ? (
              posts.map((post) => (
                <TreePost
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  author={post.author}
                  comments={post.comments}
                  isLoggedIn={isLoggedIn}
                  onReply={handleReplySubmit}
                  replyInputs={replyInputs}
                  setReplyInputs={setReplyInputs}
                />
              ))
            ) : (
              <Card
                sx={{
                  maxWidth: "500px",
                  mx: "auto",
                  backgroundColor: "rgba(26, 45, 26, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid #4A6741",
                  borderRadius: "16px",
                  textAlign: "center",
                  py: 6,
                }}
              >
                <CardContent>
                  <Nature sx={{ fontSize: 64, color: "#66BB6A", mb: 2 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#E8F5E8",
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    The Forest Awaits
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#B8D4B8",
                      lineHeight: 1.6,
                    }}
                  >
                    Be the first to plant a seed of conversation. Your thoughts
                    will grow into mighty trees that others can branch from.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Plant a New Tree (Post Creation) */}
          {isLoggedIn && (
            <Box sx={{ mt: 8, textAlign: "center" }}>
              <Card
                sx={{
                  maxWidth: "600px",
                  mx: "auto",
                  backgroundColor: "rgba(26, 45, 26, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid #4A6741",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#E8F5E8",
                      mb: 3,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Forest />
                    Plant a New Tree
                    <Forest />
                  </Typography>

                  <Box
                    component="form"
                    onSubmit={handlePostSubmit}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <TextField
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What wisdom would you like to share with the forest?"
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(15, 26, 15, 0.8)",
                          "& fieldset": {
                            borderColor: "#4A6741",
                            borderRadius: "12px",
                            borderWidth: "2px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#6B8B5A",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#66BB6A",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#E8F5E8",
                          fontSize: "1rem",
                          fontFamily: "'Quicksand', sans-serif",
                        },
                      }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!newPost.trim()}
                        sx={{
                          bgcolor: "#4A6741",
                          color: "#E8F5E8",
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: "25px",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "#6B8B5A",
                          },
                          "&:disabled": {
                            bgcolor: "#2E4A2E",
                            color: "#90A4AE",
                          },
                        }}
                      >
                        🌱 Plant Your Tree
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {!isLoggedIn && (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Card
                sx={{
                  maxWidth: "500px",
                  mx: "auto",
                  backgroundColor: "rgba(26, 45, 26, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid #4A6741",
                  borderRadius: "16px",
                  py: 6,
                }}
              >
                <CardContent>
                  <Nature sx={{ fontSize: 48, color: "#66BB6A", mb: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#E8F5E8",
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Join the Forest Community
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#B8D4B8",
                      lineHeight: 1.6,
                    }}
                  >
                    Log in to plant your first tree and watch your thoughts grow
                    into conversations.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
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

  const ip =
    context.req.headers["x-forwarded-for"] ||
    context.req.socket.remoteAddress ||
    "unknown";
  let initialCity = "Unknown";
  let initialLat = 0;
  let initialLon = 0;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    if (data.status === "success") {
      initialCity = data.city || "Unknown";
      initialLat = data.lat || 0;
      initialLon = data.lon || 0;
    }
  } catch (error) {
    console.error("IP geolocation error:", error);
  }

  const nearbyPosts = await prisma.$queryRaw`
    SELECT p.*, 
      json_build_object('name', a.name) as author,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', c.id,
              'content', c.content,
              'author', json_build_object('name', ca.name)
            )
            ORDER BY c."createdAt" ASC
          )
          FROM "Comment" c
          LEFT JOIN "User" ca ON c."authorId" = ca.id
          WHERE c."postId" = p.id
        ),
        '[]'::json
      ) as comments
    FROM "Post" p
    LEFT JOIN "User" a ON p."authorId" = a.id
    WHERE (
      6371 * acos(
        cos(radians(${initialLat})) * cos(radians((location->>'lat')::float)) *
        cos(radians((location->>'lon')::float) - radians(${initialLon})) +
        sin(radians(${initialLat})) * sin(radians((location->>'lat')::float))
      )
    ) <= 50
    ORDER BY p."createdAt" DESC
  `;
  console.log(`🚀🤗 ~ >= ~ nearbyPosts:`, nearbyPosts);

  // Recursive function to build nested comments
  const buildCommentTree = (
    comments: any[],
    parentId: number | null = null
  ): any[] => {
    return comments
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => ({
        ...comment,
        replies: buildCommentTree(comments, comment.id),
      }));
  };

  const postsWithComments = await prisma.post.findMany({
    include: {
      author: { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build nested comment structure for each post
  const allPosts = postsWithComments.map((post) => ({
    ...post,
    comments: buildCommentTree(post.comments),
  }));

  return {
    props: {
      isLoggedIn: !!decodedUser,
      currentUser: currentUser ? JSON.parse(JSON.stringify(currentUser)) : null,
      nearbyPosts: JSON.parse(JSON.stringify(nearbyPosts || [])),
      allPosts: JSON.parse(JSON.stringify(allPosts)),
      darkMode: false,
      initialCity,
      initialLat,
      initialLon,
    },
  };
};
