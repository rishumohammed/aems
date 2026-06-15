<template>
  <div class="contact-page-wrapper">
    <div class="contact-page bg-background min-h-screen">
      <div class="bg-white border-b py-12">
        <v-container>
          <div class="text-center">
            <h1 class="text-h3 font-weight-black tracking-tight mb-2">Contact Us</h1>
            <p class="text-grey-darken-1">Have a question? We're here to help.</p>
          </div>
        </v-container>
      </div>

      <v-container class="py-12">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card flat border class="rounded-xl pa-8 bg-white">
              <v-fade-transition mode="out-in">
                <div v-if="success" key="success" class="text-center py-8">
                  <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
                  <h3 class="text-h5 font-weight-bold mb-2">Message Sent!</h3>
                  <p class="text-body-1 text-medium-emphasis mb-6">
                    We've received your message and will get back to you shortly.
                  </p>
                  <v-btn color="primary" @click="success = false" rounded="lg">Send Another Message</v-btn>
                </div>

                <form v-else key="form" @submit.prevent="handleSubmit">
                  <v-row>
                    <v-col cols="12" md="6">
                      <label class="text-caption font-weight-medium mb-1 d-block">Name *</label>
                      <v-text-field
                        v-model="formData.name"
                        :error-messages="getErrors('name')"
                        placeholder="Your full name"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        class="mb-4"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <label class="text-caption font-weight-medium mb-1 d-block">Email *</label>
                      <v-text-field
                        v-model="formData.email"
                        :error-messages="getErrors('email')"
                        type="email"
                        placeholder="your@email.com"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        class="mb-4"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <label class="text-caption font-weight-medium mb-1 d-block">Phone</label>
                      <v-text-field
                        v-model="formData.phone"
                        placeholder="Your phone number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        class="mb-4"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <label class="text-caption font-weight-medium mb-1 d-block">Subject</label>
                      <v-text-field
                        v-model="formData.subject"
                        placeholder="What is this regarding?"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        class="mb-4"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <label class="text-caption font-weight-medium mb-1 d-block">Message *</label>
                      <v-textarea
                        v-model="formData.message"
                        :error-messages="getErrors('message')"
                        placeholder="How can we help you?"
                        variant="outlined"
                        density="comfortable"
                        rows="4"
                        hide-details="auto"
                        class="mb-4"
                      ></v-textarea>
                    </v-col>
                  </v-row>

                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    class="mt-4"
                    rounded="lg"
                    :loading="submitting"
                    :disabled="submitting"
                  >
                    Send Message
                  </v-btn>
                  
                  <p v-if="errorMsg" class="text-error text-center mt-4 text-caption">
                    {{ errorMsg }}
                  </p>
                </form>
              </v-fade-transition>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';

definePageMeta({
  layout: 'public'
});

useSeoMeta({
  title: 'Contact Us | AEMS Academy',
  description: 'Get in touch with AEMS Academy.'
});

const config = useRuntimeConfig();

const submitting = ref(false);
const success = ref(false);
const errorMsg = ref('');

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const rules = {
  name: { required },
  email: { required, email },
  message: { required }
};

const v$ = useVuelidate(rules, formData);

const getErrors = (key: string): string[] => {
  return v$.value[key as keyof typeof rules]?.$errors.map(e => unref(e.$message) as string) || [];
};

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  submitting.value = true;
  errorMsg.value = '';

  try {
    const response = await $fetch(`${config.public.apiBase}/public/contact`, {
      method: 'POST',
      body: formData
    });

    success.value = true;
    formData.name = '';
    formData.email = '';
    formData.phone = '';
    formData.subject = '';
    formData.message = '';
    v$.value.$reset();
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'Failed to send message. Please try again later.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.04em; }
</style>
