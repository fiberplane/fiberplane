import {
  FpDropdownMenu,
  FpDropdownMenuCheckboxItem,
  FpDropdownMenuContent,
  FpDropdownMenuItem,
  FpDropdownMenuLabel,
  FpDropdownMenuPortal,
  FpDropdownMenuSeparator,
  FpDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AllEventCategories, usePlaygroundStore } from "@/store";
import type { AgentInstanceParameters } from "@/types";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ListFilter } from "lucide-react";

export function EventCategoriesFilter(props: AgentInstanceParameters) {
  const selectedCategories = usePlaygroundStore(
    (state) => state.visibleEventCategories,
  );

  const toggleEventCategory = usePlaygroundStore(
    (state) => state.toggleEventCategory,
  );

  const resetEventCategories = usePlaygroundStore(
    (state) => state.resetEventCategories,
  );

  const unselectAllEventCategories = usePlaygroundStore(
    (state) => state.unselectAllEventCategories,
  );

  return (
    <div className="flex items-center gap-2">
      <ListFilter className="w-3.5 h-3.5" />Filter
      <FpDropdownMenu>
        <FpDropdownMenuTrigger
          className={cn(
            "flex",
            "items-center",
            "gap-2",
            "h-min",
            "hover:bg-muted",
            "data-[state=open]:bg-muted",
            "rounded-sm",
            "group/dropdown",
            "py-1"
          )}
        >
          <div className="grow-1 w-full text-start text-sm text-muted-foreground px-2">
            {selectedCategories.length === AllEventCategories.length ? (
              "All categories"
            ) : (
              <>
                {selectedCategories.length}{" "}
                {selectedCategories.length === 1 ? "category" : "categories"}
              </>
            )}
          </div>
          <CaretSortIcon className="w-3 h-3 mr-1 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-data-[state=open]/dropdown:opacity-100" />
        </FpDropdownMenuTrigger>
        <FpDropdownMenuPortal>
          <FpDropdownMenuContent align="start">
            <FpDropdownMenuLabel className="text-muted-foreground uppercase pt-2">
              Categories
            </FpDropdownMenuLabel>
            {AllEventCategories.map((category) => (
              <FpDropdownMenuCheckboxItem
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleEventCategory(category)}
                key={category}
              >
                {category}
              </FpDropdownMenuCheckboxItem>
            ))}
            <FpDropdownMenuSeparator />
            <FpDropdownMenuLabel className="text-muted-foreground uppercase  pt-2">
              Actions:
            </FpDropdownMenuLabel>
            <FpDropdownMenuItem onClick={() => resetEventCategories()}>
              Select default categories
            </FpDropdownMenuItem>
            <FpDropdownMenuItem onClick={unselectAllEventCategories}>
              Deselect all
            </FpDropdownMenuItem>
          </FpDropdownMenuContent>
        </FpDropdownMenuPortal>
      </FpDropdownMenu>
    </div>
  );
}
