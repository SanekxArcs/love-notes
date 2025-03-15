import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "../../sanity/types";

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk("messages/fetchAll", async () => {
  const response = await fetch("/api/settings/messages");
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data = await response.json();
  return data.messages;
});

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    toggleLike: (
      state,
      action: PayloadAction<{ messageId: string; liked: boolean }>
    ) => {
      const { messageId, liked } = action.payload;
      const message = state.messages.find((msg) => msg._id === messageId);
      if (message) message.like = liked;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch messages";
      });
  },
});

export const { toggleLike } = messagesSlice.actions;
export default messagesSlice.reducer;