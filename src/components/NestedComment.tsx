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
import { AccountCircle, Send, Reply, Spa, ExpandMore, ExpandLess } from "@mui/icons-material";
import Link from "next/link";

interface Author {
  name: string | null;
}

interface NestedCommentData {
  id: number;
  content: string;
  author: Author & { id?: number };
  replies?: NestedCommentData[];
}

interface NestedCommentProps {
  comment: NestedCommentData;
  postId: number;
  isLoggedIn: boolean;
  level?: number;
  onReply: (postId: number, parentId: number, content: string) => void;
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
          {comment.author.id ? (
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
                {comment.author.name || "Anonymous"}
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
              {comment.author.name || "Anonymous"}
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

          {/* Reply Button */}
          {isLoggedIn && (
            <Button
              size="small"
              startIcon={<Reply fontSize="small" />}
              onClick={() => setShowReplyBox(!showReplyBox)}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                textTransform: "none",
                minWidth: "auto",
                px: 1,
                py: 0.5,
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Reply
            </Button>
          )}

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
                    backgroundColor: "rgba(15, 26, 15, 0.6)",
                    fontSize: "0.875rem",
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
                  width: 32,
                  height: 32,
                }}
              >
                <Spa fontSize="small" sx={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </Box>
          </Collapse>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
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
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NestedComment;
