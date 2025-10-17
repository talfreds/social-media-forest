import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import {
  People,
  PersonAdd,
  Check,
  Close,
  Search,
  HourglassEmpty,
  ArrowBack,
} from "@mui/icons-material";
import { parse } from "cookie";
import { verifyToken } from "../lib/auth";
import prisma from "../lib/prisma";
import MenuBar from "../components/MenuBar";

interface Friend {
  friendshipId: string;
  friend: {
    id: string;
    name: string | null;
  };
  since: string;
}

interface FriendRequest {
  requestId: string;
  from?: {
    id: string;
    name: string | null;
  };
  to?: {
    id: string;
    name: string | null;
  };
  sentAt?: string;
  receivedAt?: string;
}

interface Props {
  initialFriends: Friend[];
  initialSentRequests: FriendRequest[];
  initialReceivedRequests: FriendRequest[];
  currentUser: {
    id: string;
    name: string | null;
  };
  darkMode: boolean;
}

export default function FriendsPage({
  initialFriends,
  initialSentRequests,
  initialReceivedRequests,
  currentUser,
  darkMode,
}: Props) {
  const [tabValue, setTabValue] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [friends, setFriends] = useState(initialFriends);
  const [sentRequests, setSentRequests] = useState(initialSentRequests);
  const [receivedRequests, setReceivedRequests] = useState(
    initialReceivedRequests
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendRequest = async () => {
    if (!searchName.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/friends/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverName: searchName.trim() }),
      });

      if (res.ok) {
        setSuccess(`Friend request sent to ${searchName}!`);
        setSearchName("");
        // Refresh the page to show updated requests
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send friend request");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (res.ok) {
        setSuccess(
          action === "accept"
            ? "Friend request accepted!"
            : "Friend request rejected"
        );
        // Refresh the page
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to respond to request");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Friends - Social Media</title>
      </Head>

      <MenuBar darkMode={darkMode} setDarkMode={() => {}} isLoggedIn={true} />

      <Box
        sx={{
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #0F1A0F 0%, #1A2D1A 50%, #0F1A0F 100%)"
            : "linear-gradient(135deg, #F1F8E9 0%, #C5E1A5 50%, #F1F8E9 100%)",
          pt: 10, // Add padding for MenuBar
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Back Button */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{
                mb: 3,
                color: darkMode ? "#E8F5E8" : "#1B5E20",
                "&:hover": {
                  bgcolor: darkMode
                    ? "rgba(74, 103, 65, 0.1)"
                    : "rgba(76, 175, 80, 0.1)",
                },
              }}
            >
              Back to Forest
            </Button>
          </Link>

          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: darkMode ? "#E8F5E8" : "#1B5E20",
                mb: 1,
              }}
            >
              <People sx={{ fontSize: 40, mr: 2, verticalAlign: "middle" }} />
              Friends
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? "#B8D4B8" : "#558B2F" }}
            >
              Grow your forest community
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          )}

          {/* Add Friend */}
          <Card sx={{ mb: 3, bgcolor: darkMode ? "#1A2D1A" : "#FFFFFF" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: darkMode ? "#E8F5E8" : "#1B5E20",
                  fontWeight: 600,
                }}
              >
                <PersonAdd sx={{ mr: 1, verticalAlign: "middle" }} />
                Add Friend
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter username"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendRequest();
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: darkMode ? "#E8F5E8" : "#1B5E20",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendRequest}
                  disabled={loading}
                  sx={{
                    bgcolor: "#4A6741",
                    "&:hover": { bgcolor: "#6B8B5A" },
                    minWidth: "120px",
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Send Request"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card sx={{ bgcolor: darkMode ? "#1A2D1A" : "#FFFFFF" }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  color: darkMode ? "#B8D4B8" : "#558B2F",
                },
                "& .Mui-selected": {
                  color: darkMode ? "#E8F5E8" : "#1B5E20",
                },
              }}
            >
              <Tab
                label={`Friends (${friends.length})`}
                icon={<People />}
                iconPosition="start"
              />
              <Tab
                label={`Received (${receivedRequests.length})`}
                icon={<HourglassEmpty />}
                iconPosition="start"
              />
              <Tab
                label={`Sent (${sentRequests.length})`}
                icon={<Search />}
                iconPosition="start"
              />
            </Tabs>

            <CardContent sx={{ minHeight: "400px" }}>
              {/* Friends List */}
              {tabValue === 0 && (
                <Box>
                  {friends.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <People
                        sx={{
                          fontSize: 64,
                          color: darkMode ? "#4A6741" : "#C5E1A5",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: darkMode ? "#B8D4B8" : "#558B2F" }}
                      >
                        No friends yet
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkMode ? "#B8D4B8" : "#558B2F",
                          mt: 1,
                        }}
                      >
                        Send friend requests to start growing your network!
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {friends.map((friendship) => (
                        <Card
                          key={friendship.friendshipId}
                          sx={{
                            bgcolor: darkMode ? "#2E4A2E" : "#F1F8E9",
                            "&:hover": {
                              bgcolor: darkMode ? "#3A5A3A" : "#E8F5E8",
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "#4A6741",
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {(friendship.friend.name ||
                                  "?")[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Link
                                  href={`/user/${friendship.friend.id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: darkMode ? "#E8F5E8" : "#1B5E20",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                    }}
                                  >
                                    {friendship.friend.name || "Anonymous"}
                                  </Typography>
                                </Link>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: darkMode ? "#B8D4B8" : "#558B2F",
                                  }}
                                >
                                  Friends since{" "}
                                  {new Date(
                                    friendship.since
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Link href={`/user/${friendship.friend.id}`}>
                              <Button size="small" variant="outlined">
                                View Profile
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Received Requests */}
              {tabValue === 1 && (
                <Box>
                  {receivedRequests.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <HourglassEmpty
                        sx={{
                          fontSize: 64,
                          color: darkMode ? "#4A6741" : "#C5E1A5",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: darkMode ? "#B8D4B8" : "#558B2F" }}
                      >
                        No pending requests
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {receivedRequests.map((request) => (
                        <Card
                          key={request.requestId}
                          sx={{
                            bgcolor: darkMode ? "#2E4A2E" : "#F1F8E9",
                          }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar sx={{ bgcolor: "#4A6741" }}>
                                {(request.from?.name || "?")[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: darkMode ? "#E8F5E8" : "#1B5E20",
                                  }}
                                >
                                  {request.from?.name || "Anonymous"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: darkMode ? "#B8D4B8" : "#558B2F",
                                  }}
                                >
                                  {request.receivedAt &&
                                    new Date(
                                      request.receivedAt
                                    ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                color="success"
                                onClick={() =>
                                  handleRespondToRequest(
                                    request.requestId,
                                    "accept"
                                  )
                                }
                                disabled={loading}
                              >
                                <Check />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleRespondToRequest(
                                    request.requestId,
                                    "reject"
                                  )
                                }
                                disabled={loading}
                              >
                                <Close />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Sent Requests */}
              {tabValue === 2 && (
                <Box>
                  {sentRequests.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Search
                        sx={{
                          fontSize: 64,
                          color: darkMode ? "#4A6741" : "#C5E1A5",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: darkMode ? "#B8D4B8" : "#558B2F" }}
                      >
                        No sent requests
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {sentRequests.map((request) => (
                        <Card
                          key={request.requestId}
                          sx={{
                            bgcolor: darkMode ? "#2E4A2E" : "#F1F8E9",
                          }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar sx={{ bgcolor: "#4A6741" }}>
                                {(request.to?.name || "?")[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: darkMode ? "#E8F5E8" : "#1B5E20",
                                  }}
                                >
                                  {request.to?.name || "Anonymous"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: darkMode ? "#B8D4B8" : "#558B2F",
                                  }}
                                >
                                  Sent{" "}
                                  {request.sentAt &&
                                    new Date(
                                      request.sentAt
                                    ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label="Pending"
                              size="small"
                              sx={{
                                bgcolor: darkMode ? "#8B6914" : "#FFA726",
                                color: "#FFF",
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const res = await fetch(`http://localhost:3000/api/friends/list`, {
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    const data = await res.json();

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true },
    });

    return {
      props: {
        initialFriends: data.friends || [],
        initialSentRequests: data.sentRequests || [],
        initialReceivedRequests: data.receivedRequests || [],
        currentUser: currentUser || { id: decoded.userId, name: null },
        darkMode: cookies.darkMode === "true",
      },
    };
  } catch (error) {
    console.error("Error fetching friends:", error);
    return {
      props: {
        initialFriends: [],
        initialSentRequests: [],
        initialReceivedRequests: [],
        currentUser: { id: decoded.userId, name: null },
        darkMode: cookies.darkMode === "true",
      },
    };
  }
};
