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
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Send,
  Forest,
  Nature,
  Spa,
  Link as LinkIcon,
} from "@mui/icons-material";
import NestedComment from "./NestedComment";
import Link from "next/link";

interface Comment {
  id: number | string;
  content: string;
  author: { id: string; name: string | null };
  replies?: Comment[];
}

interface TreePostProps {
  id: number | string;
  content: string;
  author: { id: string; name: string | null };
  comments: Comment[];
  isLoggedIn: boolean;
  onReply: (
    postId: number | string,
    parentId: number | string | null,
    content: string
  ) => Promise<void>;
  replyInputs: Record<number | string, string>;
  setReplyInputs: (inputs: Record<number | string, string>) => void;
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
      onReply(id, null, replyContent);
    }
  };

  const handleNestedReply = (
    postId: number,
    parentId: number,
    content: string
  ) => {
    onReply(postId, parentId, content);
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
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        mb: 6,
        mx: isMobile ? 1 : 2,
        gap: 3,
      }}
    >
      {/* Post Content Card - Right Side */}
      <Card
        sx={{
          minWidth: isMobile ? "280px" : "400px",
          maxWidth: "500px",
          position: "relative",
          zIndex: 2,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(26, 45, 26, 0.95)"
              : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          border: `2px solid ${theme.palette.primary.main}`,
          borderRadius: "16px",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${theme.palette.primary.main}33`
              : `0 4px 16px rgba(0, 0, 0, 0.1), 0 0 8px ${theme.palette.primary.main}22`,
          order: isMobile ? 2 : 2,
          flex: 1,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Author and Tree Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
                <Link
                  href={`/user/${author.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.info.main,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {author.name || "Anonymous Forester"}
                  </Typography>
                </Link>
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

            {/* Share Tree Link */}
            <Link href={`/post/${id}`} style={{ textDecoration: "none" }}>
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.info.main,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(66, 165, 245, 0.1)"
                        : "rgba(33, 150, 243, 0.08)",
                  },
                }}
                title="Link to this tree"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Link>
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

              <Box sx={{ p: 0 }}>
                {comments.map((comment) => (
                  <NestedComment
                    key={comment.id}
                    comment={comment}
                    postId={id}
                    isLoggedIn={isLoggedIn}
                    level={0}
                    onReply={handleNestedReply}
                    theme={theme}
                  />
                ))}
              </Box>
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
                  placeholder="Add a branch to this tree..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(15, 26, 15, 0.8)"
                          : "rgba(255, 255, 255, 0.9)",
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
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    <Spa
                      sx={{ fontSize: "1rem", transform: "rotate(-45deg)" }}
                    />
                  }
                  sx={{
                    bgcolor: theme.palette.success.main,
                    color: "#fff",
                    borderRadius: "20px",
                    px: 2,
                    py: 0.75,
                    minWidth: "auto",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxShadow: `0 2px 8px ${theme.palette.success.main}44`,
                    "&:hover": {
                      bgcolor: theme.palette.success.dark,
                      boxShadow: `0 4px 12px ${theme.palette.success.main}66`,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Branch
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tree Visualization - Left Side */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: isMobile ? "auto" : "150px",
          order: isMobile ? 1 : 1,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Tree Crown (Leaves) */}
          <Box
            className="tree-crown"
            sx={{
              width: style.crownSize,
              height: style.crownSize,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${style.leafColor}, ${style.leafColor}AA)`,
              boxShadow: `0 0 20px ${style.leafColor}44`,
              zIndex: 1,
              mb: -2,
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

          {/* Tree Branches (Comments) - Extend from trunk */}
          {comments.length > 0 && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: style.trunkHeight * 0.4,
                  left: -40,
                  right: -40,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {comments.slice(0, 3).map((comment, index) => (
                  <Box
                    key={comment.id}
                    sx={{
                      position: "relative",
                      width: 50,
                      height: 3,
                      background: "linear-gradient(90deg, #8B6914, #A68B5B)",
                      borderRadius: "2px",
                      transform: `rotate(${
                        index === 0 ? "-25deg" : index === 1 ? "0deg" : "25deg"
                      })`,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: -8,
                        top: -6,
                        width: 10,
                        height: 10,
                        background: style.leafColor,
                        borderRadius: "50%",
                        boxShadow: `0 0 8px ${style.leafColor}66`,
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Branch count badge on tree */}
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: -10,
                  bgcolor: style.leafColor,
                  color: "#fff",
                  borderRadius: "12px",
                  px: 1,
                  py: 0.5,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  boxShadow: `0 2px 8px ${style.leafColor}66`,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "60px",
                  textAlign: "center",
                }}
              >
                {comments.length}{" "}
                {comments.length === 1 ? "branch" : "branches"}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TreePost;
