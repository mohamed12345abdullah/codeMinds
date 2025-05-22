export const dynamic = "force-dynamic";

import NotificationPage from './NotificationClient';

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function Page({ searchParams }: PageProps) {
    return <NotificationPage initialText={searchParams.text as string | undefined} />;
} 