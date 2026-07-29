"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// ~2.7MB dependency: load it lazily and only mount it once opened.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { PenBox } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo.icon);
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    const result = await db
      .update(Budgets)
      .set({ name, amount, icon: emojiIcon })
      .where(eq(Budgets.id, budgetInfo.id))
      .returning();

    if (result) {
      refreshData();
      toast("Budget Updated!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-[var(--cash-teal)] px-4 text-white hover:bg-[var(--cash-ink)]">
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
              defaultValue={budgetInfo?.name}
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
              defaultValue={budgetInfo?.amount}
              placeholder="e.g. Rs.5000"
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 border-[var(--cash-line)] bg-[var(--cash-mist)] focus-visible:ring-[var(--cash-teal)]"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-end">
          <DialogClose asChild>
            <Button
              disabled={!(name && amount)}
              onClick={onUpdateBudget}
              className="w-full rounded-full bg-[var(--cash-teal)] text-white hover:bg-[var(--cash-ink)] sm:w-auto"
            >
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditBudget;
