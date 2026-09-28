import { ref, computed } from 'vue';
import { useApi } from './useApi';

const DEFAULT_LANGUAGES = ['English', 'Arabic', 'Hindi', 'Malayalam', 'Tamil', 'Spanish', 'French', 'German', 'Mandarin', 'Urdu'];
const DEFAULT_QUALIFICATIONS = ['10th', 'High School', 'Diploma', 'Bachelors', 'Masters', 'PhD'];
const DEFAULT_NOTICE_PERIODS = ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days'];

// Global reactive states so data is fetched once and shared across pages
const masterLanguages = ref<{ id: number; name: string; code?: string }[]>([]);
const masterQualifications = ref<{ id: number; name: string; level_rank?: number }[]>([]);
const masterNoticePeriods = ref<{ id: number; name: string }[]>([]);
const isLoaded = ref(false);
const isLoading = ref(false);

export const useMasterData = () => {
  const api = useApi();

  const fetchMasterData = async (force = false) => {
    if (isLoaded.value && !force) return;
    if (isLoading.value) return;

    isLoading.value = true;
    try {
      const res = await api.get('/public/master-metadata');
      const data = res.data || res;
      if (data) {
        if (Array.isArray(data.languages) && data.languages.length > 0) {
          masterLanguages.value = data.languages;
        }
        if (Array.isArray(data.qualifications) && data.qualifications.length > 0) {
          masterQualifications.value = data.qualifications;
        }
        if (Array.isArray(data.noticePeriods) && data.noticePeriods.length > 0) {
          masterNoticePeriods.value = data.noticePeriods;
        }
        isLoaded.value = true;
      }
    } catch (error) {
      console.warn('Failed to load master metadata from API, using fallback defaults:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const languageOptions = computed(() => {
    if (masterLanguages.value.length > 0) {
      return masterLanguages.value.map(l => l.name);
    }
    return DEFAULT_LANGUAGES;
  });

  const qualificationOptions = computed(() => {
    if (masterQualifications.value.length > 0) {
      return masterQualifications.value.map(q => q.name);
    }
    return DEFAULT_QUALIFICATIONS;
  });

  const noticePeriodOptions = computed(() => {
    if (masterNoticePeriods.value.length > 0) {
      return masterNoticePeriods.value.map(n => n.name);
    }
    return DEFAULT_NOTICE_PERIODS;
  });

  return {
    masterLanguages,
    masterQualifications,
    masterNoticePeriods,
    languageOptions,
    qualificationOptions,
    noticePeriodOptions,
    isLoaded,
    isLoading,
    fetchMasterData
  };
};
