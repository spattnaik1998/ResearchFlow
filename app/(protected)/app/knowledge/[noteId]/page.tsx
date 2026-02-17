import { NoteEditor } from '@/components/knowledge/NoteEditor';

interface NotePageProps {
  params: Promise<{
    noteId: string;
  }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;
  return <NoteEditor noteId={noteId} mode="edit" />;
}
