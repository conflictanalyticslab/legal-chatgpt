import { useRef, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { useDialogFlowStore } from "./store";
import { useShareDialogFlow } from "./api";

export default function Share() {
  const { graphId, origin, publicGraph, sharedWith } = useDialogFlowStore();

  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const originalEmailsRef = useRef<string[]>([]);

  // Update emails state when sharedWith changes in the store
  useEffect(() => {
    setEmails(sharedWith);
    originalEmailsRef.current = [...sharedWith];
  }, [sharedWith]);

  // Track changes when emails are modified
  useEffect(() => {
    setHasChanges(
      JSON.stringify(emails) !== JSON.stringify(originalEmailsRef.current)
    );
  }, [emails]);

  // Handle dialog close attempt
  const handleOpenChange = (newOpen: boolean) => {
    if (share.isPending) return;
    if (!newOpen && hasChanges) {
      // Alert if trying to close with unsaved changes
      alert("You have unsaved changes. Please save before closing.");
      return;
    }
    setIsOpen(newOpen);
  };

  // Add a new email
  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail && !emails.includes(newEmail)) {
      setEmails([...emails, newEmail]);
      setNewEmail("");
    }
  };

  const share = useShareDialogFlow({
    onSuccess() {
      setIsOpen(false);
      setTimeout(() => {
        originalEmailsRef.current = [...emails];
        setHasChanges(false);
      }, 200);
    },
  });

  // Delete an email
  const handleDeleteEmail = (emailToDelete: string) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
  };

  // Save changes
  const handleSave = () => {
    // Calculate added and deleted emails
    const added = emails.filter(
      (email) => !originalEmailsRef.current.includes(email)
    );
    const deleted = originalEmailsRef.current.filter(
      (email) => !emails.includes(email)
    );

    // Log changes in the required format
    share.mutate({ add: added, delete: deleted });
  };

  if (!graphId || !publicGraph || origin !== "user") return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 bg-white px-3 h-9"
          variant="ghost"
        >
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-4 flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center pt-1">
            <span>Share</span>
            {hasChanges && (
              <span className="text-xs text-amber-500 font-normal">
                Unsaved changes
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {/* Scrollable email list */}
          <div className="h-48 rounded-md border border-neutral-200 overflow-auto divide-y divide-neutral-100">
            {emails.length > 0 ? (
              emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 even:bg-neutral-100"
                >
                  <span className="truncate pl-1">{email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-100 text-red-500 hover:text-red-500"
                    onClick={() => handleDeleteEmail(email)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete email</span>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 p-2">No emails added yet</p>
            )}
          </div>

          {/* Add email form */}
          <form onSubmit={handleAddEmail} className="flex space-x-2">
            <Input
              type="email"
              placeholder="Add new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 border-neutral-200"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="border-neutral-200 hover:border-neutral-300 hover:bg-neutral-200 bg-neutral-100 border size-10 px-2"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add email</span>
            </Button>
          </form>
        </div>

        {/* Save button */}
        <Button
          className={cn("w-full", !hasChanges && "opacity-50")}
          disabled={!hasChanges || share.isPending}
          onClick={handleSave}
        >
          Share
        </Button>
      </DialogContent>
    </Dialog>
  );
}
