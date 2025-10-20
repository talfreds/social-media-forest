import React, { useState, useEffect } from "react";
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
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
} from "@mui/material";
import { Send, Forest, Nature, Spa, Share, Close } from "@mui/icons-material";
import NestedComment from "./NestedComment";
import Link from "next/link";
import { HydrationSafeDate } from "../lib/date-utils";

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string | null };
  replies?: Comment[];
  imageUrl?: string | null;
  deletedAt?: string | null;
}

interface TreePostProps {
  id: string;
  content: string;
  author: { id: string; name: string | null; avatar?: string | null };
  comments: Comment[];
  isLoggedIn: boolean;
  currentUserId?: string;
  imageUrl?: string | null;
  createdAt: string;
  onReply: (
    postId: string,
    parentId: string | null,
    content: string,
    imageUrl?: string | null
  ) => Promise<void>;
  onEditComment?: (commentId: string, newContent: string) => void;
  onDeleteComment?: (commentId: string) => void;
  replyInputs: Record<string, string>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  initialCollapsed?: boolean;
  onOpenRegister?: () => void;
  disableTreeCollapse?: boolean; // New prop to disable tree collapse functionality
}

const TreePost: React.FC<TreePostProps> = ({
  id,
  content,
  author,
  comments,
  isLoggedIn,
  currentUserId,
  imageUrl,
  createdAt,
  onReply,
  onEditComment,
  onDeleteComment,
  replyInputs,
  setReplyInputs,
  initialCollapsed = false,
  onOpenRegister,
  disableTreeCollapse = false,
}) => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTreeOnly, setIsTreeOnly] = React.useState(
    disableTreeCollapse ? false : initialCollapsed
  );
  const [mounted, setMounted] = React.useState(false);

  // Handle media query hydration safely
  React.useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.sm);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [theme.breakpoints.values.sm]);
  const [shareAnchorEl, setShareAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const shareOpen = Boolean(shareAnchorEl);
  const onOpenShare = (e: React.MouseEvent<HTMLElement>) =>
    setShareAnchorEl(e.currentTarget);
  const onCloseShare = () => setShareAnchorEl(null);
  const onCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${id}`;
      await navigator.clipboard.writeText(url);
    } catch {}
    onCloseShare();
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const replyContent = replyInputs[id] || "";
    if (replyContent.trim()) {
      if (!isLoggedIn) {
        // If not logged in, open register popup
        if (onOpenRegister) {
          onOpenRegister();
        } else {
          // Fallback to redirect if no popup handler
          window.location.href = "/#register";
        }
        return;
      }
      setReplyInputs(prev => ({ ...prev, [id]: "" }));
      onReply(id, null, replyContent);
    }
  };

  const handleNestedReply = (
    postId: string,
    parentId: string,
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

  // Prevent hydration mismatch by using consistent layout until mounted
  const safeIsMobile = mounted ? isMobile : false;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: safeIsMobile ? "column" : "row",
        alignItems: safeIsMobile ? "center" : "flex-start",
        mb: 6,
        mx: safeIsMobile ? 1 : 2,
        gap: 2,
        transition: "all 0.3s ease-in-out",
        overflow: "hidden",
      }}
    >
      {/* Tree Visualization - Left Side (hidden when collapsed) */}
      {!isTreeOnly && (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: safeIsMobile ? "auto" : "100px",
            order: safeIsMobile ? 1 : 1,
            cursor: disableTreeCollapse ? "default" : "pointer",
          }}
          onClick={
            disableTreeCollapse ? undefined : () => setIsTreeOnly(!isTreeOnly)
          }
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: 0.8,
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            {/* Tree Crown (Leaves) */}
            <Box
              className="tree-crown"
              sx={{
                width: style.crownSize * 0.6,
                height: style.crownSize * 0.6,
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
                width: style.trunkWidth * 0.6,
                height: style.trunkHeight * 0.6,
                background: "linear-gradient(135deg, #8B6914, #A68B5B)",
                borderRadius: `${(style.trunkWidth * 0.6) / 2}px`,
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
                    top: style.trunkHeight * 0.6 * 0.4,
                    left: -25,
                    right: -25,
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
                        width: 30,
                        height: 2,
                        background: "linear-gradient(90deg, #8B6914, #A68B5B)",
                        borderRadius: "2px",
                        transform: `rotate(${
                          index === 0
                            ? "-25deg"
                            : index === 1
                            ? "0deg"
                            : "25deg"
                        })`,
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          right: -5,
                          top: -3,
                          width: 6,
                          height: 6,
                          background: style.leafColor,
                          borderRadius: "50%",
                          boxShadow: `0 0 6px ${style.leafColor}66`,
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* Branch count badge on tree */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: -6,
                    bgcolor: style.leafColor,
                    color: "#fff",
                    borderRadius: "6px",
                    px: 0.4,
                    py: 0.2,
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    boxShadow: `0 2px 6px ${style.leafColor}66`,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "30px",
                    textAlign: "center",
                  }}
                >
                  {comments.length}
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Image Section - Between Tree and Content */}
      <Box
        sx={{
          width: safeIsMobile ? "100%" : "225px", // 50% larger (150px * 1.5)
          height: isTreeOnly ? "90px" : "300px", // 50% larger (200px * 1.5)
          background: imageUrl
            ? "transparent"
            : `linear-gradient(135deg, 
              ${
                theme.palette.mode === "dark"
                  ? "rgba(76, 175, 80, 0.1)"
                  : "rgba(76, 175, 80, 0.05)"
              }, 
              ${
                theme.palette.mode === "dark"
                  ? "rgba(46, 125, 50, 0.2)"
                  : "rgba(46, 125, 50, 0.1)"
              })`,
          border: `2px solid ${theme.palette.primary.main}33`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          boxShadow: `0 4px 16px ${theme.palette.primary.main}22`,
          cursor: "pointer",
          order: safeIsMobile ? 2 : 2,
          flexShrink: 0,
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          "&:hover": {
            opacity: 0.9,
          },
        }}
        onClick={() => {
          if (imageUrl) {
            setImageModalOpen(true);
          }
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Post image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.65rem",
              textAlign: "center",
              opacity: 0.5,
              fontWeight: 500,
            }}
          >
            No Image
          </Typography>
        )}
      </Box>

      {/* Post Content Card - Right Side */}
      <Card
        sx={{
          minWidth: safeIsMobile ? "280px" : "auto",
          flex: 1,
          position: "relative",
          zIndex: 2,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(26, 45, 26, 0.95)"
              : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          border: `2px solid ${theme.palette.primary.main}`,
          borderRadius: "12px",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${theme.palette.primary.main}33`
              : `0 4px 16px rgba(0, 0, 0, 0.1), 0 0 8px ${theme.palette.primary.main}22`,
          order: safeIsMobile ? 3 : 3,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <CardContent
          sx={{
            p: isTreeOnly ? 0.75 : 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease-in-out",
            cursor: isTreeOnly && !disableTreeCollapse ? "pointer" : "default",
            "&:hover":
              isTreeOnly && !disableTreeCollapse
                ? {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(76, 175, 80, 0.05)"
                        : "rgba(76, 175, 80, 0.02)",
                  }
                : {},
          }}
          onClick={
            isTreeOnly && !disableTreeCollapse
              ? () => setIsTreeOnly(false)
              : undefined
          }
        >
          {/* Minimal Author Info - Top Right */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: isTreeOnly ? 0.5 : 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 24,
                  height: 24,
                }}
              >
                <Forest fontSize="small" />
              </Avatar>
              <Link
                href={`/user/${author.id}`}
                style={{ textDecoration: "none" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.info.main,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {author.name || "Anonymous"}
                </Typography>
              </Link>
            </Box>

            {/* Actions: collapse/expand and link */}
            <Box>
              {!disableTreeCollapse && (
                <IconButton
                  size="small"
                  onClick={() => setIsTreeOnly(!isTreeOnly)}
                  sx={{
                    color: theme.palette.text.secondary,
                    mr: 1,
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(76, 175, 80, 0.08)",
                    },
                  }}
                  title={isTreeOnly ? "Expand tree" : "Collapse tree"}
                >
                  {/* reuse Spa icon rotated as a collapse glyph */}
                  <Spa
                    sx={{
                      fontSize: "small",
                      transform: isTreeOnly ? "none" : "rotate(-45deg)",
                    }}
                  />
                </IconButton>
              )}
              <Tooltip title="Share">
                <IconButton
                  size="small"
                  onClick={onOpenShare}
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
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={shareAnchorEl}
                open={shareOpen}
                onClose={onCloseShare}
              >
                <MenuItem onClick={onCopyLink}>Copy link</MenuItem>
                <MenuItem component={Link as any} href={`/post/${id}`}>
                  View tree page
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Main Content - Primary Focus */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {!isTreeOnly && (
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  fontSize: "1.1rem",
                  mb: 2,
                  flex: 1,
                }}
              >
                {content}
              </Typography>
            )}
            {isTreeOnly && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  mb: 0,
                  maxWidth: "100%",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </Typography>
            )}

            {/* Timestamp - Bottom */}
            {!isTreeOnly && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.disabled,
                  fontSize: "0.7rem",
                  mt: "auto",
                  pt: 1,
                }}
              >
                <HydrationSafeDate dateString={createdAt} format="datetime" />
              </Typography>
            )}
          </Box>

          {/* Comments Section (hidden when tree-only) */}
          {!isTreeOnly && comments.length > 0 && (
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
                {comments.map(comment => (
                  <NestedComment
                    key={comment.id}
                    comment={comment}
                    postId={id}
                    isLoggedIn={isLoggedIn}
                    currentUserId={currentUserId}
                    level={0}
                    onReply={handleNestedReply}
                    onEdit={onEditComment}
                    onDelete={onDeleteComment}
                    theme={theme}
                    onOpenRegister={onOpenRegister}
                  />
                ))}
              </Box>
            </>
          )}

          {/* Reply Input (hidden when tree-only) */}
          {!isTreeOnly && (
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
                  onChange={e => {
                    const value = e.target.value;
                    setReplyInputs(prev => ({ ...prev, [id]: value }));
                  }}
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
                      borderRadius: "20px",
                      overflow: "hidden",
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
                    minWidth: "100px",
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

      {/* Image Preview Modal */}
      {imageUrl && (
        <Dialog
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "transparent",
              boxShadow: "none",
              maxHeight: "90vh",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <img
              src={imageUrl}
              alt="Full size preview"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            />
            <IconButton
              onClick={() => setImageModalOpen(false)}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                },
              }}
            >
              <Close fontSize="large" />
            </IconButton>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default TreePost;
