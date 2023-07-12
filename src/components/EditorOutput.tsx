'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC } from 'react';

const Output = dynamic(async () => (await import('editorjs-react-renderer')).default, {
  ssr: false,
});

interface EditorOutputProps {
  content: any;
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
};

const renderers = {
  image: CustomImageRender,
  code: CustomCodeRender,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  // @ts-expect-error
  return <Output className='text-sm' data={content} style={style} renderers={renderers} />;
};

function CustomImageRender({ data }: any) {
  const src = data.file.url;

  return (
    <div className='relative w-full min-h-[15rem]'>
      <Image alt='image' src={src} className='object-contain' fill />
    </div>
  );
}

function CustomCodeRender({ data }: any) {
  return (
    <pre className='bg-gray-800 rounded-md p-4'>
      <code className='text-gray-100 text-sm'>{data.code}</code>
    </pre>
  );
}

export default EditorOutput;