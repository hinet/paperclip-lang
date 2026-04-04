import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const PLUGIN_ID = "paperclip.lang";
const PLUGIN_VERSION = "1.0.2";

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Language Pack",
  description:
    "Multi-language UI support for Paperclip. Switch the interface language without modifying the host application. Currently includes Simplified Chinese (zh-CN).",
  author: "hinet <63603636@qq.com>",
  categories: ["ui"],
  capabilities: ["ui.action.register", "instance.settings.register"],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  ui: {
    slots: [
      {
        type: "globalToolbarButton",
        id: "lang-switcher",
        displayName: "Language",
        exportName: "LangSwitcher",
      },
      {
        type: "settingsPage",
        id: "lang-settings",
        displayName: "Language Pack",
        exportName: "LangSettingsPage",
      },
    ],
  },
};

export default manifest;
