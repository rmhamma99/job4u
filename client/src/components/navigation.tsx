import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">JobBoard</a>
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {user.name || user.username}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} className="md:hidden">
                    <Link href={item.href}>
                      <a className="w-full">{item.label}</a>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
