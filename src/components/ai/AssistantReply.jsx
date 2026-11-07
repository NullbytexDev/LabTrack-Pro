import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, ThumbsDown, ThumbsUp } from 'lucide-react';
import { api } from '@/api/client';
import MaterialIconButton from '@/components/ai/MaterialIconButton';
import AssistantProse from '@/components/ai/AssistantProse';

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    if (!document.execCommand('copy')) throw new Error('copy refused');
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * One assistant answer: revealed gradually, then signed with the assistant name
 * and given copy + rating controls that respond the moment they are pressed.
 */
export default function AssistantReply({ content, question, animate, onGrow }) {
  const text = String(content || '');
  const [complete, setComplete] = useState(!animate);
  const [rating, setRating] = useState('');
  const [feedbackId, setFeedbackId] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  const saving = useRef(false);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  // The confirmation shows before the clipboard call returns, so the press feels instant.
  const copy = async () => {
    window.clearTimeout(copyTimer.current);
    setCopied(true);
    setFeedbackError('');
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        fallbackCopy(text);
      } catch {
        window.clearTimeout(copyTimer.current);
        setCopied(false);
        setFeedbackError('Copying is blocked here — select the answer and copy it manually.');
      }
    }
  };

  // The thumb fills immediately; the rating is stored in the background.
  const rate = async (value) => {
    if (rating === value || saving.current) return;
    const previous = rating;
    saving.current = true;
    setRating(value);
    setFeedbackError('');
    try {
      const { data } = await api.functions.invoke('aiAssist', {
        action: 'feedback',
        rating: value,
        question,
        response: text,
        feedback_id: feedbackId || undefined,
      });
      if (data?.id) setFeedbackId(data.id);
    } catch {
      setRating(previous);
      setFeedbackError('Your feedback could not be saved.');
    } finally {
      saving.current = false;
    }
  };

  const announcement = copied
    ? 'Answer copied to clipboard'
    : rating === 'like'
      ? 'Saved: this answer was helpful'
      : rating === 'dislike'
        ? 'Saved: this answer was not helpful'
        : '';

  return (
    <div className="space-y-1.5">
      <AssistantProse text={text} animate={animate} onGrow={onGrow} onDone={setComplete} />

      {complete && (
        <div className="flex items-center gap-0.5">
          <p className="flex-1 truncate text-[11px] font-medium text-muted-foreground">— LabTrack Pro Assistant</p>

          <MaterialIconButton
            tone={copied ? 'positive' : 'neutral'}
            pressed={copied}
            label={copied ? 'Answer copied' : 'Copy this answer'}
            onClick={copy}
          >
            <span key={copied ? 'copied' : 'copy'} className="md-icon-pop flex items-center justify-center">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            </span>
          </MaterialIconButton>

          <MaterialIconButton
            tone="positive"
            pressed={rating === 'like'}
            aria-pressed={rating === 'like'}
            label="This answer helped"
            onClick={() => rate('like')}
          >
            <span key={rating === 'like' ? 'on' : 'off'} className="md-icon-pop flex items-center justify-center">
              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            </span>
          </MaterialIconButton>

          <MaterialIconButton
            tone="negative"
            pressed={rating === 'dislike'}
            aria-pressed={rating === 'dislike'}
            label="This answer was not helpful"
            onClick={() => rate('dislike')}
          >
            <span key={rating === 'dislike' ? 'on' : 'off'} className="md-icon-pop flex items-center justify-center">
              <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </MaterialIconButton>
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>

      {feedbackError && (
        <p className="text-[11px] text-destructive" role="status">
          {feedbackError}
        </p>
      )}
    </div>
  );
}