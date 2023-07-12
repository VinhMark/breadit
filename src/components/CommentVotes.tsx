'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { usePrevious } from '@mantine/hooks';
import { CommentVote, VoteType } from '@prisma/client';
import { FC, useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { CommentVoteRequest } from '@/lib/validator/vote';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

type PartialVote = Pick<CommentVote, 'type'>;

interface CommentVotesProps {
  commentId: string;
  initialVoteAmt: number;
  initialVote?: PartialVote;
}

const CommentVotes: FC<CommentVotesProps> = ({ commentId, initialVoteAmt, initialVote }) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch('/api/subreddit/comment/vote', payload);
    },
    onError: (error, voteType) => {
      if (voteType === 'UP') {
        setVotesAmt((prev) => prev - 1);
      } else {
        setVotesAmt((prev) => prev + 1);
      }

      // reset current vote
      setCurrentVote(prevVote);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'Something went wrong',
        description: 'Your vote was nos registered, please try again.',
        variant: 'destructive',
      });
    },
    onMutate: (type) => {
      if (currentVote?.type === type) {
        setCurrentVote(undefined);
        if (type === 'UP') {
          setVotesAmt((prev) => prev - 1);
        } else if (type === 'DOWN') {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote({ type });
        if (type === 'UP') {
          setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        } else if (type === 'DOWN') {
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className='flex gap-1'>
      <Button size='sm' variant='ghost' aria-label='Up vote' onClick={() => vote(VoteType.UP)}>
        <ArrowBigUp
          className={cn('w-5 h-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP',
          })}
        />
      </Button>
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>{votesAmt}</p>
      <Button size='sm' variant='ghost' aria-label='Down vote' onClick={() => vote(VoteType.DOWN)}>
        <ArrowBigDown
          className={cn('w-5 h-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote?.type === 'UP',
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
