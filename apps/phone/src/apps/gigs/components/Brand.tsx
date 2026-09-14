import React from 'react';

/**
 * The six drifting dots from the icon art. Rendered as elements rather than a
 * background so each one can carry its own timing (see gigs.css) — a single
 * animation across all of them read as one blinking thing.
 */
export const Confetti: React.FC = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <span key={n} className={`dot d${n}`} />
    ))}
  </>
);

/**
 * The wordmark. rydeme's is set in Optien with the r's tip painted pink as
 * part of the letterform (the `rtip` gradient clip in gigs.css) and "me" in
 * accent; Snarf's is plain heavy body text, as it always was.
 */
export const Wordmark: React.FC<{ app: 'snarf' | 'goober' }> = ({ app }) =>
  app === 'snarf' ? (
    <div className="gig-word snarf-word">Snarf</div>
  ) : (
    <div className="gig-word">
      <span className="w1">
        <span className="rtip">r</span>yde
      </span>
      <span className="w2">me</span>
    </div>
  );
