"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

// ~2.7MB dependency: load it lazily and only mount it once opened.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, TrendingUp } from "lucide-react";
import { ButtonLoader } from "@/app/_components/LoadingSpinner";

import { createIncome } from "@/app/actions/incomes";
import { callAction } from "@/utils/callAction";

function CreateIncomes({ refreshData }) {
  const [open, setOpen] = useState(false);
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const onCreateIncomes = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!(Number(amount) > 0)) {
      toast.error("Enter a monthly amount greater than zero");
      return;
    }

    try {
      setIsLoading(true);
      await callAction(createIncome({ name: trimmedName, amount, icon: emojiIcon }));
      refreshData();
      toast.success("New Income Source Created!");
      setName("");
      setAmount("");
      setEmojiIcon("😀");
      setOpen(false);
    } catch (error) {
      console.error("Error creating income source:", error);
      toast.error("Failed to create income source", { description: error.message, duration: 12000 });
    } finally {
      setIsLoading(false);
    }
  };

  const onOpenChange = (nextOpen) => {
    if (isLoading) return;
    setOpen(nextOpen);
    if (!nextOpen) setOpenEmojiPicker(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex min-h-[170px] flex-col items-start justify-between rounded-[24px] border border-dashed border-[rgb(var(--cash-teal-rgb)/0.4)] bg-[rgb(var(--cash-wash-rgb)/0.55)] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--cash-teal)] hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cash-paper)] text-[var(--cash-teal)] shadow-sm transition-transform duration-300 group-hover:rotate-90">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display text-lg font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
              Create income source
            </span>
            <span className="mt-1 block text-sm text-[var(--cash-muted)]">
              Add a steady stream to your picture.
            </span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="border-[var(--cash-line)] bg-[var(--cash-paper)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">
            Create income source
          </DialogTitle>
          <DialogDescription className="text-[var(--cash-muted)]">
            Add the source and monthly amount you want to track.
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-5 pt-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cash-muted)]">Source icon</p>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-2xl border-[var(--cash-line)] bg-[var(--cash-mist)] p-0 text-xl hover:bg-[var(--cash-wash)]"
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
              aria-label="Choose income icon"
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
            <label htmlFor="income-name" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Source name</label>
            <Input
              id="income-name"
              placeholder="e.g. YouTube"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
            />
          </div>

          <div>
            <label htmlFor="income-amount" className="mb-2 block text-sm font-semibold text-[var(--cash-ink)]">Monthly amount</label>
            <Input
              id="income-amount"
              type="number"
              min="0"
              placeholder="e.g. Rs.5000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-end">
          <Button
            disabled={!(name && amount) || isLoading}
            onClick={onCreateIncomes}
            className="w-full rounded-full bg-[var(--cash-teal-solid)] text-white hover:bg-[var(--cash-onyx)] sm:w-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><ButtonLoader size="sm" /> Creating source...</span>
            ) : (
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" aria-hidden="true" /> Create income source</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateIncomes;
