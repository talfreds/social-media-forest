import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { AccountCircle, Send, Forest, Nature } from "@mui/icons-material";

interface Comment {
  id: number;
  content: string;
  author: { name: string | null };
}

interface TreePostProps {
  id: number;
  content: string;
  author: { name: string | null };
  comments: Comment[];
  isLoggedIn: boolean;
  onReply: (postId: number, e: React.FormEvent) => Promise<void>;
  replyInputs: Record<number, string>;
  setReplyInputs: (inputs: Record<number, string>) => void;
}

const TreePost: React.FC<TreePostProps> = ({
  id,
  content,
  author,
  comments,
  isLoggedIn,
  onReply,
  replyInputs,
  setReplyInputs,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const replyContent = replyInputs[id] || "";
    if (replyContent.trim()) {
      onReply(id, e);
    }
  };

  // Generate a tree type based on post content length and author
  const getTreeType = () => {
    const contentLength = content.length;
    if (contentLength < 50) return "sapling";
    if (contentLength < 150) return "young-tree";
    return "mature-tree";
  };

  const treeType = getTreeType();

  const treeStyles = {
    sapling: {
      trunkHeight: 120,
      trunkWidth: 8,
      crownSize: 60,
      leafColor: "#66BB6A",
    },
    "young-tree": {
      trunkHeight: 180,
      trunkWidth: 12,
      crownSize: 80,
      leafColor: "#4CAF50",
    },
    "mature-tree": {
      trunkHeight: 240,
      trunkWidth: 16,
      crownSize: 100,
      leafColor: "#2E7D32",
    },
  };

  const style = treeStyles[treeType];

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 6,
        mx: isMobile ? 1 : 2,
      }}
    >
      {/* Tree Visualization */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {/* Tree Crown (Leaves) */}
        <Box
          className="tree-crown"
          sx={{
            position: "absolute",
            top: -style.crownSize,
            width: style.crownSize,
            height: style.crownSize,
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${style.leafColor}, ${style.leafColor}AA)`,
            boxShadow: `0 0 20px ${style.leafColor}44`,
            zIndex: 1,
          }}
        />

        {/* Tree Trunk */}
        <Box
          sx={{
            width: style.trunkWidth,
            height: style.trunkHeight,
            background: "linear-gradient(135deg, #8B6914, #A68B5B)",
            borderRadius: `${style.trunkWidth / 2}px`,
            position: "relative",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "20%",
              left: "10%",
              right: "10%",
              height: "60%",
              background: "linear-gradient(135deg, #6B4F11, #8B6914)",
              borderRadius: "2px",
            },
          }}
        />

        {/* Tree Branches (Comments) */}
        {comments.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: style.trunkHeight * 0.3,
              left: -40,
              right: -40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {comments.slice(0, 2).map((comment, index) => (
              <Box
                key={comment.id}
                sx={{
                  position: "relative",
                  width: 60,
                  height: 3,
                  background: "linear-gradient(90deg, #8B6914, #A68B5B)",
                  borderRadius: "2px",
                  transform: `rotate(${index === 0 ? "-15deg" : "15deg"})`,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    right: -8,
                    top: -6,
                    width: 12,
                    height: 12,
                    background: style.leafColor,
                    borderRadius: "50%",
                    boxShadow: `0 0 8px ${style.leafColor}66`,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Post Content Card */}
      <Card
        sx={{
          minWidth: isMobile ? "280px" : "400px",
          maxWidth: "500px",
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(26, 45, 26, 0.95)",
          backdropFilter: "blur(10px)",
          border: `2px solid ${theme.palette.primary.main}`,
          borderRadius: "16px",
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${theme.palette.primary.main}33`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Author and Tree Icon */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                mr: 2,
                width: 36,
                height: 36,
              }}
            >
              <Forest fontSize="small" />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: "1.1rem",
                }}
              >
                {author.name || "Anonymous Forester"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Nature fontSize="inherit" />
                {treeType === "sapling" && "Young Sapling"}
                {treeType === "young-tree" && "Growing Tree"}
                {treeType === "mature-tree" && "Ancient Oak"}
              </Typography>
            </Box>
          </Box>

          {/* Post Content */}
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              color: theme.palette.text.primary,
              fontSize: "1rem",
            }}
          >
            {content}
          </Typography>

          {/* Comments Section */}
          {comments.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Branches ({comments.length})
              </Typography>

              <List sx={{ p: 0 }}>
                {comments.map((comment, index) => (
                  <ListItem
                    key={comment.id}
                    sx={{
                      px: 0,
                      py: 1,
                      alignItems: "flex-start",
                      borderBottom:
                        index < comments.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : "none",
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 36, mr: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          width: 28,
                          height: 28,
                        }}
                      >
                        <AccountCircle fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.primary,
                            lineHeight: 1.4,
                            mb: 0.5,
                          }}
                        >
                          {comment.content}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          — {comment.author.name || "Anonymous"}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Reply Input */}
          {isLoggedIn && (
            <>
              <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />
              <Box
                component="form"
                onSubmit={handleReplySubmit}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  value={replyInputs[id] || ""}
                  onChange={(e) =>
                    setReplyInputs({ ...replyInputs, [id]: e.target.value })
                  }
                  placeholder="Add a branch..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(15, 26, 15, 0.8)",
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                        borderRadius: "20px",
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.light,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    },
                  }}
                />
                <IconButton
                  type="submit"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                  }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TreePost;
