import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("paperclip-lang plugin started");
    // Language preference is stored in localStorage on the client side.
    // No server-side state is needed for the current implementation.
  },

  async onHealth() {
    return { status: "ok", message: "paperclip-lang ready" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
