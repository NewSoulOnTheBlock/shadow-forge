import { redirect } from 'next/navigation';

// The app opens on the Play hub.
export default function RootIndex() {
  redirect('/play');
}

