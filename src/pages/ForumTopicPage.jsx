import { useState, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import { addComment, formatRelative, getSnapshot, getTopic, subscribe, toggleLike } from "../services/forum";
import { useAuth } from "../services/auth.jsx";
import styles from "./ForumTopicPage.module.css";

function useForumSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function LikeIcon({ filled }) {
  return filled ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8.5 2.4 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4.1 0 6.1 4.5 4.5 7.7-2.5 4.7-10 9.3-10 9.3z"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8.5 2.4 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4.1 0 6.1 4.5 4.5 7.7-2.5 4.7-10 9.3-10 9.3z"/>
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function ReplyForm({ topicId, parentId, replyToUsername, onClose, autoFocus }) {
  const { user } = useAuth();
  const [body, setBody] = useState(replyToUsername ? `@${replyToUsername} ` : "");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (body.trim().length < 2) { setError("Reply is too short."); return; }
    addComment({ topicId, parentId, replyToUsername, body, author: user });
    setBody("");
    onClose?.();
  };

  return (
    <form className={styles.replyForm} onSubmit={submit}>
      <div className={styles.replyFormHead}>
        <span className={styles.replyFormUser}>
          {replyToUsername
            ? <>Replying to <strong>@{replyToUsername}</strong></>
            : <>Replying as <strong>{user.username}</strong></>}
        </span>
      </div>
      <textarea
        className={styles.commentInput}
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={replyToUsername ? `Reply to @${replyToUsername}...` : "Write a reply..."}
        autoFocus={autoFocus}
      />
      {error && <div className={styles.formError}>{error}</div>}
      <div className={styles.replyFormActions}>
        <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
        <button type="submit" className={styles.btnSolid}>Post reply</button>
      </div>
    </form>
  );
}

function ActionRow({ comment, onReply }) {
  const { user, openAuth } = useAuth();
  const liked = !!user && comment.likers.includes(user.id);

  const onLike = () => {
    if (!user) { openAuth("signin"); return; }
    toggleLike({ commentId: comment.id, userId: user.id });
  };
  const onReplyClick = () => {
    if (!user) { openAuth("signin"); return; }
    onReply();
  };

  return (
    <div className={styles.commentActions}>
      <button
        type="button"
        className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ""}`}
        onClick={onLike}
        aria-pressed={liked}
        title={user ? (liked ? "Unlike" : "Like") : "Sign in to like"}
      >
        <LikeIcon filled={liked} />
        <span className={styles.likeCount}>{comment.likeCount}</span>
      </button>
      <button
        type="button"
        className={styles.replyBtn}
        onClick={onReplyClick}
        title={user ? "Reply" : "Sign in to reply"}
      >
        <ReplyIcon />
        <span>Reply</span>
      </button>
    </div>
  );
}

function ReplyItem({ reply, onReply }) {
  return (
    <div className={`${styles.comment} ${styles.commentReply}`}>
      <div className={styles.commentLeft}>
        <span className={`${styles.avatar} ${styles.avatarSm}`}>
          {reply.authorUsername[0].toUpperCase()}
        </span>
      </div>
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.commentAuthor}>{reply.authorUsername}</span>
          {reply.replyToUsername && (
            <>
              <span className={styles.commentDot}>·</span>
              <span className={styles.replyTo}>replying to <strong>@{reply.replyToUsername}</strong></span>
            </>
          )}
          <span className={styles.commentDot}>·</span>
          <span className={styles.commentDate}>{formatRelative(reply.createdAt)}</span>
        </div>
        <p className={styles.commentText}>{reply.body}</p>
        <ActionRow comment={reply} onReply={() => onReply(reply)} />
      </div>
    </div>
  );
}

function CommentItem({ comment, topicId }) {
  const [replyingTo, setReplyingTo] = useState(null); // null | { parentId, replyToUsername }

  const startReplyToRoot = () => setReplyingTo({ parentId: comment.id, replyToUsername: null });
  const startReplyToChild = (reply) => setReplyingTo({
    // forum.js promotes parentId of reply-to-reply automatically, but we
    // pass the root id here for clarity.
    parentId: comment.id,
    replyToUsername: reply.authorUsername,
  });
  const closeReply = () => setReplyingTo(null);

  return (
    <div className={styles.commentBlock}>
      <div className={styles.comment}>
        <div className={styles.commentLeft}>
          <span className={styles.avatar}>{comment.authorUsername[0].toUpperCase()}</span>
        </div>
        <div className={styles.commentBody}>
          <div className={styles.commentMeta}>
            <span className={styles.commentAuthor}>{comment.authorUsername}</span>
            <span className={styles.commentDot}>·</span>
            <span className={styles.commentDate}>{formatRelative(comment.createdAt)}</span>
          </div>
          <p className={styles.commentText}>{comment.body}</p>
          <ActionRow comment={comment} onReply={startReplyToRoot} />
        </div>
      </div>

      {(comment.replies?.length > 0 || replyingTo) && (
        <div className={styles.replyThread}>
          {comment.replies?.map(r => (
            <ReplyItem
              key={r.id}
              reply={r}
              onReply={startReplyToChild}
            />
          ))}
          {replyingTo && (
            <ReplyForm
              topicId={topicId}
              parentId={replyingTo.parentId}
              replyToUsername={replyingTo.replyToUsername}
              onClose={closeReply}
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  );
}

function NewCommentForm({ topicId }) {
  const { user, openAuth } = useAuth();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className={styles.guestCommentCta}>
        <span>Sign in to join the discussion.</span>
        <div className={styles.guestCommentActions}>
          <button className={styles.btnGhost} onClick={() => openAuth("signin")}>Sign in</button>
          <button className={styles.btnSolid} onClick={() => openAuth("register")}>Register</button>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (body.trim().length < 2) { setError("Comment is too short."); return; }
    addComment({ topicId, body, author: user });
    setBody("");
  };

  return (
    <form className={styles.commentForm} onSubmit={submit}>
      <div className={styles.commentFormHead}>
        <span className={styles.avatar}>{user.username[0].toUpperCase()}</span>
        <span className={styles.commentFormUser}>Posting as <strong>{user.username}</strong></span>
      </div>
      <textarea
        className={styles.commentInput}
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add a top-level comment..."
      />
      {error && <div className={styles.formError}>{error}</div>}
      <div className={styles.commentFormActions}>
        <button type="submit" className={styles.btnSolid}>Post comment</button>
      </div>
    </form>
  );
}

export default function ForumTopicPage() {
  useForumSnapshot();
  const { topicId } = useParams();
  const topic = getTopic(topicId);

  if (!topic) {
    return (
      <main>
        <div className="wrap">
          <div className={styles.notFound}>
            <h2>Topic not found</h2>
            <p>This thread may have been removed.</p>
            <Link to="/forum" className={styles.btnGhost}>← Back to forum</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.pageHero}>
        <div className="wrap">
          <Link to="/forum" className={styles.backLink}>← Forum</Link>
          <div className={styles.heroMeta}>
            <span className={`${styles.cat} ${styles[`cat_${topic.category}`] || ""}`}>{topic.category}</span>
            <span className={styles.heroAuthor}>by <strong>{topic.authorUsername}</strong></span>
            <span className={styles.heroDot}>·</span>
            <span className={styles.heroDate}>{formatRelative(topic.createdAt)}</span>
          </div>
          <h1 className={styles.heroTitle}>{topic.title}</h1>
          <p className={styles.heroBody}>{topic.body}</p>
          <div className={styles.heroStats}>
            <span><strong>{topic.commentCount}</strong> {topic.commentCount === 1 ? "reply" : "replies"}</span>
            <span>·</span>
            <span><strong>{topic.weeklyCommentCount}</strong> this week</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <section className={styles.thread}>
          <h2 className={styles.threadTitle}>
            {topic.commentCount === 0 ? "No replies yet" : `${topic.commentCount} ${topic.commentCount === 1 ? "reply" : "replies"}`}
          </h2>

          <div className={styles.commentList}>
            {topic.comments.map(c => <CommentItem key={c.id} comment={c} topicId={topic.id} />)}
          </div>

          <NewCommentForm topicId={topic.id} />
        </section>
      </div>
    </main>
  );
}
