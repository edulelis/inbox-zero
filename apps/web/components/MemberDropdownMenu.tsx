"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  TrashIcon,
  BarChart3,
  BarChartIcon,
} from "lucide-react";

interface MemberDropdownMenuProps {
  memberId: string;
  emailAccountId?: string;
  onRemove: (memberId: string) => void;
}

export function MemberDropdownMenu({
  memberId,
  emailAccountId,
  onRemove,
}: MemberDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onRemove(memberId)}>
          <TrashIcon className="mr-2 size-4" />
          Remove
        </DropdownMenuItem>

        {emailAccountId ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BarChart3 className="mr-2 size-4" />
              Analytics
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem asChild>
                <a href={`/${emailAccountId}/stats`}>
                  <BarChart3 className="mr-2 size-4" />
                  General
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/${emailAccountId}/rule-stats`}>
                  <BarChartIcon className="mr-2 size-4" />
                  Executed Rules
                </a>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem disabled>
            <BarChart3 className="mr-2 size-4" />
            Analytics
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <BarChartIcon className="mr-2 size-4" />
          Usage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
