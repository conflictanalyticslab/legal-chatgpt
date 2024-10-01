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
import { useGlobalContext } from "@/app/store/global-context";

export default function InfoAlert() {
  const { infoAlert, setInfoAlert } = useGlobalContext();
  return (
    <Dialog open={!!infoAlert}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
        <DialogDescription className="text-base text-[black]">
          {infoAlert}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setInfoAlert("")}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
