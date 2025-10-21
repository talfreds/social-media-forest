import {
  AccountCircle,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  MoreVert,
  Reply,
  Share,
  Spa,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { HydrationSafeDate } from "../lib/date-utils";

interface Author {
  name: string | null;
  avatar?: string | null;
}

interface NestedCommentData {
  id: string;
  content: string;
  author: Author & { id?: string };
  replies?: NestedCommentData[];
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string | null;
  deletedAt?: string | null;
}

interface NestedCommentProps {
  comment: NestedCommentData;
  postId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  level?: number;
  onReply: (
    postId: string,
    parentId: string,
    content: string,
    imageUrl?: string | null
  ) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  theme: any;
  onOpenRegister?: () => void;
}

const NestedComment: React.FC<NestedCommentProps> = ({
  comment,
  postId,
  isLoggedIn,
  currentUserId,
  level = 0,
  onReply,
  onEdit,
  onDelete,
  theme,
  onOpenRegister,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  // Collapse all non-root comments by default (hide any comment-to-comment replies initially)
  const [isCollapsed, setIsCollapsed] = useState(level > 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);

  const isOwnComment = currentUserId && comment.author.id === currentUserId;

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(postId, comment.id, replyText, null); // TODO: Add image support in future
      // Auto-expand after submitting a reply
      setIsCollapsed(false);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  const handleEditSubmit = () => {
    if (editText.trim() && onEdit) {
      onEdit(comment.id, editText);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
    setMenuAnchorEl(null);
  };

  const handleCopyCommentLink = async () => {
    try {
      const url = `${window.location.origin}/post/${postId}#comment-${comment.id}`;
      await navigator.clipboard.writeText(url);
    } catch {}
    setShareAnchorEl(null);
  };

  const indentLevel = Math.min(level, 4); // Max indent of 4 levels
  const leftPadding = indentLevel * 2;

  return (
    <Box
      sx={{
        pl: leftPadding,
        borderLeft: level > 0 ? `2px solid ${theme.palette.divider}` : "none",
        ml: level > 0 ? 2 : 0,
        py: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.secondary.main,
            width: 28,
            height: 28,
            flexShrink: 0,
          }}
        >
          <AccountCircle fontSize="small" />
        </Avatar>

        <Box sx={{ flex: 1 }}>
          {/* Author Name */}
          {comment.author?.id ? (
            <Link
              href={`/user/${comment.author.id}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                component="span"
                sx={{
                  color: theme.palette.info.main,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {comment.author?.name || "Anonymous"}
              </Typography>
            </Link>
          ) : (
            <Typography
              component="span"
              sx={{
                color: theme.palette.info.main,
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {comment.author?.name || "Anonymous"}
            </Typography>
          )}

          {/* Timestamp with hover */}
          <Tooltip
            title={
              comment.createdAt
                ? new Date(comment.createdAt).toLocaleString()
                : ""
            }
            arrow
          >
            <Typography
              component="span"
              sx={{
                color: theme.palette.text.disabled,
                fontSize: "0.7rem",
                ml: 1,
              }}
            >
              {comment.createdAt && (
                <HydrationSafeDate
                  dateString={comment.createdAt}
                  format="date"
                />
              )}
              {comment.updatedAt &&
                comment.updatedAt !== comment.createdAt &&
                " (edited)"}
            </Typography>
          </Tooltip>

          {/* Comment Content or Edit Box */}
          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                value={editText}
                onChange={e => setEditText(e.target.value)}
                fullWidth
                multiline
                size="small"
                autoFocus
              />
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  onClick={handleEditSubmit}
                  variant="contained"
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : comment.deletedAt ? (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.disabled,
                lineHeight: 1.5,
                mt: 0.5,
                mb: 1,
                fontStyle: "italic",
              }}
            >
              This comment has been deleted
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                lineHeight: 1.5,
                mt: 0.5,
                mb: 1,
              }}
            >
              {comment.content}
            </Typography>
          )}

          {/* Comment Image */}
          {comment.imageUrl && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                maxWidth: "300px",
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* TODO: Replace with Next.js Image component for better performance */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comment.imageUrl}
                alt="Comment attachment"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Collapse/Expand Button */}
            {comment.replies && comment.replies.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setIsCollapsed(!isCollapsed)}
                sx={{
                  color: theme.palette.text.secondary,
                  padding: 0.25,
                  width: 24,
                  height: 24,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(74, 103, 65, 0.15)"
                        : "rgba(46, 125, 50, 0.08)",
                  },
                }}
              >
                {isCollapsed ? (
                  <ExpandMore sx={{ fontSize: "1rem" }} />
                ) : (
                  <ExpandLess sx={{ fontSize: "1rem" }} />
                )}
              </IconButton>
            )}

            {/* Reply Button - allow replying at any depth; prompt register if not logged in */}
            {!comment.deletedAt && (
              <Button
                size="small"
                startIcon={<Reply sx={{ fontSize: "0.875rem" }} />}
                onClick={() => {
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
                  // Auto-expand replies when clicking reply
                  if (
                    isCollapsed &&
                    comment.replies &&
                    comment.replies.length > 0
                  ) {
                    setIsCollapsed(false);
                  }
                  setShowReplyBox(!showReplyBox);
                }}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  textTransform: "none",
                  minWidth: "auto",
                  px: 0.75,
                  py: 0.25,
                  minHeight: "24px",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(74, 103, 65, 0.15)"
                        : "rgba(46, 125, 50, 0.08)",
                  },
                }}
              >
                Reply
              </Button>
            )}

            {/* Share Button */}
            {!comment.deletedAt && (
              <>
                <IconButton
                  size="small"
                  onClick={e => setShareAnchorEl(e.currentTarget)}
                  sx={{
                    color: theme.palette.text.secondary,
                    padding: 0.25,
                    "&:hover": {
                      color: theme.palette.info.main,
                    },
                  }}
                >
                  <Share sx={{ fontSize: "0.875rem" }} />
                </IconButton>
                <Menu
                  anchorEl={shareAnchorEl}
                  open={Boolean(shareAnchorEl)}
                  onClose={() => setShareAnchorEl(null)}
                >
                  <MenuItem onClick={handleCopyCommentLink}>Copy link</MenuItem>
                </Menu>
              </>
            )}

            {/* Edit/Delete Menu for Own Comments */}
            {isOwnComment && !comment.deletedAt && (
              <>
                <IconButton
                  size="small"
                  onClick={e => setMenuAnchorEl(e.currentTarget)}
                  sx={{
                    color: theme.palette.text.secondary,
                    padding: 0.25,
                  }}
                >
                  <MoreVert sx={{ fontSize: "0.875rem" }} />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={() => setMenuAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setIsEditing(true);
                      setMenuAnchorEl(null);
                    }}
                  >
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={handleDeleteClick}>
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Show collapsed count - only when there are replies (>0) */}
            {isCollapsed && comment.replies && comment.replies.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  fontStyle: "italic",
                  cursor: "pointer",
                }}
                onClick={() => setIsCollapsed(false)}
              >
                {`${comment.replies.length} hidden ${
                  comment.replies.length === 1 ? "reply" : "replies"
                }`}
              </Typography>
            )}
          </Box>

          {/* Reply Input Box */}
          <Collapse in={showReplyBox}>
            <Box
              component="form"
              onSubmit={handleReplySubmit}
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <TextField
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Add a branch to this comment..."
                fullWidth
                variant="outlined"
                size="small"
                multiline
                maxRows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(15, 26, 15, 0.6)"
                        : "rgba(255, 255, 255, 0.9)",
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                      borderRadius: "8px",
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.light,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                    color: theme.palette.text.primary,
                  },
                }}
              />
              {/* TODO: Add image upload for replies in future */}
              <IconButton
                type="submit"
                size="small"
                disabled={!replyText.trim()}
                sx={{
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: theme.palette.success.dark,
                    transform: "rotate(20deg)",
                  },
                  "&:disabled": {
                    bgcolor: theme.palette.action.disabledBackground,
                  },
                  transition: "all 0.3s ease",
                  width: 28,
                  height: 28,
                  padding: 0.5,
                }}
              >
                <Spa
                  sx={{ fontSize: "0.875rem", transform: "rotate(-45deg)" }}
                />
              </IconButton>
            </Box>
          </Collapse>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Collapse in={!isCollapsed}>
              <Box sx={{ mt: 1 }}>
                {comment.replies.map(reply => (
                  <NestedComment
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    isLoggedIn={isLoggedIn}
                    currentUserId={currentUserId}
                    level={level + 1}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    theme={theme}
                    onOpenRegister={onOpenRegister}
                  />
                ))}
              </Box>
            </Collapse>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NestedComment;
