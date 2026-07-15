import React from 'react';
import { Hammer } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <Hammer className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        We&apos;re working hard to bring this feature to MoneyTracker Pro. 
        Stay tuned for upcoming updates in our next sprint!
      </p>
    </div>
  );
}
