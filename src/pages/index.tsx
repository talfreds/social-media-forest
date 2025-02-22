import { GetServerSideProps } from "next";
import { parse } from "cookie";
import { verifyToken } from "../lib/auth";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import MenuBar from "../components/MenuBar";
import prisma from "../lib/prisma";

type Post = {
  id: number;
  content: string;
  author: { name: string | null };
  comments: { id: number; content: string; author: { name: string | null } }[];
  location?: { lat: number; lon: number };
};

type Props = {
  isLoggedIn: boolean;
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
  const [userLat, setUserLat] = useState(initialLat);
  const [userLon, setUserLon] = useState(initialLon);
  const [useLocation, setUseLocation] = useState(true); // Checkbox state
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({}); // Reply input per post

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address.city || data.address.town || "Unknown";
            setUserCity(city);
            setUserLat(latitude);
            setUserLon(longitude);
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
          location: useLocation ? { lat: userLat, lon: userLon } : null,
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

  const handleReplySubmit = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const replyContent = replyInputs[postId] || "";
    if (!replyContent) return;

    try {
      const res = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: replyContent }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Comment creation failed:", await res.json());
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
    setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <>
      <MenuBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: { xs: "2.5rem", sm: "3.5rem" },
            color: darkMode ? "#B0BEC5" : "#263238",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.4)",
          }}
        >
          Scribbles
        </Typography>

        {/* Nearby Posts Section */}
        <Box sx={{ mx: { xs: 1, sm: 2 }, mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Oswald', sans-serif",
              color: darkMode ? "#90A4AE" : "#546E7A",
              mb: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {userCity} (Nearby)
          </Typography>
          {nearbyPosts.length > 0 ? (
            nearbyPosts.map((post) => (
              <Box
                key={post.id}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "2px solid",
                  borderColor: darkMode ? "#546E7A" : "#B0BEC5",
                  backgroundColor: darkMode ? "#263238" : "#ECEFF1",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    color: darkMode ? "#CFD8DC" : "#263238",
                    mb: 1,
                  }}
                >
                  {post.content} - {post.author.name || "Anonymous"}
                </Typography>
                <List sx={{ p: 0 }}>
                  {post.comments.map((comment) => (
                    <ListItem
                      key={comment.id}
                      sx={{
                        py: 0.5,
                        borderTop: "1px solid",
                        borderColor: darkMode ? "#455A64" : "#CFD8DC",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              color: darkMode ? "#B0BEC5" : "#546E7A",
                            }}
                          >
                            {comment.content} -{" "}
                            {comment.author.name || "Anonymous"}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {isLoggedIn && (
                  <Box
                    component="form"
                    onSubmit={(e) => handleReplySubmit(post.id, e)}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      value={replyInputs[post.id] || ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a reply..."
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        backgroundColor: darkMode ? "#37474F" : "#ECEFF1",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: darkMode ? "#78909C" : "#455A64",
                          },
                          "&:hover fieldset": { borderColor: "#FF7043" },
                          "&.Mui-focused fieldset": { borderColor: "#FF7043" },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        mt: 1,
                        backgroundColor: darkMode ? "#FF7043" : "#BF360C",
                        color: "#fff",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      Reply
                    </Button>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Roboto', sans-serif",
                color: darkMode ? "#78909C" : "#78909C",
                ml: 2,
              }}
            >
              No nearby marks yet.
            </Typography>
          )}
        </Box>

        {/* All Posts Section */}
        <Box sx={{ mx: { xs: 1, sm: 2 }, mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Oswald', sans-serif",
              color: darkMode ? "#90A4AE" : "#546E7A",
              mb: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            All Scribbles
          </Typography>
          {allPosts.length > 0 ? (
            allPosts.map((post) => (
              <Box
                key={post.id}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "2px solid",
                  borderColor: darkMode ? "#546E7A" : "#B0BEC5",
                  backgroundColor: darkMode ? "#263238" : "#ECEFF1",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    color: darkMode ? "#CFD8DC" : "#263238",
                    mb: 1,
                  }}
                >
                  {post.content} - {post.author.name || "Anonymous"}
                </Typography>
                <List sx={{ p: 0 }}>
                  {post.comments.map((comment) => (
                    <ListItem
                      key={comment.id}
                      sx={{
                        py: 0.5,
                        borderTop: "1px solid",
                        borderColor: darkMode ? "#455A64" : "#CFD8DC",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              color: darkMode ? "#B0BEC5" : "#546E7A",
                            }}
                          >
                            {comment.content} -{" "}
                            {comment.author.name || "Anonymous"}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {isLoggedIn && (
                  <Box
                    component="form"
                    onSubmit={(e) => handleReplySubmit(post.id, e)}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      value={replyInputs[post.id] || ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a reply..."
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        backgroundColor: darkMode ? "#37474F" : "#ECEFF1",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: darkMode ? "#78909C" : "#455A64",
                          },
                          "&:hover fieldset": { borderColor: "#FF7043" },
                          "&.Mui-focused fieldset": { borderColor: "#FF7043" },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        mt: 1,
                        backgroundColor: darkMode ? "#FF7043" : "#BF360C",
                        color: "#fff",
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      Reply
                    </Button>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Roboto', sans-serif",
                color: darkMode ? "#78909C" : "#78909C",
                ml: 2,
              }}
            >
              No marks anywhere yet.
            </Typography>
          )}
        </Box>

        {/* Post Input Moved to Bottom */}
        {isLoggedIn && (
          <Box
            component="form"
            onSubmit={handlePostSubmit}
            sx={{ mx: { xs: 1, sm: 2 }, maxWidth: "600px" }}
          >
            <TextField
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`Mark the wall in ${userCity}...`}
              fullWidth
              variant="outlined"
              size="medium"
              sx={{
                backgroundColor: darkMode ? "#37474F" : "#ECEFF1",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "#78909C" : "#455A64",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": { borderColor: "#FF7043" },
                  "&.Mui-focused fieldset": { borderColor: "#FF7043" },
                },
                "& .MuiInputBase-input": {
                  fontFamily: "'Roboto Condensed', sans-serif",
                  color: darkMode ? "#CFD8DC" : "#263238",
                  fontWeight: 500,
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={useLocation}
                  onChange={(e) => setUseLocation(e.target.checked)}
                  sx={{ color: darkMode ? "#78909C" : "#455A64" }}
                />
              }
              label="Location Specific"
              sx={{ mt: 1, color: darkMode ? "#CFD8DC" : "#263238" }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 1,
                backgroundColor: darkMode ? "#FF7043" : "#BF360C",
                color: "#fff",
                fontFamily: "'Oswald', sans-serif",
                fontSize: "1rem",
                padding: "8px 20px",
                "&:hover": { backgroundColor: "#FF5722" },
              }}
            >
              Post
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Omit<Props, "setDarkMode">
> = async (context) => {
  const cookies = parse(context.req.headers.cookie || "");
  const token = cookies.authToken;
  const user = token ? verifyToken(token) : null;

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

  const allPosts = await prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      comments: { include: { author: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    props: {
      isLoggedIn: !!user,
      nearbyPosts: JSON.parse(JSON.stringify(nearbyPosts || [])),
      allPosts: JSON.parse(JSON.stringify(allPosts)),
      darkMode: false,
      initialCity,
      initialLat,
      initialLon,
    },
  };
};
