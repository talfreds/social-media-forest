import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import {
  AccountCircle,
  Send,
  Reply,
  Spa,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import Link from "next/link";

interface Author {
  name: string | null;
}

interface NestedCommentData {
  id: string;
  content: string;
  author: Author & { id?: string };
  replies?: NestedCommentData[];
}

interface NestedCommentProps {
  comment: NestedCommentData;
  postId: string;
  isLoggedIn: boolean;
  level?: number;
  onReply: (postId: string, parentId: string, content: string) => void;
  theme: any;
}

const NestedComment: React.FC<NestedCommentProps> = ({
  comment,
  postId,
  isLoggedIn,
  level = 0,
  onReply,
  theme,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  // Collapse all non-root comments by default (hide any comment-to-comment replies initially)
  const [isCollapsed, setIsCollapsed] = useState(level > 0);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(postId, comment.id, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
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

          {/* Comment Content */}
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

            {/* Reply Button */}
            {isLoggedIn && !isCollapsed && (
              <Button
                size="small"
                startIcon={<Reply sx={{ fontSize: "0.875rem" }} />}
                onClick={() => setShowReplyBox(!showReplyBox)}
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
                gap: 1,
                alignItems: "flex-end",
              }}
            >
              <TextField
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
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
                {comment.replies.map((reply) => (
                  <NestedComment
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    isLoggedIn={isLoggedIn}
                    level={level + 1}
                    onReply={onReply}
                    theme={theme}
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
