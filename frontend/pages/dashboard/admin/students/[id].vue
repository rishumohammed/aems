<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-4 mb-6">
      <v-btn icon="mdi-arrow-left" variant="tonal" class="rounded-lg bg-grey-lighten-4 text-grey-darken-3" @click="$router.back()"></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black mb-1 text-grey-darken-4">Student Profile</h1>
        <p class="text-grey-darken-1 font-weight-medium">
          View full details and progress for this student
        </p>
      </div>
    </div>

    <v-card rounded="xl" border class="shadow-card pa-12 text-center bg-grey-lighten-4 border-grey-lighten-2 elevation-0">
      <v-icon size="64" color="grey" class="mb-4">mdi-hammer-wrench</v-icon>
      <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">Profile Under Construction</h2>
      <p class="text-grey-darken-1 text-body-1">The detailed Brix Certifications profile view for student <strong>{{ studentId }}</strong> is currently being built.</p>
      <v-btn color="primary" variant="flat" class="mt-6 font-weight-bold rounded-lg px-6 text-none" @click="$router.back()">
        Go Back
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], roles: ['super_admin'] });
const route = useRoute();
const studentId = route.params.id;
</script>
