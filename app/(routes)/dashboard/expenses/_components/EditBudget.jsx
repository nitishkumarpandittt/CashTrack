"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

// ~2.7MB dependency: load it lazily and only mount it once opened.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { PenBox } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ButtonLoader } from "@/app/_components/LoadingSpinner";

import { updateBudget } from "@/app/actions/budgets";
import { callAction } from "@/utils/callAction";

function EditBudget({ budgetInfo, refreshData }) {
  const [open, setOpen] = useState(false);
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon ?? "😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState(budgetInfo?.name ?? "");
  const [amount, setAmount] = useState(budgetInfo?.amount ?? "");
  const [saving, setSaving] = useState(false);

  // The fields are re-seeded from the budget each time the dialog opens, so a
  // refresh in the background (or an abandoned edit) never leaves stale text.
  const onOpenChange = (nextOpen) => {
    if (saving) return;
    if (nextOpen) {
      setEmojiIcon(budgetInfo?.icon ?? "😀");
      setName(budgetInfo?.name ?? "");
      setAmount(budgetInfo?.amount ?? "");
    }
    setOpenEmojiPicker(false);
    setOpen(nextOpen);
  };

  const onUpdateBudget = async () => {
    if (!(Number(amount) > 0)) {
      toast.error("Enter a budget amount greater than zero");
      return;
    }

    try {
      setSaving(true);
      await callAction(updateBudget(budgetInfo.id, { name, amount, icon: emojiIcon }));
      toast.success("Budget Updated!");
      setOpen(false);
      refreshData();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Could not update this budget", { description: error.message, duration: 12000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-[var(--cash-teal-solid)] px-4 text-white hover:bg-[var(--cash-onyx)]">
          <PenBox className="mr-2 h-4 w-4" aria-hidden="true" />
          Edit budget
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[var(--cash-line)] bg-[var(--cash-paper)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">
            Update budget
          </DialogTitle>
          <DialogDescription className="text-[var(--cash-muted)]">
            Keep the guardrail aligned with how this priority is changing.
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-5 pt-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cash-muted)]">Budget icon</p>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-2xl border-[var(--cash-line)] bg-[var(--cash-mist)] p-0 text-xl hover:bg-[var(--cash-wash)]"
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
              aria-label="Choose budget icon"
            >
              {emojiIcon}
            </Button>
            {openEmojiPicker ? (
              <div className="absolute left-0 top-20 z-20">
                <EmojiPicker
                  open
                  onEmojiClick={(emoji) => {
                    setEmojiIcon(emoji.emoji);
                    setOpenEmojiPicker(false);
                  }}
                />
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="edit-budget-name" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Budget name</label>
            <Input
              id="edit-budget-name"
              placeholder="e.g. Home Decor"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
            />
          </div>

          <div>
            <label htmlFor="edit-budget-amount" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Budget amount</label>
            <Input
              id="edit-budget-amount"
              type="number"
              min="0"
              value={amount}
              placeholder="e.g. Rs.5000"
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-end">
          <Button
            disabled={!(name.trim() && amount) || saving}
            onClick={onUpdateBudget}
            className="w-full rounded-full bg-[var(--cash-teal-solid)] text-white hover:bg-[var(--cash-onyx)] sm:w-auto"
          >
            {saving ? (
              <span className="flex items-center gap-2"><ButtonLoader size="sm" /> Saving...</span>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditBudget;
