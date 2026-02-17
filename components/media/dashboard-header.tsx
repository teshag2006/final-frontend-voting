'use client';

import { Download, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MediaDashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Logo & Title */}
        <h1 className="text-2xl font-bold text-gray-900">Media Dashboard</h1>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* CSV Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1"
              >
                <span className="hidden sm:inline">CSV</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-200 bg-white">
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 flex items-center gap-2 px-2 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=media" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">MU</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">MediaUser</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-200 bg-white">
              <DropdownMenuItem disabled className="text-gray-500 text-xs cursor-default">
                media@example.com
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
