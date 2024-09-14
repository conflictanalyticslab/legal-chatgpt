"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import React from "react";
import { useChatContext } from "../../store/ChatContext";

export default function InfoAlert() {
  const { infoAlert, setInfoAlert } = useChatContext();
  return (
    <Dialog open={!!infoAlert}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
        <DialogDescription className="text-md text-[black]">
          {infoAlert}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setInfoAlert("")}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
