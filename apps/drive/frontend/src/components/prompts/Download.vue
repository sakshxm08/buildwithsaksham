<template>
  <div class="card floating" id="download">
    <div class="card-title">
      <h2>{{ t("prompts.download") }}</h2>
    </div>

    <div class="card-content">
      <p>{{ t("prompts.downloadMessage") }}</p>
      <div class="flex flex-col gap-2 my-4">
        <button
          id="focus-prompt"
          v-for="(ext, format) in formats"
          :key="format"
          class="button button--block button--outline--primary"
          @click="layoutStore.currentPrompt?.confirm(format)"
        >
          {{ ext }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLayoutStore } from "@/stores/layout";

const layoutStore = useLayoutStore();

const { t } = useI18n();

const formats = {
  zip: "zip",
  tar: "tar",
  targz: "tar.gz",
  tarbz2: "tar.bz2",
  tarxz: "tar.xz",
  tarlz4: "tar.lz4",
  tarsz: "tar.sz",
};
</script>
