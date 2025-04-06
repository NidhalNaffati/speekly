import React from "react";
import {Button} from "@/components/ui/button";
import {RefreshCcw, ChevronLeft, ChevronRight} from "lucide-react";

interface NavigationProps {
  goToPreviousParagraph: () => void;
  goToNextParagraph: () => void;
  reset: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

const Navigation: React.FC<NavigationProps> = (
  {
    goToPreviousParagraph,
    goToNextParagraph,
    reset,
    isPreviousDisabled,
    isNextDisabled,
  }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
      <Button
        onClick={reset}
        variant="outline"
        className="gap-2"
      >
        <RefreshCcw className="h-4 w-4"/>
        Reset
      </Button>

      <div className="flex gap-2">
        <Button
          onClick={goToPreviousParagraph}
          disabled={isPreviousDisabled}
          variant={isPreviousDisabled ? "ghost" : "default"}
          size="icon"
          className={!isPreviousDisabled ? "bg-speekly-teal hover:bg-speekly-teal-dark" : ""}
        >
          <ChevronLeft className="h-5 w-5"/>
        </Button>
        <Button
          onClick={goToNextParagraph}
          disabled={isNextDisabled}
          variant={isNextDisabled ? "ghost" : "default"}
          size="icon"
          className={!isNextDisabled ? "bg-speekly-teal hover:bg-speekly-teal-dark" : ""}
        >
          <ChevronRight className="h-5 w-5"/>
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
