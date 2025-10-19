import { GetServerSideProps } from "next";
import { parse } from "cookie";
import { verifyToken } from "../../lib/auth";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import { Forest, Nature, Comment as CommentIcon } from "@mui/icons-material";
import MenuBar from "../../components/MenuBar";
import { forestBackgrounds } from "../../lib/theme";
import prisma from "../../lib/prisma";
import Link from "next/link";

type Props = {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  posts: Array<{
    id: number;
    content: string;
    createdAt: string;
    forest: { name: string } | null;
    _count: { comments: number };
  }>;
  comments: Array<{
    id: number;
    content: string;
    createdAt: string;
    post: {
      id: number;
      content: string;
      forest: { name: string } | null;
    };
  }>;
  forests: Array<{
    id: number;
    name: string;
    description: string | null;
    _count: { posts: number };
  }>;
  isLoggedIn: boolean;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export default function UserProfile({
  user,
  posts,
  comments,
  forests,
  isLoggedIn,
  darkMode,
  setDarkMode,
}: Props) {
  return (
    <>
      <MenuBar
        isLoggedIn={isLoggedIn}
        currentForestId={null}
        currentForestName={null}
      />

      <Box
        className="forest-background"
        sx={{
          minHeight: "100vh",
          background: forestBackgrounds.deepWoods,
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ py: 4, position: "relative", zIndex: 1 }}
        >
          {/* User Profile Header */}
          <Card
            sx={{
              mb: 4,
              backgroundColor: "rgba(26, 45, 26, 0.95)",
              backdropFilter: "blur(10px)",
              border: "2px solid #4A6741",
              borderRadius: "16px",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#4A6741",
                    fontSize: "2rem",
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#E8F5E8",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {user.name || "Anonymous Forester"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#B8D4B8",
                    }}
                  >
                    Forest Explorer
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<Forest />}
                  label={`${posts.length} Trees Planted`}
                  sx={{
                    bgcolor: "rgba(74, 103, 65, 0.3)",
                    color: "#E8F5E8",
                    borderColor: "#4A6741",
                  }}
                  variant="outlined"
                />
                <Chip
                  icon={<Nature />}
                  label={`${comments.length} Branches Grown`}
                  sx={{
                    bgcolor: "rgba(74, 103, 65, 0.3)",
                    color: "#E8F5E8",
                    borderColor: "#4A6741",
                  }}
                  variant="outlined"
                />
                <Chip
                  icon={<Forest />}
                  label={`${forests.length} Forests Created`}
                  sx={{
                    bgcolor: "rgba(74, 103, 65, 0.3)",
                    color: "#E8F5E8",
                    borderColor: "#4A6741",
                  }}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Settings Section - Only show for own profile */}
          {isLoggedIn && (
            <Card
              sx={{
                mb: 4,
                backgroundColor: "rgba(26, 45, 26, 0.95)",
                backdropFilter: "blur(10px)",
                border: "2px solid #4A6741",
                borderRadius: "16px",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#E8F5E8",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Forest />
                  Settings
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Theme Toggle */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: "rgba(74, 103, 65, 0.2)",
                      borderRadius: "8px",
                      border: "1px solid #4A6741",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#E8F5E8", fontWeight: 500 }}
                      >
                        Theme
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#B8D4B8" }}>
                        Choose your preferred theme
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant={!darkMode ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setDarkMode(false)}
                        sx={{
                          minWidth: "60px",
                          textTransform: "none",
                          bgcolor: !darkMode ? "#4A6741" : "transparent",
                          color: !darkMode ? "#E8F5E8" : "#B8D4B8",
                          borderColor: "#4A6741",
                          "&:hover": {
                            bgcolor: !darkMode
                              ? "#6B8B5A"
                              : "rgba(74, 103, 65, 0.2)",
                          },
                        }}
                      >
                        Light
                      </Button>
                      <Button
                        variant={darkMode ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setDarkMode(true)}
                        sx={{
                          minWidth: "60px",
                          textTransform: "none",
                          bgcolor: darkMode ? "#4A6741" : "transparent",
                          color: darkMode ? "#E8F5E8" : "#B8D4B8",
                          borderColor: "#4A6741",
                          "&:hover": {
                            bgcolor: darkMode
                              ? "#6B8B5A"
                              : "rgba(74, 103, 65, 0.2)",
                          },
                        }}
                      >
                        Dark
                      </Button>
                    </Box>
                  </Box>

                  {/* TODO: Add default forest setting */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: "rgba(74, 103, 65, 0.2)",
                      borderRadius: "8px",
                      border: "1px solid #4A6741",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#E8F5E8", fontWeight: 500 }}
                      >
                        Default Forest
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#B8D4B8" }}>
                        Choose your default forest view
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B8D4B8", fontStyle: "italic" }}
                    >
                      Coming soon
                    </Typography>
                  </Box>

                  {/* TODO: Add menu bar forest selection */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: "rgba(74, 103, 65, 0.2)",
                      borderRadius: "8px",
                      border: "1px solid #4A6741",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#E8F5E8", fontWeight: 500 }}
                      >
                        Menu Bar Forests
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#B8D4B8" }}>
                        Choose which forests appear in the menu bar
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B8D4B8", fontStyle: "italic" }}
                    >
                      Coming soon
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Forests Created */}
          {forests.length > 0 && (
            <Card
              sx={{
                mb: 4,
                backgroundColor: "rgba(26, 45, 26, 0.95)",
                backdropFilter: "blur(10px)",
                border: "2px solid #4A6741",
                borderRadius: "16px",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#E8F5E8",
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Forest /> Forests Created
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {forests.map(forest => (
                    <Box
                      key={forest.id}
                      sx={{
                        p: 2,
                        bgcolor: "rgba(15, 26, 15, 0.6)",
                        borderRadius: "8px",
                        border: "1px solid #2E4A2E",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "#66BB6A", fontWeight: 600 }}
                      >
                        {forest.name}
                      </Typography>
                      {forest.description && (
                        <Typography
                          variant="body2"
                          sx={{ color: "#B8D4B8", mt: 0.5 }}
                        >
                          {forest.description}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: "#90A4AE", mt: 1, display: "block" }}
                      >
                        {forest._count.posts} trees planted
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Recent Trees (Posts) */}
          <Card
            sx={{
              mb: 4,
              backgroundColor: "rgba(26, 45, 26, 0.95)",
              backdropFilter: "blur(10px)",
              border: "2px solid #4A6741",
              borderRadius: "16px",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#E8F5E8",
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Forest /> Recent Trees
              </Typography>
              {posts.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {posts.map(post => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(15, 26, 15, 0.6)",
                          borderRadius: "8px",
                          border: "1px solid #2E4A2E",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "rgba(74, 103, 65, 0.2)",
                            borderColor: "#4A6741",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "#E8F5E8", mb: 1 }}
                        >
                          {post.content}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#90A4AE" }}
                          >
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Typography>
                          {post.forest && (
                            <Chip
                              label={post.forest.name}
                              size="small"
                              sx={{
                                bgcolor: "rgba(74, 103, 65, 0.3)",
                                color: "#B8D4B8",
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{ color: "#B8D4B8" }}
                          >
                            {post._count.comments} branches
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#B8D4B8" }}>
                  No trees planted yet
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent Branches (Comments) */}
          <Card
            sx={{
              mb: 4,
              backgroundColor: "rgba(26, 45, 26, 0.95)",
              backdropFilter: "blur(10px)",
              border: "2px solid #4A6741",
              borderRadius: "16px",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#E8F5E8",
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Nature /> Recent Branches
              </Typography>
              {comments.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {comments.map(comment => (
                    <Link
                      key={comment.id}
                      href={`/post/${comment.post.id}#comment-${comment.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(15, 26, 15, 0.6)",
                          borderRadius: "8px",
                          border: "1px solid #2E4A2E",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "rgba(74, 103, 65, 0.2)",
                            borderColor: "#4A6741",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "#E8F5E8", mb: 1 }}
                        >
                          {comment.content}
                        </Typography>
                        <Divider sx={{ my: 1, borderColor: "#2E4A2E" }} />
                        <Typography
                          variant="caption"
                          sx={{ color: "#90A4AE", fontStyle: "italic" }}
                        >
                          On: {comment.post.content.substring(0, 60)}
                          {comment.post.content.length > 60 ? "..." : ""}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#90A4AE" }}
                          >
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                          {comment.post.forest && (
                            <Chip
                              label={comment.post.forest.name}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: "rgba(74, 103, 65, 0.3)",
                                color: "#B8D4B8",
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Link>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#B8D4B8" }}>
                  No branches grown yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Omit<Props, "setDarkMode">
> = async context => {
  const userId = context.params?.id as string;

  if (!userId) {
    return { notFound: true };
  }

  const cookies = parse(context.req.headers.cookie || "");
  const token = cookies.authToken;
  const currentUser = token ? verifyToken(token) : null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return { notFound: true };
    }

    // @ts-ignore - Prisma types may need regeneration
    const [posts, comments, forests] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          // @ts-ignore
          createdAt: true,
          // @ts-ignore
          forest: { select: { name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          // @ts-ignore
          createdAt: true,
          post: {
            select: {
              id: true,
              content: true,
              // @ts-ignore
              forest: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // @ts-ignore
      prisma.forest.findMany({
        where: { creatorId: userId },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { posts: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        posts: JSON.parse(JSON.stringify(posts)),
        comments: JSON.parse(JSON.stringify(comments)),
        forests: JSON.parse(JSON.stringify(forests)),
        isLoggedIn: !!currentUser,
        darkMode: false,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { notFound: true };
  }
};
