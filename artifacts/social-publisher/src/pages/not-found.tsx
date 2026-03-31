import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-[120px] font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent leading-none mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <Button variant="gradient" size="lg">Return Home</Button>
      </Link>
    </div>
  );
}
