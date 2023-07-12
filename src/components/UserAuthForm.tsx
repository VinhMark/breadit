'use client';

import { cn } from '@/lib/utils';
import React, { FC, useState } from 'react';
import { Button } from './ui/Button';
import { Icons } from './Icons';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      toast({
        title: 'There was a problem!',
        description: 'There was an error logging in with Google.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex justify-center', className)}>
      <Button size='sm' className='w-full' isLoading={isLoading} onClick={loginWithGoogle}>
        {!isLoading && <Icons.google className='w-4 h-4 mr-1' />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
