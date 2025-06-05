<template>
  <div
    class="w-screen h-screen flex justify-center items-center"
    :class="{ recaptcha: recaptcha }"
  >
    <div
      class="shadow border border-gray-200 rounded-md p-8 w-4/5 sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col"
    >
      <div class="flex items-center gap-4 mx-auto my-6">
        <img :src="logoURL" alt="Devault" class="w-12 aspect-square" />
        <h1>{{ name }}</h1>
      </div>
      <div v-if="error !== ''" class="wrong">{{ error }}</div>
      <form @submit="submit" class="flex flex-col gap-8">
        <div class="flex flex-col gap-4">
          <input
            autofocus
            class="input input--block"
            type="text"
            name="username"
            autocapitalize="off"
            v-model="username"
            autocomplete="username"
            :placeholder="t('login.username')"
          />
          <input
            class="input input--block"
            type="password"
            name="password"
            autocomplete="current-password"
            v-model="password"
            :placeholder="t('login.password')"
          />
          <input
            class="input input--block"
            name="password"
            v-if="createMode"
            autocomplete="current-password"
            type="password"
            v-model="passwordConfirm"
            :placeholder="t('login.passwordConfirm')"
          />
        </div>

        <div v-if="recaptcha" id="recaptcha"></div>
        <button
          type="submit"
          :disabled="loading"
          class="button button--block flex items-center justify-center gap-2"
        >
          <span
            v-if="loading"
            class="w-4 h-4 flex animate-spin rounded-full border-2 border-white/40 border-t-white"
          ></span>
          <span>{{
            createMode
              ? loading
                ? t("login.signingUp")
                : t("login.signup")
              : loading
                ? t("login.loggingIn")
                : t("login.login")
          }}</span>
        </button>
        <p @click="toggleMode" v-if="signup">
          {{
            createMode ? t("login.loginInstead") : t("login.createAnAccount")
          }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatusError } from "@/api/utils";
import * as auth from "@/utils/auth";
import {
  name,
  logoURL,
  recaptcha,
  recaptchaKey,
  signup,
} from "@/utils/constants";
import { inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

// Define refs
const createMode = ref<boolean>(false);
const error = ref<string>("");
const username = ref<string>("");
const password = ref<string>("");
const passwordConfirm = ref<string>("");

const loading = ref<boolean>(false);

const route = useRoute();
const router = useRouter();
const { t } = useI18n({});
// Define functions
const toggleMode = () => (createMode.value = !createMode.value);

const $showError = inject<IToastError>("$showError")!;

const submit = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  error.value = "";
  loading.value = true;

  const redirect = (route.query.redirect || "/files/") as string;

  let captcha = "";
  if (recaptcha) {
    captcha = window.grecaptcha.getResponse();

    if (captcha === "") {
      error.value = t("login.wrongCredentials");
      loading.value = false;
      return;
    }
  }

  if (createMode.value) {
    if (password.value !== passwordConfirm.value) {
      error.value = t("login.passwordsDontMatch");
      loading.value = false;
      return;
    }
  }

  try {
    if (createMode.value) {
      await auth.signup(username.value, password.value);
    }

    await auth.login(username.value, password.value, captcha);
    router.push({ path: redirect });
  } catch (e: any) {
    // console.error(e);
    if (e instanceof StatusError) {
      if (e.status === 409) {
        error.value = t("login.usernameTaken");
      } else if (e.status === 403) {
        error.value = t("login.wrongCredentials");
      } else {
        $showError(e);
      }
    }
  } finally {
    loading.value = false;
  }
};

// Run hooks
onMounted(() => {
  if (!recaptcha) return;

  window.grecaptcha.ready(function () {
    window.grecaptcha.render("recaptcha", {
      sitekey: recaptchaKey,
    });
  });
});
</script>
